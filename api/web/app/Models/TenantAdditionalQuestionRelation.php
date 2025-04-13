<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TenantAdditionalQuestionRelation extends Model
{
    use HasFactory;
    protected $table = 'tenant-additional_question_relations';
    // 主キーが存在しない場合は自動増分を無効にする
    public $incrementing = false;
}
