<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MeasuresCommentSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();
        $comments = [];

        // コメントテンプレート
        $commentTemplates = [
            'admin' => [
                '施策の進捗状況を教えてください。',
                'この施策は全社的に重要です。優先的に進めてください。',
                '同様の施策を他部門でも展開できると良いですね。',
                '期限が迫っていますが、進捗はいかがですか？',
                '素晴らしい施策ですね。他部門への展開も検討しましょう。',
            ],
            'staff' => [
                '現在、計画通りに進行中です。来週には最初の結果が出る予定です。',
                '一部スケジュールに遅れが生じていますが、対策を検討中です。',
                '予想以上に効果が出ています。詳細なレポートを来週共有します。',
                'チームメンバー全員がこの施策に取り組んでいます。',
                '予定通り進んでいますが、追加リソースがあると助かります。',
                '先週のミーティングでの提案を反映させました。結果も良好です。',
                '他部門との連携が必要ですが、調整に時間がかかっています。',
                '初期結果は良好です。このまま継続します。',
                '目標達成に向けて順調に進んでいます。',
                '予想外の課題が発生しましたが、解決策を実行中です。',
            ],
            'personnel' => [
                '人事部としてサポートできることがあればお知らせください。',
                '研修プログラムの開発が必要であれば協力します。',
                'この施策は社員エンゲージメント向上に寄与すると思います。',
                '社内コミュニケーションの観点からもサポートします。',
                '人材配置の調整が必要であれば相談してください。',
            ],
            'manager' => [
                '部門1の管理職向け：施策の進捗についてご報告ください。',
                '部門1の管理職向け：この施策は全体の戦略にどう寄与していますか？',
                '部門1の管理職向け：今後の見通しについて詳しく説明してください。'
            ],
        ];

        $measures = DB::table('measures')->get();
        $admins = DB::table('admin_identity')->get();
        $staffs = DB::table('staff_identity')->get();

        foreach ($measures as $measure) {
            $commentCount = rand(1, 5);
            $measureCreatedAt = Carbon::parse($measure->created_at);

            for ($i = 0; $i < $commentCount; $i++) {
                $createdAt = Carbon::createFromTimestamp(rand($measureCreatedAt->timestamp, $now->timestamp));
                $typeOptions = ['admin', 'staff', 'personnel'];
                $commentType = $typeOptions[array_rand($typeOptions)];
                $commentText = $commentTemplates[$commentType][array_rand($commentTemplates[$commentType])];

                $adminId = null;
                $staffId = null;
                $mention_is_admin = false;
                $mention_is_personnel = false;
                $mention_is_manager = false;

                // メンションタイプ
                $mentionOptions = ['admin', 'personnel', 'manager', 'none'];
                $mentionType = $mentionOptions[array_rand($mentionOptions)];

                if ($mentionType === 'admin') {
                    $mention_is_admin = true;
                }
                if ($mentionType === 'personnel') {
                    $mention_is_personnel = true;
                }
                if ($mentionType === 'manager') {
                    $mention_is_manager = true;
                }

                if ($commentType === 'admin') {
                    $admin = $admins->random();
                    if ($admin) {
                        $adminId = $admin->id;
                    }
                } elseif ($commentType === 'personnel') {
                    $personnel = $staffs->where('is_personnel', true)
                        ->where('tenant_id', $measure->tenant_id)
                        ->first();

                    if ($personnel) {
                        $staffId = $personnel->id;
                    } else {
                        // fallback to regular staff
                        $commentType = 'staff';
                    }
                }

                if ($commentType === 'staff') {
                    $staff = $staffs->where('tenant_id', $measure->tenant_id)
                        ->where('department_id', $measure->department_id)
                        ->random();

                    if ($staff) {
                        $staffId = $staff->id;
                    } else {
                        continue; // 該当スタッフがいなければスキップ
                    }
                }

                if ($adminId || $staffId) {
                    $comments[] = [
                        'measure_id' => $measure->id,
                        'admin_id' => $adminId,
                        'staff_id' => $staffId,
                        'comment_text' => $commentText,
                        'mention_is_admin' => $mention_is_admin,
                        'mention_is_personnel' => $mention_is_personnel,
                        'mention_is_manager' => $mention_is_manager,
                        'created_at' => $createdAt,
                        'updated_at' => $createdAt,
                    ];
                }
            }

            // department_id が 1 の施策に対して、管理職向けのメンションコメントを追加
            if ($measure->department_id == 1) {
                // 新たな作成日時を生成
                $createdAt = Carbon::createFromTimestamp(rand($measureCreatedAt->timestamp, $now->timestamp));
                // 管理職向けコメントテキストをランダムに選択
                $managerCommentText = $commentTemplates['manager'][array_rand($commentTemplates['manager'])];

                // 管理職に該当するスタッフを取得（例として、department_id が 1 のスタッフを1件取得）
                $manager = $staffs->where('department_id', 1)->first();
                $staffId = $manager ? $manager->id : null;

                $comments[] = [
                    'measure_id' => $measure->id,
                    'admin_id' => null,
                    'staff_id' => $staffId,
                    'comment_text' => $managerCommentText,
                    'mention_is_admin' => false,
                    'mention_is_personnel' => false,
                    'mention_is_manager' => true,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ];
            }
        }

        DB::table('measures_comments')->insert($comments);
    }
}