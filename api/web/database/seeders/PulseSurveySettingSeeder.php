<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PulseSurveySettingSeeder extends Seeder
{
    /**
     * パルスサーベイ設定のシード
     */
    public function run(): void
    {
        $now = Carbon::now();
        
        // デフォルト設定
        $defaultSetting = [
            'tenant_id' => null,
            'survey_delivery_interval_days' => 7, // 1週間ごと
            'reminder_delivery_interval_days' => 1,
            'start_date' => '2020-04-01',
            'created_at' => $now,
            'updated_at' => $now,
        ];
        
        // テナント1のパルスサーベイ設定
        $tenant1Setting = [
            'tenant_id' => 1,
            'survey_delivery_interval_days' => 7, // 1週間ごと
            'reminder_delivery_interval_days' => 1,
            'start_date' => '2020-04-22', // エンゲージメントサーベイの1週間後
            'created_at' => $now,
            'updated_at' => $now,
        ];
        
        // テナント2のパルスサーベイ設定
        $tenant2Setting = [
            'tenant_id' => 2,
            'survey_delivery_interval_days' => 14, // 2週間ごと
            'reminder_delivery_interval_days' => 2,
            'start_date' => '2020-05-08', // エンゲージメントサーベイの1週間後
            'created_at' => $now,
            'updated_at' => $now,
        ];
        
        DB::table('pulse_survey_settings')->insert([
            $defaultSetting,
            $tenant1Setting,
            $tenant2Setting,
        ]);
    }
}