<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TenantSeeder extends Seeder
{
    /**
     * テナントデータのシード
     */
    public function run(): void
    {
        $now = Carbon::now();
        
        // テナントデータ（2社）
        $tenants = [
            [
                'name' => '大東亜全世界同盟株式会社',
                'tenant_address' => '東京都千代田区丸の内1-1-1',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => '株式会社テクノイノベーション',
                'tenant_address' => '大阪府大阪市北区梅田2-2-2',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        DB::table('tenants')->insert($tenants);
    }
}