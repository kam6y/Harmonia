<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EngagementScoreStatistic extends Model
{
    use HasFactory;

    /**
     * 対応するテーブル名
     *
     * @var string
     */
    protected $table = 'engagement_score_statistics';
    public $incrementing = false;

    /**
     * 複数代入可能な属性
     *
     * ※ 以下は一例です。実際のテーブル設計に合わせて調整してください。
     *
     * @var array
     */
    protected $fillable = [
        'engagement_survey_instances_id', // 関連する調査インスタンスのID
        'rating',                         // 評価値（必要に応じて算出）
        'score_average',                  // スコアの平均値
        'answer_rate',                    // 回答率（％）
        'created_at',                     // レコード作成日時
        'updated_at',                     // レコード更新日時
    ];
}
