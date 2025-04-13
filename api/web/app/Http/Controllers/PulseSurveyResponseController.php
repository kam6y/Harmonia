<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Validator;
use App\Models\PulseSurveyInstance;

class PulseSurveyResponseController extends Controller
{
    /**
     * パルスサーベイの回答を保存する
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            // バリデーションルールを定義
            $validator = Validator::make($request->all(), [
                'tenant_id' => 'required|integer',
                'instance_id' => 'required|integer',
                'is_manager' => 'required|boolean',
                'manager_email' => 'nullable|email',
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

            // pulse_survey_instancesからdepartment_idを取得
            $pulseSurveyInstance = PulseSurveyInstance::findOrFail($validatedData['instance_id']);
            $departmentId = $pulseSurveyInstance->department_id;

            // 回答データの整形
            foreach ($validatedData['answers'] as $answer) {
                $responses[] = [
                    'pulse_survey_instances_id' => $validatedData['instance_id'],
                    'survey_question_id' => $answer['survey_question_id'],
                    'is_manager' => $validatedData['is_manager'],
                    'manager_email' => $validatedData['is_manager'] ? $validatedData['manager_email'] : null,
                    'actual_value' => $answer['actual_value'],
                    'expected_value' => $answer['expected_value'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            // トランザクション開始
            DB::beginTransaction();

            // 回答データをDBに挿入
            DB::table('pulse_survey_responses')->insert($responses);

            // トランザクション完了
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'パルスサーベイの回答を保存しました'
            ]);
        } catch (Exception $e) {
            // エラー発生時のロールバック
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'パルスサーベイの回答の保存に失敗しました',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}