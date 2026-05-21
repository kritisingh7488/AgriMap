<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Layer extends Model
{
    protected $fillable = [
        'name',
        'type', // vector, raster
        'style', // color, opacity, etc
        'is_public',
        'status', // active, inactive
        'created_by'
    ];
}
