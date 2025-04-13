<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateIssueMeasuresRelationTable extends Migration
{
    public function up()
    {
        Schema::create('issue-measures_relations', function (Blueprint $table) {
            // 対象の課題。外部キーとして issues を参照
            $table->unsignedInteger('issue_id');
            $table->foreign('issue_id')->references('id')->on('issues')->onDelete('cascade');

            // 対象の施策。外部キーとして measures を参照
            $table->unsignedInteger('measure_id');
            $table->foreign('measure_id')->references('id')->on('measures')->onDelete('cascade');

            // 作成日時、更新日時を自動管理
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('issue_measures_relation');
    }
}
