<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class GeoPoint extends Model
{
    protected $fillable = [
        'name',
        'description',
        'location', // GeoJSON point or coordinates array
        'category_id',
        'layer_id',
        'attributes', // Dynamic properties (soil health, etc)
        'media', // Array of images/videos
        'status', // pending, approved, rejected
        'submitted_by',
        'approved_by'
    ];
    public function submittedByUser()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }
}
