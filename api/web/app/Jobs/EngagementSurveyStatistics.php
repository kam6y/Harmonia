<?php
namespace App\Jobs;

use App\Models\EngagementSurveyInstance;
use App\Models\EngagementSurveyResponse;
use App\Models\StaffIdentity;
use App\Models\EngagementScoreStatistic;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class EngagementSurveyStatistics implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $tenantId;
    protected $settingId;
    protected $date;

    /**
     * Create a new job instance.
     *
     * @param mixed $tenantId
     * @param mixed $settingId
     * @param string $date
     */
    public function __construct($tenantId, $settingId, $date)
    {
        $this->tenantId = $tenantId;
        $this->settingId = $settingId;
        $this->date = $date;
    }


    public function handle(): void
    {
        Log::info("EngagementScoreStatistic job started", [
            'setting_id' => $this->settingId,
            'tenant_id'  => $this->tenantId,
        ]);

        // 回答の取得
        $survey_instance = EngagementSurveyInstance::where('settings_id', $this->settingId)->first();
        if (! $survey_instance) {
            Log::error("Survey instance not found", ['settings_id' => $this->settingId]);
            return;
        }
        Log::info("Survey instance found", ['instance_id' => $survey_instance->id]);

        $responses = EngagementSurveyResponse::where('engagement_survey_instances_id', $survey_instance->id)->get();
        Log::info("Responses retrieved", ['count' => $responses->count()]);

        $staff = StaffIdentity::where('tenant_id', $this->tenantId)->get();
        Log::info("Staff retrieved", ['count' => $staff->count()]);

        // 平均値の計算
        $scoreAverageRaw = $responses->avg('actual_value');
        $scoreAverage    = floor($scoreAverageRaw * 10) / 10;
        Log::info("Calculated score average", [
            'raw'       => $scoreAverageRaw,
            'rounded'  => $scoreAverage,
        ]);

        // 回答率の計算
        $response = app()->call('App\Http\Controllers\EngagementSurveyQuestionController@index', [
            'tenant_id'   => $this->tenantId,
            'instance_id' => $survey_instance->id,
        ]);
        $questions = $response->getData(true)['questions'] ?? [];
        $answerRate = $responses->count() > 0
            ? floor(($responses->count() / count($questions) / $staff->count()) * 100)
            : 0;
        Log::info("Calculated answer rate", [
            'responses'     => $responses->count(),
            'questions'     => count($questions),
            'staff'         => $staff->count(),
            'answer_rate%'  => $answerRate,
        ]);

        // EngagementScoreStatistic に結果を保存
        try {
            $stat = EngagementScoreStatistic::create([
                'engagement_survey_instances_id' => $survey_instance->id,
                'rating'                         => 50, // 必要に応じて rating のロジックを追加
                'score_average'                  => $scoreAverage,
                'answer_rate'                    => $answerRate,
                'created_at'                     => now(),
                'updated_at'                     => now(),
            ]);
            Log::info("EngagementScoreStatistic created", [
                'statistic_id' => $stat->id,
            ]);
        } catch (\Throwable $e) {
            Log::error("Failed to create EngagementScoreStatistic", [
                'exception' => $e->getMessage(),
                'trace'     => $e->getTraceAsString(),
            ]);
            throw $e;
        }

        Log::info("EngagementScoreStatistic job completed successfully");
    }

}
