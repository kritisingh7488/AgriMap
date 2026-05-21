<?php

namespace App\Http\Controllers\DataManager;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\GeoPoint;
use App\Models\Layer;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $userId = auth()->id();
        $mySubmissions = GeoPoint::where('submitted_by', $userId)->count();
        $pendingTasks = GeoPoint::where('submitted_by', $userId)->where('status', 'pending')->count();
        $layers = Layer::where('status', 'active')->get();

        $submissions = GeoPoint::where('submitted_by', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($p) {
                $layer = Layer::find($p->layer_id);
                return [
                    'id' => (string) $p->_id,
                    'name' => $p->name,
                    'description' => $p->description,
                    'latitude' => $p->location['coordinates'][1] ?? null,
                    'longitude' => $p->location['coordinates'][0] ?? null,
                    'status' => $p->status, // pending, approved, rejected
                    'layer_name' => $layer ? $layer->name : 'Unassigned',
                    'created_at' => $p->created_at ? $p->created_at->diffForHumans() : 'Recently'
                ];
            });

        return Inertia::render('DataManager/Dashboard', [
            'stats' => [
                'mySubmissions' => $mySubmissions,
                'pendingTasks' => $pendingTasks,
            ],
            'layers' => $layers,
            'submissions' => $submissions,
        ]);
    }
}

