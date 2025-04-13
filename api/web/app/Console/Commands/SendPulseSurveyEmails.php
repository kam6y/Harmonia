<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use App\Models\PulseSurveySetting;
use App\Jobs\SendPulseSurvey;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SendPulseSurveyEmails extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'pulse_survey:send';

    /**
     * The console command description.
     */
    protected $description = 'Send pulse survey emails (including reminders) based on settings';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // コマンド開始ログ
        $this->info("pulse_survey:send command started at " . now());
        Log::info("pulse_survey:send command started at " . now());

        // 今日の日付を取得
        $today = Carbon::today();
        $this->info("Today's date: " . $today->toDateString());
        Log::info("Today's date: " . $today->toDateString());

        // 各企業ごとに最新のレコードを一件ずつ取得
        $settings = PulseSurveySetting::select('pulse_survey_settings.*')->join(
            DB::raw('(SELECT tenant_id, MAX(id) AS max_id FROM pulse_survey_settings GROUP BY tenant_id) as latest'),
            fn($join) => $join->on('pulse_survey_settings.tenant_id', '=', 'latest.tenant_id')
                ->on('pulse_survey_settings.id', '=', 'latest.max_id')
        )->get();

        $this->info("Retrieved " . $settings->count() . " settings.");
        Log::info("Retrieved " . $settings->count() . " settings.");

        // 各設定ごとに、初回送信とリマインダー送信の判定を行う
        foreach ($settings as $setting) {
            $this->info("Processing tenant_id={$setting->tenant_id} with start date {$setting->start_date} and interval {$setting->survey_delivery_interval_days} days.");
            Log::info("Processing tenant_id={$setting->tenant_id} with start date {$setting->start_date} and interval {$setting->survey_delivery_interval_days} days.");

            $startDay = Carbon::parse($setting->start_date);
            $interval = $setting->survey_delivery_interval_days;
            $reminderInterval = $setting->reminder_delivery_interval_days; // リマインダー送信用間隔

            // まだ開始日が来ていない場合はスキップ
            if ($today->lt($startDay)) {
                $this->info("Skipping tenant_id={$setting->tenant_id} because today's date is before the start date (" . $startDay->toDateString() . ").");
                Log::info("Skipping tenant_id={$setting->tenant_id} because today's date is before the start date (" . $startDay->toDateString() . ").");
                continue;
            }

            // 開始日から何日経過しているか
            $daysFromStart = $startDay->diffInDays($today);
            $this->info("Tenant_id={$setting->tenant_id}: Days from start = $daysFromStart");
            Log::info("Tenant_id={$setting->tenant_id}: Days from start = $daysFromStart");

            // =====================
            // 1) 初回送信判定
            // =====================
            if ($interval && $daysFromStart % $interval === 0) {
                $this->info("Dispatching INITIAL pulse survey job for tenant_id={$setting->tenant_id}.");
                Log::info("Dispatching INITIAL pulse survey job for tenant_id={$setting->tenant_id}.");

                // isReminder に false を渡して初回送信ジョブをディスパッチ
                SendPulseSurvey::dispatch(
                    $setting->tenant_id,
                    $setting->id,
                    $today->toDateString(),
                    false // 通常送信
                );
            } else {
                $this->info("Not a scheduled (initial) send day for tenant_id={$setting->tenant_id} (daysFromStart: $daysFromStart, interval: $interval).");
                Log::info("Not a scheduled (initial) send day for tenant_id={$setting->tenant_id} (daysFromStart: $daysFromStart, interval: $interval).");
            }

            // =====================
            // 2) リマインダー送信判定
            // =====================
            if (
                !is_null($reminderInterval) &&   // リマインド間隔が設定されている
                $reminderInterval > 0 &&           // 有効な値である
                $interval &&                       // 配信間隔がある
                ($daysFromStart % $interval === $reminderInterval)
            ) {
                $this->info("Dispatching REMINDER pulse survey job for tenant_id={$setting->tenant_id}.");
                Log::info("Dispatching REMINDER pulse survey job for tenant_id={$setting->tenant_id}.");

                // isReminder に true を渡してリマインダー送信ジョブをディスパッチ
                SendPulseSurvey::dispatch(
                    $setting->tenant_id,
                    $setting->id,
                    $today->toDateString(),
                    true // リマインダー送信
                );
            } else {
                $this->info("No reminder send condition matched for tenant_id={$setting->tenant_id} (daysFromStart: $daysFromStart).");
                Log::info("No reminder send condition matched for tenant_id={$setting->tenant_id} (daysFromStart: $daysFromStart).");
            }
        }

        $this->info("pulse_survey:send command finished at " . now());
        Log::info("pulse_survey:send command finished at " . now());

        return 0;
    }
}
