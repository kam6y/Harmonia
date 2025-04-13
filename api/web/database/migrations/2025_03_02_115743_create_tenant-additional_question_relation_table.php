<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTenantAdditionalQuestionRelationTable extends Migration
{
    public function up()
    {
        Schema::create('tenant-additional_question_relations', function (Blueprint $table) {
            // 対象のテナント。外部キーとして tenants テーブルを参照
            $table->unsignedInteger('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');

            // 追加されるサーベイ質問。外部キーとして survey_questions テーブルを参照
            $table->unsignedInteger('survey_question_id');
            $table->foreign('survey_question_id')->references('id')->on('survey_questions')->onDelete('cascade');

            // 作成日時と更新日時を自動管理
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('tenant_additional_question_relation');
    }
}
