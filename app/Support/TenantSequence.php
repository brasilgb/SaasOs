<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Model;
use InvalidArgumentException;

class TenantSequence
{
    /**
     * @param  class-string<Model>  $modelClass
     */
    public static function next(string $modelClass, string $column, ?int $tenantId = null): int
    {
        if (! is_a($modelClass, Model::class, true)) {
            throw new InvalidArgumentException("{$modelClass} must be an Eloquent model.");
        }

        $tenantId ??= resolveCurrentTenantId();
        $query = $modelClass::query()->lockForUpdate();

        if (! is_null($tenantId)) {
            $query->where('tenant_id', $tenantId);
        }

        $max = $query
            ->pluck($column)
            ->map(fn (mixed $value): int => (int) $value)
            ->max();

        return ((int) $max) + 1;
    }
}
