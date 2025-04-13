<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MeasureSeeder extends Seeder
{
    /**
     * 施策データのシード
     */
    public function run(): void
    {
        $now = Carbon::now();
        $measures = [];

        // カテゴリごとの施策案
        $measureSuggestions = [
            '顧客基盤の安定性' => [
                [
                    'measure_text' => '顧客満足度調査の実施と改善',
                    'action_plan' => '四半期ごとに顧客満足度調査を実施し、結果をもとにサービス改善を行う',
                    'action_plan_details' => '1. 顧客満足度調査の設計と実施\n2. 結果分析とレポート作成\n3. 改善点の特定と実行計画策定\n4. 改善施策の実施とモニタリング',
                ],
                [
                    'measure_text' => '顧客ロイヤリティプログラムの導入',
                    'action_plan' => 'リピート顧客向けの特典プログラムを設計し、導入する',
                    'action_plan_details' => '1. 競合他社のロイヤリティプログラム調査\n2. 自社に適したプログラム設計\n3. システム構築と運用体制整備\n4. プログラム導入と効果測定',
                ],
                [
                    'measure_text' => '顧客フィードバックの一元管理システム構築',
                    'action_plan' => '顧客からの声を一元管理し、改善につなげる仕組みを作る',
                    'action_plan_details' => '1. フィードバック収集チャネルの整理\n2. 管理システムの選定・導入\n3. 分析・対応フローの策定\n4. 部門横断での改善活動の実施',
                ],
            ],
            '理念戦略への納得感' => [
                [
                    'measure_text' => '全社ビジョン浸透ワークショップの開催',
                    'action_plan' => '各部門でビジョン浸透ワークショップを実施し、理解を深める',
                    'action_plan_details' => '1. ワークショップ内容の設計\n2. ファシリテーター育成\n3. 各部門でのワークショップ実施\n4. フォローアップと定着度確認',
                ],
                [
                    'measure_text' => '経営層と社員の対話セッション定期開催',
                    'action_plan' => '四半期ごとに経営層と社員の対話セッションを開催し、戦略理解を促進',
                    'action_plan_details' => '1. 対話セッションの形式設計\n2. 質問事前募集の仕組み構築\n3. 定期開催と議事録共有\n4. 理解度調査とフィードバック',
                ],
                [
                    'measure_text' => '部門別戦略の見える化とKPI設定',
                    'action_plan' => '全社戦略を部門別に落とし込み、達成すべきKPIを明確化する',
                    'action_plan_details' => '1. 部門別戦略マップの作成\n2. KPI設定ワークショップ\n3. 進捗管理の仕組み構築\n4. 定期的な振り返りと調整',
                ],
            ],
            '社会的貢献' => [
                [
                    'measure_text' => '社会貢献活動参加制度の整備',
                    'action_plan' => '社員が社会貢献活動に参加しやすい制度を整える',
                    'action_plan_details' => '1. 社会貢献活動参加制度の設計\n2. 有給ボランティア休暇の導入\n3. 活動情報の共有プラットフォーム構築\n4. 参加実績の可視化と表彰',
                ],
                [
                    'measure_text' => 'SDGs推進チームの発足と活動',
                    'action_plan' => '部門横断のSDGs推進チームを結成し、全社的な取り組みを推進',
                    'action_plan_details' => '1. SDGs推進チームの結成\n2. 全社SDGs研修の実施\n3. 重点テーマの選定と目標設定\n4. 定期的な活動報告と成果共有',
                ],
                [
                    'measure_text' => '環境負荷削減プロジェクト実施',
                    'action_plan' => '事業活動における環境負荷削減プロジェクトを実施',
                    'action_plan_details' => '1. 現状の環境負荷調査\n2. 削減目標設定と計画策定\n3. 施策実施と効果測定\n4. 社内外への情報発信',
                ],
            ],
            '連帯感と相互尊重' => [
                [
                    'measure_text' => '部門間交流イベントの定期開催',
                    'action_plan' => '四半期ごとに部門間交流イベントを開催し、相互理解を促進',
                    'action_plan_details' => '1. 交流イベント企画委員会の設置\n2. 多様な交流イベントの企画\n3. 定期開催と参加促進\n4. 効果測定とフィードバック',
                ],
                [
                    'measure_text' => 'ダイバーシティ＆インクルージョン研修実施',
                    'action_plan' => '全社員を対象としたD&I研修を実施し、多様性尊重の文化を醸成',
                    'action_plan_details' => '1. D&I研修プログラムの設計\n2. 管理職向け研修の実施\n3. 全社員向け研修の展開\n4. 行動変容調査と追加施策検討',
                ],
                [
                    'measure_text' => 'クロスファンクショナルプロジェクトの推進',
                    'action_plan' => '部門横断のプロジェクトを積極的に組成し、協働の機会を創出',
                    'action_plan_details' => '1. クロスファンクショナルプロジェクトのテーマ選定\n2. プロジェクトチーム編成\n3. 進捗共有の場の設定\n4. 成果発表と横展開',
                ],
            ],
            '責任と顧客・社会への貢献' => [
                [
                    'measure_text' => '顧客フィードバックを活用したサービス改善の実施',
                    'action_plan' => '定期的な顧客アンケートとデータ分析を通じ、サービスの課題を特定し改善策を講じる',
                    'action_plan_details' => "1. 定期的な顧客アンケートの実施\n2. アンケート結果のデータ集計と分析\n3. 課題抽出と改善策の立案\n4. 改善策の実施と効果測定",
                ],
                [
                    'measure_text' => '持続可能な環境対策の導入と推進',
                    'action_plan' => '社内外で環境負荷低減に向けた具体的な取り組みを実施する',
                    'action_plan_details' => "1. 現状の環境負荷評価\n2. エネルギー効率向上施策の検討\n3. 環境技術の導入と実施\n4. 効果の定期評価と改善",
                ],
                [
                    'measure_text' => '地域社会への貢献活動の強化',
                    'action_plan' => '地域のニーズを踏まえた社会貢献プロジェクトを企画・実行する',
                    'action_plan_details' => "1. 地域ニーズ調査の実施\n2. プロジェクト計画の策定\n3. 地域パートナーとの連携強化\n4. プロジェクト成果の評価と次年度への反映",
                ],
            ],

            '魅力的な上司' => [
                [
                    'measure_text' => 'マネジメントスキル強化研修の実施',
                    'action_plan' => '管理職を対象としたマネジメントスキル強化研修を実施',
                    'action_plan_details' => '1. マネジメントスキル診断の実施\n2. 研修プログラムの設計\n3. 研修実施と実践課題の設定\n4. フォローアップと効果測定',
                ],
                [
                    'measure_text' => '1on1ミーティングの導入と定着',
                    'action_plan' => '上司と部下の1on1ミーティングを導入し、コミュニケーション強化を図る',
                    'action_plan_details' => '1. 1on1ミーティングガイドラインの策定\n2. 管理職向け研修の実施\n3. 試行と改善\n4. 全社展開と効果確認',
                ],
                [
                    'measure_text' => 'リーダーシップ360度フィードバックの導入',
                    'action_plan' => '管理職を対象に360度フィードバックを導入し、成長を支援',
                    'action_plan_details' => '1. 360度フィードバックツールの選定\n2. 評価項目と実施プロセスの設計\n3. 試行実施と改善\n4. 全管理職への展開と開発計画策定',
                ],
            ],
            '勤務地や会社設備の魅力' => [
                [
                    'measure_text' => 'オフィス環境改善プロジェクト',
                    'action_plan' => '社員の声を取り入れたオフィス環境改善を実施',
                    'action_plan_details' => '1. 社員満足度調査の実施\n2. 改善ポイントの特定と優先順位付け\n3. 改善計画の策定と実施\n4. 改善後の満足度調査と効果確認',
                ],
                [
                    'measure_text' => 'リモートワーク環境整備支援',
                    'action_plan' => '在宅勤務環境整備のための支援制度を導入',
                    'action_plan_details' => '1. 在宅勤務環境の現状調査\n2. 必要な支援内容の特定\n3. 支援制度の設計と導入\n4. 利用状況と満足度の確認',
                ],
                [
                    'measure_text' => 'サテライトオフィス導入検討',
                    'action_plan' => '通勤負担軽減のためのサテライトオフィス導入を検討',
                    'action_plan_details' => '1. 社員の居住地分布調査\n2. サテライトオフィスの候補地選定\n3. 費用対効果分析\n4. 試験導入と本格展開判断',
                ],
            ],
            '評価・給与と柔軟な働き方' => [
                [
                    'measure_text' => '評価制度の見直しと透明化',
                    'action_plan' => '評価基準を明確化し、プロセスの透明性を高める',
                    'action_plan_details' => '1. 現行評価制度の課題抽出\n2. 新評価制度の設計\n3. 評価者研修の実施\n4. 新制度の導入と運用状況確認',
                ],
                [
                    'measure_text' => '柔軟な勤務制度の拡充',
                    'action_plan' => 'フレックスタイム制やシフト勤務など柔軟な勤務制度を拡充',
                    'action_plan_details' => '1. 現行勤務制度の課題調査\n2. 新勤務制度の設計\n3. システム対応と運用ルール策定\n4. 試験導入と全社展開',
                ],
                [
                    'measure_text' => '成果連動型報酬制度の導入',
                    'action_plan' => '個人・チームの成果と報酬を連動させる仕組みを導入',
                    'action_plan_details' => '1. 他社事例調査と自社適合性検討\n2. 成果指標と連動方法の設計\n3. 制度設計と説明会実施\n4. 導入と運用状況のモニタリング',
                ],
            ],
            '公平な評価' => [
                [
                    'measure_text' => '評価者トレーニングの実施',
                    'action_plan' => '評価バイアスを減らすための評価者トレーニングを実施',
                    'action_plan_details' => '1. 評価バイアスの実態調査\n2. トレーニングプログラムの設計\n3. 全評価者向けトレーニング実施\n4. 評価結果の分析と追加対策検討',
                ],
                [
                    'measure_text' => '多面評価の導入',
                    'action_plan' => '上司だけでなく同僚・部下からの評価も取り入れる多面評価を導入',
                    'action_plan_details' => '1. 多面評価項目と方法の設計\n2. 評価システムの整備\n3. 試行導入と改善\n4. 本格導入と効果測定',
                ],
                [
                    'measure_text' => '評価結果のフィードバック強化',
                    'action_plan' => '評価結果の丁寧なフィードバックと育成計画策定を徹底',
                    'action_plan_details' => '1. フィードバック面談ガイドラインの策定\n2. 評価者向けフィードバック研修\n3. フィードバック面談の実施と記録\n4. フォローアップと改善確認',
                ],
            ],
            '顧客の期待を上回る提案' => [
                [
                    'measure_text' => '提案力強化研修の実施',
                    'action_plan' => '営業担当者向けに顧客提案力強化研修を実施',
                    'action_plan_details' => '1. 現在の提案内容の分析\n2. 研修プログラムの設計\n3. 研修実施と実践課題の設定\n4. 提案内容の変化と成果確認',
                ],
                [
                    'measure_text' => '顧客インサイト共有会の定期開催',
                    'action_plan' => '顧客インサイトを全社で共有し、提案力向上につなげる',
                    'action_plan_details' => '1. 顧客インサイト収集の仕組み構築\n2. 共有会の企画と定期開催\n3. 好事例の横展開\n4. 提案内容の改善と効果測定',
                ],
                [
                    'measure_text' => 'ソリューション提案テンプレートの開発',
                    'action_plan' => '顧客課題解決型の提案テンプレートを開発し、全社で活用',
                    'action_plan_details' => '1. 現行提案資料の課題分析\n2. 新テンプレートの開発\n3. 使い方研修と試行\n4. 改善と全社展開',
                ],
            ],
            '具体的な目標の共有' => [
                [
                    'measure_text' => 'OKR（目標と主要成果指標）の導入',
                    'action_plan' => '全社でOKRを導入し、目標の連鎖と進捗可視化を実現',
                    'action_plan_details' => '1. OKR導入研修の実施\n2. 部門・チームOKRの設定\n3. 進捗確認の仕組み構築\n4. 振り返りと改善サイクル確立',
                ],
                [
                    'measure_text' => '全社目標ダッシュボードの構築',
                    'action_plan' => '全社・部門・個人の目標と進捗を可視化するダッシュボードを構築',
                    'action_plan_details' => '1. ダッシュボード要件定義\n2. システム構築\n3. 利用促進と定着支援\n4. 効果検証と改善',
                ],
                [
                    'measure_text' => '週次目標レビューの定着',
                    'action_plan' => 'チームごとに週次で目標進捗レビューを行う習慣を定着させる',
                    'action_plan_details' => '1. 週次レビュー方法の設計\n2. 各チームでの試行\n3. 好事例共有と全社展開\n4. 効果測定と改善',
                ],
            ],
            'リモートワークの満足度' => [
                [
                    'measure_text' => 'リモートワークガイドラインの整備',
                    'action_plan' => '効果的なリモートワークのためのガイドラインを整備',
                    'action_plan_details' => '1. 現状の課題抽出\n2. ガイドライン策定\n3. 全社説明会の実施\n4. 運用状況確認と改善',
                ],
                [
                    'measure_text' => 'オンラインコミュニケーションツールの標準化',
                    'action_plan' => 'オンライン会議・チャットツールの利用ルールを標準化',
                    'action_plan_details' => '1. 現状の利用状況調査\n2. 標準ツールと利用ルールの策定\n3. 研修と移行支援\n4. 定着度確認と改善',
                ],
                [
                    'measure_text' => 'リモートワーク環境整備補助制度の導入',
                    'action_plan' => '自宅の作業環境整備のための補助制度を導入',
                    'action_plan_details' => '1. 必要な環境整備の調査\n2. 補助制度の設計\n3. 制度導入と利用促進\n4. 満足度調査と制度改善',
                ],
            ],
            '部署間コミュニケーション' => [
                [
                    'measure_text' => '部門横断プロジェクトの推進',
                    'action_plan' => '部門を超えたプロジェクトチームを組成し、協働を促進',
                    'action_plan_details' => '1. 部門横断プロジェクトのテーマ選定\n2. チーム編成と目標設定\n3. 定期的な進捗共有\n4. 成果発表と効果測定',
                ],
                [
                    'measure_text' => '部門交流イベントの定期開催',
                    'action_plan' => '四半期ごとに部門交流イベントを開催し、相互理解を促進',
                    'action_plan_details' => '1. イベント企画チームの結成\n2. 部門紹介セッションの開催\n3. 交流ワークショップの実施\n4. 効果測定とフィードバック',
                ],
                [
                    'measure_text' => '情報共有プラットフォームの整備',
                    'action_plan' => '部門間で情報を効果的に共有できるプラットフォームを整備',
                    'action_plan_details' => '1. 現状の情報共有課題調査\n2. プラットフォーム選定と設計\n3. 導入と利用促進\n4. 活用状況確認と改善',
                ],
            ],
            'ワークライフバランス' => [
                [
                    'measure_text' => '労働時間管理の徹底と長時間労働是正',
                    'action_plan' => '労働時間の可視化と長時間労働者への個別対応を徹底',
                    'action_plan_details' => '1. 労働時間管理システムの整備\n2. 長時間労働の原因分析\n3. 管理職向け労務管理研修\n4. 改善状況のモニタリング',
                ],
                [
                    'measure_text' => '有給休暇取得促進キャンペーン',
                    'action_plan' => '計画的な有給休暇取得を促進するキャンペーンを実施',
                    'action_plan_details' => '1. 部門別有給取得率の公表\n2. 計画的取得の推進策検討\n3. キャンペーン実施と好事例共有\n4. 取得率改善確認と継続施策検討',
                ],
                [
                    'measure_text' => '業務効率化・属人化解消プロジェクト',
                    'action_plan' => '業務の効率化と属人化解消により残業削減と休暇取得促進',
                    'action_plan_details' => '1. 業務分析と効率化余地の特定\n2. 業務マニュアル整備\n3. チーム内ナレッジ共有の仕組み構築\n4. 効果測定と横展開',
                ],
            ],
            'キャリア開発機会' => [
                [
                    'measure_text' => '自己啓発支援制度の拡充',
                    'action_plan' => '社員のスキルアップを支援する自己啓発支援制度を拡充',
                    'action_plan_details' => '1. 現行制度の利用状況と課題調査\n2. 制度改定案の策定\n3. 新制度導入と利用促進\n4. 効果測定と改善',
                ],
                [
                    'measure_text' => 'キャリア面談の定期実施',
                    'action_plan' => '年2回、上司との個別キャリア面談を実施し、成長を支援',
                    'action_plan_details' => '1. キャリア面談ガイドラインの策定\n2. 管理職向け研修の実施\n3. 面談実施と記録\n4. フォローアップと効果確認',
                ],
                [
                    'measure_text' => '社内公募制度・ジョブローテーションの活性化',
                    'action_plan' => '社内公募やジョブローテーションを活性化し、成長機会を提供',
                    'action_plan_details' => '1. 現行制度の課題抽出\n2. 制度改善と活性化策の検討\n3. 新制度導入と周知\n4. 応募状況と効果確認',
                ],
            ],
        ];

        // 全ての課題に対して施策を作成
        $issues = DB::table('issues')->get();

        foreach ($issues as $issue) {
            $category = $issue->issue_category;

            // カテゴリに対応する施策案がない場合はスキップ
            if (!isset($measureSuggestions[$category])) {
                continue;
            }

            // カテゴリに対応する施策案の中からランダムに1～2個選択
            $count = rand(1, min(2, count($measureSuggestions[$category])));
            $keys = array_rand($measureSuggestions[$category], $count);

            // array_randが1つだけの場合は整数を返すので配列に変換
            if (!is_array($keys)) {
                $keys = [$keys];
            }

            $selectedMeasures = [];
            foreach ($keys as $key) {
                $selectedMeasures[] = $measureSuggestions[$category][$key];
            }

            foreach ($selectedMeasures as $measureInfo) {
                // 施策の作成日（過去1年以内の任意の日付）
                $createdAt = Carbon::now()->subDays(rand(0, 365));

                // ステータスをランダムに設定
                $statusOptions = ['planning', 'in_progress', 'systematization', 'archived'];
                $status = $statusOptions[array_rand($statusOptions)];

                // 期限を作成日から30～180日後に設定
                $deadline = (clone $createdAt)->addDays(rand(30, 180));

                // 目標値（実績は期待値の50～100%）
                $expectedValue = rand(30, 50) / 10; // 3.0～5.0
                $actualValue = $expectedValue * (rand(50, 100) / 100); // 期待値の50～100%

                $measures[] = [
                    'tenant_id' => $issue->tenant_id,
                    'department_id' => $issue->department_id,
                    'issue_category' => $issue->issue_category,
                    'measure_text' => $measureInfo['measure_text'],
                    'action_plan' => $measureInfo['action_plan'],
                    'action_plan_details' => $measureInfo['action_plan_details'],
                    'assignee' => '担当者' . rand(1, 5),
                    'deadline' => $deadline->format('Y-m-d'),
                    'goal_actual_value' => $actualValue,
                    'goal_expected_value' => $expectedValue,
                    'status' => $status,
                    'created_at' => $createdAt,
                    'updated_at' => $now,
                ];
            }
        }
        DB::table('measures')->insert($measures);
    }
}
