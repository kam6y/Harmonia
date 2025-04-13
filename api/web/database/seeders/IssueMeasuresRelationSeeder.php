<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class IssueMeasuresRelationSeeder extends Seeder
{
    /**
     * 課題と施策の関連データのシード
     */
    public function run(): void
    {
        $now = Carbon::now();
        $relations = [];
        
        // 課題と施策のデータを取得
        $issues = DB::table('issues')->get();
        $measures = DB::table('measures')->get();
        
        // 各施策に対して、同じカテゴリの課題と関連付ける
        foreach ($measures as $measure) {
            $relatedIssues = $issues->filter(function ($issue) use ($measure) {
                return $issue->tenant_id === $measure->tenant_id &&
                       $issue->department_id === $measure->department_id &&
                       $issue->issue_category === $measure->issue_category;
            });
            
            if ($relatedIssues->count() > 0) {
                // 該当する課題の中からランダムに1つ選択
                $selectedIssue = $relatedIssues->random();
                
                $relations[] = [
                    'issue_id' => $selectedIssue->id,
                    'measure_id' => $measure->id,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }
        
        DB::table('issue-measures_relations')->insert($relations);
    }
}