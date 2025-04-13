<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PulseSurveyQuestionSeeder extends Seeder
{
    /**
     * パルスサーベイの質問データをシード
     */
    public function run(): void
    {
        $now = Carbon::now();

        // 既存の質問データとインスタンスを取得
        $questions = DB::table('survey_questions')->get();
        $instances = DB::table('pulse_survey_instances')->get();
        $pulse_survey_questions = [];

        foreach ($instances as $instance) {
            if ($instance->id >= 8 && $instance->id <= 15) {
                // インスタンスIDが8〜15の場合、固定の質問ID1,2,3,4,5を使用
                $fixedIds = [1, 2, 3, 4, 5 ,6];
                $selectedQuestions = collect([]);
                foreach ($fixedIds as $id) {
                    $question = $questions->firstWhere('id', $id);
                    if ($question) {
                        $selectedQuestions->push($question);
                    }
                }
            } else {
                // それ以外の場合、3つの質問をランダムに選択
                $selectedQuestions = $questions->random(3);
            }

            // 各インスタンスに対して、選択された質問を紐付ける
            foreach ($selectedQuestions as $question) {
                $pulse_survey_questions[] = [
                    'pulse_survey_instances_id' => $instance->id,
                    'survey_question_id' => $question->id,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // バッチに分けて挿入（大量データの場合の対応）
        $chunks = array_chunk($pulse_survey_questions, 500);
        foreach ($chunks as $chunk) {
            DB::table('pulse_survey_questions')->insert($chunk);
        }
    }
}
