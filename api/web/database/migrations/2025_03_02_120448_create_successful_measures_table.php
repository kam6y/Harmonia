<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSuccessfulMeasuresTable extends Migration
{
    public function up()
    {
        Schema::create('successful_measures', function (Blueprint $table) {
            // 成功施策の一意な識別子。自動増分
            $table->increments('id');

            // 対象テナント。外部キーとして tenants を参照
            $table->unsignedInteger('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');

            // 成功した施策。外部キーとして measures を参照
            $table->unsignedInteger('measure_id');
            $table->foreign('measure_id')->references('id')->on('measures')->onDelete('cascade');

            // 仕組み化が記録された日付（date 型）
            $table->date('success_date');

            // 作成日時（更新は不要な場合は created_at のみ）
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down()
    {
        Schema::dropIfExists('successful_measures');
    }
}
