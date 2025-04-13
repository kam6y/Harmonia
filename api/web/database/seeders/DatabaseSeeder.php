<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * データベースシード実行
     */
    public function run(): void
    {
        $this->call([
            TenantSeeder::class,
            DepartmentSeeder::class,
            DepartmentRelationSeeder::class,
            AdminIdentitySeeder::class,
            StaffIdentitySeeder::class,
            SurveyQuestionSeeder::class,
            EngagementSurveySettingSeeder::class,
            EngagementSurveyInstanceSeeder::class,
            EngagementSurveyResponseSeeder::class,
            PulseSurveySettingSeeder::class,
            PulseSurveyInstanceSeeder::class,
            PulseSurveyQuestionSeeder::class,
            PulseSurveyResponseSeeder::class,
            IssueSeeder::class,
            MeasureSeeder::class,
            IssueMeasuresRelationSeeder::class,
            MeasuresCommentSeeder::class,
            SuccessfulMeasureSeeder::class,
        ]);
    }
}