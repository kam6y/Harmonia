<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class AdminIdentity extends Authenticatable
{
    use Notifiable;

    protected $table = 'admin_identity';
    
    protected $fillable = [
        'mail_address', 'password_hash', 'email_verified_at'
    ];

    protected $hidden = [
        'password_hash', 'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];
    
    // パスワードを取得するためのgetterをオーバーライド
    public function getAuthPassword()
    {
        return $this->password_hash;
    }
}