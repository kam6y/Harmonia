<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EngagementSurveyInstanceSeeder extends Seeder
{
    /**
     * エンゲージメントサーベイ実施のシード（5年分、半年ごと）
     */
    public function run(): void
    {
        $now = Carbon::now();
        $instances = [];
        
        // テナント1のエンゲージメントサーベイ実施（5年分、半年ごと）= 10回
        $tenant1StartDate = Carbon::parse('2020-04-15');
        $tenant1Settings = DB::table('engagement_survey_settings')
            ->where('tenant_id', 1)
            ->first();
        
        for ($i = 0; $i < 10; $i++) {
            $instanceDate = (clone $tenant1StartDate)->addDays(180 * $i);
            $instances[] = [
                'tenant_id' => 1,
                'settings_id' => $tenant1Settings->id,
                'start_date' => $instanceDate->format('Y-m-d'),
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        
        // テナント2のエンゲージメントサーベイ実施（5年分、半年ごと）= 10回
        $tenant2StartDate = Carbon::parse('2020-05-01');
        $tenant2Settings = DB::table('engagement_survey_settings')
            ->where('tenant_id', 2)
            ->first();
        
        for ($i = 0; $i < 10; $i++) {
            $instanceDate = (clone $tenant2StartDate)->addDays(180 * $i);
            $instances[] = [
                'tenant_id' => 2,
                'settings_id' => $tenant2Settings->id,
                'start_date' => $instanceDate->format('Y-m-d'),
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        
        DB::table('engagement_survey_instances')->insert($instances);
        
        // 統計データのシード
        $this->seedEngagementScoreStatistics();
    }
    
    /**
     * エンゲージメントスコア統計データのシード
     */
    private function seedEngagementScoreStatistics(): void
    {
        $now = Carbon::now();
        $statistics = [];
        
        // 全てのエンゲージメントサーベイインスタンスに対して統計データを生成
        $tenant1Instances = DB::table('engagement_survey_instances')
            ->where('tenant_id', 1)
            ->orderBy('start_date')
            ->get();
        
        $tenant2Instances = DB::table('engagement_survey_instances')
            ->where('tenant_id', 2)
            ->orderBy('start_date')
            ->get();
        
        // テナント1の統計データ
        $this->generateStatisticsForTenant($tenant1Instances, $statistics, $now);
        
        // テナント2の統計データ
        $this->generateStatisticsForTenant($tenant2Instances, $statistics, $now);
        
        DB::table('engagement_score_statistics')->insert($statistics);
    }
    
    /**
     * テナントごとの統計データを生成
     */
    private function generateStatisticsForTenant($instances, &$statistics, $now): void
    {
        $totalInstances = count($instances);
        
        foreach ($instances as $index => $instance) {
            // サーベイの進行度（0～1の範囲）
            $progress = $index / ($totalInstances - 1);
            
            // スコアは30～40から始めて、最後は60～70になるよう徐々に上昇
            $minScore = 30 + (30 * $progress);
            $maxScore = 40 + (30 * $progress);
            $score = rand(floor($minScore), floor($maxScore));
            
            // 偏差値（45～55の範囲で変動）
            $rating = (($score - 50) / 10) + (rand(-5, 5) / 10);
            $rating = max(0.45, min(0.55, $rating));
            
            $statistics[] = [
                'engagement_survey_instances_id' => $instance->id,
                'rating' => $rating,
                'score_average' => $score,
                'answer_rate' => rand(70, 95), // 70%～95%のランダム回答率
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
    }
}