<?php

namespace App\Console\Commands;

use App\Jobs\EngagementSurveyStatistics;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use App\Models\EngagementSurveySetting;
use App\Jobs\SendEngagementSurvey;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SendEngagementSurveyEmails extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'engagement_survey:send';

    /**
     * The console command description.
     */
    protected $description = 'Send engagement survey emails (including reminders) based on settings';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // コマンド開始ログ
        $this->info("survey:send command started at " . now());
        Log::info("survey:send command started at " . now());

        // 今日の日付を取得
        $today = Carbon::today();
        $this->info("Today's date: " . $today->toDateString());
        Log::info("Today's date: " . $today->toDateString());

        // 各企業ごとに最新のレコードを一件ずつ取得
        $settings = EngagementSurveySetting::select('engagement_survey_settings.*')
            ->join(
                DB::raw('(SELECT tenant_id, MAX(id) AS max_id FROM engagement_survey_settings GROUP BY tenant_id) as latest'),
                function($join) {
                    $join->on('engagement_survey_settings.tenant_id', '=', 'latest.tenant_id')
                        ->on('engagement_survey_settings.id', '=', 'latest.max_id');
                }
            )
            ->get();

        Log::info('EngagementSurveySetting latest-per-tenant results:', [
            'count'    => $settings->count(),
            'settings' => $settings->toArray(),
        ]);

        $this->info("Retrieved " . $settings->count() . " settings.");
        Log::info("Retrieved " . $settings->count() . " settings.");

        // 本日が配信日かチェック
        foreach ($settings as $setting) {
            $this->info("Processing tenant_id={$setting->tenant_id} with start day {$setting->survey_start_day} and interval {$setting->survey_delivery_interval_days} days.");
            Log::info("Processing tenant_id={$setting->tenant_id} with start day {$setting->survey_start_day} and interval {$setting->survey_delivery_interval_days} days.");

            $startDay = Carbon::parse($setting->survey_start_day);
            $interval = $setting->survey_delivery_interval_days;
            $reminderInterval = $setting->reminder_delivery_interval_days; // 追加
            $deadline = $setting->deadline;

            // まだ開始日が来ていない場合はスキップ
            if ($today->lt($startDay)) {
                $this->info("Skipping tenant_id={$setting->tenant_id} because today's date is before the start day (" . $startDay->toDateString() . ").");
                Log::info("Skipping tenant_id={$setting->tenant_id} because today's date is before the start day (" . $startDay->toDateString() . ").");
                continue;
            }

            // 開始日から何日経過したか
            $daysFromStart = $startDay->diffInDays($today);
            $this->info("Tenant_id={$setting->tenant_id}: Days from start = $daysFromStart StartDate = $startDay");
            Log::info("Tenant_id={$setting->tenant_id}: Days from start = $daysFromStart StartDate = $startDay");

            // =====================
            // 1) 本番送信判定
            // =====================
            if ($interval && $daysFromStart % $interval === 0) {
                $this->info("Dispatching INITIAL survey job for tenant_id={$setting->tenant_id}.");
                Log::info("Dispatching INITIAL survey job for tenant_id={$setting->tenant_id}.");

                // ジョブをディスパッチ (非同期実行)
                SendEngagementSurvey::dispatch(
                    $setting->tenant_id,
                    $setting->id,
                    $today->toDateString(),
                    false // isReminder = false
                );
            } else {
                $this->info("Not a scheduled (initial) send day for tenant_id={$setting->tenant_id} (daysFromStart: $daysFromStart).");
                Log::info("Not a scheduled (initial) send day for tenant_id={$setting->tenant_id} (daysFromStart: $daysFromStart).");
            }

            if($daysFromStart === $deadline) {
                // ジョブをディスパッチ (非同期実行)
                EngagementSurveyStatistics::dispatch(
                    $setting->tenant_id,
                    $setting->id,
                    $today->toDateString(),
                );
            }else {
                $this->info("Not a scheduled (initial) send day for tenant_id={$setting->tenant_id} (daysFromStart: $daysFromStart).");
                Log::info("Not a scheduled (initial) send day for tenant_id={$setting->tenant_id} (daysFromStart: $daysFromStart).");
            }

            // =====================
            // 2) リマインド送信判定
            // =====================
            // 「本番送信日 + reminderInterval 日後」= 「daysFromStart % $interval == reminderInterval」 で判定
            if (
                !is_null($reminderInterval) &&        // リマインド間隔が設定されている
                $reminderInterval > 0 &&              // 0より大きい（無意味な値でない）
                $interval &&                          // 本番送信のインターバルもある
                ($daysFromStart % $interval === $reminderInterval)
            ) {
                if ($today->lte($startDay->copy()->addDays($deadline))){
                    $this->info("Dispatching REMINDER survey job for tenant_id={$setting->tenant_id}.");
                    Log::info("Dispatching REMINDER survey job for tenant_id={$setting->tenant_id}.");

                    SendEngagementSurvey::dispatch(
                        $setting->tenant_id,
                        $setting->id,
                        $today->toDateString(),
                        true // isReminder = true
                    );
                }
            } else {
                $this->info("No reminder send condition matched for tenant_id={$setting->tenant_id} (daysFromStart: $daysFromStart).");
                Log::info("No reminder send condition matched for tenant_id={$setting->tenant_id} (daysFromStart: $daysFromStart).");
            }
        }


        $this->info("survey:send command finished at " . now());
        Log::info("survey:send command finished at " . now());

        return 0;
    }
}
