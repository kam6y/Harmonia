<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log; // この行を追加
use Carbon\Carbon;

class MeasureCommentController extends Controller
{
    /**
     * 施策に対するコメントを保存
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            // バリデーション
            $validated = $request->validate([
                'measure_id' => 'required|exists:measures,id',
                'comment_text' => 'required|string',
                'mention_is_admin' => 'boolean',
                'mention_is_personnel' => 'boolean',
                'mention_is_manager' => 'boolean',
            ]);

            $now = Carbon::now();

//            // ログインしているユーザーの情報を取得
//            $user = Auth::user();
            $staffId = $request->staff_id;

//            // スタッフか管理者かを判定してIDを設定
//            if ($user) {
//                if (get_class($user) === 'App\Models\StaffIdentity') {
//                    $staffId = $user->id;
//                } elseif (get_class($user) === 'App\Models\AdminIdentity') {
//                    $adminId = $user->id;
//                }
//            }

            // コメントデータを作成
            $commentData = [
                'measure_id' => $request->measure_id,
                'staff_id' => $staffId,
                'admin_id' => null,
                'comment_text' => $request->comment_text,
                'mention_is_admin' => $request->mention_is_admin ?? false,
                'mention_is_personnel' => $request->mention_is_personnel ?? false,
                'mention_is_manager' => $request->mention_is_manager ?? false,
                'created_at' => $now,
                'updated_at' => $now,
            ];



            // コメントをデータベースに保存
            $commentId = DB::table('measures_comments')->insertGetId($commentData);

            // 保存したコメント情報を取得
            $comment = DB::table('measures_comments')
                ->where('id', $commentId)
                ->first();

            return response()->json([
                'success' => true,
                'message' => 'コメントを保存しました',
                'id' => $commentId,
                'created_at' => $comment->created_at,
            ]);
        } catch (\Exception $e) {
            Log::error('コメント保存エラー: ' . $e->getMessage()); // \Log から Log に変更

            return response()->json([
                'success' => false,
                'message' => 'コメントの保存に失敗しました',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 施策に対するコメント一覧を取得
     *
     * @param int $measureId
     * @return \Illuminate\Http\JsonResponse
     */
    public function index($measureId)
    {
        try {
            // コメント一覧を取得
            $comments = DB::table('measures_comments')
                ->where('measure_id', $measureId)
                ->orderBy('created_at', 'asc')
                ->get();

            // 各コメントの作成者情報を取得
            $formattedComments = $comments->map(function ($comment) {
                $authorName = 'Unknown';

                // スタッフからのコメントの場合
                if ($comment->staff_id) {
                    $staff = DB::table('staff_identity')
                        ->where('id', $comment->staff_id)
                        ->first();

                    if ($staff) {
                        $authorName = $staff->name ?? $staff->mail_address;
                    }
                }

                // 管理者からのコメントの場合
                if ($comment->admin_id) {
                    $admin = DB::table('admin_identity')
                        ->where('id', $comment->admin_id)
                        ->first();

                    if ($admin) {
                        $authorName = '管理者: ' . ($admin->name ?? $admin->mail_address);
                    }
                }

                return [
                    'id' => $comment->id,
                    'author' => $authorName,
                    'date' => Carbon::parse($comment->created_at)->format('Y年m月d日'),
                    'text' => $comment->comment_text,
                    'mention_is_admin' => (bool)$comment->mention_is_admin,
                    'mention_is_personnel' => (bool)$comment->mention_is_personnel,
                    'mention_is_manager' => (bool)$comment->mention_is_manager,
                ];
            });

            return response()->json([
                'success' => true,
                'comments' => $formattedComments
            ]);
        } catch (\Exception $e) {
            Log::error('コメント取得エラー: ' . $e->getMessage()); // \Log から Log に変更

            return response()->json([
                'success' => false,
                'message' => 'コメントの取得に失敗しました',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
