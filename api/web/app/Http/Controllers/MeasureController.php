<?php

namespace App\Http\Controllers;

use App\Models\Measure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MeasureController extends Controller
{
    /**
     * 施策一覧を取得する
     * フィルタリングとページネーションに対応
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // リクエストからフィルターパラメータを取得
        $page = $request->input('page', 1);
        $itemsPerPage = $request->input('itemsPerPage', 10);
        $department = $request->input('department');
        $status = $request->input('status');
        $score = $request->input('score');
        $tenantId = $request->input('tenant_id', 1); // デフォルトテナントID

        // クエリビルダの初期化
        $query = Measure::with(['department'])
            ->where('tenant_id', $tenantId);

        // 部門フィルター適用
        if ($department) {
            $query->where('department_id', $department);
        }

        // ステータスフィルター適用
        if ($status) {
            $query->where('status', $status);
        }

        // スコアフィルター適用
        if ($score) {
            $query->where('goal_actual_value', '>=', (float) $score);
        }

        // 総数のカウント
        $totalCount = $query->count();
        
        // ページネーション計算
        $totalPages = ceil($totalCount / $itemsPerPage);
        $offset = ($page - 1) * $itemsPerPage;

        // データ取得
        $measures = $query->orderBy('created_at', 'desc')
            ->offset($offset)
            ->limit($itemsPerPage)
            ->get();

        // フロントエンドに必要な形式に整形
        // 重要: measure.department.nameと互換性を持たせるため、departmentオブジェクトとして返す
        $formattedMeasures = $measures->map(function ($measure) {
            return [
                'id' => $measure->id,
                'department' => [
                    'id' => $measure->department_id,
                    'name' => $measure->department->name
                ],
                'issue_category' => $measure->issue_category,
                'measure_text' => $measure->measure_text,
                'action_plan' => $measure->action_plan,
                'action_plan_details' => $measure->action_plan_details,
                'assignee' => $measure->assignee,
                'deadline' => $measure->deadline,
                'goal_actual_value' => $measure->goal_actual_value,
                'goal_expected_value' => $measure->goal_expected_value,
                'status' => $measure->status,
                'created_at' => $measure->created_at->format('Y-m-d'),
            ];
        });

        return response()->json([
            'measures' => $formattedMeasures,
            'totalItems' => $totalCount,
            'totalPages' => $totalPages,
            'currentPage' => $page,
        ]);
    }

    /**
     * 組織ごとの統計情報と構造を取得する
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOrganizationStats(Request $request)
    {
        $tenantId = $request->input('tenant_id', 1); // デフォルトテナントID

        // 部門ごとの統計情報を取得
        $departmentStats = DB::table('departments as d')
            ->leftJoin('measures as m', function($join) {
                $join->on('d.id', '=', 'm.department_id');
            })
            ->where('d.tenant_id', $tenantId)
            ->groupBy('d.id', 'd.name', 'd.front_only_departments_id')
            ->select(
                'd.id',
                'd.name',
                'd.front_only_departments_id as code',
                DB::raw('COUNT(m.id) as measureCount'),
                DB::raw('AVG(m.goal_actual_value) as score'),
                // レスポンス率は仮のデータとして70-95の範囲でランダムに生成
                // PostgreSQLの場合は RANDOM() 関数を使用
                DB::raw('FLOOR(70 + RANDOM() * 25) as responseRate')
            )
            ->get();
        
        // 統計マップを作成
        $statsMap = [];
        foreach ($departmentStats as $stat) {
            $statsMap[$stat->id] = [
                'score' => round($stat->score ?? 0, 1),
                'measureCount' => (int)$stat->measureCount,
                'responseRate' => (int)$stat->responseRate
            ];
        }

        // 組織構造を取得
        // 最新の組織構造のみを対象にする
        $latestDate = DB::table('departments')
            ->where('tenant_id', $tenantId)
            ->max('start_date');

        $departments = DB::table('departments')
            ->where('tenant_id', $tenantId)
            ->where('start_date', $latestDate)
            ->get();

        $relations = DB::table('departments_relations')
            ->join('departments as parent', 'departments_relations.parent_department_id', '=', 'parent.id')
            ->where('parent.tenant_id', $tenantId)
            ->where('departments_relations.start_date', $latestDate)
            ->get(['parent_department_id', 'child_department_id']);

        // 組織構造をツリー形式に構築
        $organizationTree = $this->buildOrganizationTree($departments, $relations, $statsMap);

        return response()->json([
            'organizations' => $organizationTree
        ]);
    }

    /**
     * 組織構造ツリーを構築する
     *
     * @param \Illuminate\Support\Collection $departments
     * @param \Illuminate\Support\Collection $relations
     * @param array $statsMap
     * @return array
     */
    private function buildOrganizationTree($departments, $relations, $statsMap)
    {
        $departmentsById = [];
        foreach ($departments as $dept) {
            $departmentsById[$dept->id] = [
                'id' => $dept->id,
                'name' => $dept->name,
                'code' => $dept->code,
                'stats' => isset($statsMap[$dept->id]) ? $statsMap[$dept->id] : [
                    'score' => 0,
                    'measureCount' => 0,
                    'responseRate' => 0
                ],
                'children' => []
            ];
        }

        $childrenByParent = [];
        foreach ($relations as $relation) {
            $parentId = $relation->parent_department_id;
            $childId = $relation->child_department_id;

            if (!isset($childrenByParent[$parentId])) {
                $childrenByParent[$parentId] = [];
            }

            $childrenByParent[$parentId][] = $childId;
        }

        // 最上位部門を特定（他の部門の子でない部門）
        $rootDepartments = [];
        foreach ($departments as $dept) {
            $isChild = false;
            foreach ($relations as $relation) {
                if ($relation->child_department_id == $dept->id) {
                    $isChild = true;
                    break;
                }
            }
            if (!$isChild) {
                $rootDepartments[] = $dept->id;
            }
        }

        $result = [];
        foreach ($rootDepartments as $rootId) {
            $result[] = $this->buildSubtree($rootId, $departmentsById, $childrenByParent);
        }

        return $result;
    }

    /**
     * サブツリーを再帰的に構築する
     *
     * @param int $nodeId
     * @param array $departmentsById
     * @param array $childrenByParent
     * @return array
     */
    private function buildSubtree($nodeId, $departmentsById, $childrenByParent)
    {
        $node = $departmentsById[$nodeId];

        if (isset($childrenByParent[$nodeId])) {
            foreach ($childrenByParent[$nodeId] as $childId) {
                $node['children'][] = $this->buildSubtree($childId, $departmentsById, $childrenByParent);
            }
        }

        return $node;
    }
}