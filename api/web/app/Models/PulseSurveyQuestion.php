<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PulseSurveyQuestion extends Model
{
    use HasFactory;

    public $incrementing = false; // 自動IDは使わない
    protected $table = 'pulse_survey_questions';
    protected $fillable = [
        'pulse_survey_instances_id',
        'survey_question_id',
    ];

    public function surveyQuestion()
    {
        // このテーブル(pulse_survey_questions)の survey_question_id が
        // survey_questions テーブルの主キー(id)を参照している想定
        return $this->belongsTo(SurveyQuestion::class, 'survey_question_id');
    }
}
