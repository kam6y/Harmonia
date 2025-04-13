<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SurveyQuestion;
use App\Models\EngagementSurveySetting;
use App\Models\PulseSurveySetting;
use App\Models\TenantAdditionalQuestionRelation;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SurveySettingsAdminController extends Controller
{
    /**
     * サーベイ設定情報を更新する
     */
    public function update(Request $request)
    {
        try {
            $engagementSurvey = $request->input('engagement_survey');
            $pulseSurvey = $request->input('pulse_survey');
            $defaultQuestions = $request->input('default_questions', []);

            DB::beginTransaction();

            // 1. エンゲージメントサーベイ設定の更新（デフォルト設定 - tenant_id = null）
            if ($engagementSurvey) {
                $this->updateEngagementSurveySettings(null, $engagementSurvey);
            }

            // 2. パルスサーベイ設定の更新（デフォルト設定 - tenant_id = null）
            if ($pulseSurvey) {
                $this->updatePulseSurveySettings(null, $pulseSurvey);
            }

            // 3. 設問の更新
            if (!empty($defaultQuestions)) {
                $this->updateDefaultQuestions($defaultQuestions);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'サーベイ設定が正常に更新されました'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'サーベイ設定の更新に失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * エンゲージメントサーベイ設定を更新
     */
    private function updateEngagementSurveySettings($tenantId, $settings)
    {
        $surveyDeliveryInterval = $settings['survey_delivery_interval_days'] ?? 180;
        $reminderDeliveryInterval = $settings['reminder_delivery_interval_days'] ?? 3;

        $existingSettings = EngagementSurveySetting::where('tenant_id', $tenantId)->first();

        if ($existingSettings) {
            $existingSettings->survey_delivery_interval_days = $surveyDeliveryInterval;
            $existingSettings->reminder_delivery_interval_days = $reminderDeliveryInterval;
            $existingSettings->updated_at = Carbon::now();
            $existingSettings->save();
        } else {
            EngagementSurveySetting::create([
                'tenant_id' => $tenantId,
                'survey_start_day' => Carbon::now()->format('Y-m-d'),
                'survey_delivery_interval_days' => $surveyDeliveryInterval,
                'reminder_delivery_interval_days' => $reminderDeliveryInterval,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }
    }

    /**
     * パルスサーベイ設定を更新
     */
    private function updatePulseSurveySettings($tenantId, $settings)
    {
        $surveyDeliveryInterval = $settings['survey_delivery_interval_days'] ?? 7;
        $reminderDeliveryInterval = $settings['reminder_delivery_interval_days'] ?? 1;

        $existingSettings = PulseSurveySetting::where('tenant_id', $tenantId)->first();

        if ($existingSettings) {
            $existingSettings->survey_delivery_interval_days = $surveyDeliveryInterval;
            $existingSettings->reminder_delivery_interval_days = $reminderDeliveryInterval;
            $existingSettings->updated_at = Carbon::now();
            $existingSettings->save();
        } else {
            PulseSurveySetting::create([
                'tenant_id' => $tenantId,
                'start_date' => Carbon::now()->format('Y-m-d'),
                'survey_delivery_interval_days' => $surveyDeliveryInterval,
                'reminder_delivery_interval_days' => $reminderDeliveryInterval,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }
    }

    /**
     * 設問を更新
     */
    private function updateDefaultQuestions($questions)
    {
        foreach ($questions as $question) {
            $id = $question['id'] ?? null;
            $issueCategory = $question['issue_category'] ?? '';
            $questionText = $question['question_text'] ?? '';

            // 空の設問はスキップ
            if (empty($issueCategory) && empty($questionText)) {
                continue;
            }

            $existingQuestion = SurveyQuestion::find($id);

            if ($existingQuestion) {
                // 既存の設問を更新
                $existingQuestion->issue_category = $issueCategory;
                $existingQuestion->question_text = $questionText;
                $existingQuestion->updated_at = Carbon::now();
                $existingQuestion->save();
            } else {
                // 新しい設問を作成
                SurveyQuestion::create([
                    'issue_category' => $issueCategory,
                    'question_text' => $questionText,
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ]);
            }
        }
    }

    /**
     * サーベイ設定を取得
     */
    public function show(Request $request)
    {
        // デフォルト設定（tenant_id = null）を取得
        // engagement_survey_settings の取得
        $engagement = EngagementSurveySetting::whereNull('tenant_id')->first();

        // pulse_survey_settings の取得
        $pulse = PulseSurveySetting::whereNull('tenant_id')->first();

        // デフォルト質問の取得
        $tenantRelatedIds = TenantAdditionalQuestionRelation::pluck('survey_question_id');
        $defaultQuestions = SurveyQuestion::select('id', 'issue_category', 'question_text')
            ->whereNotIn('id', $tenantRelatedIds)
            ->get();

        // 追加質問は管理者用画面では不要なので空配列を返す
        $additionalQuestions = [];

        return response()->json([
            'engagement_survey' => $engagement ? [
                'survey_start_day' => $engagement->survey_start_day,
                'survey_delivery_interval_days' => $engagement->survey_delivery_interval_days,
                'reminder_delivery_interval_days' => $engagement->reminder_delivery_interval_days,
            ] : null,
            'pulse_survey' => $pulse ? [
                'survey_delivery_interval_days' => $pulse->survey_delivery_interval_days,
                'reminder_delivery_interval_days' => $pulse->reminder_delivery_interval_days,
            ] : null,
            'default_questions' => $defaultQuestions,
            'additional_questions' => $additionalQuestions,
        ]);
    }
}
