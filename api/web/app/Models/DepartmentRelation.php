<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DepartmentRelation extends Model
{
    use HasFactory;
    // 実際のテーブル名を明示的に指定
    protected $table = 'departments_relations';

    public function parentDepartment()
    {
        return $this->belongsTo(Department::class, 'parent_department_id');
    }

    /**
     * 子部署とのリレーション
     */
    public function childDepartment()
    {
        return $this->belongsTo(Department::class, 'child_department_id');
    }
}
