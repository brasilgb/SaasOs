<?php

namespace App\Models\Admin;

use App\Models\Tenant;
use Database\Factories\PlanFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'value',
        'description',
    ];

    protected static function newFactory(): Factory
    {
        return PlanFactory::new();
    }

    public function tenants(): HasMany
    {
        return $this->hasMany(Tenant::class, 'plan');
    }
}
