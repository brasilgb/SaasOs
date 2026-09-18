<?php

namespace App\Models\App;

use App\Tenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Equipment extends Model
{
    use HasFactory, Tenantable;

    public const KIND_MOBILE = 'mobile';

    public const KIND_PC = 'pc';

    public const KIND_OTHER = 'other';

    public static function kinds(): array
    {
        return [
            self::KIND_MOBILE => 'Mobile',
            self::KIND_PC => 'PC',
            self::KIND_OTHER => 'Outro',
        ];
    }

    public function checklists(): HasMany
    {
        return $this->hasMany(Checklist::class);
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function budgets(): HasMany
    {
        return $this->hasMany(Budget::class);
    }
}
