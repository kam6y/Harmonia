<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EngagementSurveyReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public $staff;
    public $tenantId;

    /**
     * Create a new message instance.
     */
    public function __construct($staff, $tenantId)
    {
        $this->staff    = $staff;
        $this->tenantId = $tenantId;
    }

    /**
     * Build the message.
     */
    public function build()
    {
//        // tenantId から Tenant を取得
//        $tenant = \App\Models\Tenant::find($this->tenantId);
//        $surveytype = 1;

        return $this
            ->subject('アンケートご案内')
            ->view('mail.engagement_survey_remind');
    }
}
