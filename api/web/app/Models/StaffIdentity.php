<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class StaffIdentity extends Authenticatable
{
    use Notifiable;

    protected $table = 'staff_identity';

    protected $fillable = [
        'tenant_id', 'department_id', 'sub_department_id',
        'mail_address', 'password_hash', 'email_verified_at',
        'is_personnel', 'is_manager', 'role_name', 'name'
    ];

    protected $hidden = [
        'password_hash', 'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_personnel' => 'boolean',
        'is_manager' => 'boolean',
    ];

    // パスワードを取得するためのgetterをオーバーライド
    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    // テナントとのリレーション
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    // 部門とのリレーション
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    // サブ部門とのリレーション
    public function subDepartment()
    {
        return $this->belongsTo(Department::class, 'sub_department_id');
    }

    public function adminComments(): HasMany
    {
        return $this->hasMany(MeasureComment::class, 'admin_id', 'id');
    }

    public function staffComments(): HasMany
    {
        return $this->hasMany(MeasureComment::class, 'staff_id', 'id');
    }
}
