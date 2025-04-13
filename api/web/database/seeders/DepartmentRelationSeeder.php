<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DepartmentRelationSeeder extends Seeder
{
    /**
     * 部門間の関係データのシード
     */
    public function run(): void
    {
        $now = Carbon::now();
        $startDate = Carbon::create(2024, 4, 1); // 開始日を2024年4月1日に設定
        $relations = [];
        
        // テナント1の部門階層関係
        // 1. 本社が親として持つ部門
        $tenant1Parent1Children = [2, 3, 4, 5, 6, 7, 9, 10]; // 営業部から国際事業部まで（製品開発部、研究開発部、品質管理部を除く）
        
        foreach ($tenant1Parent1Children as $childId) {
            $relations[] = [
                'parent_department_id' => 1, // 本社
                'child_department_id' => $childId,
                'start_date' => $startDate->format('Y-m-d'), // 新しいstart_dateフィールドを追加
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        
        // 2. 製品開発部が親として持つ部門
        $relations[] = [
            'parent_department_id' => 1, // 本社
            'child_department_id' => 8, // 製品開発部
            'start_date' => $startDate->format('Y-m-d'), // 新しいstart_dateフィールドを追加
            'created_at' => $now,
            'updated_at' => $now,
        ];
        
        $relations[] = [
            'parent_department_id' => 8, // 製品開発部
            'child_department_id' => 11, // 研究開発部
            'start_date' => $startDate->format('Y-m-d'), // 新しいstart_dateフィールドを追加
            'created_at' => $now,
            'updated_at' => $now,
        ];
        
        $relations[] = [
            'parent_department_id' => 8, // 製品開発部
            'child_department_id' => 12, // 品質管理部
            'start_date' => $startDate->format('Y-m-d'), // 新しいstart_dateフィールドを追加
            'created_at' => $now,
            'updated_at' => $now,
        ];
        
        // テナント2の部門階層関係
        // 1. 本社が親として持つ部門（全部門）
        for ($i = 2; $i <= 12; $i++) {
            $baseId = ($i <= 12) ? $i : $i - 12;
            $relations[] = [
                'parent_department_id' => 13, // テナント2の本社
                'child_department_id' => 12 + $baseId,
                'start_date' => $startDate->format('Y-m-d'), // 新しいstart_dateフィールドを追加
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        
        // 2. テナント2の製品開発部（20）が親として持つ部門
        $relations[] = [
            'parent_department_id' => 20, // 製品開発部
            'child_department_id' => 23, // 研究開発部
            'start_date' => $startDate->format('Y-m-d'), // 新しいstart_dateフィールドを追加
            'created_at' => $now,
            'updated_at' => $now,
        ];
        
        $relations[] = [
            'parent_department_id' => 20, // 製品開発部
            'child_department_id' => 24, // 品質管理部
            'start_date' => $startDate->format('Y-m-d'), // 新しいstart_dateフィールドを追加
            'created_at' => $now,
            'updated_at' => $now,
        ];
        
        // 子組織に複数の親を持たせない仕様に変更（重複削除）
        // テナント2の研究開発部と品質管理部は、本社と製品開発部の両方から親子関係を持たないよう修正
        $relations = array_filter($relations, function($relation) {
            // 親が本社で子が研究開発部/品質管理部の場合を除外
            return !($relation['parent_department_id'] == 13 && 
                    ($relation['child_department_id'] == 23 || $relation['child_department_id'] == 24));
        });
        
        DB::table('departments_relations')->insert($relations);
    }
}