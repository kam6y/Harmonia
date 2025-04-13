<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Department;
use App\Models\DepartmentRelation;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class DepartmentController extends Controller
{
    /**
     * ① トップレベル部署一覧の取得
     *    departments_relationテーブルのchild_department_id に載っている部門は子部署なので
     *    そこに含まれないものを「トップレベル部署」として扱う例
     */
    public function index()
    {
        try {
            Log::info('部門一覧を取得します');
            
            // 全ての child_department_id を取得
            $childIds = DepartmentRelation::pluck('child_department_id');
            
            // child_department_id に含まれない部署IDが「最上位部署」
            $topLevelDepartments = Department::whereNotIn('id', $childIds)->get();
            
            Log::info('トップレベル部門を取得しました', [
                'count' => count($topLevelDepartments),
                'departments' => $topLevelDepartments->toArray()
            ]);

            return response()->json($topLevelDepartments);
        } catch (\Exception $e) {
            Log::error('部門一覧取得エラー: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * 特定のテナントIDに基づく部門一覧を取得
     * 今日の日付より過去で最新の組織データを取得
     * 
     * @param int $tenant_id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getByTenant($tenant_id)
    {
        try {
            $today = Carbon::today()->format('Y-m-d');
            Log::info('テナントID: ' . $tenant_id . ' の部門を取得します（今日: ' . $today . '）');
            
            // テナントIDの型を確認
            Log::info('テナントIDの型: ' . gettype($tenant_id));
            
            // 今日より過去の組織データの中で最新の日付を取得
            $latestDate = DB::table('departments')
                ->where('tenant_id', $tenant_id)
                ->where('start_date', '<=', $today)
                ->max('start_date');

            Log::info('過去で最新の部門データ日付: ' . ($latestDate ?? 'なし'));

            if (!$latestDate) {
                Log::warning('テナント ' . $tenant_id . ' の部門データがありません');
                return response()->json([]);
            }

            // 1. テナントに属するすべての部門を取得
            $allDepartments = Department::where('tenant_id', $tenant_id)
                ->where('start_date', $latestDate)
                ->get();
                
            Log::info('テナント部門数: ' . count($allDepartments));
            Log::info('テナント部門データ: ', $allDepartments->toArray());

            // 対象の日付の親子関係を取得
            $relations = DB::table('departments_relations')
                ->where('start_date', $latestDate)
                ->get();
                
            Log::info('関連部門数: ' . count($relations));
            Log::info('親子関係データ: ', $relations->toArray());

            // 子部門のIDを収集
            $childIds = [];
            foreach ($relations as $relation) {
                $childIds[] = $relation->child_department_id;
            }

            Log::info('子部門ID一覧: ', $childIds);

            // 子部門でない部門（つまりトップレベルの部門）を抽出
            $topLevelDepartments = $allDepartments->filter(function ($department) use ($childIds) {
                return !in_array($department->id, $childIds);
            })->values();
            
            Log::info('トップレベル部門数: ' . count($topLevelDepartments));
            Log::info('トップレベル部門: ', $topLevelDepartments->toArray());

            // フォールバック: もしトップレベル部門がない場合は、テナントのすべての部門を返す
            if ($topLevelDepartments->isEmpty() && !$allDepartments->isEmpty()) {
                Log::info('トップレベル部門が見つからないため、すべての部門を返します');
                return response()->json($allDepartments);
            }

            return response()->json($topLevelDepartments);
        } catch (\Exception $e) {
            Log::error('テナント部門取得エラー: ' . $e->getMessage() . '\n' . $e->getTraceAsString());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * ② 特定の部署ID ($parentId) にぶら下がる子部署一覧の取得
     * 親部門と同じ日付（過去かつ最新）の子部門を取得
     */
    public function children($parentId)
    {
        try {
            Log::info('親部門ID: ' . $parentId . ' の子部門を取得します');
            
            // 親部門の情報を取得
            $parentDepartment = Department::find($parentId);
            if (!$parentDepartment) {
                Log::warning('親部門が見つかりません: ' . $parentId);
                return response()->json([], 404);
            }

            Log::info('親部門情報: ', [
                'id' => $parentDepartment->id,
                'name' => $parentDepartment->name,
                'tenant_id' => $parentDepartment->tenant_id,
                'start_date' => $parentDepartment->start_date,
            ]);

            // 対象の親部門と同じ日付の親子関係を取得
            $childIds = DepartmentRelation::where('parent_department_id', $parentId)
                ->where('start_date', $parentDepartment->start_date)
                ->pluck('child_department_id');
                
            Log::info('子部門ID一覧: ', $childIds->toArray());

            // 子部門のデータを取得
            $children = Department::whereIn('id', $childIds)
                ->where('tenant_id', $parentDepartment->tenant_id)
                ->where('start_date', $parentDepartment->start_date)
                ->get();
                
            Log::info('子部門数: ' . count($children));
            Log::info('子部門: ', $children->toArray());

            // 子部門がなければ空の配列を返す
            if ($children->isEmpty()) {
                Log::info('子部門が見つかりませんでした');
                return response()->json([]);
            }

            return response()->json($children);
        } catch (\Exception $e) {
            Log::error('子部門取得エラー: ' . $e->getMessage() . '\n' . $e->getTraceAsString());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * ③ (オプション) リレーションを直接使って子部署を取得する例
     */
    public function childrenUsingRelation($parentId)
    {
        // 例：Department モデル側で定義した children() リレーションを使うと、
        // Department::find($parentId)->children によって子部署一覧が取れる。
        $parentDepartment = Department::find($parentId);
        if (!$parentDepartment) {
            return response()->json(["error" => "Department not found"], 404);
        }
        $children = $parentDepartment->children;
        return response()->json($children);
    }
}