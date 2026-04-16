<?php

namespace App\Services;

use App\Models\App\OperationalAudit;
use Illuminate\Database\Eloquent\Model;

class OperationalAuditService
{
    public function record(
        string $action,
        string $entityType,
        Model $entity,
        ?int $userId = null,
        array $data = []
    ): OperationalAudit {
        /** @var mixed $tenantId */
        $tenantId = $entity->getAttribute('tenant_id');

        return OperationalAudit::create([
            'tenant_id' => (int) $tenantId,
            'user_id' => $userId,
            'entity_type' => $entityType,
            'entity_id' => $entity->getKey(),
            'action' => $action,
            'data' => $data,
            'created_at' => now(),
        ]);
    }
}
