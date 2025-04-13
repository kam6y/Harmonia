<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MeasureComment extends Model
{
    use HasFactory;
    // テーブル名が規定と異なる場合は明示的に指定
     protected $table = 'measures_comments';

    /**
     * 複数代入可能な属性
     */
    protected $fillable = [
        'measure_id',
        'comment_text',
    ];

    /**
     * 管理者のリレーション
     *
     * @return BelongsTo
     */
    public function adminIdentity(): BelongsTo
    {
        return $this->belongsTo(StaffIdentity::class, 'admin_id', 'id');
    }

    /**
     * スタッフのリレーション
     *
     * @return BelongsTo
     */
    public function staffIdentity(): BelongsTo
    {
        return $this->belongsTo(StaffIdentity::class, 'staff_id', 'id');
    }

}
