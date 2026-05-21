<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Layer;

class LayerController extends Controller
{
    public function index()
    {
        $layers = Layer::paginate(10);
        return Inertia::render('Admin/Layers/Index', [
            'layers' => $layers
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Layers/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:vector,raster',
            'style_color' => ['required', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'style_opacity' => 'required|numeric|min:0|max:1',
            'is_public' => 'required|boolean',
            'status' => 'required|string|in:active,inactive',
        ]);

        Layer::create([
            'name' => $validated['name'],
            'type' => $validated['type'],
            'style' => [
                'color' => $validated['style_color'],
                'opacity' => (float)$validated['style_opacity'],
            ],
            'is_public' => (bool)$validated['is_public'],
            'status' => $validated['status'],
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('admin.layers.index')->with('success', 'Map layer created successfully.');
    }

    public function edit(Layer $layer)
    {
        return Inertia::render('Admin/Layers/Edit', [
            'layer' => $layer
        ]);
    }

    public function update(Request $request, Layer $layer)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:vector,raster',
            'style_color' => ['required', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'style_opacity' => 'required|numeric|min:0|max:1',
            'is_public' => 'required|boolean',
            'status' => 'required|string|in:active,inactive',
        ]);

        $layer->update([
            'name' => $validated['name'],
            'type' => $validated['type'],
            'style' => [
                'color' => $validated['style_color'],
                'opacity' => (float)$validated['style_opacity'],
            ],
            'is_public' => (bool)$validated['is_public'],
            'status' => $validated['status'],
        ]);

        return redirect()->route('admin.layers.index')->with('success', 'Map layer updated successfully.');
    }

    public function destroy(Layer $layer)
    {
        $layer->delete();
        return redirect()->route('admin.layers.index')->with('success', 'Map layer deleted successfully.');
    }
}
