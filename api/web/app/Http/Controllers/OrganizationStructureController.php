<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Exception;

class OrganizationStructureController extends Controller
{
  /**
   * 組織構造を取得する
   *
   * @param Request $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function getStructure(Request $request)
  {
    try {
      $tenantId = $request->input('tenant_id', 1);
      $requestedDate = $request->input('date');

      if (!$requestedDate) {
        $requestedDate = Carbon::now()->format('Y-m-d');
      }

      // リクエスト日付以下で最も新しいstart_dateを取得
      $targetDate = DB::table('departments')
        ->where('tenant_id', $tenantId)
        ->where('start_date', '<=', $requestedDate)
        ->max('start_date');

      // 該当するデータがない場合は空の構造を返す
      if (!$targetDate) {
        return response()->json([
          'success' => true,
          'structure' => [],
          'availableDates' => []
        ]);
      }

      // targetDate の組織レコードを取得
      $departments = DB::table('departments')
        ->where('tenant_id', $tenantId)
        ->where('start_date', $targetDate)
        ->get(['id', 'name', 'front_only_departments_id as code', 'start_date']);

      // targetDate の親子関係も取得
      $relations = DB::table('departments_relations')
        ->join('departments as parent', 'departments_relations.parent_department_id', '=', 'parent.id')
        ->join('departments as child', 'departments_relations.child_department_id', '=', 'child.id')
        ->where('parent.tenant_id', $tenantId)
        ->where('departments_relations.start_date', $targetDate)
        ->select(
          'departments_relations.parent_department_id',
          'departments_relations.child_department_id',
          'departments_relations.start_date'
        )
        ->get();

      // 利用可能な全日付一覧（履歴としての参考用）
      $availableDates = DB::table('departments')
        ->where('tenant_id', $tenantId)
        ->whereNotNull('start_date')
        ->distinct()
        ->pluck('start_date')
        ->toArray();

      $relationDates = DB::table('departments_relations')
        ->join('departments', 'departments_relations.parent_department_id', '=', 'departments.id')
        ->where('departments.tenant_id', $tenantId)
        ->whereNotNull('departments_relations.start_date')
        ->distinct()
        ->pluck('departments_relations.start_date')
        ->toArray();

      $availableDates = array_unique(array_merge($availableDates, $relationDates));
      sort($availableDates);

      // 部門と親子関係からツリーを再構築
      $structure = $this->buildOrganizationTree($departments, $relations);

      return response()->json([
        'success' => true,
        'structure' => $structure,
        'availableDates' => $availableDates,
        'targetDate' => $targetDate  // ※どの日付のデータを利用しているか参考用に返す
      ]);
    } catch (Exception $e) {
      return response()->json([
        'success' => false,
        'message' => '組織構造の取得に失敗しました',
        'error' => $e->getMessage()
      ], 500);
    }
  }

  /**
   * 組織構造を保存する
   *
   * @param Request $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function saveStructure(Request $request)
  {
    try {
      $tenantId = $request->input('tenant_id', 1);
      $startDate = $request->input('start_date');
      $organizations = $request->input('organizations');

      if (!$startDate || !$organizations) {
        return response()->json([
          'success' => false,
          'message' => '必須パラメータが不足しています'
        ], 400);
      }

      DB::beginTransaction();

      // ① 既に同じ日付のデータがある場合、古いデータを削除
      $exists = DB::table('departments')
        ->where('tenant_id', $tenantId)
        ->where('start_date', $startDate)
        ->exists();
      if ($exists) {
        // 親子関係を先に削除
        DB::table('departments_relations')
          ->join('departments as parent', 'departments_relations.parent_department_id', '=', 'parent.id')
          ->where('parent.tenant_id', $tenantId)
          ->where('departments_relations.start_date', $startDate)
          ->delete();

        // 部門データを削除
        DB::table('departments')
          ->where('tenant_id', $tenantId)
          ->where('start_date', $startDate)
          ->delete();
      }

      // ② 新しい組織データを再帰的に処理
      $departmentIds = [];
      $relations = [];
      $this->processOrganizationData($organizations, $tenantId, $startDate, $departmentIds, $relations);

      // ③ すべて新規に挿入する
      foreach ($departmentIds as $orgCode => $data) {
        $data['id'] = DB::table('departments')->insertGetId([
          'tenant_id' => $tenantId,
          'name' => $data['name'],
          'front_only_departments_id' => $orgCode,
          'start_date' => $startDate,
          'created_at' => Carbon::now(),
          'updated_at' => Carbon::now()
        ]);
        $departmentIds[$orgCode] = $data;
      }

      // ④ 親子関係も挿入
      foreach ($relations as $relation) {
        if (!isset($departmentIds[$relation['parent_code']]) || !isset($departmentIds[$relation['child_code']])) {
          continue;
        }
        $parentId = $departmentIds[$relation['parent_code']]['id'];
        $childId = $departmentIds[$relation['child_code']]['id'];

        DB::table('departments_relations')->insert([
          'parent_department_id' => $parentId,
          'child_department_id' => $childId,
          'start_date' => $startDate,
          'created_at' => Carbon::now(),
          'updated_at' => Carbon::now()
        ]);
      }

      DB::commit();

      return response()->json([
        'success' => true,
        'message' => '組織構造を保存しました'
      ]);
    } catch (Exception $e) {
      DB::rollback();

      return response()->json([
        'success' => false,
        'message' => '組織構造の保存に失敗しました',
        'error' => $e->getMessage()
      ], 500);
    }
  }

  /**
   * 組織構造と統計情報を取得する
   *
   * @param Request $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function getOrganizationStats(Request $request)
  {
    try {
      $tenantId = $request->input('tenant_id', 1);
      $requestedDate = $request->input('date');

      if (!$requestedDate) {
        $requestedDate = Carbon::now()->format('Y-m-d');
      }

      // リクエスト日付以下で最も新しいstart_dateを取得
      $targetDate = DB::table('departments')
        ->where('tenant_id', $tenantId)
        ->where('start_date', '<=', $requestedDate)
        ->max('start_date');

      // 該当するデータがない場合は空の構造を返す
      if (!$targetDate) {
        return response()->json([
          'success' => true,
          'organizations' => []
        ]);
      }

      // targetDate の組織レコードを取得
      $departments = DB::table('departments')
        ->where('tenant_id', $tenantId)
        ->where('start_date', $targetDate)
        ->get(['id', 'name', 'front_only_departments_id as code', 'start_date']);

      // targetDate の親子関係も取得
      $relations = DB::table('departments_relations')
        ->join('departments as parent', 'departments_relations.parent_department_id', '=', 'parent.id')
        ->join('departments as child', 'departments_relations.child_department_id', '=', 'child.id')
        ->where('parent.tenant_id', $tenantId)
        ->where('departments_relations.start_date', $targetDate)
        ->select(
          'departments_relations.parent_department_id',
          'departments_relations.child_department_id',
          'departments_relations.start_date'
        )
        ->get();

      // 部門ごとの施策統計情報を取得
      $departmentStats = [];
      foreach ($departments as $dept) {
        // 部門ごとの施策数を取得
        $measureCount = DB::table('measures')
          ->where('tenant_id', $tenantId)
          ->where('department_id', $dept->id)
          ->count();
        
        // 実施中の施策数
        $inProgressCount = DB::table('measures')
          ->where('tenant_id', $tenantId)
          ->where('department_id', $dept->id)
          ->where('status', 'in_progress')
          ->count();
        
        // 完了済みの施策数（systematization または archived）
        $completedCount = DB::table('measures')
          ->where('tenant_id', $tenantId)
          ->where('department_id', $dept->id)
          ->whereIn('status', ['systematization', 'archived'])
          ->count();
        
        // 平均スコア（goal_actual_value の平均）
        $avgScore = DB::table('measures')
          ->where('tenant_id', $tenantId)
          ->where('department_id', $dept->id)
          ->avg('goal_actual_value');
        
        $departmentStats[$dept->id] = [
          'totalMeasures' => $measureCount,
          'inProgress' => $inProgressCount,
          'completed' => $completedCount,
          'avgScore' => round($avgScore ?? 0, 1),
          'implementationRate' => $measureCount > 0 ? round(($inProgressCount + $completedCount) / $measureCount * 100) : 0
        ];
      }

      // 部門と親子関係からツリーを再構築し、統計情報を追加
      $structure = $this->buildOrganizationTreeWithStats($departments, $relations, $departmentStats);

      return response()->json([
        'success' => true,
        'organizations' => $structure
      ]);
    } catch (Exception $e) {
      return response()->json([
        'success' => false,
        'message' => '組織統計情報の取得に失敗しました',
        'error' => $e->getMessage()
      ], 500);
    }
  }

  /**
   * 組織構造データから階層ツリーを構築する
   *
   * @param Collection $departments
   * @param Collection $relations
   * @return array
   */
  private function buildOrganizationTree($departments, $relations)
  {
    $departmentsById = [];
    foreach ($departments as $dept) {
      $departmentsById[$dept->id] = [
        'id' => $dept->id,
        'name' => $dept->name,
        'code' => $dept->code,
        'startDate' => $dept->start_date,
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
   * 再帰的にサブツリーを構築する
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

  /**
   * 組織構造データから階層ツリーを構築し、統計情報を追加する
   *
   * @param Collection $departments
   * @param Collection $relations
   * @param array $departmentStats
   * @return array
   */
  private function buildOrganizationTreeWithStats($departments, $relations, $departmentStats)
  {
    $departmentsById = [];
    foreach ($departments as $dept) {
      $departmentsById[$dept->id] = [
        'id' => $dept->id,
        'name' => $dept->name,
        'code' => $dept->code,
        'startDate' => $dept->start_date,
        'stats' => $departmentStats[$dept->id] ?? [
          'totalMeasures' => 0,
          'inProgress' => 0,
          'completed' => 0,
          'avgScore' => 0,
          'implementationRate' => 0
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
      $result[] = $this->buildSubtreeWithStats($rootId, $departmentsById, $childrenByParent);
    }

    return $result;
  }

  /**
   * 再帰的にサブツリーを構築し、統計情報を含める
   *
   * @param int $nodeId
   * @param array $departmentsById
   * @param array $childrenByParent
   * @return array
   */
  private function buildSubtreeWithStats($nodeId, $departmentsById, $childrenByParent)
  {
    $node = $departmentsById[$nodeId];

    if (isset($childrenByParent[$nodeId])) {
      foreach ($childrenByParent[$nodeId] as $childId) {
        $node['children'][] = $this->buildSubtreeWithStats($childId, $departmentsById, $childrenByParent);
      }
    }

    return $node;
  }

  /**
   * 組織データを再帰的に処理し、部門情報と親子関係を抽出する
   *
   * @param array $organizations
   * @param int $tenantId
   * @param string $startDate
   * @param array &$departmentIds
   * @param array &$relations
   * @param string|null $parentCode
   * @return void
   */
  private function processOrganizationData($organizations, $tenantId, $startDate, &$departmentIds, &$relations, $parentCode = null)
  {
    if (!is_array($organizations)) {
      return;
    }

    foreach ($organizations as $org) {
      if (!isset($org['code']) || !isset($org['name'])) {
        continue;
      }

      $code = $org['code'];
      $name = $org['name'];

      $departmentIds[$code] = [
        'name' => $name,
        'tenant_id' => $tenantId
      ];

      if ($parentCode !== null) {
        $relations[] = [
          'parent_code' => $parentCode,
          'child_code' => $code
        ];
      }

      if (isset($org['children']) && is_array($org['children'])) {
        $this->processOrganizationData($org['children'], $tenantId, $startDate, $departmentIds, $relations, $code);
      }
    }
  }

  /**
   * 特定の日付の組織構造を全て削除する
   *
   * @param Request $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function deleteStructure(Request $request)
  {
    try {
      $tenantId = $request->input('tenant_id', 1);
      $date = $request->input('date');

      if (!$date) {
        return response()->json([
          'success' => false,
          'message' => '日付が指定されていません'
        ], 400);
      }

      DB::beginTransaction();

      // 指定日付の親子関係を削除
      // departments_relationsのstart_dateが$dateのレコードを削除する
      DB::table('departments_relations')
        ->join('departments as parent', 'departments_relations.parent_department_id', '=', 'parent.id')
        ->join('departments as child', 'departments_relations.child_department_id', '=', 'child.id')
        ->where('parent.tenant_id', $tenantId)
        ->where('departments_relations.start_date', $date)
        ->delete();

      // 指定日付のdepartmentsレコードを削除
      DB::table('departments')
        ->where('tenant_id', $tenantId)
        ->where('start_date', $date)
        ->delete();

      DB::commit();

      return response()->json([
        'success' => true,
        'message' => '指定した日付の組織構造を削除しました'
      ]);
    } catch (Exception $e) {
      DB::rollback();

      return response()->json([
        'success' => false,
        'message' => '組織構造の削除に失敗しました',
        'error' => $e->getMessage()
      ], 500);
    }
  }
}