<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use Illuminate\Support\Str;

class StaffIdentitySeeder extends Seeder
{
    /**
     * スタッフデータのシード
     */
    public function run(): void
    {
        $now = Carbon::now();
        $staff = [];
        
        // 姓のリスト
        $lastNames = ['佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺', '山本', '中村', '小林', '加藤'];
        
        // 名のリスト
        $firstNames = ['太郎', '次郎', '三郎', '四郎', '五郎', '花子', '直子', '美香', '裕子', '愛'];
        
        // 役職リスト
        $roles = ['部長', '課長', '主任', '係長', 'マネージャー'];
        
        // テナント1のスタッフ
        for ($deptId = 1; $deptId <= 12; $deptId++) {
            // 各部門に1人の管理職を配置
            $managerCount = 1;
            
            for ($i = 0; $i < 6; $i++) {
                $lastName = $lastNames[array_rand($lastNames)];
                $firstName = $firstNames[array_rand($firstNames)];
                
                // 管理職かどうか
                $isManager = ($i < $managerCount) ? true : false;
                
                // 人事部の特定のスタッフは人事担当
                $isPersonnel = ($deptId == 4) ? true : false;
                
                // 名前と役職は管理職か人事部のみ設定
                $nameValue = ($isManager || $isPersonnel) ? $lastName . ' ' . $firstName : null;
                $roleValue = ($isManager || $isPersonnel) ? $roles[array_rand($roles)] : null;
                
                $staff[] = [
                    'tenant_id' => 1,
                    'department_id' => $deptId,
                    'sub_department_id' => null,
                    'mail_address' => 'tenant1_dept' . $deptId . '_staff' . ($i+1) . '@example.com',
                    'password_hash' => Hash::make('password123'),
                    'email_verified_at' => $now,
                    'remember_token' => Str::random(10),
                    'is_personnel' => $isPersonnel,
                    'is_manager' => $isManager,
                    'role_name' => $roleValue,
                    'name' => $nameValue,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }
        
        // テナント2のスタッフ
        for ($deptId = 13; $deptId <= 24; $deptId++) {
            // 各部門に1人の管理職を配置
            $managerCount = 1;
            
            for ($i = 0; $i < 6; $i++) {
                $lastName = $lastNames[array_rand($lastNames)];
                $firstName = $firstNames[array_rand($firstNames)];
                
                // 管理職かどうか
                $isManager = ($i < $managerCount) ? true : false;
                
                // 人事部の特定のスタッフは人事担当
                $isPersonnel = ($deptId == 16) ? true : false;
                
                // 名前と役職は管理職か人事部のみ設定
                $nameValue = ($isManager || $isPersonnel) ? $lastName . ' ' . $firstName : null;
                $roleValue = ($isManager || $isPersonnel) ? $roles[array_rand($roles)] : null;
                
                $staff[] = [
                    'tenant_id' => 2,
                    'department_id' => $deptId,
                    'sub_department_id' => null,
                    'mail_address' => 'tenant2_dept' . $deptId . '_staff' . ($i+1) . '@example.com',
                    'password_hash' => Hash::make('password123'),
                    'email_verified_at' => $now,
                    'remember_token' => Str::random(10),
                    'is_personnel' => $isPersonnel,
                    'is_manager' => $isManager,
                    'role_name' => $roleValue,
                    'name' => $nameValue,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }
        
        // 追加：サブ部署を持つスタッフ
        $staff[] = [
            'tenant_id' => 1,
            'department_id' => 8, // 製品開発部
            'sub_department_id' => 11, // 研究開発部
            'mail_address' => 'tenant1_cross_dept_staff@example.com',
            'password_hash' => Hash::make('password123'),
            'email_verified_at' => $now,
            'remember_token' => Str::random(10),
            'is_personnel' => false,
            'is_manager' => false,
            'role_name' => null,
            'name' => null,
            'created_at' => $now,
            'updated_at' => $now,
        ];
        
        $staff[] = [
            'tenant_id' => 2,
            'department_id' => 20, // 製品開発部
            'sub_department_id' => 23, // 研究開発部
            'mail_address' => 'tenant2_cross_dept_staff@example.com',
            'password_hash' => Hash::make('password123'),
            'email_verified_at' => $now,
            'remember_token' => Str::random(10),
            'is_personnel' => false,
            'is_manager' => false,
            'role_name' => null,
            'name' => null,
            'created_at' => $now,
            'updated_at' => $now,
        ];
        
        DB::table('staff_identity')->insert($staff);
    }
}