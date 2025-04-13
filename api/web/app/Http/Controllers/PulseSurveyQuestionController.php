<?php

namespace App\Http\Controllers;

use App\Models\Issue;
use App\Models\Measure;
use App\Models\PulseSurveyQuestion;
use App\Models\SurveyQuestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PulseSurveyQuestionController extends Controller
{
    /**
     * 部署に関連する課題カテゴリーの質問を取得
     *
     * @param int $tenant_id
     * @param int $instance_id
     * @return \Illuminate\Http\JsonResponse
     */
    public function index($tenant_id, $instance_id)
    {
        // パルスサーベイインスタンスから部門IDを取得
        $pulseSurveyInstance = DB::table('pulse_survey_instances')
            ->where('id', $instance_id)
            ->first();

        if (!$pulseSurveyInstance) {
            return response()->json(['error' => '指定されたインスタンスが見つかりません'], 404);
        }

       $surveyQuestions = PulseSurveyQuestion::where('pulse_survey_instances_id', $pulseSurveyInstance->id);
        // 課題カテゴリーに関連する質問を取得
        $questions = [];
        foreach ($surveyQuestions as $question) {
            $questions[] = [
                'id' => $question->id,
                'issue_category' => SurveyQuestion::where('id', $question->question_id)->first()->issue_category,
                'question_text' => SurveyQuestion::where('id', $question->question_id)->first()->question_text,
            ];
        }

        return response()->json(['questions' => $questions]);
    }
}
