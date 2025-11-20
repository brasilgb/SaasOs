<?php

namespace App\Models\App;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Tenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Message extends Model
{
    use Tenantable, HasFactory;
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    
    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
