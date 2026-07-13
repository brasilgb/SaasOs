<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlanLead extends Model
{
    protected $fillable = [
        'name',
        'whatsapp',
        'email',
        'source',
        'status',
        'notes',
        'last_contact_at',
    ];

    protected function casts(): array
    {
        return [
            'last_contact_at' => 'datetime',
        ];
    }
}
