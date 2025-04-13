<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\AdminIdentity;
use App\Models\StaffIdentity;
use Illuminate\Support\Facades\Log;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // 管理者アカウントのチェック
        $admin = AdminIdentity::where('mail_address', $request->email)->first();
        if ($admin && Hash::check($request->password, $admin->password_hash)) {
            // 管理者としてログイン成功
            return response()->json([
                'success' => true,
                'token' => 'admin_token_' . time(), // 実際の実装ではSanctumなどで適切なトークンを生成
                'user' => [
                    'id' => $admin->id,
                    'email' => $admin->mail_address,
                    'role' => 'admin',
                    'first_login' => false,
                    // 管理者に tenant_id や department_id がある場合は返す
                    // なければ固定値やnullで返す
                    'tenant_id' => $admin->tenant_id ?? 1,
                    'department_id' => $admin->department_id ?? null,
                    'sub_department_id' => $admin->sub_department_id ?? null,
                ]
            ]);
        }

        // スタッフアカウントのチェック
        $staff = StaffIdentity::where('mail_address', $request->email)->first();
        if ($staff && Hash::check($request->password, $staff->password_hash)) {
            // スタッフの種類に応じてユーザータイプを決定
            $role = 'staff';

            if ($staff->is_personnel) {
                $role = 'personnel';
            } elseif ($staff->is_manager) {
                $role = 'manager';
            }

            $department_name = Department::where('id', $staff->department_id)->pluck('name')->first();

            // 名前が登録されていれば first_login = false, なければ true
            $first_login = is_null($staff->name);

            return response()->json([
                'success' => true,
                'token' => $role . '_token_' . time(),
                'user' => [
                    'id' => $staff->id,
                    'email' => $staff->mail_address,
                    'role' => $role,
                    'first_login' => $first_login,
                    // ★ 追加: テナントIDとデパートメントID
                    'tenant_id' => $staff->tenant_id,
                    'department_id' => $staff->department_id,
                    //追加:組織名
                    'department_name' => $department_name,
                ]
            ]);
        }

        // ログイン失敗
        return response()->json([
            'success' => false,
            'message' => 'メールアドレスまたはパスワードが正しくありません'
        ], 401);
    }

    // CSRF保護なしのログイン（開発用）
    public function loginNoCsrf(Request $request)
    {
        return $this->login($request);
    }

    // セットアップ処理
    public function setup(Request $request){
        $name = $request['name'];
        $userId = $request['userId'];

        $staff = StaffIdentity::find($userId);
        $staff->update([
            'name' => $name,
        ]);

        return response()->json([
            'message' => "こんにちは、{$name}さん！登録ありがとうございます。",
        ]);
    }
}
