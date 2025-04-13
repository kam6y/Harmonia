<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SurveyQuestion;
use Illuminate\Http\Request;
use App\Models\EngagementSurveySetting;
use App\Models\PulseSurveySetting;
use App\Models\TenantAdditionalQuestionRelation;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SurveyController extends Controller
{
    public function show(Request $request)
    {
        $tenantId = $request->input('tenant_id');

        // サーベイ設定を取得
        // EngagementSurveySettingの中で作成日時が一番早いレコードを取得
        $engagement = EngagementSurveySetting::where('tenant_id', $tenantId)
            ->orderBy('created_at', 'desc')
            ->first();
        // PulseSurveySettingの中で作成日時が一番早いレコードを取得
        $pulse = PulseSurveySetting::where('tenant_id', $tenantId)
            ->orderBy('created_at', 'desc')
            ->first();

        //デフォルト質問の取得
        $tenantRelatedIds = TenantAdditionalQuestionRelation::pluck('survey_question_id');$defaultQuestions = SurveyQuestion::select('id', 'issue_category', 'question_text')
        ->whereNotIn('id', $tenantRelatedIds)
        ->orderBy('id', 'asc') // ← 追加
        ->get();

        //テナント別質問の取得
        $tenantQuestionIds = TenantAdditionalQuestionRelation::where('tenant_id', $tenantId)
            ->pluck('survey_question_id');
        $additionalQuestions = SurveyQuestion::select('id', 'issue_category', 'question_text')
            ->whereIn('id', $tenantQuestionIds)
            ->get();

        return response()->json([
            'engagement_survey' => $engagement ? [
                'survey_start_day' => $engagement->survey_start_day,
                'survey_delivery_interval' => $engagement-> survey_delivery_interval_days,
                'reminder_delivery_interval' => $engagement-> reminder_delivery_interval_days,
                'deadline' => $engagement-> deadline,
            ] : null,
            'pulse_survey' => $pulse ? [
                'start_date' => $pulse->start_date,
                'survey_delivery_interval' => $pulse-> survey_delivery_interval_days,
                'reminder_delivery_interval' => $pulse->reminder_delivery_interval_days,
            ] : null,
            'default_questions' => $defaultQuestions,
            'additional_questions' => $additionalQuestions,
        ]);
    }

    public function save(Request $request)
    {
        // -----------------------------
        // 1. EngagementSurveySetting の保存（更新 or 新規作成）
        // -----------------------------
        // ※ここは既存の実装例のまま。必要に応じて更新処理に変更してください。
        $engagement = new EngagementSurveySetting();
        $engagement->tenant_id = $request['tenant_id'];
        $engagement->survey_start_day = $request['engagement_survey']['survey_start_day'];
        // ※注意：フロントエンド側のペイロードではキー名が "survey_delivery_interval" ですが、
        // DB保存時は "survey_delivery_interval_days" としているため、合わせる必要があります。
        $engagement->survey_delivery_interval_days = $request['engagement_survey']['survey_delivery_interval'];
        $engagement->reminder_delivery_interval_days = $request['engagement_survey']['reminder_delivery_interval'];
        $engagement->deadline = $request['engagement_survey']['deadline'];
        $engagement->save();

        // -----------------------------
        // 2. PulseSurveySetting の保存（更新 or 新規作成）
        // -----------------------------
        $pulse = new PulseSurveySetting();
        $pulse->tenant_id = $request['tenant_id'];
        $pulse->start_date = $request['pulse_survey']['start_date'];
        $pulse->survey_delivery_interval_days = $request['pulse_survey']['survey_delivery_interval'];
        $pulse->reminder_delivery_interval_days = $request['pulse_survey']['reminder_delivery_interval'];
        $pulse->save();

        // -----------------------------
        // 3. 追加設問の処理
        // -----------------------------

        // 3-1. 削除対象の質問を処理
        if (!empty($request['deleted_question_ids'])) {
            foreach ($request['deleted_question_ids'] as $deletedId) {
                // 該当の SurveyQuestion を削除
                SurveyQuestion::destroy($deletedId);
                // 関連する TenantAdditionalQuestionRelation も削除
                TenantAdditionalQuestionRelation::where('survey_question_id', $deletedId)->delete();
            }
        }

        // 3-2. 追加設問の更新または新規作成
        if (!empty($request['additional_questions'])) {
            foreach ($request['additional_questions'] as $questionData) {
                // 空の質問はスキップ（念のため）
                if (empty($questionData['issue_category']) && empty($questionData['question_text'])) {
                    continue;
                }

                // IDがあれば既存レコードとして更新
                if (isset($questionData['id']) && !empty($questionData['id'])) {
                    $surveyQuestion = SurveyQuestion::find($questionData['id']);
                    if ($surveyQuestion) {
                        $surveyQuestion->issue_category = $questionData['issue_category'] ?? '';
                        $surveyQuestion->question_text = $questionData['question_text'] ?? '';
                        $surveyQuestion->save();
                    }
                } else {
                    // 新規の場合
                    // 1. survey_questions テーブルにレコードを作成
                    $surveyQuestion = new SurveyQuestion();
                    $surveyQuestion->issue_category = $questionData['issue_category'] ?? '';
                    $surveyQuestion->question_text = $questionData['question_text'] ?? '';
                    $surveyQuestion->save();
                    Log::info('メモ',[$surveyQuestion]);

                    // 2. 直前で作成した $surveyQuestion->id と tenant_id を使って
                    //    tenant_additional_question_relation テーブルに関連レコードを作成
                    $relation = new TenantAdditionalQuestionRelation();
                    $relation->tenant_id = $request['tenant_id'];
                    $relation->survey_question_id = $surveyQuestion->id;
                    $relation->save();
                }
            }
        }

        return response()->json([
            'message' => '設定を保存しました',
        ], 201);
    }

}
