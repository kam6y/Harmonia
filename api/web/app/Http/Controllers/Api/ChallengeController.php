<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Issue;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ChallengeController extends Controller
{
    /**
     * 課題の新規登録
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // バリデーション
        $validator = Validator::make($request->all(), [
            'issue_category' => 'required|string|max:255',
            'issue_text'     => 'required|string',
            'tenant_id'      => 'required|integer',
            'department_id'  => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => '入力内容に誤りがあります',
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            // 新規課題レコードの作成
            $challenge = new Issue();
            $challenge->issue_category = $request->input('issue_category');
            $challenge->issue_text     = $request->input('issue_text');
            $challenge->tenant_id      = $request->input('tenant_id');
            $challenge->department_id  = $request->input('department_id');
            $challenge->created_at = Carbon::now();
            $challenge->updated_at = Carbon::now();
            $challenge->save();

            return response()->json([
                'success'   => true,
                'message'   => '課題が登録されました',
                'challenge' => [
                    'id'            => $challenge->id,
                    'issue_category' => $challenge->issue_category,
                    'issue_text'    => $challenge->issue_text,
                    'tenant_id'     => $challenge->tenant_id,
                    'department_id' => $challenge->department_id,
                    'created_at'    => $challenge->created_at->format('Y-m-d H:i:s'),
                    'updated_at'    => $challenge->updated_at->format('Y-m-d H:i:s'),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('課題登録エラー: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => '課題の登録に失敗しました: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 課題の編集
     *
     * @param Request $request
     * @param int $challenge_id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $challenge_id)
    {
        // バリデーション
        $validator = Validator::make($request->all(), [
            'issue_category' => 'required|string|max:255',
            'issue_text'     => 'required|string',
            'tenant_id'      => 'required|integer',
            'department_id'  => 'required|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => '入力内容に誤りがあります',
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            $challenge = Issue::findOrFail($challenge_id);
            $challenge->issue_category = $request->input('issue_category');
            $challenge->issue_text     = $request->input('issue_text');
            $challenge->tenant_id      = $request->input('tenant_id');
            $challenge->department_id  = $request->input('department_id');
            $challenge->updated_at = Carbon::now();
            $challenge->save();

            return response()->json([
                'success'   => true,
                'message'   => '課題が更新されました',
                'challenge' => [
                    'id'            => $challenge->id,
                    'issue_category' => $challenge->issue_category,
                    'issue_text'    => $challenge->issue_text,
                    'tenant_id'     => $challenge->tenant_id,
                    'department_id' => $challenge->department_id,
                    'created_at'    => $challenge->created_at->format('Y-m-d H:i:s'),
                    'updated_at'    => $challenge->updated_at->format('Y-m-d H:i:s'),
                ],
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '指定された課題が見つかりません',
            ], 404);
        } catch (\Exception $e) {
            Log::error('課題更新エラー: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => '課題の更新に失敗しました: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 課題の削除
     *
     * @param int $challenge_id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($challenge_id)
    {
        try {
            $challenge = Issue::findOrFail($challenge_id);

            // 関連する施策があれば削除前に処理するロジックを追加
            // 例: $challenge->measures()->delete();

            $challenge->delete();

            return response()->json([
                'success' => true,
                'message' => '課題が削除されました',
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => '指定された課題が見つかりません',
            ], 404);
        } catch (\Exception $e) {
            Log::error('課題削除エラー: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => '課題の削除に失敗しました: ' . $e->getMessage(),
            ], 500);
        }
    }
}