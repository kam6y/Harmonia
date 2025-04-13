<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SuccessfulMeasureSeeder extends Seeder
{
    /**
     * 成功施策データのシード
     */
    public function run(): void
    {
        $now = Carbon::now();
        $successfulMeasures = [];
        
        // ステータスが 'systematization' または 'archived' の施策を成功施策として登録
        $measures = DB::table('measures')
            ->whereIn('status', ['systematization', 'archived'])
            ->get();
        
        foreach ($measures as $measure) {
            // 成功日（施策の期限から0～60日後）
            $deadline = Carbon::parse($measure->deadline);
            $successDate = (clone $deadline)->addDays(rand(0, 60));
            
            // 現在より後の日付にならないよう調整
            if ($successDate->gt($now)) {
                $successDate = $now->copy()->subDays(rand(1, 30));
            }
            
            $successfulMeasures[] = [
                'tenant_id' => $measure->tenant_id,
                'measure_id' => $measure->id,
                'success_date' => $successDate->format('Y-m-d'),
                'created_at' => $successDate,
            ];
        }
        
        DB::table('successful_measures')->insert($successfulMeasures);
    }
}