<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EngagementSurveySetting extends Model
{
    use HasFactory;

    protected $table = 'engagement_survey_settings';

    protected $fillable = [
        'tenant_id',
        'survey_start_day',
        'survey_delivery_interval',
        // 他の必要カラムを追加
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function engagementSurveyInstances()
    {
        return $this->hasMany(EngagementSurveyInstance::class, 'settings_id');
    }
}
