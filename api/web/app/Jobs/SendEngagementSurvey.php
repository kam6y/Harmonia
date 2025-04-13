<?php

namespace App\Jobs;

use App\Mail\EngagementSurveyMail;
use App\Mail\EngagementSurveyReminderMail;
use App\Models\EngagementSurveySetting;
use App\Models\EngagementSurveyInstance;
use App\Models\StaffIdentity;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Carbon;

class SendEngagementSurvey implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $tenantId;
    protected $settingId;
    protected $deliveryDate; // 本日など、送信日
    protected $isReminder;

    /**
     * Create a new job instance.
     *
     * @param int $tenantId
     * @param int $settingId
     * @param string $deliveryDate (Y-m-d形式など)
     * @param bool $isReminder
     */
    public function __construct($tenantId, $settingId, $deliveryDate, $isReminder = false)
    {
        $this->tenantId = $tenantId;
        $this->settingId = $settingId;
        $this->deliveryDate = $deliveryDate;
        $this->isReminder = $isReminder;

    }

    /**
     * Execute the job.
     */
    public function handle()
    {
        if ($this->isReminder) {
            $staffList = StaffIdentity::where('tenant_id', $this->tenantId)->get();
            foreach ($staffList as $staff) {
                Mail::to($staff->mail_address)
                    ->queue(new EngagementSurveyReminderMail($staff, $this->tenantId));
            }

        } else {
            // 全メール送信を指示した後にインスタンスを作成
            $instance = EngagementSurveyInstance::create([
                'tenant_id'   => $this->tenantId,
                'settings_id' => $this->settingId,
                'start_date'  => $this->deliveryDate,
            ]);
            $instanceId = $instance->id; // ← 作成されたレコードのID

            // 設定とスタッフを取得
            $setting = EngagementSurveySetting::find($this->settingId);
            if (!$setting) {
                return; // 該当設定がなければ何もしない
            }

            $staffList = StaffIdentity::where('tenant_id', $this->tenantId)->get();

            // スタッフごとにメールをキューで送信
            // (※メール自体をさらに別ジョブに分けてもOKです)
            foreach ($staffList as $staff) {
                Mail::to($staff->mail_address)
                    ->queue(new EngagementSurveyMail($staff, $this->tenantId, $setting,$instanceId));
            }
        }
    }
}
