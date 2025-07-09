<?php

namespace App\Models\App;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Tenantable;
    
class Message extends Model
{
    use Tenantable;
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    
    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
