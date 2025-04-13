<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CreateMeasuresTable extends Migration
{
    public function up()
    {
        Schema::create('measures', function (Blueprint $table) {
            // 施策の一意な識別子。自動増分
            $table->increments('id');

            // 対象テナント。外部キーとして tenants を参照
            $table->unsignedInteger('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');

            // 対象部門。外部キーとして departments を参照
            $table->unsignedInteger('department_id');
            $table->foreign('department_id')->references('id')->on('departments')->onDelete('cascade');

            // 課題のカテゴリ（100文字以内）
            $table->string('issue_category', 100);

            // 施策（255文字以内）
            $table->string('measure_text', 255);

            // アクションプラン（255文字以内）
            $table->string('action_plan', 255);

            // 担当者（255文字以内）
            $table->string('assignee', 255);

            // アクションプランの詳細（任意、NULL 許容）
            $table->text('action_plan_details')->nullable();

            // 期限（date 型）
            $table->date('deadline');

            // 目標の実績値（float 型）
            $table->float('goal_actual_value');

            // 目標の期待値（float 型）
            $table->float('goal_expected_value');

            // 施策の進行状況。enum 型で、初期値は 'planning'
            $table->enum('status', ['planning', 'in_progress', 'systematization', 'archived'])->default('planning');

            // 作成日時、更新日時を自動管理
            $table->timestamps();
        });
    }

    public function down()
    {
        DB::statement('DROP TABLE IF EXISTS measures CASCADE');
    }
}
