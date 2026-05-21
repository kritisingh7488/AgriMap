<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GeoPoint;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function getPendingSubmissions()
    {
        $points = GeoPoint::where('status', 'pending')->with('submitted_by')->get();
        return response()->json($points);
    }

    public function approveSubmission(Request $request, $id)
    {
        $point = GeoPoint::findOrFail($id);
        $point->status = 'approved';
        $point->approved_by = $request->user()->_id;
        $point->save();

        return response()->json(['success' => true, 'message' => 'Submission approved']);
    }

    public function rejectSubmission($id)
    {
        $point = GeoPoint::findOrFail($id);
        $point->status = 'rejected';
        $point->save();

        return response()->json(['success' => true, 'message' => 'Submission rejected']);
    }
}
