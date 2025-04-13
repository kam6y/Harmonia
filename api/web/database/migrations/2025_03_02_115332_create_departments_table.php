<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CreateDepartmentsTable extends Migration
{
    public function up()
    {
        Schema::create('departments', function (Blueprint $table) {
            // 部門の一意な識別子。自動増分
            $table->increments('id');

            // どのテナントに属するか。外部キーとして tenants テーブルを参照
            $table->unsignedInteger('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');

            // front_only_departments_id。必須項目（NULL 不可）
            $table->unsignedInteger('front_only_departments_id');

            // 作成日時、更新日時を自動管理
            $table->timestamps();
        });
    }

    public function down()
    {
        DB::statement('DROP TABLE IF EXISTS departments CASCADE');
    }
}
