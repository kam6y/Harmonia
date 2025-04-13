<?php

namespace App\Http\Controllers;

use App\Models\EngagementSurveyInstance;
use App\Models\TenantAdditionalQuestionRelation;
use Illuminate\Http\Request;
use App\Models\SurveyQuestion;

class EngagementSurveyQuestionController extends Controller
{
    public function index($tenant_id, $instance_id)
    {
        // エンゲージサーベイの作成日時を取得
        $surveyInstance = EngagementSurveyInstance::findOrFail($instance_id);
        $instanceCreatedAt = $surveyInstance->created_at;


        // 共通質問の取得
        $commonQuery = SurveyQuestion::select('id', 'question_text')
            ->whereNotIn('id', TenantAdditionalQuestionRelation::select('survey_question_id')->getQuery())
            ->where('created_at', '<=', $instanceCreatedAt);

        // テナントごとの質問の取得
        $tenantQuery = SurveyQuestion::select('id', 'question_text')
            ->whereIn('id', TenantAdditionalQuestionRelation::select('survey_question_id')
                ->where('tenant_id', $tenant_id)
                ->getQuery())
            ->where('created_at', '<=', $instanceCreatedAt);

        // unionで共通質問とテナント質問をまとめ、必要なカラムのみ整形
        $questions = $commonQuery->union($tenantQuery)->get()
            ->map(function ($item) {
                return [
                    'id'   => $item->id,
                    'issue_category' => $item->issue_category,
                    'question_text' => $item->question_text,
                ];
            });

        return response()->json(['questions' => $questions]);
    }

}
