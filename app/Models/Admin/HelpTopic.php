<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;

class HelpTopic extends Model
{
    protected $fillable = [
        'slug',
        'title',
        'content',
        'category',
        'position',
    ];
}
