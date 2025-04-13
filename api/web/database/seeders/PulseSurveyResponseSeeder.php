<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PulseSurveyResponseSeeder extends Seeder
{
    /**
     * パルスサーベイ回答データのシード
     */
    public function run(): void
    {
        $now = Carbon::now();
        $responses = [];
        
        // 全てのパルスサーベイインスタンスに対する質問を取得
        $pulseQuestions = DB::table('pulse_survey_questions')
            ->join('pulse_survey_instances', 'pulse_survey_questions.pulse_survey_instances_id', '=', 'pulse_survey_instances.id')
            ->select('pulse_survey_questions.*', 'pulse_survey_instances.department_id', 'pulse_survey_instances.tenant_id')
            ->get();
        
        foreach ($pulseQuestions as $question) {
            // 管理職からの回答
            $responses[] = [
                'pulse_survey_instances_id' => $question->pulse_survey_instances_id,
                'survey_question_id' => $question->survey_question_id,
                'is_manager' => true,
                'manager_email' => 'tenant' . $question->tenant_id . '_dept' . $question->department_id . '_staff1@example.com',
                'actual_value' => rand(2, 5), // 2～5の回答値
                'expected_value' => rand(3, 5), // 3～5の期待値
                'created_at' => $now,
                'updated_at' => $now,
            ];
            
            // 一般社員からの回答（3人分のみ - パルスサーベイは簡易的）
            for ($i = 0; $i < 3; $i++) {
                $responses[] = [
                    'pulse_survey_instances_id' => $question->pulse_survey_instances_id,
                    'survey_question_id' => $question->survey_question_id,
                    'is_manager' => false,
                    'manager_email' => null,
                    'actual_value' => rand(1, 5), // 1～5の回答値
                    'expected_value' => rand(3, 5), // 3～5の期待値
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }
        
        // バッチに分けて挿入（大量データのため）
        $chunks = array_chunk($responses, 500);
        foreach ($chunks as $chunk) {
            DB::table('pulse_survey_responses')->insert($chunk);
        }
    }
}