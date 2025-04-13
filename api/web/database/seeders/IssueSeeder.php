<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class IssueSeeder extends Seeder
{
    /**
     * 課題データのシード
     */
    public function run(): void
    {
        // created_at は2022-04-22以前にするため、2022-04-21を設定
        $createdAt = Carbon::parse('2022-04-21 00:00:00');
        $updatedAt = Carbon::now();
        $issues = [];

        // 課題カテゴリとそれに対応する課題テキスト
        $issueTypes = [
            '顧客基盤の安定性' => [
                '顧客離れが増加している',
                '新規顧客獲得率が低下している',
                'リピート率が低い',
                '顧客満足度が業界平均を下回っている',
            ],
            '理念戦略への納得感' => [
                '会社のビジョンが社員に浸透していない',
                '経営方針への理解が乏しい',
                '社員の帰属意識が低い',
                '中長期戦略と日常業務の結びつきが弱い',
            ],
            '社会的貢献' => [
                'SDGsへの取り組みが不十分',
                '社会貢献活動の参加率が低い',
                '環境配慮型製品の開発が遅れている',
                '地域社会との関わりが希薄',
            ],
            '責任と顧客・社会への貢献' => [
                '品質とサービスの一貫性の維持ができていない',
                '社会貢献活動の効果測定と持続性の確保ができていない',
                'コストとリソースの最適配分が取れていない',
                '組織内外のコミュニケーションと信頼構築に劣る',
            ],
            '連帯感と相互尊重' => [
                '部門間の連携が取れていない',
                'チームワークが弱い',
                '多様性への理解が不足している',
                '社内コミュニケーションが円滑でない',
            ],
            '魅力的な上司' => [
                '上司のフィードバックが不足している',
                'リーダーシップが発揮されていない',
                '部下の育成に時間を割いていない',
                'マネージャーのコーチングスキルが不足',
            ],
            '勤務地や会社設備の魅力' => [
                'リモートワーク環境が整っていない',
                'オフィス環境が快適でない',
                '通勤の利便性が悪い',
                '職場設備の老朽化',
            ],
            '評価・給与と柔軟な働き方' => [
                '評価基準が不明確',
                'フレックスタイム制が機能していない',
                '給与水準が業界平均より低い',
                '成果と報酬の連動性が弱い',
            ],
            '公平な評価' => [
                '評価の透明性が低い',
                '成果が適切に評価されていない',
                '評価者による偏りがある',
                '評価フィードバックが不十分',
            ],
            '顧客の期待を上回る提案' => [
                '提案力が弱い',
                '革新的なアイデアが出ない',
                '顧客視点が欠けている',
                'ソリューション提案より製品販売に偏重',
            ],
            '具体的な目標の共有' => [
                '部門目標が不明確',
                '個人目標が会社の目標と連動していない',
                '目標の進捗管理ができていない',
                'KPIの設定と運用が不十分',
            ],
            'リモートワークの満足度' => [
                'オンライン会議ツールの使い方が統一されていない',
                '在宅勤務環境の支援が不十分',
                'リモートワーク下でのチームワークの低下',
                '勤怠管理の仕組みが整っていない',
            ],
            '部署間コミュニケーション' => [
                '情報共有がうまくいっていない',
                '部署間の壁が高い',
                '共同プロジェクトの進行が遅い',
                '相互理解の不足によるミスコミュニケーション',
            ],
            'ワークライフバランス' => [
                '長時間労働の常態化',
                '休暇取得率の低さ',
                '業務量の偏り',
                'プライベートと仕事の境界線が曖昧',
            ],
            'キャリア開発機会' => [
                'スキルアップのための研修機会が少ない',
                'キャリアパスが明確でない',
                '自己啓発の支援制度が不足',
                '専門性を高める機会が限られている',
            ],
        ];

        // テナント1の部門を取得
        $tenant1Departments = DB::table('departments')
            ->where('tenant_id', 1)
            ->get();

        // テナント2の部門を取得
        $tenant2Departments = DB::table('departments')
            ->where('tenant_id', 2)
            ->get();

        // テナント1の部門に対する処理
        foreach ($tenant1Departments as $department) {
            if ($department->id == 8) {
                // 固定の5カテゴリを使用（各カテゴリから2件ずつ、計10件）
                $fixedCategories = [
                    '顧客基盤の安定性',
                    '理念戦略への納得感',
                    '社会的貢献',
                    '連帯感と相互尊重',
                    '魅力的な上司',
                ];
                foreach ($fixedCategories as $category) {
                    $texts = $issueTypes[$category];
                    shuffle($texts);
                    // 各カテゴリから2件取得
                    $selectedTexts = array_slice($texts, 0, 2);
                    foreach ($selectedTexts as $issueText) {
                        $issues[] = [
                            'tenant_id'      => 1,
                            'department_id'  => $department->id,
                            'issue_category' => $category,
                            'issue_text'     => $issueText,
                            'created_at'     => $createdAt,
                            'updated_at'     => $updatedAt,
                        ];
                    }
                }
            } else {
                // それ以外の部門は、ランダムに課題カテゴリを10個選択し、各カテゴリから1件ずつ登録
                $selectedCategories = array_rand($issueTypes, min(10, count($issueTypes)));
                if (!is_array($selectedCategories)) {
                    $selectedCategories = [$selectedCategories];
                }

                foreach ($selectedCategories as $category) {
                    $issueText = $issueTypes[$category][array_rand($issueTypes[$category])];
                    $issues[] = [
                        'tenant_id'      => 1,
                        'department_id'  => $department->id,
                        'issue_category' => $category,
                        'issue_text'     => $issueText,
                        'created_at'     => $createdAt,
                        'updated_at'     => $updatedAt,
                    ];
                }
            }
        }

        // テナント2の部門に対する処理
        foreach ($tenant2Departments as $department) {
            if ($department->id == 8) {
                // 固定の5カテゴリを使用（各カテゴリから2件ずつ、計10件）
                $fixedCategories = [
                    '顧客基盤の安定性',
                    '理念戦略への納得感',
                    '社会的貢献',
                    '連帯感と相互尊重',
                    '魅力的な上司',
                ];
                foreach ($fixedCategories as $category) {
                    $texts = $issueTypes[$category];
                    shuffle($texts);
                    $selectedTexts = array_slice($texts, 0, 2);
                    foreach ($selectedTexts as $issueText) {
                        $issues[] = [
                            'tenant_id'      => 2,
                            'department_id'  => $department->id,
                            'issue_category' => $category,
                            'issue_text'     => $issueText,
                            'created_at'     => $createdAt,
                            'updated_at'     => $updatedAt,
                        ];
                    }
                }
            } else {
                // それ以外は、ランダムに10個選択して登録
                $selectedCategories = array_rand($issueTypes, min(10, count($issueTypes)));
                if (!is_array($selectedCategories)) {
                    $selectedCategories = [$selectedCategories];
                }

                foreach ($selectedCategories as $category) {
                    $issueText = $issueTypes[$category][array_rand($issueTypes[$category])];
                    $issues[] = [
                        'tenant_id'      => 2,
                        'department_id'  => $department->id,
                        'issue_category' => $category,
                        'issue_text'     => $issueText,
                        'created_at'     => $createdAt,
                        'updated_at'     => $updatedAt,
                    ];
                }
            }
        }

        DB::table('issues')->insert($issues);
    }
}
