<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePulseSurveyInstancesTable extends Migration
{
    public function up()
    {
        Schema::create('pulse_survey_instances', function (Blueprint $table) {
            // サーベイ実施の一意な識別子。自動増分
            $table->increments('id');

            // どのテナントのサーベイか。外部キーとして tenants を参照
            $table->unsignedInteger('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');

            // 対象部門。必須項目。外部キーとして departments を参照
            $table->unsignedInteger('department_id');
            $table->foreign('department_id')->references('id')->on('departments')->onDelete('cascade');

            // 適用されるサーベイ設定。外部キーとして pulse_survey_settings を参照
            $table->unsignedInteger('setting_id');
            $table->foreign('setting_id')->references('id')->on('pulse_survey_settings')->onDelete('cascade');

            // 作成日時、更新日時を自動管理
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('pulse_survey_instances');
    }
}
