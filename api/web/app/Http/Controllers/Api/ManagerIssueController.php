<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Str;

class ManagerIssueController extends Controller
{
    /**
     * 部署ごとの課題・強み・弱み分析、その他データをまとめたレスポンスを返す
     *
     * @param int $departmentId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getIssueData($departmentId)
    {
        $this->logToConsole('info', 'getIssueData called with departmentId: ' . $departmentId);

        // セッションからテナントIDを取得（なければ1）
        $tenantId = session('tenant_id', 1);

        // 部署情報の取得
        $department = $this->getDepartment($departmentId, $tenantId);
        if (!$department) {
            $this->logToConsole('warning', 'Department not found: ' . $departmentId);
            return response()->json([
                'success' => false,
                'message' => '部署が見つかりません'
            ], 404);
        }

        // サーベイインスタンスの取得
        try {
            $instances = DB::table('engagement_survey_instances')
                ->where('tenant_id', $tenantId)
                ->orderBy('start_date', 'desc')
                ->get();
        } catch (\Exception $e) {
            $this->logToConsole('error', 'Error fetching survey instances: ' . $e->getMessage());
            $instances = collect([]);
        }
        if ($instances->isEmpty()) {
            $this->logToConsole('warning', 'No survey instances found');
            return response()->json([
                'success' => false,
                'message' => 'サーベイインスタンスが見つかりません'
            ], 404);
        }
        $latestInstance = $instances->first();
        $instanceIds = $instances->pluck('id')->toArray();

        // 各種データの取得
        $scoreData           = $this->calculateScores($tenantId, $departmentId, $latestInstance->id, $instanceIds);
        $responseRates       = $this->calculateResponseRates($departmentId, $instanceIds);
        $timeBasedMatrixData = $this->generateTimeBasedMatrixData($tenantId, $departmentId, $instances);
        $categories          = $this->getCategories($tenantId);
        $challengeData       = $this->getChallengesByDepartment($departmentId, $tenantId);
        $engagementData      = $this->getEngagementData($tenantId, $departmentId);
        $surveyStatus        = $this->getCurrentSurveyStatus($tenantId);

        // questionData と categories をマージして "questions" として返す
        $questions = $categories->merge($engagementData['questionData']);

        return response()->json([
            'success' => true,
            'data' => [
                'department'            => $department,
                'scoreData'             => $scoreData,
                'responseRate'          => $responseRates['currentRate'],
                'rateHistory'           => $responseRates['history'],
                'surveyDates'           => $timeBasedMatrixData['dates'],
                'matrixData'            => $timeBasedMatrixData['data'],
                'departmentSummary'     => $timeBasedMatrixData['summary'],
                'questions'             => $questions,
                'challengeData'         => $challengeData,
                'engagementSurveyData'  => $engagementData['surveyData'],
                'managerScoreData'      => $engagementData['managerData'],
                'insightTexts'          => $this->generateInsightTexts(),
                'surveyStatus'          => $surveyStatus
            ]
        ]);
    }

    /**
     * 部署情報を取得する
     *
     * @param int $departmentId
     * @param int $tenantId
     * @return object|null
     */
    private function getDepartment($departmentId, $tenantId)
    {
        try {
            return DB::table('departments')
                ->where('id', $departmentId)
                ->where('tenant_id', $tenantId)
                ->first();
        } catch (\Exception $e) {
            $this->logToConsole('error', 'Error fetching department: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * すべての質問（survey_questions）を取得し、
     * 追加質問の場合は tenant-additional_question_relations に該当テナントの登録があるものだけを残す。
     *
     * @param int $tenantId
     * @return \Illuminate\Support\Collection
     */
    private function getCategories($tenantId)
    {
        try {
            $allCategories = DB::table('survey_questions')
                ->select('id', 'issue_category as category', 'question_text')
                ->get();

            $allAdditionalIds = DB::table('tenant-additional_question_relations')
                ->pluck('survey_question_id')
                ->unique()
                ->toArray();

            $tenantAdditionalIds = DB::table('tenant-additional_question_relations')
                ->where('tenant_id', $tenantId)
                ->pluck('survey_question_id')
                ->toArray();

            $filteredCategories = $allCategories->filter(function ($q) use ($allAdditionalIds, $tenantAdditionalIds) {
                if (in_array($q->id, $allAdditionalIds)) {
                    return in_array($q->id, $tenantAdditionalIds);
                }
                return true;
            });

            return $filteredCategories;
        } catch (\Exception $e) {
            $this->logToConsole('error', 'Error fetching categories: ' . $e->getMessage());
            return collect([]);
        }
    }

    /**
     * issues テーブルから、該当テナント・部署の課題を取得し、
     * 同じ issue_category と department_id の Measure の数も追加する
     *
     * @param int $departmentId
     * @param int $tenantId
     * @return \Illuminate\Support\Collection
     */
    private function getChallengesByDepartment($departmentId, $tenantId)
    {
        try {
            $issues = DB::table('issues')
                ->where('department_id', $departmentId)
                ->where('tenant_id', $tenantId)
                ->get();

            $issues = $issues->map(function ($issue) use ($tenantId, $departmentId) {
                $measureCount = DB::table('measures')
                    ->where('tenant_id', $tenantId)
                    ->where('department_id', $departmentId)
                    ->where('issue_category', $issue->issue_category)
                    ->count();
                $issue->measureCount = $measureCount;
                return $issue;
            });

            return $issues;
        } catch (\Exception $e) {
            $this->logToConsole('error', 'Error in getChallengesByDepartment: ' . $e->getMessage());
            return collect([]);
        }
    }

    /**
     * 部門スコアデータを計算する
     *
     * @param int   $tenantId
     * @param int   $departmentId
     * @param int   $latestInstanceId
     * @param array $instanceIds
     * @return array
     */
    private function calculateScores($tenantId, $departmentId, $latestInstanceId, $instanceIds)
    {
        try {
            $score = $this->calculateScoreForDept($departmentId, $latestInstanceId);

            $prevInstance = DB::table('engagement_survey_instances')
                ->where('tenant_id', $tenantId)
                ->where('id', '<', $latestInstanceId)
                ->orderBy('start_date', 'desc')
                ->first();

            if ($prevInstance) {
                $prevScore = $this->calculateScoreForDept($departmentId, $prevInstance->id);
                $prevDiff = round($score - $prevScore, 1);
            } else {
                $prevDiff = null;
            }

            $companyAvg = round($this->getCompanyAverage($latestInstanceId), 1);
            if ($prevInstance) {
                $companyDiff = round($companyAvg - $this->getCompanyAverage($prevInstance->id), 1);
            } else {
                $companyDiff = null;
            }

            $ratingInfo = $this->calculateRating($tenantId, $score, $latestInstanceId);
            $history = $this->getScoreHistory($departmentId, $instanceIds);

            return [
                'score'       => round($score, 1),
                'prevDiff'    => $prevDiff,
                'companyAvg'  => $companyAvg,
                'companyDiff' => $companyDiff,
                'rating'      => $ratingInfo['rating'],
                'ratingLabel' => $ratingInfo['label'],
                'history'     => $history
            ];
        } catch (\Exception $e) {
            $this->logToConsole('error', 'Error in calculateScores: ' . $e->getMessage());
            throw new \Exception('スコア計算中にエラーが発生しました。');
        }
    }

    /**
     * 部署の回答率データを取得する
     *
     * @param int   $departmentId
     * @param array $instanceIds
     * @return array
     */
    private function calculateResponseRates($departmentId, $instanceIds)
    {
        try {
            $result = [
                'currentRate' => 0,
                'history'     => []
            ];

            $staffCount = DB::table('staff_identity')
                ->where('department_id', $departmentId)
                ->count();

            if ($staffCount > 0) {
                $latestInstance = DB::table('engagement_survey_instances')
                    ->whereIn('id', $instanceIds)
                    ->orderBy('start_date', 'desc')
                    ->first();

                if ($latestInstance) {
                    $respondedCount = DB::table('engagement_survey_responses')
                        ->where('engagement_survey_instances_id', $latestInstance->id)
                        ->where('department_id', $departmentId)
                        ->where('survey_question_id', 1)
                        ->count();
                    $result['currentRate'] = round(($respondedCount / $staffCount) * 100);
                }
            }

            foreach ($instanceIds as $instanceId) {
                $instance = DB::table('engagement_survey_instances')
                    ->where('id', $instanceId)
                    ->first();
                if (!$instance) continue;

                $respondedCount = DB::table('engagement_survey_responses')
                    ->where('engagement_survey_instances_id', $instanceId)
                    ->where('department_id', $departmentId)
                    ->where('survey_question_id', 1)
                    ->count();
                $rate = $staffCount > 0 ? round(($respondedCount / $staffCount) * 100) : 0;
                $result['history'][] = [
                    'date' => date('Y/m', strtotime($instance->start_date)),
                    'rate' => $rate
                ];
            }

            // 次回分のエントリー
            $result['history'][] = [
                'date' => '',
                'rate' => null
            ];

            return $result;
        } catch (\Exception $e) {
            $this->logToConsole('error', 'Error in calculateResponseRates: ' . $e->getMessage());
            return [
                'currentRate' => 0,
                'history'     => []
            ];
        }
    }

    /**
     * 時系列ベースの4象限マトリクスデータを生成する
     *
     * @param int                            $tenantId
     * @param int                            $departmentId
     * @param \Illuminate\Support\Collection $instances
     * @return array
     */
    private function generateTimeBasedMatrixData($tenantId, $departmentId, $instances)
    {
        try {
            $result = [
                'dates'   => [],
                'data'    => [],
                'summary' => []
            ];

            $categories = DB::table('survey_questions')
                ->select('id', 'issue_category as category')
                ->get();
            if ($categories->isEmpty()) {
                $categories = collect([]);
            }

            foreach ($instances as $instance) {
                $date = date('Y年n月', strtotime($instance->start_date));
                $result['dates'][] = $date;

                $dateData = [];
                $responses = DB::table('engagement_survey_responses')
                    ->where('engagement_survey_instances_id', $instance->id)
                    ->where('department_id', $departmentId)
                    ->get();
                if ($responses->isEmpty()) continue;

                foreach ($categories as $category) {
                    $categoryResponses = $responses->where('survey_question_id', $category->id);
                    if ($categoryResponses->isEmpty()) continue;
                    $satisfaction = $categoryResponses->avg('actual_value');
                    $expectation  = $categoryResponses->avg('expected_value');

                    $dateData[] = [
                        'id'       => $category->id,
                        'category' => $category->category,
                        'x'        => round($satisfaction, 1),
                        'y'        => round($expectation, 1)
                    ];
                }

                if (!empty($dateData)) {
                    $result['data'][$date] = $dateData;
                }

                // サマリーデータの生成
                $categoryScores = [];
                foreach ($categories as $category) {
                    $categoryResponses = $responses->where('survey_question_id', $category->id);
                    if ($categoryResponses->isEmpty()) continue;
                    $satisfaction = $categoryResponses->avg('actual_value');
                    $expectation  = $categoryResponses->avg('expected_value');
                    $gap          = $expectation - $satisfaction;
                    $categoryScores[] = [
                        'category'     => $category->category,
                        'satisfaction' => round($satisfaction, 2),
                        'expectation'  => round($expectation, 2),
                        'gap'          => round($gap, 2)
                    ];
                }

                // 強み：満足度が高い順上位3件
                $strengths = collect($categoryScores)
                    ->sortByDesc('satisfaction')
                    ->take(3)
                    ->pluck('category')
                    ->toArray();

                // 弱み：ギャップが大きい順上位3件
                $weaknesses = collect($categoryScores)
                    ->sortByDesc('gap')
                    ->take(3)
                    ->pluck('category')
                    ->toArray();

                $deptAvg    = round(collect($categoryScores)->avg('satisfaction'), 1);
                $companyAvg = round($this->getCompanyAverage($instance->id), 1);

                $deptName = DB::table('departments')
                    ->where('id', $departmentId)
                    ->value('name') ?? '部署' . $departmentId;

                // サマリー文の生成
                $summary = "{$deptName}は";
                if (!empty($strengths)) {
                    $summary .= implode('、', array_slice($strengths, 0, 2)) . "において強みがあります。";
                }
                if (!empty($weaknesses)) {
                    $summary .= "一方、" . implode('、', array_slice($weaknesses, 0, 2)) . "に課題があります。";
                }
                if ($deptAvg > $companyAvg) {
                    $summary .= "全体平均と比較して満足度は高い傾向です。";
                } elseif ($deptAvg < $companyAvg) {
                    $summary .= "全体平均と比較してやや満足度が低い傾向です。";
                } else {
                    $summary .= "全体平均と同程度の満足度です。";
                }
                if (!empty($weaknesses)) {
                    $summary .= "特に" . $weaknesses[0] . "について優先的な改善が効果的です。";
                }

                $result['summary'][$date] = [
                    'strong'        => $strengths,
                    'weak'          => $weaknesses,
                    'summary'       => $summary,
                    'companyAvg'    => $companyAvg,
                    'departmentAvg' => $deptAvg
                ];
            }

            if (empty($result['dates'])) {
                $result['dates']   = [];
                $result['data']    = [];
                $result['summary'] = [];
            }
            return $result;
        } catch (\Exception $e) {
            $this->logToConsole('error', 'Error in generateTimeBasedMatrixData: ' . $e->getMessage());
            return [
                'dates'   => [],
                'data'    => [],
                'summary' => []
            ];
        }
    }

    /**
     * 部署のスコアを計算する
     *
     * @param int $departmentId
     * @param int $instanceId
     * @return float
     */
    private function calculateScoreForDept($departmentId, $instanceId)
    {
        try {
            $questionCount = DB::table('survey_questions')->count();
            if ($questionCount === 0) {
                throw new \Exception("質問データが存在しません");
            }
            $responses = DB::table('engagement_survey_responses')
                ->where('engagement_survey_instances_id', $instanceId)
                ->where('department_id', $departmentId)
                ->get();
            if ($responses->isEmpty()) {
                $stat = DB::table('engagement_score_statistics')
                    ->where('engagement_survey_instances_id', $instanceId)
                    ->first();
                if (!$stat) {
                    throw new \Exception("回答データが存在しません");
                }
                return $stat->score_average;
            }
            $totalGap = 0;
            $questionsProcessed = 0;
            foreach ($responses->groupBy('survey_question_id') as $questionResponses) {
                $avgSatisfaction = $questionResponses->avg('actual_value');
                $avgExpectation  = $questionResponses->avg('expected_value');
                $gap = $avgExpectation - $avgSatisfaction;
                $totalGap += $gap;
                $questionsProcessed++;
            }
            if ($questionsProcessed === 0) {
                throw new \Exception("有効な回答が存在しません");
            }
            $maxPossibleGap = $questionsProcessed * 5;
            $score = 100 - (100 / $maxPossibleGap) * $totalGap;
            return max(0, min(100, $score));
        } catch (\Exception $e) {
            $this->logToConsole('error', 'Error in calculateScoreForDept: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * 全社平均スコアを取得する
     *
     * @param int $instanceId
     * @return float
     */
    private function getCompanyAverage($instanceId)
    {
        try {
            $allDeptResponses = DB::table('engagement_survey_responses')
                ->where('engagement_survey_instances_id', $instanceId)
                ->get();
            if ($allDeptResponses->isEmpty()) {
                throw new \Exception("全社の回答データが存在しません");
            }
            $totalGap = 0;
            $questionsCount = $allDeptResponses->pluck('survey_question_id')->unique()->count();
            if ($questionsCount === 0) {
                throw new \Exception("質問データが存在しません");
            }
            foreach ($allDeptResponses->groupBy('survey_question_id') as $responses) {
                $avgSatisfaction = $responses->avg('actual_value');
                $avgExpectation  = $responses->avg('expected_value');
                $totalGap += ($avgExpectation - $avgSatisfaction);
            }
            $maxPossibleGap = $questionsCount * 5;
            $score = 100 - (100 / $maxPossibleGap) * $totalGap;
            return max(0, min(100, $score));
        } catch (\Exception $e) {
            $this->logToConsole('error', 'Error in getCompanyAverage: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * 偏差値（レーティング）を計算する
     *
     * @param int   $tenantId
     * @param float $score
     * @param int   $latestInstanceId
     * @return array ['rating' => 偏差値, 'label' => 文字評価]
     */
    private function calculateRating($tenantId, $score, $latestInstanceId)
    {
        try {
            $allScores = $this->getAllDeptScoresForTenant($tenantId, $latestInstanceId);
            $n = count($allScores);
            if ($n === 0) {
                throw new \Exception("全社スコアが存在しません");
            }
            $avg = array_sum($allScores) / $n;
            if ($n > 1) {
                $variance = 0;
                foreach ($allScores as $s) {
                    $variance += pow($s - $avg, 2);
                }
                $variance /= ($n - 1);
                $stdDev = sqrt($variance);
                if ($stdDev == 0) {
                    $stdDev = 1;
                }
            } else {
                $stdDev = 1;
            }
            $deviation = round(50 + 10 * (($score - $avg) / $stdDev), 1);
            $label = $this->convertRatingToLabel($deviation);
            return ['rating' => $deviation, 'label' => $label];
        } catch (\Exception $e) {
            $this->logToConsole('error', 'Error in calculateRating: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * 全社の各部署のスコア配列を取得する
     *
     * @param int $tenantId
     * @param int $instanceId
     * @return array
     */
    private function getAllDeptScoresForTenant($tenantId, $instanceId)
    {
        try {
            $departments = DB::table('departments')
                ->where('tenant_id', $tenantId)
                ->pluck('id')
                ->toArray();
            if (empty($departments)) {
                throw new \Exception("部署データが存在しません");
            }
            $scores = [];
            foreach ($departments as $deptId) {
                $deptScore = $this->calculateScoreForDept($deptId, $instanceId);
                $scores[] = round($deptScore, 1);
            }
            return $scores;
        } catch (\Exception $e) {
            $this->logToConsole('error', 'Error in getAllDeptScoresForTenant: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * 偏差値に応じた文字評価を返す
     *
     * @param float $deviation
     * @return string
     */
    private function convertRatingToLabel($deviation)
    {
        if ($deviation >= 60) {
            return 'S';
        } elseif ($deviation >= 58) {
            return 'A+';
        } elseif ($deviation >= 56) {
            return 'A';
        } elseif ($deviation >= 54) {
            return 'B+';
        } elseif ($deviation >= 52) {
            return 'B';
        } elseif ($deviation >= 50) {
            return 'B-';
        } elseif ($deviation >= 48) {
            return 'C+';
        } elseif ($deviation >= 45) {
            return 'C';
        } elseif ($deviation >= 42) {
            return 'C-';
        } elseif ($deviation >= 40) {
            return 'D+';
        } elseif ($deviation >= 38) {
            return 'D';
        }
    }

    /**
     * スコア履歴を取得する
     *
     * @param int   $departmentId
     * @param array $instanceIds
     * @return array
     */
    private function getScoreHistory($departmentId, $instanceIds)
    {
        try {
            $history = [];
            foreach ($instanceIds as $instanceId) {
                $instance = DB::table('engagement_survey_instances')
                    ->where('id', $instanceId)
                    ->first();
                if (!$instance) continue;
                $score = $this->calculateScoreForDept($departmentId, $instanceId);
                $rating = $this->calculateRating($instance->tenant_id, $score, $instanceId);
                $history[] = [
                    'date'  => $instance->start_date,
                    'score' => round($score, 1),
                    'rating'=> $rating['label']
                ];
            }
            return $history;
        } catch (Exception $e) {
            $this->logToConsole('error', 'Error in getScoreHistory: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * engagementSurveyData, managerScoreData, questionData を取得する
     * Seeder で投入されたデータをそのまま DB から取得する例です。
     *
     * @param int $tenantId
     * @param int $departmentId
     * @return array
     */
    private function getEngagementData($tenantId, $departmentId)
    {
        try {
            $surveyData = DB::table('engagement_survey_data')
                ->where('tenant_id', $tenantId)
                ->where('department_id', $departmentId)
                ->get();
            $managerData = DB::table('manager_scores')
                ->where('tenant_id', $tenantId)
                ->where('department_id', $departmentId)
                ->get();
            $questionData = DB::table('question_data')
                ->where('tenant_id', $tenantId)
                ->where('department_id', $departmentId)
                ->get();

            return [
                'surveyData'   => $surveyData,
                'managerData'  => $managerData,
                'questionData' => $questionData,
            ];
        } catch (Exception $e) {
            $this->logToConsole('error', 'Error in getEngagementData: ' . $e->getMessage());
            return [
                'surveyData'   => [],
                'managerData'  => [],
                'questionData' => []
            ];
        }
    }

    /**
     * 現在のサーベイステータスを取得する
     *
     * @param int $tenantId
     * @return array
     */
    private function getCurrentSurveyStatus($tenantId)
    {
        try {
            $now = new Carbon();
            $currentSurvey = DB::table('engagement_survey_instances')
                ->where('tenant_id', $tenantId)
                ->where('start_date', '<=', $now)
                ->where('end_date', '>=', $now)
                ->first();
            if ($currentSurvey) {
                return [
                    'state'      => 'inProgress',
                    'surveyData' => [
                        'id'            => $currentSurvey->id,
                        'title'         => $currentSurvey->title ?: date('Y年n月', strtotime($currentSurvey->start_date)) . ' エンゲージメントサーベイ',
                        'startDate'     => $currentSurvey->start_date,
                        'endDate'       => $currentSurvey->end_date,
                        'targetCount'   => $currentSurvey->target_count ?? 0,
                        'responseCount' => $currentSurvey->response_count ?? 0,
                    ]
                ];
            }
            return [
                'state'      => 'completed',
                'surveyData' => null
            ];
        } catch (Exception $e) {
            $this->logToConsole('error', 'Error in getCurrentSurveyStatus: ' . $e->getMessage());
            return [
                'state'      => 'completed',
                'surveyData' => null
            ];
        }
    }

    /**
     * インサイトテキストを生成する
     *
     * @return array
     */
    private function generateInsightTexts()
    {
        return [
            [
                'title' => '改善施策の効果測定',
                'text'  => '前回から今回へのスコア変化から、実施した施策の効果を具体的に評価できます。',
                'icon'  => '<div class="w-8 h-8 flex-shrink-0 bg-brand-teal rounded-full flex items-center justify-center text-white mr-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg></div>'
            ],
            [
                'title' => '長期的なトレンド',
                'text'  => '複数回のデータから、長期的な満足度や期待値の変化傾向を把握できます。上昇・下降・横ばいなどのパターンを分析することで、予測値の精度を高め、先手を打った対策が可能になります。',
                'icon'  => '<div class="w-8 h-8 flex-shrink-0 bg-brand-cyan rounded-full flex items-center justify-center text-white mr-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg></div>'
            ],
            [
                'title' => '季節変動・外部要因の影響',
                'text'  => '定期的な繁忙期や組織変更などのイベントがスコアに与える影響を時系列で確認できます。外部環境の変化と内部満足度の関係性を分析することで、より状況に応じた柔軟な対応が可能になります。',
                'icon'  => '<div class="w-8 h-8 flex-shrink-0 bg-brand-coral rounded-full flex items-center justify-center text-white mr-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></div>'
            ],
            [
                'title' => '継続的な課題の特定',
                'text'  => '複数回のサーベイでも改善が見られない項目は、より根本的・構造的な問題を示唆しています。短期的な対応では解決できない課題を特定することで、中長期的な組織改革の方向性を定めることができます。',
                'icon'  => '<div class="w-8 h-8 flex-shrink-0 bg-brand-orange rounded-full flex items-center justify-center text-white mr-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></div>'
            ]
        ];
    }

    /**
     * API のログをファイルとサーバーコンソール（error_log）に出力する共通メソッド
     *
     * @param string $level   info, warning, error など
     * @param string $message
     * @return void
     */
    private function logToConsole($level, $message)
    {
        switch ($level) {
            case 'info':
                Log::info($message);
                break;
            case 'warning':
                Log::warning($message);
                break;
            case 'error':
                Log::error($message);
                break;
            default:
                Log::debug($message);
                break;
        }
        // サーバーのコンソールにも出力
        error_log(strtoupper($level) . ': ' . $message);
    }
}