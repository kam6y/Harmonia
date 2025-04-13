<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\EngagementSurveyInstance;
use App\Models\EngagementSurveyResponse;
use App\Models\Measure;
use App\Models\MeasureComment;
use App\Models\PulseSurveyInstance;
use App\Models\PulseSurveyResponse;
use App\Models\StaffIdentity;
use App\Models\SurveyQuestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ManagerImprovementController extends Controller
{
    /**
     * GET /api/improvements?orgId=...
     * 施策データの取得処理
     */
    public function getImprovements($orgId)
    {
        $measures = Measure::where('department_id', $orgId)->get();
        $department_name = Department::where('id', $orgId)->pluck('name')->first();
        $manager_name = StaffIdentity::where('department_id', $orgId)->where('is_manager','true')->pluck('name')->first();
        $results = [];
        foreach ($measures as $measure) {
            $comments = MeasureComment::where('measure_id', $measure->id)->get();
            $chat = [];
            foreach ($comments as $comment) {
                if($comment->staff_id != null){
                    $chat[] = [
                        "author" => "スタッフ",
                        "date" => $comment->created_at->format('Y/m/d'),
                        "text" => $comment->comment_text,
                    ];
                }
                if($comment->admin_id != null){
                    $chat[] = [
                        "author" => $comment->adminIdentity->name,
                        "date" =>  $comment->created_at->format('Y/m/d'),
                        "text" => $comment->comment_text,
                    ];
                }
            }
            $issue_category_id = SurveyQuestion::where('issue_category', $measure->issue_category)->pluck('id')->first();
            $results[] = [
                "id" => $measure->id,
                "issue_category" => $issue_category_id,
                "title" => $measure["measure_text"],
                "category" => $measure["issue_category"],
                "responsible" => $measure["assignee"],
                "status" => $measure["status"],
                "department" => $department_name,
                "manager" =>  $manager_name,
                //なんか此処変わりそう
                "issue" => $measure["issue_category"],
                "description" => $measure["action_plan_details"],
                //此処も絶対変わる
                "satisfaction" => $measure["goal_actual_value"],
                //なんか此処変わりそう
                "deadline" => $measure["deadline"],
                "comments" => $chat,
            ];
        }
        return response()->json($results);
    }


    /**
     * GET /api/pulse-survey?orgId=...
     * パルスサーベイデータの取得処理
     */
    public function getPulseSurvey($orgId)
    {
        // パルス調査2回分のインスタンスを取得
        $pulse_instances = PulseSurveyInstance::where('department_id', $orgId)
            ->orderBy('created_at', 'desc')
            ->take(2)
            ->get();

        // 各パルス調査ごとの結果を格納する配列
        $surveys = [];

        // 各パルス調査ごとに全質問の集計結果を作成
        foreach ($pulse_instances as $index => $pulse_instance) {
            $pulse_responses = PulseSurveyResponse::where('pulse_survey_instances_id', $pulse_instance->id)->get();
            $surveys[$index] = $pulse_responses->groupBy('survey_question_id')->map(function ($group) {
                return [
                    'survey_question_id' => $group->first()->survey_question_id,
                    'avg_actual_value'   => round($group->avg('actual_value'), 1),
                    'avg_expected_value' => round($group->avg('expected_value'), 1),
                ];
            })->values()->toArray(); // toArray()で純粋な配列に変換
        }

        // 各質問ごとにキーを質問IDにする（調査0・調査1ともに）
        $survey0 = collect($surveys[0])->keyBy('survey_question_id');
        $survey1 = collect($surveys[1])->keyBy('survey_question_id');

        // 結果を格納する配列
        $results = [];

        // 調査0の全質問に対してループ（調査0に存在する全質問が対象）
        foreach ($survey0 as $question_id => $data0) {
            // 調査1でも同じ質問がある場合はそのデータを取得
            $data1 = $survey1->get($question_id);

            $results[] = [
                "categoryId"                => $question_id,
                "category"          => SurveyQuestion::where('id', $question_id)->pluck('issue_category')->first(),
                "question"          => SurveyQuestion::where('id', $question_id)->pluck('question_text')->first(),
                "expectation"       => $data0["avg_expected_value"],
                "expectationDiff"   => $data1 ? $data0["avg_expected_value"] - $data1["avg_expected_value"] : 0,
                "expectationYoyDiff"=> 0.4,
                "satisfaction"      => $data0["avg_actual_value"],
                "satisfactionDiff"  => $data1 ? $data0["avg_actual_value"] - $data1["avg_actual_value"] : 0,
                "satisfactionYoyDiff"=> 0.3
            ];
        }

        return response()->json($results);
    }

    /**
     * GET /api/manager-scores?orgId=...
     * 管理者スコアデータの取得処理
     */
    public function getManagerScores($orgId)
    {
        // パルス調査2回分のインスタンスを取得
        $pulse_instances = PulseSurveyInstance::where('department_id', $orgId)
            ->orderBy('created_at', 'desc')
            ->take(2)
            ->get();

        // 各パルス調査ごとの結果を格納する配列
        $surveys = [];

        // 各パルス調査ごとに全質問の集計結果を作成
        foreach ($pulse_instances as $index => $pulse_instance) {
            $pulse_responses = PulseSurveyResponse::where('pulse_survey_instances_id', $pulse_instance->id)->where('is_manager', true)->get();
            $surveys[$index] = $pulse_responses->groupBy('survey_question_id')->map(function ($group) {
                return [
                    'survey_question_id' => $group->first()->survey_question_id,
                    'avg_actual_value'   => round($group->avg('actual_value'), 1),
                    'avg_expected_value' => round($group->avg('expected_value'), 1),
                ];
            })->values()->toArray(); // toArray()で純粋な配列に変換
        }

        // 各質問ごとにキーを質問IDにする（調査0・調査1ともに）
        $survey0 = collect($surveys[0])->keyBy('survey_question_id');
        $survey1 = collect($surveys[1])->keyBy('survey_question_id');

        // 結果を格納する配列
        $results = [];

        // 調査0の全質問に対してループ（調査0に存在する全質問が対象）
        foreach ($survey0 as $question_id => $data0) {
            // 調査1でも同じ質問がある場合はそのデータを取得
            $data1 = $survey1->get($question_id);

            $results[] = [
                "categoryId"                => $question_id,
                "category"          => SurveyQuestion::where('id', $question_id)->pluck('issue_category')->first(),
                "question"          => SurveyQuestion::where('id', $question_id)->pluck('question_text')->first(),
                "expectation"       => $data0["avg_expected_value"],
                "expectationDiff"   => $data1 ? $data0["avg_expected_value"] - $data1["avg_expected_value"] : 0,
                "expectationYoyDiff"=> 0.4,
                "satisfaction"      => $data0["avg_actual_value"],
                "satisfactionDiff"  => $data1 ? $data0["avg_actual_value"] - $data1["avg_actual_value"] : 0,
                "satisfactionYoyDiff"=> 0.3
            ];
        }

        return response()->json($results);
    }

    /**
     * GET /api/chart-data?orgId=...
     * チャート用データの取得処理
     */
    public function getChartData($orgId)
    {
        // 1. 指定部署の全パルス調査インスタンスを新しい順に取得
        $pulse_instances = PulseSurveyInstance::where('department_id', $orgId)->orderBy('created_at', 'asc')->get();

        // 2. 各パルス調査ごとに全設問の平均スコアを集計
        $surveys = [];
        foreach ($pulse_instances as $index => $pulse_instance) {
            $pulse_responses = PulseSurveyResponse::where('pulse_survey_instances_id', $pulse_instance->id)->get();
            $aggregated_data = ['id' => $index + 1];

            $pulse_responses->groupBy('survey_question_id')
                ->each(function ($group, $questionId) use (&$aggregated_data) {
                    $avg_actual   = round($group->avg('actual_value'), 1);
                    $avg_expected = round($group->avg('expected_value'), 1);
                    $aggregated_data["satisfaction{$questionId}"] = $avg_actual;
                    $aggregated_data["expectation{$questionId}"]  = $avg_expected;
                    $aggregated_data["gap{$questionId}"]          = round($avg_expected - $avg_actual, 1);
                });

            $surveys[$index] = $aggregated_data;
        }

        Log::info($surveys);

        return response()->json($surveys);
    }

    /**
     * GET /api/analytics-summary?orgId=...
     * 分析サマリーデータの取得処理
     */
    public function getAnalyticsSummary($orgID)
    {
        $measures = Measure::where('department_id', $orgID)->where('status','in_progress')->get();
        $results = [];
        foreach ($measures as $measure) {
            $goal_gap = $measure->goal_expected_value - $measure->goal_actual_value;
            $engagement_survey_instance = EngagementSurveyInstance::where('created_at', '<', $measure->created_at)
                ->orderBy('created_at', 'desc')
                ->first();
            $pulse_survey_instance = PulseSurveyInstance::where('department_id', $orgID)
                ->orderBy('created_at', 'desc')
                ->first();
            $survey_questions = SurveyQuestion::where('issue_category', $measure->category_id)
                ->get();
            // エンゲージメントの集計
            $engagement_diff = 0;
            if ($engagement_survey_instance) {
                $engagement_survey_responses = EngagementSurveyResponse::where('engagement_survey_instance_id', $engagement_survey_instance->id)
                    ->where('department_id', $orgID)
                    ->get();
                $engagement_diff = $engagement_survey_responses->avg('expected_value')
                    - $engagement_survey_responses->avg('actual_value');
            }

            // パルスサーベイの集計
            $pulse_diff = 0;
            if ($pulse_survey_instance) {
                $pulse_survey_responses = PulseSurveyResponse::where('pulse_survey_instances_id', $pulse_survey_instance->id)
                    ->get();

                $pulse_diff = $pulse_survey_responses->avg('expected_value')
                    - $pulse_survey_responses->avg('actual_value');
            }

            $gap = $engagement_diff - $pulse_diff;

            $results[] = [
                'measure'          => $measure,
                'gap'              => $gap,
                'engagement_diff'  => $engagement_diff,
                'pulse_diff'       => $pulse_diff,
                'survey_questions' => $survey_questions,
            ];
        }
        // プラスのギャップ大きい順トップ3
        $topPositive = collect($results)
            ->filter(fn($item) => $item['gap'] > 0)
            ->sortByDesc('gap')
            ->take(3)
            ->values();

        // マイナスのギャップ小さい順トップ3
        // （負の値であれば、そのまま小さい順にソートして先頭3件を取る）
        $topNegative = collect($results)
            ->filter(fn($item) => $item['gap'] < 0)
            ->sortBy('gap')
            ->take(3)
            ->values();

        $BadBadBad = collect($results)
            ->sortByDesc('engagement_diff')
            ->take(3)
            ->values();

        // PHP 側で配列を組み立てる例
        $colorsPositive = ['#F29759', '#FC7F7A', '#00A3B3'];
        $colorsNegative = ['#FC7F7A', '#F29759', '#004259'];
        $colorsBad = ['#D9534F', '#F0AD4E', '#5BC0DE'];

        $priorityCategories = collect($topPositive)
            ->values()
            ->map(function($item, $idx) use ($colorsPositive) {
                return [
                    'name'          => $item['measure']->measure_text,      // カテゴリ名
                    'color'         => $colorsPositive[$idx] ?? '#000000',   // カラーコード
                ];
            })
            ->toArray();

        $poorPerformingMeasures = collect($topNegative)
            ->values()
            ->map(function($item, $idx) use ($colorsNegative) {
                return [
                    'title'    => $item['measure']->measure_text,                // Measure のタイトル
                    'color'    => $colorsNegative[$idx] ?? '#000000',     // カラーコード
                ];
            })
            ->toArray();

        $onTrackMeasures = $BadBadBad
            ->map(function($item, $idx) use ($colorsBad) {
                // engagement_diff が高い順なので「課題優先度が高い」などの意味づけに
                $gapPct = round($item['engagement_diff'] * 100, 1);
                return [
                    'title'          => $item['measure']->measure_text,   // カテゴリ名
                    'gapPercentage' => $gapPct,                            // エンゲージメント差分を％に
                    'color'         => $colorsBad[$idx] ?? '#000000',
                ];
            })
            ->toArray();

        $insights = [
            'ITツール導入関連の施策が最も効果が高く、社内スコアを大きく向上させています。',
            'リモートワーク環境の整備は引き続き優先課題となっています。理想値とのギャップが85%と最も大きい状態です。',
            '部門間連携の強化施策を開始して1ヶ月で、関連スコアが0.9ポイント向上しています。',
            '施策の実行段階にある項目が平均して高いスコア上昇を示しており、計画から実行への移行を迅速化すると効果が期待できます。',
        ];

        $dashboardData = [
            'priorityCategories'      => $priorityCategories,
            'poorPerformingMeasures'  => $poorPerformingMeasures,
            'onTrackMeasures'         => $onTrackMeasures,
            'insights'                => $insights,
        ];

        return response()->json($dashboardData);
    }

    /**
     * GET /api/success-cases?orgId=...
     * 成功事例データの取得処理
     */
    public function getSuccessCases($orgId)
    {
        //リレーション取得
        $tenant_id = Department::where('id', $orgId)->pluck('tenant_id');
        $measures = Measure::where('tenant_id', $tenant_id)->where('status',"systematization")->get();
        $results = [];
        foreach ($measures as $measure) {
            $manager_name = StaffIdentity::where('department_id', $measure['department_id'])->where('is_manager','true')->pluck('name')->first();
            $department_name = Department::where('id', $measure['department_id'])->pluck('name')->first();

            $results[] = [
                "title"=> $measure["measure_text"],
                "category" => $measure["issue_category"],
                "issue" => $measure["issue_category"],
                "manager" => $manager_name,
                "department" => $department_name,
                "description" => $measure["action_plan_details"],
            ];
        }
        return response()->json($results);

    }

    public function kanbanstatusupdate(Request $request, $measure_id){
        Log::info($request->all());
        Log::info($measure_id);
        // 該当施策を取得
        $improvement = Measure::find($measure_id);
        if (!$improvement) {
            return response()->json(['message' => 'Not Found'], 404);
        }
        // ステータス更新
        $improvement->status = $request->status;
        $improvement->save();

        return response()->json($improvement);
    }
    public function kanbandelete($measure_id){
        $improvement = Measure::find($measure_id);
        if (!$improvement) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        $improvement->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}
