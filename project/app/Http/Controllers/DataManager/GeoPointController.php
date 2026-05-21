<?php

namespace App\Http\Controllers\DataManager;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\GeoPoint;

class GeoPointController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'layer_id' => 'required|string',
        ]);

        GeoPoint::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'location' => [
                'type' => 'Point',
                'coordinates' => [ (float)$validated['longitude'], (float)$validated['latitude'] ]
            ],
            'layer_id' => $validated['layer_id'],
            'media' => $request->media ?? [],
            'status' => 'pending',
            'submitted_by' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'GeoPoint submitted successfully and is pending approval.');
    }

    public function uploadFile(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:json,geojson,zip,tif,tiff|max:10240', // 10MB limit
        ]);

        // Just store the file for now. Processing will happen later.
        if ($request->file('file')) {
            $path = $request->file('file')->store('gis_uploads', 'public');
            
            // Optionally store a record in a File/Upload model.
            // For now, we'll just redirect back.
            return redirect()->back()->with('success', 'File uploaded successfully.');
        }

        return redirect()->back()->with('error', 'File upload failed.');
    }
}
