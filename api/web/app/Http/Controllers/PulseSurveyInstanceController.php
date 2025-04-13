<?php

namespace App\Http\Controllers;

use App\Models\PulseSurveyInstance;
use Illuminate\Http\Request;

class PulseSurveyInstanceController extends Controller
{
    /**
     * パルスサーベイインスタンスの詳細情報を取得
     *
     * @param int $instanceId
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($instanceId)
    {
        try {
            // インスタンスを取得（部門情報も一緒に読み込む）
            $instance = PulseSurveyInstance::with('department')
                ->findOrFail($instanceId);

            return response()->json([
                'department_id' => $instance->department_id,
                'department_name' => $instance->department->name,
                'tenant_id' => $instance->tenant_id,
                'start_date' => $instance->created_at->format('Y-m-d')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => '指定されたインスタンスが見つかりませんでした',
                'message' => $e->getMessage()
            ], 404);
        }
    }
}