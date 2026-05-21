<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\GeoPoint;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->hasRole('admin')) {
            return redirect()->route('admin.dashboard');
        } elseif ($user->hasRole('data_manager')) {
            return redirect()->route('manager.dashboard');
        }

        $savedLocationIds = $user->saved_locations ?? [];
        $savedLocations = GeoPoint::whereIn('_id', $savedLocationIds)->get();

        return Inertia::render('Dashboard', [
            'savedLocations' => $savedLocations
        ]);
    }

    public function toggleBookmark(Request $request, $id)
    {
        $user = $request->user();
        $saved = $user->saved_locations ?? [];

        if (in_array($id, $saved)) {
            $saved = array_values(array_filter($saved, fn($x) => $x !== $id));
            $message = 'Location removed from your bookmarks list.';
        } else {
            $saved[] = $id;
            $message = 'Location bookmarked successfully!';
        }

        $user->update(['saved_locations' => $saved]);

        return redirect()->back()->with('success', $message);
    }

    public function updatePreferences(Request $request)
    {
        $user = $request->user();
        $prefs = $user->map_preferences ?? [];

        if ($request->has('basemap')) {
            $prefs['basemap'] = $request->basemap;
        }

        if ($request->has('checked_layers')) {
            $prefs['checked_layers'] = $request->checked_layers;
        }

        $user->update(['map_preferences' => $prefs]);

        return response()->json(['status' => 'success', 'preferences' => $prefs]);
    }
}

