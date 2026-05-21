<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\GeoPoint;

class ApprovalController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->query('status', 'all');
        $query = GeoPoint::with('submittedByUser');
        
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $geoPoints = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/Approvals/Index', [
            'geoPoints' => $geoPoints,
            'currentStatus' => $status
        ]);
    }

    public function update(Request $request, GeoPoint $geopoint)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected,pending',
        ]);

        $geopoint->update([
            'status' => $validated['status'],
            'approved_by' => auth()->id()
        ]);

        return redirect()->back()->with('success', 'GeoPoint status updated to ' . $validated['status'] . ' successfully.');
    }

    public function destroy(GeoPoint $geopoint)
    {
        $geopoint->delete();
        return redirect()->back()->with('success', 'GeoPoint deleted successfully.');
    }
}
