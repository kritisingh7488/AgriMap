<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\GeoPoint;
use App\Models\Layer;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $userCount = User::count();
        $pendingApprovals = GeoPoint::where('status', 'pending')->count();
        $totalLayers = Layer::count();
        $totalPoints = GeoPoint::count();

        // 1. Layer distribution counts
        $layers = Layer::all();
        $layerCounts = [];
        foreach ($layers as $l) {
            $id = (string)($l->_id ?? $l->id);
            $count = GeoPoint::where('layer_id', $id)->count();
            $layerCounts[] = [
                'name' => $l->name,
                'color' => $l->style['color'] ?? '#3b82f6',
                'count' => $count
            ];
        }

        // 2. Status counts
        $approvedCount = GeoPoint::where('status', 'approved')->count();
        $rejectedCount = GeoPoint::where('status', 'rejected')->count();

        // 3. Recent submissions
        $recentSubmissions = GeoPoint::orderBy('created_at', 'desc')->limit(5)->get()->map(function($p) {
            $user = User::find($p->submitted_by);
            $layer = Layer::find($p->layer_id);
            return [
                'id' => (string) $p->_id,
                'name' => $p->name,
                'status' => $p->status,
                'submitted_by' => $user ? $user->name : 'System',
                'layer_name' => $layer ? $layer->name : 'Unassigned',
                'created_at' => $p->created_at ? $p->created_at->diffForHumans() : 'Just now'
            ];
        });

        // 4. Dynamic High-Fidelity Audit Logs
        $auditLogs = [];
        foreach (Layer::orderBy('created_at', 'desc')->limit(2)->get() as $rl) {
            $auditLogs[] = [
                'action' => '📁 Layer Created',
                'details' => "GIS Theme '{$rl->name}' initialized with color code {$rl->style['color']}.",
                'time' => $rl->created_at ? $rl->created_at->diffForHumans() : 'Recently'
            ];
        }
        foreach (GeoPoint::orderBy('created_at', 'desc')->limit(3)->get() as $rp) {
            $actionWord = $rp->status === 'approved' ? '✅ Waypoint Approved' : '⏳ Waypoint Pending';
            $auditLogs[] = [
                'action' => $actionWord,
                'details' => "Marker '{$rp->name}' registered in spatial registry.",
                'time' => $rp->created_at ? $rp->created_at->diffForHumans() : 'Recently'
            ];
        }
        usort($auditLogs, function($a, $b) {
            return 0; // maintain database order
        });

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalUsers' => $userCount,
                'pendingApprovals' => $pendingApprovals,
                'totalLayers' => $totalLayers,
                'totalPoints' => $totalPoints,
                'approvedPoints' => $approvedCount,
                'rejectedPoints' => $rejectedCount,
                'layerCounts' => $layerCounts,
                'recentSubmissions' => $recentSubmissions,
                'auditLogs' => $auditLogs,
            ]
        ]);
    }
}
