<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEngagementSurveyInstancesTable extends Migration
{
    public function up()
    {
        Schema::create('engagement_survey_instances', function (Blueprint $table) {
            // サーベイ実施の一意な識別子。自動増分
            $table->increments('id');

            // どのテナントのサーベイか。外部キーとして tenants テーブルを参照
            $table->unsignedInteger('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');

            // 適用されるサーベイ設定。外部キーとして engagement_survey_settings テーブルを参照
            $table->unsignedInteger('settings_id');
            $table->foreign('settings_id')->references('id')->on('engagement_survey_settings')->onDelete('cascade');

            // サーベイの開始日（date 型）
            $table->date('start_date');

            // 作成日時と更新日時を自動管理
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('engagement_survey_instances');
    }
}
