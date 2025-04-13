<?php

use App\Http\Controllers\EngagementSurveyResponseController;
use App\Http\Controllers\ManagerImprovementController;
use App\Http\Controllers\MeasureRegisterController;
use App\Http\Controllers\PulseSurveyInstanceController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AdminTenantController;
use App\Http\Controllers\Api\SurveySettingsAdminController;
use App\Http\Controllers\Api\ManagerDashboardController;
use App\Http\Controllers\Api\ManagerIssueController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\EngagementSurveyQuestionController;
use App\Http\Controllers\MeasureController;
use App\Http\Controllers\MeasureCommentController;
use App\Http\Controllers\OrganizationStructureController;
use App\Http\Controllers\OrganizationMembersController;
use App\Http\Controllers\PulseSurveyQuestionController;
use App\Http\Controllers\SurveyController;
use App\Http\Controllers\Api\ChallengeController;
use App\Http\Controllers\NotificationController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| ここではAPIルートを登録します。RouteServiceProviderによってロードされ、
| すべて「api」ミドルウェアグループに割り当てられます。
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// ログイン関連
Route::post('/login', [App\Http\Controllers\Auth\LoginController::class, 'login']);
Route::post('/login-no-csrf', [App\Http\Controllers\Auth\LoginController::class, 'loginNoCsrf']);
Route::post('/setup', [LoginController::class, 'setup']);

// 管理者用ルート - ミドルウェアを使わない実装
Route::prefix('admin')->group(function () {
    // テナント管理
    Route::get('/tenants', [AdminTenantController::class, 'index']);
    Route::post('/tenants', [AdminTenantController::class, 'store']);

    // 管理者用サーベイ設定
    Route::post('/survey-settings', [SurveySettingsAdminController::class, 'show']);
    Route::post('/update-survey-settings', [SurveySettingsAdminController::class, 'update']);
});

// エンゲージメントサーベイ質問項目取得
Route::get('/engagement-survey-questions/{tenant_id}/{instance_id}', [EngagementSurveyQuestionController::class, 'index']);
Route::get('/pulse-survey-questions/{tenant_id}/{instance_id}', [PulseSurveyQuestionController::class, 'index']);
//サーベイ回答送信
Route::post('/engagement-survey-responses', [EngagementSurveyResponseController::class, 'store']);

// サーベイの設定変更
Route::post('/survey-settings', [SurveyController::class, 'show']);
Route::post('/survey-settings/save', [SurveyController::class, 'save']);

// 組織名の取得
Route::get('/departments', [DepartmentController::class, 'index']);
Route::get('/departments/{tenantId}', [DepartmentController::class, 'getByTenant']);
Route::get('/departments/{parentId}/children', [DepartmentController::class, 'children']);
// リレーションを直接使った取得例
Route::get('/departments/{parentId}/children-relation', [DepartmentController::class, 'childrenUsingRelation']);

// 施策取得
Route::get('/measures', [MeasureController::class, 'index']);
//施策変更
Route::post('/measures/{measureId}', [MeasureRegisterController::class, 'updateMeasureStatus']);

Route::get('/measures/filtered', [MeasureController::class, 'getFilteredMeasures']);

// 新しい組織統計情報ルート
Route::get('/organization-stats', [OrganizationStructureController::class, 'getOrganizationStats']);
// 組織構造API
Route::get('/organization-structure', [OrganizationStructureController::class, 'getStructure']);
Route::post('/organization-structure', [OrganizationStructureController::class, 'saveStructure']);
Route::delete('/organization-structure', [OrganizationStructureController::class, 'deleteStructure']);

// 組織メンバー関連のルート
Route::prefix('organization-members')->group(function () {
    Route::post('/get', [OrganizationMembersController::class, 'getMembers']);
    Route::post('/save', [OrganizationMembersController::class, 'saveMembers']);
    Route::post('/import-csv', [OrganizationMembersController::class, 'importMembersFromCsv']);
    Route::post('/delete', [OrganizationMembersController::class, 'deleteMember']);
    Route::post('/organization-options', [OrganizationMembersController::class, 'getOrganizationOptions']);
});


//ManagerImprovementControllerまとめて
// 施策データ取得
Route::get('/improvements/{orgId}', [ManagerImprovementController::class, 'getImprovements']);
// パルスサーベイデータ取得
Route::get('/pulse-survey/{orgId}', [ManagerImprovementController::class, 'getPulseSurvey']);
// 管理者スコアデータ取得
Route::get('/manager-scores/{orgId}', [ManagerImprovementController::class, 'getManagerScores']);
// チャート用データ取得
Route::get('/chart-data/{orgId}', [ManagerImprovementController::class, 'getChartData']);
// 分析サマリーデータ取得
Route::get('/analytics-summary/{orgId}', [ManagerImprovementController::class, 'getAnalyticsSummary']);
// 成功事例データ取得
Route::get('/success-cases/{orgId}', [ManagerImprovementController::class, 'getSuccessCases']);

//施策登録
Route::get('/category-issues/{departmentId}', [MeasureRegisterController::class, 'getInfo']);

//看板関係()
Route::put('/kanban/improvements/{measure_id}', [ManagerImprovementController::class, 'kanbanstatusupdate']);
Route::delete('/kanban/improvements/{id}', [ManagerImprovementController::class, 'kanbandelete']);

// ダッシュボード関連のエンドポイント
Route::prefix('dashboard')->group(function () {
    Route::post('/survey', [App\Http\Controllers\Api\ManagerDashboardController::class, 'getSurveyData']);
});


// Issue関連のルート
Route::get('/issue/department/{departmentId}', [App\Http\Controllers\Api\ManagerIssueController::class, 'getDepartmentIssueData']);
Route::post('/issue/department', [App\Http\Controllers\Api\ManagerIssueController::class, 'getDepartmentIssueData']);


// 課題登録
Route::post('/manager/challenges', [ChallengeController::class, 'store']);
// 課題編集
Route::put('/manager/challenges/{id}', [ChallengeController::class, 'update']);
// 課題削除
Route::delete('/manager/challenges/{id}', [ChallengeController::class, 'destroy']);

// 通知関連のルート
Route::prefix('notifications')->group(function () {
    // Reactコードと合わせたエンドポイント
    Route::post('/get', [NotificationController::class, 'getNotifications']);
    Route::post('/mark-read', [NotificationController::class, 'markAsRead']);
    Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::post('/create', [NotificationController::class, 'createNotification']);
});

Route::post('/measure-comment', [MeasureCommentController::class, 'store'])->name('measure-comment');
Route::get('/measure-comment/{measureId}', [MeasureCommentController::class, 'index']);

Route::post('/register-measure', [MeasureRegisterController::class, 'registerMeasure']);

Route::get('/pulse-survey-instances/{instanceId}', [PulseSurveyInstanceController::class, 'show']);

// ダッシュボード関連のエンドポイント
Route::prefix('dashboard')->group(function () {
    Route::post('/survey', [App\Http\Controllers\Api\ManagerDashboardController::class, 'getSurveyData']);
});

// issue用データ取得エンドポイント
Route::get('/manager/issue-data/{departmentId}', [ManagerIssueController::class, 'getIssueData']);
// 課題登録
Route::post('/manager/challenges', [ChallengeController::class, 'store']);
// 課題編集
Route::put('/manager/challenges/{id}', [ChallengeController::class, 'update']);
// 課題削除
Route::delete('/manager/challenges/{id}', [ChallengeController::class, 'destroy']);
