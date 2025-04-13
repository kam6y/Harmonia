<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PulseSurveyInstance extends Model
{
    use HasFactory;
    protected $table = 'pulse_survey_instances';

    protected $fillable = [
        'tenant_id',
        'department_id',
        'setting_id',
        'start_date',
        'created_at',
        'updated_at',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function pulseSurveySetting()
    {
        return $this->belongsTo(PulseSurveySetting::class, 'setting_id');
    }
}