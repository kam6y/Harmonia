<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        $this->engagement_schedule($schedule);
        $this->pulse_schedule($schedule);
    }

    protected function engagement_schedule(Schedule $schedule)
    {
        // php artisan schedule:runで実行
        $schedule->command('engagement_survey:send')->dailyAt('00:01');
    }

    protected function pulse_schedule(Schedule $schedule)
    {
        // php artisan schedule:runで実行
        $schedule->command('pulse_survey:send')->dailyAt('00:01');
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');
        require base_path('routes/console.php');
    }
}

