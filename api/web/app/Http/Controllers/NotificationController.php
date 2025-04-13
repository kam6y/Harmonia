<?php
// api/web/app/Http/Controllers/NotificationController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\StaffIdentity;
use App\Models\Measure;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    /**
     * ユーザーの通知一覧を取得する
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getNotifications(Request $request)
    {
        try {
            $tenantId = $request->input('tenant_id', 1);
            $departmentId = $request->input('department_id');
            $role = $request->input('role', 'manager'); // リクエストからroleを取得、デフォルトはmanager

            // 部門IDが指定されていない場合はエラー
            if (!$departmentId) {
                return response()->json([
                    'success' => false,
                    'message' => '部門IDが指定されていません'
                ], 400);
            }

            // 指定された部門と配下部門を取得
            try {
                $departments = $this->getDepartments($tenantId, $departmentId);
                $departmentIds = $departments->pluck('id')->toArray();
            } catch (Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage()
                ], 404);
            }

            // コメント（=通知）を取得するクエリ作成
            $query = DB::table('measures_comments')
                ->join('measures', 'measures_comments.measure_id', '=', 'measures.id')
                ->leftJoin('departments', 'measures.department_id', '=', 'departments.id')
                ->leftJoin('staff_identity as sender_staff', 'measures_comments.staff_id', '=', 'sender_staff.id')
                ->leftJoin('admin_identity as sender_admin', 'measures_comments.admin_id', '=', 'sender_admin.id')
                ->where('measures.tenant_id', $tenantId)
                ->whereIn('measures.department_id', $departmentIds); // 指定された部門と配下部門に限定

            // roleに応じたメンション条件を追加
            switch($role) {
                case 'admin':
                    $query->where('measures_comments.mention_is_admin', true);
                    break;
                case 'personnel':
                    $query->where('measures_comments.mention_is_personnel', true);
                    break;
                case 'manager':
                default:
                    $query->where('measures_comments.mention_is_manager', true);
                    break;
            }

            $comments = $query->select(
                'measures_comments.id',
                'measures_comments.measure_id',
                'measures_comments.comment_text',
                'measures_comments.created_at',
                'measures_comments.admin_id',
                'measures_comments.staff_id',
                'measures_comments.mention_is_admin',
                'measures_comments.mention_is_personnel',
                'measures_comments.mention_is_manager',
                'measures.measure_text',
                'measures.department_id',
                'departments.name as department_name',
                'sender_staff.name as staff_name',
                'sender_staff.mail_address as staff_email',
                'sender_admin.mail_address as admin_email'
            )
            ->orderBy('measures_comments.created_at', 'desc')
            ->limit(50)
            ->get();

            // テナント名を取得
            $tenantName = '';
            try {
                $tenant = DB::table('tenants')->where('id', $tenantId)->first();
                $tenantName = $tenant ? $tenant->name : '';
            } catch (Exception $e) {
                // テナント取得失敗時は空文字のままにする
            }

            // フロントエンド用にデータを整形
            $formattedNotifications = [];
            foreach ($comments as $comment) {
                // コメント作成時刻から24時間以上経過しているかチェック（既読判定の簡易実装）
                $createdAt = Carbon::parse($comment->created_at);
                $isReplied = $createdAt->diffInHours(Carbon::now()) >= 24;

                // 送信者情報
                $senderName = $comment->staff_name ?? 'Admin';
                $senderEmail = $comment->staff_email ?? $comment->admin_email ?? '';

                $formattedNotifications[] = [
                    'id' => $comment->id,
                    'userImg' => '/images/Generic_avatar.svg', // デフォルトアバター
                    'tenantName' => $tenantName,
                    'department' => $comment->department_name ?? '不明な部署',
                    'department_name' => $comment->department_name ?? '不明な部署',
                    'title' => '施策へのコメント',
                    'comment' => "「{$comment->measure_text}」に新しいコメントがあります",
                    'comment_text' => $comment->comment_text,
                    'measure_text' => $comment->measure_text,
                    'time' => $comment->created_at,
                    'created_at' => $comment->created_at,
                    'replied' => $isReplied,
                    'sender' => [
                        'id' => $comment->staff_id ?? $comment->admin_id ?? null,
                        'name' => $senderName,
                        'email' => $senderEmail
                    ],
                    'targetType' => 'measure',
                    'targetId' => $comment->measure_id,
                    'measure_id' => $comment->measure_id,
                    'department_id' => $comment->department_id,
                    'mention_is_admin' => (bool)$comment->mention_is_admin,
                    'mention_is_personnel' => (bool)$comment->mention_is_personnel,
                    'mention_is_manager' => (bool)$comment->mention_is_manager
                ];
            }

            return response()->json([
                'success' => true,
                'notifications' => $formattedNotifications
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '通知の取得に失敗しました',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 通知を既読状態にする
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function markAsRead(Request $request)
    {
        try {
            $notificationId = $request->input('notification_id');

            // このテーブルでは既読状態を保存していないため、
            // 成功レスポンスのみを返す（実際の既読状態はクライアント側で管理）
            return response()->json([
                'success' => true,
                'message' => '通知を既読にしました'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '通知の更新に失敗しました',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * すべての通知を既読状態にする
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function markAllAsRead(Request $request)
    {
        try {
            $departmentId = $request->input('department_id');
            $role = $request->input('role');

            // このテーブルでは既読状態を保存していないため、
            // 成功レスポンスのみを返す（実際の既読状態はクライアント側で管理）
            return response()->json([
                'success' => true,
                'message' => 'すべての通知を既読にしました'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '通知の更新に失敗しました',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 新しい通知（コメント）を作成する
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createNotification(Request $request)
    {
        Log::info($request);
        try {
            $measureId = $request->input('measure_id');
            $userId = $request->user() ? $request->user()->id : null;
            $commentText = $request->input('comment_text');
            $mentionIsAdmin = $request->input('mention_is_admin', false);
            $mentionIsPersonnel = $request->input('mention_is_personnel', false);
            $mentionIsManager = $request->input('mention_is_manager', false);
            $departmentId = $request->input('department_id'); // 部門IDを取得

            // バリデーション
            if (!$measureId || !$commentText) {
                return response()->json([
                    'success' => false,
                    'message' => '必須項目が不足しています'
                ], 400);
            }

            // 施策の存在確認
            $measure = Measure::find($measureId);
            if (!$measure) {
                return response()->json([
                    'success' => false,
                    'message' => '指定された施策が見つかりません'
                ], 404);
            }

            // 部門IDの検証（指定された部門に属する施策かチェック）
            if ($departmentId && $measure->department_id != $departmentId) {
                // 部門が異なる場合、所属配下の部門をチェック
                $validDepartments = $this->getDepartments($measure->tenant_id, $departmentId)
                    ->pluck('id')
                    ->toArray();

                if (!in_array($measure->department_id, $validDepartments)) {
                    return response()->json([
                        'success' => false,
                        'message' => '指定された施策に対するコメント権限がありません'
                    ], 403);
                }
            }

            // コメント作成
            $comment = [
                'measure_id' => $measureId,
                'staff_id' => $userId,
                'admin_id' => null,
                'comment_text' => $commentText,
                'mention_is_personnel' => $mentionIsPersonnel,
                'mention_is_admin' => $mentionIsAdmin,
                'mention_is_manager' => $mentionIsManager,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ];

            $commentId = DB::table('measures_comments')->insertGetId($comment);

            return response()->json([
                'success' => true,
                'message' => 'コメントを作成しました',
                'notification_id' => $commentId
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'コメントの作成に失敗しました',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 通知（コメント）を削除する
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteNotification(Request $request)
    {
        try {
            $commentId = $request->input('notification_id');
            $userId = $request->user() ? $request->user()->id : null;

            if (!$commentId) {
                return response()->json([
                    'success' => false,
                    'message' => 'コメントIDが指定されていません'
                ], 400);
            }

            // コメントを取得
            $comment = DB::table('measures_comments')->where('id', $commentId)->first();

            if (!$comment) {
                return response()->json([
                    'success' => false,
                    'message' => 'コメントが見つかりません'
                ], 404);
            }

            // 権限チェック（自分のコメントのみ削除可能）
            if ($userId && $comment->staff_id != $userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'このコメントを削除する権限がありません'
                ], 403);
            }

            // コメント削除
            DB::table('measures_comments')->where('id', $commentId)->delete();

            return response()->json([
                'success' => true,
                'message' => 'コメントを削除しました'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'コメントの削除に失敗しました',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 指定部署（自部署＋配下部署）を取得
     *
     * @param int $tenantId
     * @param int $departmentId
     * @return \Illuminate\Support\Collection
     */
    private function getDepartments($tenantId, $departmentId)
    {
        $mainDepartment = DB::table('departments')
            ->where('id', $departmentId)
            ->where('tenant_id', $tenantId)
            ->first();

        if (!$mainDepartment) {
            throw new Exception('指定された部署が見つかりません');
        }

        $subordinateDeptIds = DB::table('departments_relations')
            ->where('parent_department_id', $departmentId)
            ->pluck('child_department_id')
            ->toArray();

        $allDepartmentIds = array_merge([$departmentId], $subordinateDeptIds);
        $departments = DB::table('departments')
            ->whereIn('id', $allDepartmentIds)
            ->where('tenant_id', $tenantId)
            ->select('id', 'name', 'front_only_departments_id')
            ->get();

        return $departments;
    }
}
