<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Layer;
use App\Models\GeoPoint;
use Illuminate\Http\Request;

class MapDataController extends Controller
{
    public function getLayers()
    {
        return response()->json(Layer::where('status', 'active')->get());
    }

    public function getPoints(Request $request)
    {
        $query = GeoPoint::where('status', 'approved');

        if ($request->has('layer_id')) {
            $query->where('layer_id', $request->layer_id);
        }

        $points = $query->get();
        $layers = Layer::all()->keyBy('_id');

        // Convert to GeoJSON format
        $features = $points->map(function ($point) use ($layers) {
            $layer = isset($layers[$point->layer_id]) ? $layers[$point->layer_id] : null;
            $color = $layer && isset($layer->style['color']) ? $layer->style['color'] : '#3b82f6';
            $opacity = $layer && isset($layer->style['opacity']) ? $layer->style['opacity'] : 0.8;

            return [
                'type' => 'Feature',
                'geometry' => $point->location,
                'properties' => [
                    'id' => (string) $point->_id,
                    'name' => $point->name,
                    'description' => $point->description,
                    'category_id' => $point->category_id,
                    'layer_id' => $point->layer_id,
                    'layer_color' => $color,
                    'layer_opacity' => (float)$opacity,
                ]
            ];
        });

        return response()->json([
            'type' => 'FeatureCollection',
            'features' => $features
        ]);
    }

    public function getPointDetails($id)
    {
        $point = GeoPoint::findOrFail($id);
        return response()->json($point);
    }
}
