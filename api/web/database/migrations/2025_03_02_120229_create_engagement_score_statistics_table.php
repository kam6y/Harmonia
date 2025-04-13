<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEngagementScoreStatisticsTable extends Migration
{
    public function up()
    {
        Schema::create('engagement_score_statistics', function (Blueprint $table) {
            // engagement_survey_instances_id を主キーとすることで、
            // 各サーベイごとに 1 件の統計データのみ保持可能とする
            $table->unsignedInteger('engagement_survey_instances_id')->primary();
            $table->foreign('engagement_survey_instances_id')
                  ->references('id')->on('engagement_survey_instances')
                  ->onDelete('cascade');

            // サーベイの評価（例：満足度など）を float 型で管理
            $table->float('rating');

            // スコアの平均値を float 型で管理
            $table->float('score_average');

            // 回答率（％など）を float 型で管理
            $table->float('answer_rate');

            // 作成日時と更新日時を自動管理
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('engagement_score_statistics');
    }
}
