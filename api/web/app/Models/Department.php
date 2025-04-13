<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;
    protected $table = 'departments';

    public function children()
    {
        // belongsToMany(関連モデル, 中間テーブル, 中間テーブル内の"自部署ID"カラム, 中間テーブル内の"相手部署ID"カラム)
        return $this->belongsToMany(
            Department::class,
            'departments_relations',
            'parent_department_id',
            'child_department_id'
        );
    }

    /**
     * 親部署を取得するためのリレーション
     */
    public function parents()
    {
        return $this->belongsToMany(
            Department::class,
            'departments_relations',
            'child_department_id',
            'parent_department_id'
        );
    }

    public function measures()
    {
        return $this->hasMany(Measure::class);
    }
    public function tenant(){
        return $this->belongsTo(Tenant::class);
    }
}
