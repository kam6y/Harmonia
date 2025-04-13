<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DepartmentSeeder extends Seeder
{
    /**
     * 部門データのシード
     */
    public function run(): void
    {
        $now = Carbon::now();
        $startDate = Carbon::create(2024, 4, 1); // 開始日を2024年4月1日に設定
        $departments = [];
        
        // テナント1の部門（12部門）
        $tenant1Departments = [
            ['name' => '本社', 'front_only_departments_id' => 1],
            ['name' => '営業部', 'front_only_departments_id' => 2],
            ['name' => '開発部', 'front_only_departments_id' => 3],
            ['name' => '人事部', 'front_only_departments_id' => 4],
            ['name' => '財務部', 'front_only_departments_id' => 5],
            ['name' => '法務部', 'front_only_departments_id' => 6],
            ['name' => 'マーケティング部', 'front_only_departments_id' => 7],
            ['name' => '製品開発部', 'front_only_departments_id' => 8],
            ['name' => 'カスタマーサポート部', 'front_only_departments_id' => 9],
            ['name' => '国際事業部', 'front_only_departments_id' => 10],
            ['name' => '研究開発部', 'front_only_departments_id' => 11],
            ['name' => '品質管理部', 'front_only_departments_id' => 12],
        ];
        
        foreach ($tenant1Departments as $dept) {
            $departments[] = [
                'tenant_id' => 1,
                'name' => $dept['name'],
                'front_only_departments_id' => $dept['front_only_departments_id'],
                'start_date' => $startDate->format('Y-m-d'),  // 新しいstart_dateフィールドを追加
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        
        // テナント2の部門（12部門）
        $tenant2Departments = [
            ['name' => '本社', 'front_only_departments_id' => 1],
            ['name' => '営業部', 'front_only_departments_id' => 2],
            ['name' => '開発部', 'front_only_departments_id' => 3],
            ['name' => '人事部', 'front_only_departments_id' => 4],
            ['name' => '財務部', 'front_only_departments_id' => 5],
            ['name' => '法務部', 'front_only_departments_id' => 6],
            ['name' => 'マーケティング部', 'front_only_departments_id' => 7],
            ['name' => '製品開発部', 'front_only_departments_id' => 8],
            ['name' => 'カスタマーサポート部', 'front_only_departments_id' => 9],
            ['name' => '国際事業部', 'front_only_departments_id' => 10],
            ['name' => '研究開発部', 'front_only_departments_id' => 11],
            ['name' => '品質管理部', 'front_only_departments_id' => 12],
        ];
        
        foreach ($tenant2Departments as $dept) {
            $departments[] = [
                'tenant_id' => 2,
                'name' => $dept['name'],
                'front_only_departments_id' => $dept['front_only_departments_id'],
                'start_date' => $startDate->format('Y-m-d'),  // 新しいstart_dateフィールドを追加
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        
        DB::table('departments')->insert($departments);
    }
}