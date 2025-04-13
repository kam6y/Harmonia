<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddDeadlineToEngagementSurveySettings extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('engagement_survey_settings', function (Blueprint $table) {
            $table->integer('deadline')->default(30);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('engagement_survey_settings', function (Blueprint $table) {
            $table->dropColumn('deadline');
        });
    }
}
