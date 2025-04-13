<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EngagementSurveySettingSeeder extends Seeder
{
    /**
     * エンゲージメントサーベイ設定のシード
     */
    public function run(): void
    {
        $now = Carbon::now();

        // デフォルト設定
        $defaultSetting = [
            'tenant_id' => null, // nullはデフォルト設定
            'survey_start_day' => '2020-04-01',
            'survey_delivery_interval_days' => 180, // 6ヶ月
            'reminder_delivery_interval_days' => 3,
            'deadline' => '7',
            'created_at' => $now,
            'updated_at' => $now,
        ];

        // テナント1の設定
        $tenant1Setting = [
            'tenant_id' => 1,
            'survey_start_day' => '2020-04-15',
            'survey_delivery_interval_days' => 180, // 6ヶ月
            'reminder_delivery_interval_days' => 3,
            'deadline' => '7',
            'created_at' => $now,
            'updated_at' => $now,
        ];

        // テナント2の設定
        $tenant2Setting = [
            'tenant_id' => 2,
            'survey_start_day' => '2020-05-01',
            'survey_delivery_interval_days' => 180, // 6ヶ月
            'reminder_delivery_interval_days' => 5,
            'deadline' => '7',
            'created_at' => $now,
            'updated_at' => $now,
        ];

        DB::table('engagement_survey_settings')->insert([
            $defaultSetting,
            $tenant1Setting,
            $tenant2Setting,
        ]);
    }
}
