<?php

namespace App\Models\App;

use Illuminate\Database\Eloquent\Relations\Pivot;

class OrderPart extends Pivot
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'order_parts';
}