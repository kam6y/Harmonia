<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SurveyQuestion extends Model
{
    use HasFactory;
    protected $table = 'survey_questions'; // テーブル名

    protected $fillable = [
        'issue_category',
        'question_text'
    ];
    public function pulseSurveyQuestions()
    {
        // survey_question_id を外部キーとして持つ
        return $this->hasMany(PulseSurveyQuestion::class, 'survey_question_id');
    }

}
