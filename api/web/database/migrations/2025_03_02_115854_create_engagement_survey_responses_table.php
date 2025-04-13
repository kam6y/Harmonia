<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEngagementSurveyResponsesTable extends Migration
{
    public function up()
    {
        Schema::create('engagement_survey_responses', function (Blueprint $table) {
            // サーベイ回答の一意な識別子。自動増分
            $table->increments('id');

            // 対象のサーベイインスタンス。外部キーとして engagement_survey_instances を参照
            $table->unsignedInteger('engagement_survey_instances_id');
            $table->foreign('engagement_survey_instances_id')->references('id')->on('engagement_survey_instances')->onDelete('cascade');

            // 回答対象の部門。外部キーとして departments を参照
            $table->unsignedInteger('department_id');
            $table->foreign('department_id')->references('id')->on('departments')->onDelete('cascade');

            // 対象の質問。外部キーとして survey_questions を参照
            $table->unsignedInteger('survey_question_id');
            $table->foreign('survey_question_id')->references('id')->on('survey_questions')->onDelete('cascade');

            // 回答者が管理職かどうか
            $table->boolean('is_manager');

            // 管理職のメールアドレス
            $table->string('manager_email')->nullable();

            // 実際の回答値（tinyInteger 型）
            $table->tinyInteger('actual_value');

            // 期待値（tinyInteger 型、必須項目）
            $table->tinyInteger('expected_value');

            // 作成日時はデフォルトで CURRENT_TIMESTAMP を使用
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down()
    {
        Schema::dropIfExists('engagement_survey_responses');
    }
}
