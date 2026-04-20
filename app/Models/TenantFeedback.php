<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantFeedback extends Model
{
    use HasFactory;

    protected $table = 'tenant_feedbacks';

    protected $guarded = ['_method'];

    protected $casts = [
        'feedback_sent_at' => 'datetime',
        'feedback_opened_at' => 'datetime',
        'feedback_submitted_at' => 'datetime',
        'feedback_expires_at' => 'datetime',
        'feedback_recovery_updated_at' => 'datetime',
        'testimonial_consent_at' => 'datetime',
        'testimonial_published_at' => 'datetime',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function recoveryAssignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'feedback_recovery_assigned_to');
    }
}
