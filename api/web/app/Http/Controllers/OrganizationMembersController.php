<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Str;

class OrganizationMembersController extends Controller
{
    /**
     * 組織メンバー一覧を取得する
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMembers(Request $request)
    {
        try {
            $tenantId = $request->input('tenant_id', 1);
            $type = $request->input('type', 'employee'); // 'employee' または 'manager'
            $page = $request->input('page', 1);
            $itemsPerPage = $request->input('items_per_page', 10);
            
            $offset = ($page - 1) * $itemsPerPage;

            $query = DB::table('staff_identity')
                ->join('departments', 'staff_identity.department_id', '=', 'departments.id')
                ->where('staff_identity.tenant_id', $tenantId);
            
            // 管理職と一般社員で分ける - PostgreSQL用に修正
            if ($type === 'manager') {
                $query->where('is_manager', true);  // booleanとして比較
            } else {
                $query->where('is_manager', false); // booleanとして比較
            }
            
            // 総数のカウント
            $totalCount = $query->count();
            
            // メインクエリ - PostgreSQL用に修正
            $members = $query->leftJoin('departments as sub_dept', 'staff_identity.sub_department_id', '=', 'sub_dept.id')
                ->select(
                    'staff_identity.id',
                    'staff_identity.mail_address as email',
                    'staff_identity.name',
                    'staff_identity.role_name as role',
                    DB::raw('CASE 
                        WHEN staff_identity.is_personnel = true THEN \'人事\'
                        ELSE \'一般\'
                    END as permission'),
                    'departments.front_only_departments_id as org_code',
                    'departments.name as org_name',
                    'sub_dept.front_only_departments_id as sub_org_code',
                    'sub_dept.name as sub_org_name'
                )
                ->orderBy('staff_identity.id')
                ->offset($offset)
                ->limit($itemsPerPage)
                ->get();
            
            return response()->json([
                'success' => true,
                'members' => $members,
                'total' => $totalCount,
                'page' => $page,
                'items_per_page' => $itemsPerPage,
                'total_pages' => ceil($totalCount / $itemsPerPage)
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '組織メンバーの取得に失敗しました',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * 組織メンバーを保存または更新する
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function saveMembers(Request $request)
    {
        try {
            $tenantId = $request->input('tenant_id', 1);
            $members = $request->input('members');
            
            if (!$members || !is_array($members)) {
                return response()->json([
                    'success' => false,
                    'message' => 'メンバーデータが不正です'
                ], 400);
            }
            
            DB::beginTransaction();
            
            foreach ($members as $member) {
                // バリデーション
                if (empty($member['email'])) {
                    continue; // メールアドレスが空の場合はスキップ
                }
                
                // 組織コードから部門IDを取得
                $departmentId = null;
                if (!empty($member['orgCode'])) {
                    $department = DB::table('departments')
                        ->where('tenant_id', $tenantId)
                        ->where('front_only_departments_id', $member['orgCode'])
                        ->first();
                    
                    if ($department) {
                        $departmentId = $department->id;
                    }
                }
                
                // 準所属組織コードから部門IDを取得
                $subDepartmentId = null;
                if (!empty($member['subOrgCode'])) {
                    $subDepartment = DB::table('departments')
                        ->where('tenant_id', $tenantId)
                        ->where('front_only_departments_id', $member['subOrgCode'])
                        ->first();
                    
                    if ($subDepartment) {
                        $subDepartmentId = $subDepartment->id;
                    }
                }
                
                // 権限の設定 - PostgreSQL用に修正
                $isPersonnel = $member['permission'] === '人事';
                
                // 管理職かどうかの設定 - PostgreSQL用に修正
                $isManager = isset($member['role']) && !empty($member['role']);
                
                // 既存メンバーの検索
                $existingMember = DB::table('staff_identity')
                    ->where('tenant_id', $tenantId)
                    ->where('mail_address', $member['email'])
                    ->first();
                
                $now = Carbon::now();
                
                if ($existingMember) {
                    // 更新
                    $updateData = [
                        'department_id' => $departmentId,
                        'sub_department_id' => $subDepartmentId,
                        'is_personnel' => $isPersonnel,
                        'is_manager' => $isManager,
                        'updated_at' => $now
                    ];
                    
                    // 役職名は管理職の場合のみ更新
                    if ($isManager && isset($member['role'])) {
                        $updateData['role_name'] = $member['role'];
                    }
                    
                    // 名前がある場合のみ更新
                    if (isset($member['name']) && !empty($member['name'])) {
                        $updateData['name'] = $member['name'];
                    }
                    
                    DB::table('staff_identity')
                        ->where('id', $existingMember->id)
                        ->update($updateData);
                } else {
                    // 新規追加
                    DB::table('staff_identity')->insert([
                        'tenant_id' => $tenantId,
                        'department_id' => $departmentId,
                        'sub_department_id' => $subDepartmentId,
                        'mail_address' => $member['email'],
                        'password_hash' => bcrypt('password123'), // 初期パスワード
                        'remember_token' => Str::random(10), // ランダムなリメンバートークンを生成
                        'is_personnel' => $isPersonnel,
                        'is_manager' => $isManager,
                        'role_name' => $isManager && isset($member['role']) ? $member['role'] : null,
                        'name' => isset($member['name']) ? $member['name'] : null,
                        'created_at' => $now,
                        'updated_at' => $now
                    ]);
                }
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => '組織メンバーを保存しました'
            ]);
        } catch (Exception $e) {
            DB::rollback();
            
            return response()->json([
                'success' => false,
                'message' => '組織メンバーの保存に失敗しました',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * CSVファイルからメンバーをインポートする
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function importMembersFromCsv(Request $request)
    {
        try {
            $tenantId = $request->input('tenant_id', 1);
            $type = $request->input('type', 'employee'); // 'employee' または 'manager'
            
            if (!$request->hasFile('csv_file')) {
                return response()->json([
                    'success' => false,
                    'message' => 'CSVファイルがアップロードされていません'
                ], 400);
            }
            
            $file = $request->file('csv_file');
            
            // CSVファイルを読み込み
            $csvData = array_map('str_getcsv', file($file->getPathname()));
            
            // ヘッダー行を取得
            $headers = array_shift($csvData);
            
            // ヘッダーのインデックスを取得
            $emailIndex = array_search('email', $headers);
            $permissionIndex = array_search('permission', $headers);
            $orgCodeIndex = array_search('organization_code', $headers);
            $subOrgCodeIndex = array_search('sub_organization_code', $headers);
            $roleIndex = $type === 'manager' ? array_search('role', $headers) : null;
            $nameIndex = array_search('name', $headers);
            
            // 必須ヘッダーが存在するか確認
            if ($emailIndex === false || $permissionIndex === false || $orgCodeIndex === false) {
                return response()->json([
                    'success' => false,
                    'message' => '必須ヘッダー(email, permission, organization_code)が不足しています'
                ], 400);
            }
            
            // 管理職の場合、roleは必須
            if ($type === 'manager' && $roleIndex === false) {
                return response()->json([
                    'success' => false,
                    'message' => '管理職の場合は役職名(role)が必須です'
                ], 400);
            }
            
            // CSVデータをメンバー形式に変換
            $members = [];
            foreach ($csvData as $row) {
                // 空行をスキップ
                if (count($row) <= 1 && empty($row[0])) {
                    continue;
                }
                
                $member = [
                    'email' => $emailIndex !== false && isset($row[$emailIndex]) ? $row[$emailIndex] : '',
                    'permission' => $permissionIndex !== false && isset($row[$permissionIndex]) ? $row[$permissionIndex] : '一般',
                    'orgCode' => $orgCodeIndex !== false && isset($row[$orgCodeIndex]) ? $row[$orgCodeIndex] : '',
                    'subOrgCode' => $subOrgCodeIndex !== false && isset($row[$subOrgCodeIndex]) ? $row[$subOrgCodeIndex] : '',
                ];
                
                // 管理職の場合は役職名も設定
                if ($type === 'manager' && $roleIndex !== false && isset($row[$roleIndex])) {
                    $member['role'] = $row[$roleIndex];
                }
                
                // 名前があれば設定
                if ($nameIndex !== false && isset($row[$nameIndex])) {
                    $member['name'] = $row[$nameIndex];
                }
                
                // 必須項目が空でなければ追加
                if (!empty($member['email']) && !empty($member['orgCode'])) {
                    $members[] = $member;
                }
            }
            
            // 保存処理を呼び出し
            $saveRequest = new Request([
                'tenant_id' => $tenantId,
                'members' => $members
            ]);
            
            return $this->saveMembers($saveRequest);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'CSVインポートに失敗しました',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * メンバーを削除する
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteMember(Request $request)
    {
        try {
            $memberId = $request->input('member_id');
            $tenantId = $request->input('tenant_id', 1);
            
            if (!$memberId) {
                return response()->json([
                    'success' => false,
                    'message' => 'メンバーIDが指定されていません'
                ], 400);
            }
            
            DB::beginTransaction();
            
            // 該当メンバーの存在確認
            $member = DB::table('staff_identity')
                ->where('id', $memberId)
                ->where('tenant_id', $tenantId)
                ->first();
                
            if (!$member) {
                return response()->json([
                    'success' => false,
                    'message' => '指定されたメンバーが見つかりません'
                ], 404);
            }
            
            // メンバーの削除
            DB::table('staff_identity')
                ->where('id', $memberId)
                ->delete();
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'メンバーを削除しました'
            ]);
        } catch (Exception $e) {
            DB::rollback();
            
            return response()->json([
                'success' => false,
                'message' => 'メンバー削除に失敗しました',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * 組織ドロップダウン用のデータを取得する
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOrganizationOptions(Request $request)
    {
        try {
            $tenantId = $request->input('tenant_id', 1);
            
            // 最新の組織データを取得
            $latestDate = DB::table('departments')
                ->where('tenant_id', $tenantId)
                ->max('start_date');
            
            if (!$latestDate) {
                return response()->json([
                    'success' => true,
                    'organizations' => []
                ]);
            }
            
            $organizations = DB::table('departments')
                ->where('tenant_id', $tenantId)
                ->where('start_date', $latestDate)
                ->select('id', 'name', 'front_only_departments_id as code')
                ->orderBy('front_only_departments_id')
                ->get();
            
            return response()->json([
                'success' => true,
                'organizations' => $organizations
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '組織データの取得に失敗しました',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}