<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CreateIssuesTable extends Migration
{
    public function up()
    {
        Schema::create('issues', function (Blueprint $table) {
            // 課題の一意な識別子。自動増分
            $table->increments('id');

            // 対象テナント。外部キーとして tenants を参照
            $table->unsignedInteger('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');

            // 対象部門。外部キーとして departments を参照
            $table->unsignedInteger('department_id');
            $table->foreign('department_id')->references('id')->on('departments')->onDelete('cascade');

            // 課題のカテゴリ（100文字以内）
            $table->string('issue_category', 100);

            // 課題内容（255文字以内）
            $table->string('issue_text', 255);

            // 作成日時、更新日時を自動管理
            $table->timestamps();
        });
    }

    public function down()
    {
        DB::statement('DROP TABLE IF EXISTS issues CASCADE');
    }
}
