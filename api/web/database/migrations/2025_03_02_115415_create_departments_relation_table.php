<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDepartmentsRelationTable extends Migration
{
    public function up()
    {
        Schema::create('departments_relations', function (Blueprint $table) {
            // 親部門のID。departments テーブルを参照
            $table->unsignedInteger('parent_department_id');

            // 子部門のID。departments テーブルを参照
            $table->unsignedInteger('child_department_id');

            // データ作成日時と更新日時を自動管理
            $table->timestamps();

            // 外部キー設定：親部門が削除された場合、関連する関係も削除
            $table->foreign('parent_department_id')->references('id')->on('departments')->onDelete('cascade');
            $table->foreign('child_department_id')->references('id')->on('departments')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('departments_relation');
    }
}
