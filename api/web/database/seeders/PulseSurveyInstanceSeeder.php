<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PulseSurveyInstanceSeeder extends Seeder
{
    /**
     * パルスサーベイ実施のシード
     */
    public function run(): void
    {
        $instances = [];

        // テナント1のパルスサーベイ実施（直近6ヶ月分）
        $tenant1Settings = DB::table('pulse_survey_settings')
            ->where('tenant_id', 1)
            ->first();

        // テナント1の部門を取得
        $tenant1Departments = DB::table('departments')
            ->where('tenant_id', 1)
            ->get();

        foreach ($tenant1Departments as $department) {
            if ($department->id == 8) {
                // department_id が 8 の場合は固定データを生成
                $customStartDate = Carbon::parse('2020-04-22');
                for ($i = 0; $i < 8; $i++) {
                    $instances[] = [
                        'tenant_id'      => 1,
                        'department_id'  => 8,
                        'setting_id'     => 2,
                        'start_date'     => $customStartDate->copy(),
                        'created_at'     => $customStartDate->copy(),
                        'updated_at'     => $customStartDate->copy(),
                    ];
                    $customStartDate->addDays(7);
                }
            } else {
                // その他の部門は従来のロジックで作成
                $startDate = Carbon::parse($tenant1Settings->start_date);
                $currentDate = clone $startDate;
                $instances[] = [
                    'tenant_id'      => 1,
                    'department_id'  => $department->id,
                    'setting_id'     => $tenant1Settings->id,
                    'start_date'     => $currentDate->copy(),
                    'created_at'     => $currentDate->copy(),
                    'updated_at'     => $currentDate->copy(),
                ];
            }
        }

        // テナント2のパルスサーベイ実施（直近6ヶ月分）
        $tenant2Settings = DB::table('pulse_survey_settings')
            ->where('tenant_id', 2)
            ->first();

        // テナント2の部門を取得
        $tenant2Departments = DB::table('departments')
            ->where('tenant_id', 2)
            ->get();

        $tenant2StartDate = Carbon::parse($tenant2Settings->start_date);
        $tenant2EndDate = Carbon::now()->subDays(14); // 2週間前まで

        $currentDate = clone $tenant2StartDate;
        while ($currentDate->lt($tenant2EndDate)) {
            foreach ($tenant2Departments as $department) {
                $instances[] = [
                    'tenant_id'      => 2,
                    'department_id'  => $department->id,
                    'setting_id'     => $tenant2Settings->id,
                    'start_date'     => $currentDate->copy(),
                    'created_at'     => $currentDate->copy(),
                    'updated_at'     => $currentDate->copy(),
                ];
            }
            $currentDate->addDays($tenant2Settings->survey_delivery_interval_days);
        }

        // バッチに分けて挿入（大量データのため）
        $chunks = array_chunk($instances, 500);
        foreach ($chunks as $chunk) {
            DB::table('pulse_survey_instances')->insert($chunk);
        }
    }
}
