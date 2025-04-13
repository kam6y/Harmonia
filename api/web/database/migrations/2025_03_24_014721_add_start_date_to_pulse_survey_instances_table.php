<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class AddStartDateToPulseSurveyInstancesTable extends Migration
{
    public function up()
    {
        Schema::table('pulse_survey_instances', function (Blueprint $table) {
            // デフォルト値として CURRENT_DATE を設定し、日付型で持ちます
            $table->date('start_date')
                ->default(DB::raw('CURRENT_DATE'))
                ->comment('日付(YYYY-MM-DD形式)');
        });
    }

    public function down()
    {
        Schema::table('pulse_survey_instances', function (Blueprint $table) {
            $table->dropColumn('start_date');
        });
    }
}
