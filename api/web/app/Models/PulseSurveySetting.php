<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PulseSurveySetting extends Model
{
    use HasFactory;
    protected $table = 'pulse_survey_settings';

    protected $fillable = [
        'tenant_id',
        'start_date',
        'survey_delivery_interval',
        // 他の必要カラムを追加
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function pulseSurveyInstances()
    {
        return $this->hasMany(PulseSurveyInstance::class, 'setting_id');
    }
}
