<?php

namespace App\Http\Controllers;

use App\Models\Issue;
use App\Models\Measure;
use App\Models\MeasureChallenge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Exception;

class MeasureRegisterController extends Controller
{
    /**
     * 部署IDに基づいて課題カテゴリーと課題を取得する
     *
     * @param int $department_id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getInfo($department_id)
    {
        $issues = Issue::where('department_id', $department_id)->get();
        $groupedIssues = $issues->groupBy('issue_category')
            ->map(function ($group) {
                return $group->pluck('issue_text')->toArray();
            })
            ->toArray();

        Log::info("getInfo: department_id = {$department_id}", $groupedIssues);

        return response()->json([$groupedIssues,]);
    }

    /**
     * フロントエンド用のカテゴリと課題データを取得する
     *
     * @param int $department_id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCategoryIssues($department_id)
    {
        try {
            $issues = Issue::where('department_id', $department_id)->get();
            Log::info("getCategoryIssues: department_id = {$department_id}", ['count' => $issues->count()]);

            // カテゴリー毎にグループ化し、フロントエンドが期待する形式に整形
            $result = [];
            $issuesByCategory = $issues->groupBy('issue_category');

            foreach ($issuesByCategory as $category => $categoryIssues) {
                $issuesList = [];
                foreach ($categoryIssues as $issue) {
                    $issuesList[] = [
                        'id' => $issue->id,
                        'challenge' => $issue->issue_text
                    ];
                }
                $result[] = [$category => $issuesList];
            }

            Log::info("getCategoryIssues: result", $result);
            return response()->json($result);
        } catch (Exception $e) {
            Log::error('Error fetching category issues: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'エラーが発生しました: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 施策を登録する
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function registerMeasure(Request $request)
    {
        try {
            DB::beginTransaction();

            // リクエスト全体をログ出力
            Log::info('registerMeasure: Request Data', $request->all());

            // リクエストからデータを取得
            $selectedCategory = $request->input('selectedCategory');
            $selectedKadai = $request->input('selectedKadai');
            $measures = $request->input('measures');
            $departmentId = $request->input('department_id', 1);
            $tenantId = $request->user() ? $request->user()->tenant_id : 1;

            Log::info('registerMeasure: Parsed Data', [
                'selectedCategory' => $selectedCategory,
                'selectedKadai' => $selectedKadai,
                'departmentId' => $departmentId,
                'tenantId' => $tenantId,
            ]);

            $registeredMeasures = [];

            // 各施策を登録
            foreach ($measures as $measureData) {
                Log::info('registerMeasure: Processing Measure', $measureData);

                // shisakuがnullの場合、selectedKadaiの先頭のchallengeを利用する
                $challengeText = $measureData['shisaku'];
                if (is_null($challengeText) && isset($selectedKadai[0]['challenge'])) {
                    $challengeText = $selectedKadai[0]['challenge'];
                }

                // 必須フィールドのチェック
                if (
                    is_null($challengeText) ||
                    is_null($measureData['actionPlan']) ||
                    is_null($measureData['dueDate']) ||
                    is_null($measureData['assignee']) ||
                    is_null($measureData['actionPlanDetail'])
                ) {
                    Log::warning('registerMeasure: Measure data skipped due to missing required fields', $measureData);
                    continue; // この施策はスキップ
                }

                $measure = new Measure();
                $measure->tenant_id = $tenantId;
                $measure->department_id = $departmentId;
                $measure->issue_category = $selectedCategory;
                // measure_text に challenge の値を設定
                $measure->measure_text = $challengeText;
                $measure->action_plan = $measureData['actionPlan'];
                $measure->action_plan_details = $measureData['actionPlanDetail'];
                $measure->assignee = $measureData['assignee'];
                $measure->deadline = $measureData['dueDate'];
                // 現在と目標の値を保存
                $measure->goal_actual_value = $request->input('currentSatisfaction');
                $measure->goal_expected_value = $request->input('computedTargetSatisfaction');
                $measure->status = 'planning';
                $measure->save();

                Log::info('registerMeasure: Measure saved', ['measure_id' => $measure->id]);
                $registeredMeasures[] = $measure;

                // 選択された課題と施策の関連付け
                foreach ($selectedKadai as $kadaiItem) {
                    // $kadaiItem はオブジェクト（配列形式）として受け取っている前提
                    $kadaiId = isset($kadaiItem['id']) ? $kadaiItem['id'] : null;
                    Log::info('registerMeasure: Processing kadai', ['kadaiId' => $kadaiId]);
                    $issueId = is_numeric($kadaiId) ? $kadaiId : null;

                    // 数値でない場合、文字列から分割して検索
                    if (!$issueId && is_string($kadaiId)) {
                        $kadaiParts = explode('-', $kadaiId);
                        if (count($kadaiParts) > 1) {
                            $kategory = $kadaiParts[0];
                            $index = (int)$kadaiParts[1];

                            // カテゴリに一致する課題を取得
                            $issues = Issue::where('department_id', $departmentId)
                                ->where('issue_category', $kategory)
                                ->get();

                            if ($issues->count() > $index) {
                                $issueId = $issues[$index]->id;
                                Log::info('registerMeasure: Found issueId from text', ['issueId' => $issueId]);
                            } else {
                                Log::warning('registerMeasure: Issue not found by index', ['kategory' => $kategory, 'index' => $index]);
                            }
                        } else {
                            Log::warning('registerMeasure: kadaiParts count < 2', ['kadaiId' => $kadaiId]);
                        }
                    }

                    // if ($issueId) {
                    //     $measureChallenge = new MeasureChallenge();
                    //     $measureChallenge->measure_id = $measure->id;
                    //     $measureChallenge->issue_id = $issueId;
                    //     $measureChallenge->created_at = Carbon::now();
                    //     $measureChallenge->save();
                    //     Log::info('registerMeasure: MeasureChallenge saved', [
                    //         'measure_id' => $measure->id,
                    //         'issue_id' => $issueId,
                    //     ]);
                    // } else {
                    //     Log::warning('registerMeasure: issueId is null for kadai', ['kadaiId' => $kadaiId]);
                    // }
                }
            }

            DB::commit();

            Log::info('registerMeasure: Transaction committed successfully');
            return response()->json([
                'success' => true,
                'message' => '施策が正常に登録されました',
                'data' => [
                    'measures' => $registeredMeasures
                ]
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('registerMeasure: Exception occurred', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => '施策の登録に失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 部署の施策一覧を取得する
     *
     * @param Request $request
     * @param int $department_id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMeasures(Request $request, $department_id = null)
    {
        try {
            $departmentId = $department_id ?: $request->input('department_id');
            if (!$departmentId) {
                Log::warning('getMeasures: department_id is missing');
                return response()->json([
                    'success' => false,
                    'message' => 'department_idは必須パラメータです。'
                ], 400);
            }

            $measures = Measure::where('department_id', $departmentId)
                ->orderBy('created_at', 'desc')
                ->get();

            Log::info('getMeasures: Retrieved measures', [
                'departmentId' => $departmentId,
                'count' => $measures->count()
            ]);
            return response()->json([
                'success' => true,
                'data' => $measures
            ]);

        } catch (Exception $e) {
            Log::error('getMeasures: Exception occurred', [
                'message' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'エラーが発生しました: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 施策のステータスを更新する
     *
     * @param Request $request
     * @param int $measure_id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateMeasureStatus(Request $request, $measure_id)
    {
        try {
            $request->validate([
                'status' => 'required|string|in:planning,in_progress,systematization,archived'
            ]);

            $measure = Measure::findOrFail($measure_id);
            $measure->status = $request->input('status');
            $measure->updated_at = Carbon::now();
            $measure->save();

            Log::info('updateMeasureStatus: Measure status updated', [
                'measure_id' => $measure_id,
                'status' => $measure->status
            ]);
            return response()->json([
                'success' => true,
                'message' => '施策のステータスが更新されました',
                'data' => $measure
            ]);

        } catch (Exception $e) {
            Log::error('updateMeasureStatus: Exception occurred', [
                'message' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'ステータス更新に失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }
}
