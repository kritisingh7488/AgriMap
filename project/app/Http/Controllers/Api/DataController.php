<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GeoPoint;
use Illuminate\Http\Request;

class DataController extends Controller
{
    public function storePoint(Request $request)
    {
        // Validation would go here
        $point = GeoPoint::create([
            'name' => $request->name,
            'description' => $request->description,
            'location' => [
                'type' => 'Point',
                'coordinates' => [$request->longitude, $request->latitude] // GeoJSON format [lng, lat]
            ],
            'category_id' => $request->category_id,
            'layer_id' => $request->layer_id,
            'attributes' => $request->attributes ?? [],
            'status' => 'pending', // Requires admin approval
            'submitted_by' => $request->user()->_id
        ]);

        return response()->json(['success' => true, 'data' => $point], 201);
    }

    public function storeBulkPoints(Request $request)
    {
        $request->validate([
            'points' => 'required|array|min:1',
            'points.*.name' => 'required|string|max:255',
            'points.*.description' => 'nullable|string',
            'points.*.latitude' => 'required|numeric',
            'points.*.longitude' => 'required|numeric',
            'points.*.layer_id' => 'required|string',
            'points.*.media' => 'nullable|array',
            'points.*.submitted_at' => 'nullable|string',
        ]);

        $createdCount = 0;
        foreach ($request->points as $p) {
            GeoPoint::create([
                'name' => $p['name'],
                'description' => $p['description'] ?? null,
                'location' => [
                    'type' => 'Point',
                    'coordinates' => [ (float)$p['longitude'], (float)$p['latitude'] ]
                ],
                'layer_id' => $p['layer_id'],
                'media' => $p['media'] ?? [],
                'status' => 'pending', // Requires admin approval
                'submitted_by' => auth()->id(),
                'created_at' => isset($p['submitted_at']) ? new \MongoDB\BSON\UTCDateTime(strtotime($p['submitted_at']) * 1000) : null
            ]);
            $createdCount++;
        }

        return response()->json([
            'success' => true,
            'message' => "Successfully submitted {$createdCount} points for admin approval."
        ], 201);
    }
}
