<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CreateSurveyQuestionsTable extends Migration
{
    public function up()
    {
        Schema::create('survey_questions', function (Blueprint $table) {
            // 質問の一意な識別子。自動増分
            $table->increments('id');

            // 質問のカテゴリ（127文字以内）
            $table->string('issue_category', 127);

            // 質問の内容（255文字以内）
            $table->string('question_text', 255);

            // 作成日時と更新日時を自動管理
            $table->timestamps();
        });
    }

    public function down()
    {
        DB::statement('DROP TABLE IF EXISTS survey_questions  CASCADE');
    }
}
