<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Notification extends Model
{
    use HasFactory;
    protected $table = 'measures_comments';

    protected $fillable = [
        'measure_id',
        'admin_id',
        'staff_id',
        'comment_text',
        'mention_is_personnel',
        'mention_is_admin',
        'mention_is_manager',
        'created_at',
        'updated_at',
    ];

    /**
     * 関連する施策
     */
    public function measure()
    {
        return $this->belongsTo(Measure::class, 'measure_id');
    }

    /**
     * スタッフの送信者
     */
    public function staffSender()
    {
        return $this->belongsTo(StaffIdentity::class, 'staff_id');
    }

    /**
     * 管理者の送信者
     */
    public function adminSender()
    {
        return $this->belongsTo(AdminIdentity::class, 'admin_id');
    }

    /**
     * 送信者の情報を取得（スタッフまたは管理者）
     */
    public function getSender()
    {
        if ($this->staff_id) {
            return $this->staffSender;
        } elseif ($this->admin_id) {
            return $this->adminSender;
        }
        return null;
    }

    /**
     * 通知が既読か判定する
     * measures_commentsテーブルには既読フラグがないため、
     * 24時間以上経過したコメントは既読とみなす簡易実装
     *
     * @return bool
     */
    public function isReplied()
    {
        $createdAt = Carbon::parse($this->created_at);
        $now = Carbon::now();
        return $createdAt->diffInHours($now) >= 24;
    }

    /**
     * 関連する部署を取得する
     *
     * @return Department|null
     */
    public function getDepartment()
    {
        if ($this->measure) {
            return Department::find($this->measure->department_id);
        }
        return null;
    }

    /**
     * 関連するテナントを取得する
     *
     * @return Tenant|null
     */
    public function getTenant()
    {
        if ($this->measure) {
            return Tenant::find($this->measure->tenant_id);
        }
        return null;
    }

    /**
     * 通知タイトルを取得する
     *
     * @return string
     */
    public function getTitle()
    {
        return "施策へのコメント";
    }

    /**
     * 通知内容を取得する
     *
     * @return string
     */
    public function getMessage()
    {
        if ($this->measure) {
            return "「{$this->measure->measure_text}」に新しいコメントがあります";
        }
        return $this->comment_text;
    }

    /**
     * 通知データをフロントエンド用に整形する
     *
     * @return array
     */
    public function toNotificationArray()
    {
        $sender = $this->getSender();
        $department = $this->getDepartment();
        $tenant = $this->getTenant();

        return [
            'id' => $this->id,
            'userImg' => '/images/Generic_avatar.svg',
            'tenantName' => $tenant ? $tenant->name : '',
            'department' => $department ? $department->name : '不明な部署',
            'title' => $this->getTitle(),
            'comment' => $this->getMessage(),
            'time' => $this->created_at,
            'replied' => $this->isReplied(),
            'sender' => [
                'id' => $sender ? $sender->id : null,
                'name' => $sender ? ($sender->name ?? '不明') : '不明',
                'email' => $sender ? ($sender->mail_address ?? '') : ''
            ],
            'targetType' => 'measure',
            'targetId' => $this->measure_id
        ];
    }
}