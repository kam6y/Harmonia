<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SurveyQuestionSeeder extends Seeder
{
    /**
     * サーベイ質問データのシード
     */
    public function run(): void
    {
        $now = Carbon::now();
        
        // 常設設問
        $defaultQuestions = [
            ['issue_category' => '顧客基盤の安定性', 'question_text' => '企業が長期間にわたって安定した顧客関係を築き、維持している状態。'],
            ['issue_category' => '理念戦略への納得感', 'question_text' => '従業員が企業のビジョンや戦略に共感し、それに対する理解と信頼を持っていること。'],
            ['issue_category' => '社会的貢献', 'question_text' => '企業が社会的責任を果たし、地域社会や社会全体へ積極的に貢献している行為。'],
            ['issue_category' => '責任と顧客・社会への貢献', 'question_text' => '企業が顧客への約束を守り、社会に対しても積極的に貢献している姿勢。'],
            ['issue_category' => '連帯感と相互尊重', 'question_text' => '従業員間での団結力と互いの価値観を尊重する文化があること。'],
            ['issue_category' => '魅力的な上司', 'question_text' => '職場において、尊敬できる上司や魅力的な同僚がいること。'],
            ['issue_category' => '勤務地や会社設備の魅力', 'question_text' => '勤務地の立地や会社の設備が充実していて働きやすい環境が整っていること。'],
            ['issue_category' => '評価・給与と柔軟な働き方', 'question_text' => '公正な評価と適正な給与、柔軟な勤務体制が提供されていること。'],
            ['issue_category' => '顧客ニーズや事業戦略の伝達', 'question_text' => '顧客の要望や企業の事業戦略が従業員に明確に伝えられていること。'],
            ['issue_category' => '上司や会社からの理解', 'question_text' => '従業員の意見や状況に対して、上司や会社が理解と支持を示していること。'],
            ['issue_category' => '公平な評価', 'question_text' => '従業員の業績や行動が公正な基準によって評価されていること。'],
            ['issue_category' => '上司からの適切な教育・支援', 'question_text' => '上司が従業員の成長を支援し、必要な知識やスキルの提供を行っていること。'],
            ['issue_category' => '顧客の期待を上回る提案', 'question_text' => '従業員が顧客の期待を超える提案やサービスを提供していること。'],
            ['issue_category' => '具体的な目標の共有', 'question_text' => '会社の目標が明確であり、それが従業員と共有されていること。'],
            ['issue_category' => '未来に向けた活動', 'question_text' => '企業が将来の成功に向けて戦略的な活動を行っていること。'],
            ['issue_category' => 'ナレッジの標準化', 'question_text' => '企業が持つ知識や情報が整理され、効率的に活用されていること。'],
        ];
        
        // 追加の質問（企業ごとに異なる）
        $additionalQuestions = [
            ['issue_category' => 'リモートワークの満足度', 'question_text' => 'リモートワーク環境やルールが整備され、快適に業務を遂行できる状況。'],
            ['issue_category' => '部署間コミュニケーション', 'question_text' => '異なる部署間での情報共有や協力関係が円滑に行われている状態。'],
            ['issue_category' => '新しい技術導入への理解', 'question_text' => '新技術やシステムの導入に対して、組織全体が前向きに対応している状況。'],
            ['issue_category' => 'ワークライフバランス', 'question_text' => '仕事と私生活のバランスが適切に保たれている状態。'],
            ['issue_category' => 'キャリア開発機会', 'question_text' => '自身のスキルや能力を向上させる機会が十分に提供されている状態。'],
            ['issue_category' => '職場の安全性', 'question_text' => '職場環境が健康や安全に配慮されており、安心して働ける状態。'],
        ];
        
        $allQuestions = array_merge($defaultQuestions, $additionalQuestions);
        $questionsWithTimestamps = [];
        
        foreach ($allQuestions as $question) {
            $question['created_at'] = $now;
            $question['updated_at'] = $now;
            $questionsWithTimestamps[] = $question;
        }
        
        DB::table('survey_questions')->insert($questionsWithTimestamps);
        
        // テナント追加質問の関連付け
        $questions = DB::table('survey_questions')->get();
        $tenantAdditionalQuestions = [];
        
        // テナント1の追加質問（リモートワーク、部署間コミュニケーション、新しい技術導入）
        foreach ($questions as $question) {
            if (in_array($question->issue_category, ['リモートワークの満足度', '部署間コミュニケーション', '新しい技術導入への理解'])) {
                $tenantAdditionalQuestions[] = [
                    'tenant_id' => 1,
                    'survey_question_id' => $question->id,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }
        
        // テナント2の追加質問（ワークライフバランス、キャリア開発機会、職場の安全性）
        foreach ($questions as $question) {
            if (in_array($question->issue_category, ['ワークライフバランス', 'キャリア開発機会', '職場の安全性'])) {
                $tenantAdditionalQuestions[] = [
                    'tenant_id' => 2,
                    'survey_question_id' => $question->id,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }
        
        DB::table('tenant-additional_question_relations')->insert($tenantAdditionalQuestions);
    }
}