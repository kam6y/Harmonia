<?php

namespace App\Http\Controllers;

use App\Models\StaffIdentity;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    public function setup(Request $request)
    {
        // リクエストから送られた値を受け取る
        $name = $request->input('name');
        $userData = $request->input('user'); // 例: ユーザーIDやメールなどの情報
        $roleData = $request->input('role'); // 例: 管理者、一般ユーザー等の情報

        // 例: userData からユーザーIDが取得できる場合、そのユーザーの名前を更新する
        $user = StaffIdentity::find($userData['id'] ?? null);
        if (!$user) {
            return response()->json(['message' => 'ユーザーが見つかりません'], 404);
        }

        $user->name = $name;
        $user->save();

        return response()->json(['message' => 'ユーザー名が更新されました', 'user' => $user], 200);
    }

}
