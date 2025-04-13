<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MeasureChallenge extends Model
{
    use HasFactory;
    
    /**
     * モデルに関連付けるテーブル
     *
     * @var string
     */
    protected $table = 'measures';
    
    /**
     * モデルが使用するプライマリキーの名前
     * 複合キーを使用するため、プライマリキーはnullに設定
     *
     * @var string
     */
    protected $primaryKey = null;
    
    /**
     * モデルのIDが自動増分するかどうか
     * 複合キーを使用するため、falseに設定
     *
     * @var bool
     */
    public $incrementing = false;
    
    /**
     * 複数代入可能な属性
     *
     * @var array
     */
    protected $fillable = [
        'measure_id',
        'issue_id'
    ];
    
    /**
     * タイムスタンプを更新日時のみに制限
     * created_atのみ使用し、updated_atは使用しない
     *
     * @var array
     */
    const UPDATED_AT = null;
    
    /**
     * 関連する施策
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function measure()
    {
        return $this->belongsTo(Measure::class);
    }
    
    /**
     * 関連する課題
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function issue()
    {
        return $this->belongsTo(Issue::class);
    }
}