<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Feedback extends Model
{
    protected $table = 'feedbacks';

    protected $fillable = [
        'user_id',
        'name',
        'email',
        'subject',
        'message',
        'geopoint_id',
        'status', // 'unread', 'read', 'resolved'
        'admin_reply',
        'admin_reply_at',
    ];
}
