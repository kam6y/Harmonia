<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePulseSurveyQuestionsTable extends Migration
{
    public function up()
    {
        Schema::create('pulse_survey_questions', function (Blueprint $table) {
            // 対象のサーベイインスタンス。外部キーとして pulse_survey_instances を参照
            $table->unsignedInteger('pulse_survey_instances_id');
            $table->foreign('pulse_survey_instances_id')->references('id')->on('pulse_survey_instances')->onDelete('cascade');

            // 対象の質問。外部キーとして survey_questions を参照
            $table->unsignedInteger('survey_question_id');
            $table->foreign('survey_question_id')->references('id')->on('survey_questions')->onDelete('cascade');

            // 作成日時、更新日時を自動管理
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('pulse_survey_questions');
    }
}
