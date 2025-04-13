<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EngagementSurveyResponseSeeder extends Seeder
{
    /**
     * エンゲージメントサーベイ回答のシード
     */
    public function run(): void
    {
        $now = Carbon::now();
        $responses = [];
        
        // 全てのエンゲージメントサーベイインスタンスに対して回答を生成
        $instances = DB::table('engagement_survey_instances')->get();
        $questions = DB::table('survey_questions')->get();
        $questionsCount = count($questions);
        
        foreach ($instances as $instance) {
            // テナントに属する部門を取得
            $departments = DB::table('departments')
                ->where('tenant_id', $instance->tenant_id)
                ->get();
            
            foreach ($departments as $department) {
                // 各質問に対して回答を生成
                foreach ($questions as $index => $question) {
                    // テナント固有の追加質問については、そのテナントのみ回答を生成
                    if ($index >= 16) { // 最初の16問はデフォルト質問
                        $isAdditionalQuestion = DB::table('tenant-additional_question_relations')
                            ->where('tenant_id', $instance->tenant_id)
                            ->where('survey_question_id', $question->id)
                            ->exists();
                        
                        if (!$isAdditionalQuestion) {
                            continue;
                        }
                    }
                    
                    // 管理職からの回答
                    $responses[] = [
                        'engagement_survey_instances_id' => $instance->id,
                        'department_id' => $department->id,
                        'survey_question_id' => $question->id,
                        'is_manager' => true,
                        'manager_email' => 'tenant' . $instance->tenant_id . '_dept' . $department->id . '_staff1@example.com',
                        'actual_value' => rand(2, 5), // 2～5の回答値
                        'expected_value' => rand(3, 5), // 3～5の期待値
                        'created_at' => $now,
                    ];
                    
                    // 一般社員からの回答（4-5人分）
                    for ($i = 0; $i < rand(4, 5); $i++) {
                        $responses[] = [
                            'engagement_survey_instances_id' => $instance->id,
                            'department_id' => $department->id,
                            'survey_question_id' => $question->id,
                            'is_manager' => false,
                            'manager_email' => null,
                            'actual_value' => rand(1, 4), // 1～5の回答値
                            'expected_value' => rand(2, 5), // 2～5の期待値
                            'created_at' => $now,
                        ];
                    }
                }
            }
        }
        
        // バッチに分けて挿入（大量データのため）
        $chunks = array_chunk($responses, 500);
        foreach ($chunks as $chunk) {
            DB::table('engagement_survey_responses')->insert($chunk);
        }
    }
}