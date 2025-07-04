<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    
    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
