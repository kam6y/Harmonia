<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use Illuminate\Support\Str;

class AdminIdentitySeeder extends Seeder
{
    /**
     * 管理者データのシード
     */
    public function run(): void
    {
        $now = Carbon::now();
        
        // 管理者アカウント
        $admins = [
            [
                'mail_address' => '',
                'password_hash' => Hash::make('password123'),
                'email_verified_at' => $now,
                'remember_token' => Str::random(10),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'mail_address' => 'admin2@example.com',
                'password_hash' => Hash::make('password123'),
                'email_verified_at' => $now,
                'remember_token' => Str::random(10),
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];
        
        DB::table('admin_identity')->insert($admins);
    }
}