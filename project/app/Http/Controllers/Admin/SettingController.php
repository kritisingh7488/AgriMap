<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Setting;

class SettingController extends Controller
{
    public function index()
    {
        $settings = [
            'map_center_lat' => Setting::where('key', 'map_center_lat')->first()?->value ?? '30.9010',
            'map_center_lng' => Setting::where('key', 'map_center_lng')->first()?->value ?? '75.8573',
            'map_default_zoom' => Setting::where('key', 'map_default_zoom')->first()?->value ?? '11',
            'default_basemap' => Setting::where('key', 'default_basemap')->first()?->value ?? 'Street',
            'projection_code' => Setting::where('key', 'projection_code')->first()?->value ?? 'EPSG:4326',
            'moisture_offset' => Setting::where('key', 'moisture_offset')->first()?->value ?? '1.2',
            'ph_threshold' => Setting::where('key', 'ph_threshold')->first()?->value ?? '6.5',
        ];

        return Inertia::render('Admin/Settings', [
            'settings' => $settings
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'map_center_lat' => 'required|numeric',
            'map_center_lng' => 'required|numeric',
            'map_default_zoom' => 'required|integer|min:1|max:20',
            'default_basemap' => 'required|string',
            'projection_code' => 'required|string',
            'moisture_offset' => 'required|numeric',
            'ph_threshold' => 'required|numeric',
        ]);

        foreach ($validated as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => (string)$value]
            );
        }

        return redirect()->back()->with('success', 'System settings saved successfully.');
    }
}
