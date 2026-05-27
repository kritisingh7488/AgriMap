<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Feedback;
use Inertia\Inertia;

class FeedbackController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'geopoint_id' => 'nullable|string',
        ]);

        $user = $request->user();

        Feedback::create([
            'user_id' => $user ? (string)$user->_id : null,
            'name' => $user ? $user->name : 'Anonymous User',
            'email' => $user ? $user->email : 'anonymous@gis.com',
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'geopoint_id' => $validated['geopoint_id'] ?? null,
            'status' => 'unread',
        ]);

        return redirect()->back()->with('success', 'Thank you! Your feedback ticket has been logged successfully.');
    }

    public function adminIndex()
    {
        $feedbacks = Feedback::orderBy('created_at', 'desc')->get()->map(function($f) {
            return [
                'id' => (string)$f->_id,
                'name' => $f->name,
                'email' => $f->email,
                'subject' => $f->subject,
                'message' => $f->message,
                'status' => $f->status,
                'admin_reply' => $f->admin_reply,
                'admin_reply_at' => $f->admin_reply_at ? \Carbon\Carbon::parse($f->admin_reply_at)->diffForHumans() : null,
                'created_at' => $f->created_at ? $f->created_at->diffForHumans() : 'Just now'
            ];
        });

        return Inertia::render('Admin/Feedbacks', [
            'feedbacks' => $feedbacks
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:unread,read,resolved'
        ]);

        $feedback = Feedback::findOrFail($id);
        $feedback->update(['status' => $request->status]);

        return redirect()->back()->with('success', 'Feedback ticket status updated successfully.');
    }

    public function reply(Request $request, $id)
    {
        $request->validate([
            'reply' => 'required|string',
            'status' => 'nullable|string|in:read,resolved'
        ]);

        $feedback = Feedback::findOrFail($id);
        $feedback->update([
            'admin_reply' => $request->reply,
            'admin_reply_at' => now(),
            'status' => $request->status ?? 'resolved'
        ]);

        return redirect()->back()->with('success', 'Reply submitted successfully.');
    }
}
