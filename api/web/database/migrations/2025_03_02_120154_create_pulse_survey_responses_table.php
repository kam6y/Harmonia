<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePulseSurveyResponsesTable extends Migration
{
    public function up()
    {
        Schema::create('pulse_survey_responses', function (Blueprint $table) {
            // 回答の一意な識別子。自動増分
            $table->increments('id');

            // 対象サーベイインスタンス。外部キーとして pulse_survey_instances を参照
            $table->unsignedInteger('pulse_survey_instances_id');
            $table->foreign('pulse_survey_instances_id')->references('id')->on('pulse_survey_instances')->onDelete('cascade');

            // 対象質問。外部キーとして survey_questions を参照
            $table->unsignedInteger('survey_question_id');
            $table->foreign('survey_question_id')->references('id')->on('survey_questions')->onDelete('cascade');

            // 回答者が管理職かどうか（boolean 型）
            $table->boolean('is_manager');

            // 管理職のメールアドレス
            $table->string('manager_email')->nullable();

            // 実際の回答値
            $table->tinyInteger('actual_value');

            // 期待値。ここは nullable() にせず必須としている
            $table->tinyInteger('expected_value');

            // 作成日時、更新日時を自動管理
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('pulse_survey_responses');
    }
}
