<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEngagementSurveySettingsTable extends Migration
{
    public function up()
    {
        Schema::create('engagement_survey_settings', function (Blueprint $table) {
            // サーベイ設定の一意な識別子。自動増分
            $table->increments('id');

            // どのテナントのサーベイ設定か。default 設定の場合は NULL 許容
            $table->unsignedInteger('tenant_id')->nullable();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');

            // サーベイ開始日（DATE 型）
            $table->date('survey_start_day');

            // サーベイ配信間隔（日単位）
            $table->integer('survey_delivery_interval_days');

            // リマインダー送信間隔（日単位）
            $table->integer('reminder_delivery_interval_days');

            // 作成日時と更新日時を自動管理
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('engagement_survey_settings');
    }
}
