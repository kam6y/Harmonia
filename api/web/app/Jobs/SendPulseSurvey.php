<?php

namespace App\Jobs;

use App\Mail\PulseSurveyMail;
use App\Mail\PulseSurveyReminderMail;
use App\Models\Department;
use App\Models\Issue;
use App\Models\PulseSurveyQuestion;
use App\Models\PulseSurveySetting;
use App\Models\PulseSurveyInstance;
use App\Models\StaffIdentity;
use App\Models\SurveyQuestion;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Carbon;

class SendPulseSurvey implements ShouldQueue
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
    public function __construct($tenantId, $settingId, $deliveryDate, $isReminder)
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
                    ->queue(new PulseSurveyReminderMail($staff, $this->tenantId));
            }
        }else{
            $departments = Department::where('tenant_id', $this->tenantId)->get();
            $setting = PulseSurveySetting::find($this->settingId);
            if (!$setting) {
                return;
            }

            foreach ($departments as $department) {
                $departmentId = $department->id;

                Log::info('Department ID:', ['departmentId' => $departmentId]);

                $instance = PulseSurveyInstance::create([
                    'tenant_id' => $this->tenantId,
                    'department_id' => $departmentId,
                    'setting_id' => $this->settingId,
                    'start_date' => $this->deliveryDate,
                ]);
                $instanceId = $instance->id;
                $issues = Issue::where('department_id', $department->id)
                    ->whereDate('created_at', '<=', Carbon::today())
                    ->get();

                foreach ($issues as $issue) {
                    $surveyQuestionId = SurveyQuestion::where('issue_category', $issue->issue_category)->value('id');
                    if (!$surveyQuestionId) {
                        continue;
                    }
                    PulseSurveyQuestion::create([
                        'pulse_survey_instances_id' => $instanceId,
                        'survey_question_id' => $surveyQuestionId,
                    ]);
                }

                $staffList = StaffIdentity::where('department_id', $department->id)->get();

                // スタッフごとにメールをキューで送信
                // (※メール自体をさらに別ジョブに分けてもOKです)
                foreach ($staffList as $staff) {
                    Mail::to($staff->mail_address)
                        ->queue(new PulseSurveyMail($staff, $this->tenantId, $setting, $instanceId));
                }
            }

        }
    }
}
