<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantImprovementRequest extends Model
{
    use HasFactory;

    protected $guarded = ['_method'];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function statusLabel(): string
    {
        return match ($this->status) {
            'reviewing', 'avaliando' => 'Avaliando',
            'planned', 'ajustando' => 'Ajustando',
            'done', 'concluido' => 'Concluido',
            default => 'Nova solicitacao',
        };
    }

    public function typeLabel(): string
    {
        return $this->request_type === 'adjustment' ? 'Ajuste' : 'Melhoria';
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
