<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EngagementSurveyInstance extends Model
{
    use HasFactory;

    /**
     * 対応するテーブル名
     *
     * @var string
     */
    protected $table = 'engagement_survey_instances';

    /**
     * 複数代入可能な属性
     *
     * ※ 以下は一例です。実際のテーブルのカラムに合わせて調整してください。
     *
     * @var array
     */
    protected $fillable = [
        'tenant_id',           // テナントID
        'settings_id',         // 設定ID（調査設定を参照する場合など）
        'start_date',          // 調査開始日
        'end_date',            // 調査終了日
        'survey_title',        // 調査のタイトル
        'survey_description',  // 調査の説明文
        'status',              // 調査の状態（例: active/inactive など）
    ];
}
