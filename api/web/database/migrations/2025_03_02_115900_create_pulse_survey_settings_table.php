<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePulseSurveySettingsTable extends Migration
{
    public function up()
    {
        Schema::create('pulse_survey_settings', function (Blueprint $table) {
            // サーベイ設定の一意な識別子。自動増分
            $table->increments('id');

            // どのテナントの設定か。外部キーとして tenants を参照
            $table->unsignedInteger('tenant_id')->nullable();
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');

            // サーベイ配信間隔（日単位）を整数型で設定
            $table->integer('survey_delivery_interval_days');

            // リマインダー送信間隔（日単位）を整数型で設定
            $table->integer('reminder_delivery_interval_days');

            // 配信開始日（date 型）
            $table->date('start_date');

            // 作成日時、更新日時を自動管理
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('pulse_survey_settings');
    }
}
