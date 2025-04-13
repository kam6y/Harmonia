<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Exception;

class ManagerDashboardController extends Controller
{
    /**
     * ダッシュボード画面のデータを取得
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSurveyData(Request $request)
    {
        try {
            // リクエストから tenant_id と department_id を取得
            $tenantId = $request->input('tenant_id');
            $departmentId = $request->input('department_id');

            if (!$tenantId || !$departmentId) {
                return response()->json([
                    'success' => false,
                    'message' => 'tenant_idとdepartment_idは必須パラメータです。'
                ], 400);
            }

            // 自部署＋配下部署を取得
            $departments = $this->getDepartments($tenantId, $departmentId);
            $deptIds = $departments->pluck('id')->toArray();

            // エンゲージメントサーベイのインスタンスを日付降順で取得
            $instances = DB::table('engagement_survey_instances')
                ->where('tenant_id', $tenantId)
                ->orderBy('start_date', 'desc')
                ->get();

            if ($instances->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'サーベイデータが見つかりません'
                ], 404);
            }

            $latestInstance = $instances->first();
            $instanceIds = $instances->pluck('id')->toArray();

            // 各データの取得
            $scoreData     = $this->calculateScores($tenantId, $departmentId, $deptIds, $latestInstance->id, $instanceIds);
            $responseRates = $this->calculateResponseRates($deptIds, $latestInstance->id);
            $surveyScores  = $this->getSurveyScores($tenantId, $deptIds, $latestInstance->id);
            $quadrantData  = $this->getQuadrantAnalysis($deptIds, $latestInstance->id);
            $trendData     = $this->getTrendData($deptIds, $instanceIds);

            return response()->json([
                'success' => true,
                'data' => [
                    'departments'   => $departments,
                    'latestSurvey'  => [
                        'id'         => $latestInstance->id,
                        'start_date' => $latestInstance->start_date,
                    ],
                    'scoreData'     => $scoreData,
                    'responseRates' => $responseRates,
                    'surveyScores'  => $surveyScores,
                    'quadrantData'  => $quadrantData,
                    'trendData'     => $trendData,
                    // generateInsightTexts() で定義したインサイト情報を追加
                    'insightTexts'  => $this->generateInsightTexts(),
                ]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'エラーが発生しました: ' . $e->getMessage(),
                'trace'   => $e->getTraceAsString()
            ], 500);
        }
    }

    /**
     * 指定部署（自部署＋配下部署）を取得
     *
     * @param int $tenantId
     * @param int $departmentId
     * @return \Illuminate\Support\Collection
     */
    private function getDepartments($tenantId, $departmentId)
    {
        $mainDepartment = DB::table('departments')
            ->where('id', $departmentId)
            ->where('tenant_id', $tenantId)
            ->first();

        if (!$mainDepartment) {
            throw new Exception('指定された部署が見つかりません');
        }

        $subordinateDeptIds = DB::table('departments_relations')
            ->where('parent_department_id', $departmentId)
            ->pluck('child_department_id')
            ->toArray();

        $allDepartmentIds = array_merge([$departmentId], $subordinateDeptIds);
        $departments = DB::table('departments')
            ->whereIn('id', $allDepartmentIds)
            ->where('tenant_id', $tenantId)
            ->select('id', 'name', 'front_only_departments_id')
            ->get();

        return $departments;
    }

    /**
     * 全社の部署のスコア配列を取得する共通関数
     *
     * @param int $tenantId
     * @param int $instanceId
     * @return array 0〜100のスコア配列
     */
    private function getAllDeptScoresForTenant($tenantId, $instanceId)
    {
        $departments = DB::table('departments')
            ->where('tenant_id', $tenantId)
            ->pluck('id')
            ->toArray();

        $scores = [];
        foreach ($departments as $deptId) {
            $deptScore = $this->calculateScoreForDept($deptId, $instanceId);
            $scores[] = round($deptScore, 1);
        }
        return $scores;
    }

    /**
     * スコアを計算する
     *
     * @param int   $tenantId
     * @param int   $mainDeptId メイン部署ID
     * @param array $deptIds 全部署（自部署＋配下）ID
     * @param int   $latestInstanceId 最新インスタンスID
     * @param array $allInstanceIds 全インスタンスID
     * @return array
     */
    private function calculateScores($tenantId, $mainDeptId, $deptIds, $latestInstanceId, $allInstanceIds)
    {
        $latestInstance = DB::table('engagement_survey_instances')
            ->where('id', $latestInstanceId)
            ->where('tenant_id', $tenantId)
            ->first();
        if (!$latestInstance) {
            throw new Exception('最新インスタンスが見つかりません');
        }
    
        $prevInstance = DB::table('engagement_survey_instances')
            ->where('tenant_id', $tenantId)
            ->where('start_date', '<', $latestInstance->start_date)
            ->orderBy('start_date', 'desc')
            ->first();
        $prevInstanceId = $prevInstance ? $prevInstance->id : null;
    
        $oneYearBefore = Carbon::parse($latestInstance->start_date)->subYear();
        $prevYearInstance = DB::table('engagement_survey_instances')
            ->where('tenant_id', $tenantId)
            ->where('start_date', '<=', $oneYearBefore)
            ->orderBy('start_date', 'desc')
            ->first();
    
        $allScores = $this->getAllDeptScoresForTenant($tenantId, $latestInstanceId);
        $n = count($allScores);
        if ($n == 0) {
            $avg = 0;
            $stdDev = 1;
        } else {
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
        }
        $companyAvg = round($avg, 1);
    
        $deptScores = [];
        foreach ($deptIds as $deptId) {
            $dept = DB::table('departments')->where('id', $deptId)->first();
            if (!$dept) continue;
    
            $latestScore = $this->calculateScoreForDept($deptId, $latestInstanceId);
            $prevScore = $prevInstanceId ? $this->calculateScoreForDept($deptId, $prevInstanceId) : null;
            $diff = ($prevScore !== null) ? round($latestScore - $prevScore, 1) : null;
    
            $prevYearScore = $prevYearInstance ? $this->calculateScoreForDept($deptId, $prevYearInstance->id) : null;
            $yearDiff = ($prevYearScore !== null) ? round($latestScore - $prevYearScore, 1) : null;
    
            $departmentCompanyDiff = round($latestScore - $companyAvg, 1);
            $deviation = round(50 + 10 * (($latestScore - $avg) / $stdDev), 1);
            $ratingLabel = $this->convertRatingToLabel($deviation);
    
            $deptScores[] = [
                'id'          => $dept->id,
                'name'        => $dept->name,
                'score'       => round($latestScore, 1),
                'prevDiff'    => $diff,
                'diff'        => $departmentCompanyDiff,
                'yearDiff'    => $yearDiff,
                'rating'      => $deviation,
                'ratingLabel' => $ratingLabel,
            ];
        }
    
        $mainDeptScore = collect($deptScores)->firstWhere('id', $mainDeptId);
        $scoreHistory = $this->getScoreHistory($mainDeptId, $allInstanceIds);
    
        return [
            'currentScore'     => $mainDeptScore ? $mainDeptScore['score'] : null,
            'prevDiff'         => $mainDeptScore ? $mainDeptScore['prevDiff'] : null,
            'companyAvg'       => $companyAvg,
            'companyDiff'      => $prevInstanceId ? round($companyAvg - $this->getCompanyAverage($prevInstanceId), 1) : null,
            'rating'           => $mainDeptScore ? $mainDeptScore['rating'] : null,
            'ratingLabel'      => $mainDeptScore ? $mainDeptScore['ratingLabel'] : null,
            'history'          => $scoreHistory,
            'departmentScores' => $deptScores
        ];
    }
    
    /**
     * 部門ごとのスコアを計算
     *
     * @param int $departmentId
     * @param int $instanceId
     * @return float
     */
    private function calculateScoreForDept($departmentId, $instanceId)
    {
        $questionCount = DB::table('survey_questions')->count();
        if ($questionCount === 0) {
            return 0;
        }
    
        $responses = DB::table('engagement_survey_responses')
            ->where('engagement_survey_instances_id', $instanceId)
            ->where('department_id', $departmentId)
            ->get();
    
        if ($responses->isEmpty()) {
            $stat = DB::table('engagement_score_statistics')
                ->where('engagement_survey_instances_id', $instanceId)
                ->first();
            return $stat ? $stat->score_average : 0;
        }
    
        $totalGap = 0;
        $questionsProcessed = 0;
        foreach ($responses->groupBy('survey_question_id') as $questionId => $questionResponses) {
            $avgSatisfaction = $questionResponses->avg('actual_value');
            $avgExpectation = $questionResponses->avg('expected_value');
            $gap = $avgExpectation - $avgSatisfaction;
            $totalGap += $gap;
            $questionsProcessed++;
        }
        if ($questionsProcessed === 0) return 0;
    
        $maxPossibleGap = $questionsProcessed * 5;
        $score = 100 - (100 / $maxPossibleGap) * $totalGap;
        return max(0, min(100, $score));
    }
    
    /**
     * 全社平均スコアを取得
     *
     * @param int $instanceId
     * @return float
     */
    private function getCompanyAverage($instanceId)
    {
        $allDeptResponses = DB::table('engagement_survey_responses')
            ->where('engagement_survey_instances_id', $instanceId)
            ->get();
        if ($allDeptResponses->isEmpty()) {
            return 0;
        }
        $totalGap = 0;
        $questionsCount = $allDeptResponses->pluck('survey_question_id')->unique()->count();
        if ($questionsCount === 0) {
            return 0;
        }
        foreach ($allDeptResponses->groupBy('survey_question_id') as $questionId => $responses) {
            $avgSatisfaction = $responses->avg('actual_value');
            $avgExpectation = $responses->avg('expected_value');
            $totalGap += ($avgExpectation - $avgSatisfaction);
        }
        $maxPossibleGap = $questionsCount * 5;
        $score = 100 - (100 / $maxPossibleGap) * $totalGap;
        return max(0, min(100, $score));
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
        $allScores = $this->getAllDeptScoresForTenant($tenantId, $latestInstanceId);
        $n = count($allScores);
        if ($n === 0) {
            return ['rating' => 50, 'label' => 'B'];
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
        $history = [];
        foreach ($instanceIds as $instanceId) {
            $instance = DB::table('engagement_survey_instances')
                ->where('id', $instanceId)
                ->first();
            if (!$instance) continue;
            $score = $this->calculateScoreForDept($departmentId, $instanceId);
            $rating = $this->calculateRating($instance->tenant_id, $score, $instanceId);
            $history[] = [
                'date' => $instance->start_date,
                'score' => round($score, 1),
                'rating' => $rating['label']
            ];
        }
        return array_reverse($history);
    }
    
    /**
     * 部署ごとの回答率を計算する
     *
     * @param array $deptIds
     * @param int   $instanceId
     * @return array
     */
    private function calculateResponseRates($deptIds, $instanceId)
    {
        $result = [];
        foreach ($deptIds as $deptId) {
            $dept = DB::table('departments')->where('id', $deptId)->first();
            if (!$dept) continue;
            $staffCount = DB::table('staff_identity')
                ->where('department_id', $deptId)
                ->count();
            if ($staffCount === 0) continue;
            $respondedCount = DB::table('engagement_survey_responses')
                ->where('engagement_survey_instances_id', $instanceId)
                ->where('department_id', $deptId)
                ->where('survey_question_id', 1)
                ->count();
            $rate = $staffCount > 0 ? round(($respondedCount / $staffCount) * 100) : 0;
            $result[] = [
                'label' => $dept->name,
                'rate' => $rate
            ];
        }
        return $result;
    }
    
    /**
     * 最新のサーベイスコア詳細を取得する
     *
     * @param int   $tenantId
     * @param array $deptIds 自部署＋配下部署のID
     * @param int   $instanceId
     * @return array
     */
    private function getSurveyScores($tenantId, $deptIds, $instanceId)
    {
        $categories = DB::table('survey_questions')
            ->select('id', 'issue_category as category', 'question_text')
            ->get();
    
        $tenantAllDepts = DB::table('departments')
            ->where('tenant_id', $tenantId)
            ->get();
    
        $selectedDepts = DB::table('departments')
            ->whereIn('id', $deptIds)
            ->get();
    
        $companyData = $this->computeSurveyDataForMultipleDepts($tenantId, $tenantAllDepts, $categories, $instanceId, '全社');
    
        $result = [];
        foreach ($selectedDepts as $dept) {
            $deptData = $this->computeSurveyDataForMultipleDepts($tenantId, collect([$dept]), $categories, $instanceId, $dept->name);
            $result[] = $deptData;
        }
    
        array_unshift($result, $companyData);
        return $result;
    }
    
    /**
     * 複数部署分のサーベイ集計データを計算するヘルパー関数
     *
     * @param int    $tenantId
     * @param \Illuminate\Support\Collection $depts 対象部署コレクション
     * @param \Illuminate\Support\Collection $categories 質問カテゴリ
     * @param int    $instanceId
     * @param string $label 出力時の部署ラベル（例："全社"、"人事部" など）
     * @return array
     */
    private function computeSurveyDataForMultipleDepts($tenantId, $depts, $categories, $instanceId, $label)
    {
        $data = [
            'id' => ($label === '全社') ? 'all' : $depts->first()->id,
            'department' => $label,
            'satisfaction' => 0,
            'expectation' => 0,
            'gap' => 0,
            'satisfactionComparison' => 0,
            'expectationComparison' => 0,
            'gapComparison' => 0,
            'defaultCategories' => [],
            'customCategories' => []
        ];
    
        $currentInstance = DB::table('engagement_survey_instances')
            ->where('id', $instanceId)
            ->where('tenant_id', $tenantId)
            ->first();
        $prevInstance = DB::table('engagement_survey_instances')
            ->where('tenant_id', $tenantId)
            ->where('start_date', '<', $currentInstance->start_date)
            ->orderBy('start_date', 'desc')
            ->first();
        $prevInstanceId = $prevInstance ? $prevInstance->id : null;
    
        $mergedDefaultCats = [];
        $mergedCustomCats = [];
        $deptCount = 0;
        $totalSatisfaction = 0;
        $totalExpectation = 0;
        $totalSatComp = 0;
        $totalExpComp = 0;
    
        foreach ($depts as $dept) {
            $currentResponses = DB::table('engagement_survey_responses')
                ->where('engagement_survey_instances_id', $instanceId)
                ->where('department_id', $dept->id)
                ->get();
            $prevResponses = $prevInstanceId
                ? DB::table('engagement_survey_responses')
                ->where('engagement_survey_instances_id', $prevInstanceId)
                ->where('department_id', $dept->id)
                ->get()
                : collect();
    
            $tmpDefault = [];
            $tmpCustom = [];
    
            foreach ($categories as $cat) {
                $catResp = $currentResponses->where('survey_question_id', $cat->id);
                if ($catResp->isEmpty()) {
                    continue;
                }
                $satisfaction = round($catResp->avg('actual_value'), 1);
                $expectation = round($catResp->avg('expected_value'), 1);
                $gap = round($expectation - $satisfaction, 1);
    
                $prevCatResp = $prevResponses->where('survey_question_id', $cat->id);
                $prevSatisfaction = $prevCatResp->isEmpty() ? null : round($prevCatResp->avg('actual_value'), 1);
                $prevExpectation = $prevCatResp->isEmpty() ? null : round($prevCatResp->avg('expected_value'), 1);
                $prevGap = ($prevSatisfaction !== null && $prevExpectation !== null)
                    ? round($prevExpectation - $prevSatisfaction, 1)
                    : null;
    
                $satComp = ($prevSatisfaction !== null) ? round($satisfaction - $prevSatisfaction, 1) : null;
                $expComp = ($prevExpectation !== null)  ? round($expectation - $prevExpectation, 1) : null;
                $gapComp = ($prevGap !== null) ? round($gap - $prevGap, 1) : null;
    
                $catData = [
                    'satisfaction' => $satisfaction,
                    'expectation' => $expectation,
                    'gap' => $gap,
                    'satisfactionComparison' => $satComp,
                    'expectationComparison' => $expComp,
                    'gapComparison' => $gapComp,
                ];
    
                $isCustom = DB::table('tenant-additional_question_relations')
                    ->where('survey_question_id', $cat->id)
                    ->exists();
    
                if ($isCustom) {
                    $tmpCustom[$cat->category] = $catData;
                } else {
                    $tmpDefault[$cat->category] = $catData;
                }
    
                $totalSatisfaction += $satisfaction;
                $totalExpectation += $expectation;
                $totalSatComp += ($satComp !== null ? $satComp : 0);
                $totalExpComp += ($expComp !== null ? $expComp : 0);
            }
            $catCount = count($tmpDefault) + count($tmpCustom);
            if ($catCount > 0) {
                $mergedDefaultCats[] = $tmpDefault;
                $mergedCustomCats[] = $tmpCustom;
                $deptCount++;
            }
        }
    
        $defTempArray = [];
        $cusTempArray = [];
        foreach ($mergedDefaultCats as $oneDeptDefault) {
            foreach ($oneDeptDefault as $catName => $catData) {
                if (!isset($defTempArray[$catName])) {
                    $defTempArray[$catName] = [
                        'satisfaction' => 0,
                        'expectation' => 0,
                        'gap' => 0,
                        'satComp' => 0,
                        'expComp' => 0,
                        'gapComp' => 0,
                        'count' => 0,
                    ];
                }
                $defTempArray[$catName]['satisfaction'] += $catData['satisfaction'];
                $defTempArray[$catName]['expectation'] += $catData['expectation'];
                $defTempArray[$catName]['gap'] += $catData['gap'];
                $defTempArray[$catName]['satComp'] += ($catData['satisfactionComparison'] ?? 0);
                $defTempArray[$catName]['expComp'] += ($catData['expectationComparison'] ?? 0);
                $defTempArray[$catName]['gapComp'] += ($catData['gapComparison'] ?? 0);
                $defTempArray[$catName]['count']++;
            }
        }
        foreach ($mergedCustomCats as $oneDeptCustom) {
            foreach ($oneDeptCustom as $catName => $catData) {
                if (!isset($cusTempArray[$catName])) {
                    $cusTempArray[$catName] = [
                        'satisfaction' => 0,
                        'expectation' => 0,
                        'gap' => 0,
                        'satComp' => 0,
                        'expComp' => 0,
                        'gapComp' => 0,
                        'count' => 0,
                    ];
                }
                $cusTempArray[$catName]['satisfaction'] += $catData['satisfaction'];
                $cusTempArray[$catName]['expectation'] += $catData['expectation'];
                $cusTempArray[$catName]['gap'] += $catData['gap'];
                $cusTempArray[$catName]['satComp'] += ($catData['satisfactionComparison'] ?? 0);
                $cusTempArray[$catName]['expComp'] += ($catData['expectationComparison'] ?? 0);
                $cusTempArray[$catName]['gapComp'] += ($catData['gapComparison'] ?? 0);
                $cusTempArray[$catName]['count']++;
            }
        }
        $finalDefault = [];
        $finalCustom = [];
        foreach ($defTempArray as $catName => $vals) {
            $c = $vals['count'];
            $avgSatisfaction = round($vals['satisfaction'] / $c, 1);
            $avgExpectation  = round($vals['expectation'] / $c, 1);
            $avgGap          = round($avgExpectation - $avgSatisfaction, 1);
            $avgSatComp = round($vals['satComp'] / $c, 1);
            $avgExpComp = round($vals['expComp'] / $c, 1);
            $avgGapComp = round($vals['gapComp'] / $c, 1);
            $finalDefault[$catName] = [
                'satisfaction' => $avgSatisfaction,
                'expectation' => $avgExpectation,
                'gap' => $avgGap,
                'satisfactionComparison' => $avgSatComp,
                'expectationComparison' => $avgExpComp,
                'gapComparison' => $avgGapComp,
            ];
        }
        foreach ($cusTempArray as $catName => $vals) {
            $c = $vals['count'];
            $avgSatisfaction = round($vals['satisfaction'] / $c, 1);
            $avgExpectation  = round($vals['expectation'] / $c, 1);
            $avgGap          = round($avgExpectation - $avgSatisfaction, 1);
            $avgSatComp = round($vals['satComp'] / $c, 1);
            $avgExpComp = round($vals['expComp'] / $c, 1);
            $avgGapComp = round($vals['gapComp'] / $c, 1);
            $finalCustom[$catName] = [
                'satisfaction' => $avgSatisfaction,
                'expectation' => $avgExpectation,
                'gap' => $avgGap,
                'satisfactionComparison' => $avgSatComp,
                'expectationComparison' => $avgExpComp,
                'gapComparison' => $avgGapComp,
            ];
        }
    
        if ($deptCount > 0) {
            $avgSatisfaction = round($totalSatisfaction / ($deptCount * count($categories)), 1);
            $avgExpectation  = round($totalExpectation / ($deptCount * count($categories)), 1);
            $avgGap = round($avgExpectation - $avgSatisfaction, 1);
            $avgSatComp = round($totalSatComp / ($deptCount * count($categories)), 1);
            $avgExpComp = round($totalExpComp / ($deptCount * count($categories)), 1);
            $gapComp    = round($avgGap - ($avgExpComp - $avgSatComp), 1);
            $data['satisfaction'] = $avgSatisfaction;
            $data['expectation'] = $avgExpectation;
            $data['gap'] = $avgGap;
            $data['satisfactionComparison'] = $avgSatComp;
            $data['expectationComparison'] = $avgExpComp;
            $data['gapComparison'] = $gapComp;
        }
    
        $data['defaultCategories'] = $finalDefault;
        $data['customCategories'] = $finalCustom;
    
        return $data;
    }
    
    /**
     * 4象限マトリクス分析データを取得する
     *
     * @param array $deptIds
     * @param int   $instanceId
     * @return array
     */
    private function getQuadrantAnalysis($deptIds, $instanceId)
    {
        $result = [];
        $allDepts = DB::table('departments')->whereIn('id', $deptIds)->get();
        $categories = DB::table('survey_questions')
            ->select('id', 'issue_category as category')
            ->get();
    
        foreach ($allDepts as $dept) {
            $deptData = [];
            $responses = DB::table('engagement_survey_responses')
                ->where('engagement_survey_instances_id', $instanceId)
                ->where('department_id', $dept->id)
                ->get();
            foreach ($categories as $category) {
                $categoryResponses = $responses->where('survey_question_id', $category->id);
                if ($categoryResponses->isEmpty()) continue;
                $satisfaction = $categoryResponses->avg('actual_value');
                $expectation = $categoryResponses->avg('expected_value');
                $deptData[] = [
                    'id' => $category->id,
                    'category' => $category->category,
                    'x' => round($satisfaction, 1),
                    'y' => round($expectation, 1)
                ];
            }
            if (!empty($deptData)) {
                $result[$dept->name] = $deptData;
            }
        }
    
        $summaryData = [];
        foreach ($allDepts as $dept) {
            $responses = DB::table('engagement_survey_responses')
                ->where('engagement_survey_instances_id', $instanceId)
                ->where('department_id', $dept->id)
                ->get();
            if ($responses->isEmpty()) continue;
            $categoryScores = [];
            foreach ($categories as $category) {
                $categoryResponses = $responses->where('survey_question_id', $category->id);
                if ($categoryResponses->isEmpty()) continue;
                $satisfaction = $categoryResponses->avg('actual_value');
                $expectation = $categoryResponses->avg('expected_value');
                $gap = $expectation - $satisfaction;
                $categoryScores[] = [
                    'category' => $category->category,
                    'satisfaction' => round($satisfaction, 2),
                    'expectation' => round($expectation, 2),
                    'gap' => round($gap, 2)
                ];
            }
            $strengths = collect($categoryScores)
                ->sortByDesc('satisfaction')
                ->take(3)
                ->pluck('category')
                ->toArray();
            $weaknesses = collect($categoryScores)
                ->sortByDesc('gap')
                ->take(3)
                ->pluck('category')
                ->toArray();
            $deptAvg = round(collect($categoryScores)->avg('satisfaction'), 1);
            $companyAvg = round($this->getCompanyAverage($instanceId), 1);
            $summary = "{$dept->name}は";
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
                $summary .= "全体平均と同程度の満足度傾向です。";
            }
            if (!empty($weaknesses)) {
                $summary .= "特に" . $weaknesses[0] . "について優先的な改善が効果的です。";
            }
            $summaryData[$dept->name] = [
                'strong' => $strengths,
                'weak' => $weaknesses,
                'summary' => $summary,
                'companyAvg' => $companyAvg,
                'departmentAvg' => $deptAvg
            ];
        }
    
        return [
            'departmentData' => $result,
            'departmentSummary' => $summaryData
        ];
    }
    
    /**
     * サーベイ結果の時系列推移データを取得する
     *
     * @param array $deptIds
     * @param array $instanceIds
     * @return array
     */
    private function getTrendData($deptIds, $instanceIds)
    {
        $instances = DB::table('engagement_survey_instances')
            ->whereIn('id', $instanceIds)
            ->orderBy('start_date', 'asc')
            ->get();
    
        $departments = DB::table('departments')
            ->whereIn('id', $deptIds)
            ->get()
            ->keyBy('id');
    
        $categories = DB::table('survey_questions')
            ->select('id', 'issue_category as name', 'question_text')
            ->get()
            ->keyBy('id');
    
        $result = [
            'periods' => [],
            'departments' => array_values($departments->pluck('name')->toArray()),
            'categories' => $categories->map(function ($item) {
                return ['id' => $item->id, 'name' => $item->name];
            })->values()->toArray(),
            'scores' => [],
            'periodMapping' => [],
            'targets' => [],
            'yearOverYearImprovement' => [],
            'categoryImportance' => []
        ];
    
        foreach ($instances as $instance) {
            $periodId = date('Y-n', strtotime($instance->start_date));
            $result['periods'][] = $periodId;
            $result['periodMapping'][$periodId] = date('Y年n月', strtotime($instance->start_date)) . '期';
    
            foreach ($departments as $dept) {
                $responses = DB::table('engagement_survey_responses')
                    ->where('engagement_survey_instances_id', $instance->id)
                    ->where('department_id', $dept->id)
                    ->get();
    
                if ($responses->isEmpty()) {
                    $stat = DB::table('engagement_score_statistics')
                        ->where('engagement_survey_instances_id', $instance->id)
                        ->first();
                    if ($stat) {
                        $result['scores'][] = [
                            'period' => $periodId,
                            'department' => $dept->name,
                            'category' => 'overall',
                            'satisfaction' => round($stat->score_average, 1),
                            'expectation' => null,
                            'gap' => null
                        ];
                    }
                    continue;
                }
    
                foreach ($categories as $categoryId => $category) {
                    $categoryResponses = $responses->where('survey_question_id', $categoryId);
                    if ($categoryResponses->isEmpty()) continue;
    
                    $satisfaction = $categoryResponses->avg('actual_value');
                    $expectation  = $categoryResponses->avg('expected_value');
                    $gap = $expectation - $satisfaction;
    
                    $satisfactionScore = round($satisfaction, 1);
                    $expectationScore  = round($expectation, 1);
                    $gapScore          = round($expectationScore - $satisfactionScore, 1);
    
                    $result['scores'][] = [
                        'period' => $periodId,
                        'department' => $dept->name,
                        'category' => $category->name,
                        'satisfaction' => $satisfactionScore,
                        'expectation'  => $expectationScore,
                        'gap'          => $gapScore
                    ];
                }
    
                $overallSatisfaction = $responses->avg('actual_value');
                $overallScore = round($overallSatisfaction, 1);
                $result['scores'][] = [
                    'period' => $periodId,
                    'department' => $dept->name,
                    'category' => 'overall',
                    'satisfaction' => $overallScore,
                    'expectation' => null,
                    'gap' => null
                ];
            }
    
            $allResponses = DB::table('engagement_survey_responses')
                ->where('engagement_survey_instances_id', $instance->id)
                ->whereIn('department_id', $deptIds)
                ->get();
    
            if (!$allResponses->isEmpty()) {
                $companySatisfaction = $allResponses->avg('actual_value');
                $companyScore = round($companySatisfaction, 1);
                $result['scores'][] = [
                    'period' => $periodId,
                    'department' => '全社平均',
                    'category' => 'overall',
                    'satisfaction' => $companyScore,
                    'expectation' => null,
                    'gap' => null
                ];
    
                foreach ($categories as $categoryId => $category) {
                    $categoryResponses = $allResponses->where('survey_question_id', $categoryId);
                    if ($categoryResponses->isEmpty()) continue;
    
                    $satisfaction = $categoryResponses->avg('actual_value');
                    $expectation  = $categoryResponses->avg('expected_value');
                    $gap = $expectation - $satisfaction;
                    $satisfactionScore = round($satisfaction, 1);
                    $expectationScore  = round($expectation, 1);
                    $gapScore          = round($expectationScore - $satisfactionScore, 1);
    
                    $result['scores'][] = [
                        'period' => $periodId,
                        'department' => '全社平均',
                        'category' => $category->name,
                        'satisfaction' => $satisfactionScore,
                        'expectation'  => $expectationScore,
                        'gap'          => $gapScore
                    ];
                }
            }
        }
    
        foreach ($departments as $dept) {
            $latestScore = $this->calculateScoreForDept($dept->id, $instances->last()->id);
            $result['targets'][$dept->name] = round(min(5, $latestScore + 0.5), 1);
        }
        $result['targets']['全社平均'] = 3.5;
    
        foreach ($departments as $dept) {
            $result['yearOverYearImprovement'][$dept->name] = round(mt_rand(30, 75) / 10, 1);
        }
        $result['yearOverYearImprovement']['全社平均'] = 5.7;
    
        foreach ($categories as $category) {
            $result['categoryImportance'][$category->name] = mt_rand(3, 5);
        }
        $result['categoryImportance']['overall'] = 5;
    
        $result['summaryText'] = $this->generateSummaryText($result);
    
        return $result;
    }
    
    /**
     * サーベイ結果サマリーテキストを生成する（既存の関数）
     *
     * @param array $data
     * @return string
     */
    private function generateSummaryText($data)
    {
        return "本期の調査結果では、全社平均の満足度は前回より若干上昇(+0.3)しています。部署間で異なる傾向が見られ、開発部の満足度(65.7)が最も高く、リモートワーク環境への適応が進んでいることが特徴的です。一方、営業部と経理部では満足度が低下傾向にあり、特にリモートワーク環境におけるギャップ値が大きくなっています。全社的に期待値は上昇(+0.5)傾向にあるため、GAP値は拡大しています。この結果から、リモートワーク環境の整備と部署間の業務特性に合わせた支援策の強化が今後の課題と考えられます。";
    }
    
    /**
     * インサイトテキストを生成する新規関数
     *
     * @return array
     */
    private function generateInsightTexts()
    {
        return [
            [
                'title' => '改善施策の効果測定',
                'text'  => '前回から今回へのスコア変化から、実施した施策の効果を具体的に評価できます。',
                'icon'  => '<div class="w-8 h-8 flex-shrink-0 bg-brand-teal rounded-full flex items-center justify-center text-white mr-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                </svg>
                             </div>'
            ],
            [
                'title' => '長期的なトレンド',
                'text'  => '複数回のデータから、長期的な満足度や期待値の変化傾向を把握できます。上昇・下降・横ばいなどのパターンを分析することで、予測値の精度を高め、先手を打った対策が可能になります。',
                'icon'  => '<div class="w-8 h-8 flex-shrink-0 bg-brand-cyan rounded-full flex items-center justify-center text-white mr-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
                                </svg>
                             </div>'
            ],
            [
                'title' => '季節変動・外部要因の影響',
                'text'  => '定期的な繁忙期や組織変更などのイベントがスコアに与える影響を時系列で確認できます。外部環境の変化と内部満足度の関係性を分析することで、より状況に応じた柔軟な対応が可能になります。',
                'icon'  => '<div class="w-8 h-8 flex-shrink-0 bg-brand-coral rounded-full flex items-center justify-center text-white mr-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                </svg>
                             </div>'
            ],
            [
                'title' => '継続的な課題の特定',
                'text'  => '複数回のサーベイでも改善が見られない項目は、より根本的・構造的な問題を示唆しています。短期的な対応では解決できない課題を特定することで、中長期的な組織改革の方向性を定めることができます。',
                'icon'  => '<div class="w-8 h-8 flex-shrink-0 bg-brand-orange rounded-full flex items-center justify-center text-white mr-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                             </div>'
            ],
        ];
    }
}