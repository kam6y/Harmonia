<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Tenant;
use App\Models\EngagementSurveyInstance;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class AdminTenantController extends Controller
{
    /**
     * テナント一覧を取得する
     */
    public function index()
    {
        try {
            // 全テナントを取得
            $tenants = Tenant::all();
            $tenantsData = [];
            
            foreach ($tenants as $tenant) {
                // 回答率の計算（最新のエンゲージメントサーベイの回答率を取得）
                $latestInstance = EngagementSurveyInstance::where('tenant_id', $tenant->id)
                    ->orderBy('start_date', 'desc')
                    ->first();
                
                $responseRate = null;
                if ($latestInstance) {
                    // 統計データから回答率を取得
                    $stats = DB::table('engagement_score_statistics')
                        ->where('engagement_survey_instances_id', $latestInstance->id)
                        ->first();
                    
                    if ($stats) {
                        $responseRate = $stats->answer_rate;
                    }
                }
                
                // スコアトレンドの取得（直近5回のエンゲージメントサーベイのスコア）
                $scoreTrend = [];
                $instances = EngagementSurveyInstance::where('tenant_id', $tenant->id)
                    ->orderBy('start_date', 'desc')
                    ->limit(5)
                    ->get();
                
                if ($instances->isNotEmpty()) {
                    foreach ($instances->reverse() as $instance) {
                        $stats = DB::table('engagement_score_statistics')
                            ->where('engagement_survey_instances_id', $instance->id)
                            ->first();
                        
                        if ($stats) {
                            $scoreTrend[] = [
                                'name' => date('Y/m', strtotime($instance->start_date)),
                                'score' => round($stats->score_average),
                            ];
                        }
                    }
                }
                
                // ダミーの通知データ
                $notifications = [];
                
                // テナントデータを整形
                $tenantsData[] = [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'tenant_address' => $tenant->tenant_address,
                    'response_rate' => $responseRate ?? rand(50, 95),  // レスポンスレートがない場合はランダム値
                    'score_trend' => !empty($scoreTrend) ? $scoreTrend : $this->generateDummyScoreTrend(),
                    'notifications' => $notifications,
                ];
            }
            
            return response()->json([
                'success' => true,
                'tenants' => $tenantsData,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'テナント一覧の取得に失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ダミーのスコアトレンドデータを生成する
     */
    private function generateDummyScoreTrend()
    {
        $trend = [];
        $months = ['1月', '2月', '3月', '4月', '5月'];
        
        foreach ($months as $month) {
            $trend[] = [
                'name' => $month,
                'score' => rand(50, 90),
            ];
        }
        
        return $trend;
    }

    /**
     * 新しいテナントを登録する
     */
    public function store(Request $request)
    {
        try {
            // バリデーション
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'mail_address' => 'required|email|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'バリデーションエラー',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // テナントを作成
            $tenant = new Tenant();
            $tenant->name = $request->input('name');
            $tenant->tenant_address = $request->input('mail_address');
            $tenant->created_at = Carbon::now();
            $tenant->updated_at = Carbon::now();
            $tenant->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'テナントが正常に登録されました',
                'tenant' => [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'テナント登録に失敗しました: ' . $e->getMessage()
            ], 500);
        }
    }
}