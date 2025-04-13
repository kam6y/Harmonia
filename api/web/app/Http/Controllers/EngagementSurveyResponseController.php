<?php

namespace App\Http\Controllers;

use App\Models\EngagementSurveyResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class EngagementSurveyResponseController extends Controller
{
    /**
     * エンゲージメントサーベイの回答を保存する
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            // リクエストデータのバリデーション
            $validator = Validator::make($request->all(), [
                'tenant_id' => 'required|integer',
                'instance_id' => 'required|integer',
                'department_id' => 'required|integer',
                'is_manager' => 'required|boolean',
                'manager_email' => 'required_if:is_manager,true|email|nullable',
                'answers' => 'required|array',
                'answers.*.survey_question_id' => 'required|integer',
                'answers.*.actual_value' => 'required|integer|min:1|max:5',
                'answers.*.expected_value' => 'required|integer|min:1|max:5',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'バリデーションエラー',
                    'errors' => $validator->errors()
                ], 422);
            }

            $validatedData = $validator->validated();
            $now = Carbon::now();
            $responses = [];


            // 回答データの整形
            foreach ($validatedData['answers'] as $answer) {
                $responses[] = [
                    'engagement_survey_instances_id' => $validatedData['instance_id'],
                    'department_id' => $validatedData['department_id'],
                    'survey_question_id' => $answer['survey_question_id'],
                    'is_manager' => $validatedData['is_manager'],
                    'manager_email' => $validatedData['is_manager'] ? $validatedData['manager_email'] : null,
                    'actual_value' => $answer['actual_value'],
                    'expected_value' => $answer['expected_value'],
                    'created_at' => $now,
                ];
            }

            // トランザクション開始
            DB::beginTransaction();

            // 回答データをDBに挿入
            DB::table('engagement_survey_responses')->insert($responses);

            // トランザクション完了
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'エンゲージメントサーベイの回答を保存しました'
            ]);
        } catch (Exception $e) {
            // エラー発生時のロールバック
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'エンゲージメントサーベイの回答の保存に失敗しました',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
