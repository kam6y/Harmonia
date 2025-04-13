<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CreateTenantsTable extends Migration
{
    public function up()
    {
        Schema::create('tenants', function (Blueprint $table) {
            // テナントの一意な識別子。自動増分の主キー
            $table->increments('id');

            // テナント名（100文字以内）
            $table->string('name', 127);

            // 住所。必須項目として設定（NULL 不可）
            $table->string('tenant_address', 127);

            // データ作成日時と更新日時を自動管理
            $table->timestamps();
        });
    }

    public function down()
    {
        DB::statement('DROP TABLE IF EXISTS tenants CASCADE');
    }
}
