<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\User::truncate();
        
        // Admin
        $admin = \App\Models\User::create([
            'name' => 'System Admin',
            'email' => 'admin@gis.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'roles' => ['admin'],
        ]);

        // Data Manager
        $manager = \App\Models\User::create([
            'name' => 'Data Manager',
            'email' => 'manager@gis.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'roles' => ['data_manager'],
        ]);

        // Standard User
        $user = \App\Models\User::create([
            'name' => 'Test User',
            'email' => 'user@gis.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'roles' => ['user'],
        ]);

        // Truncate Layers and GeoPoints
        \App\Models\Layer::truncate();
        \App\Models\GeoPoint::truncate();

        // Default Layers
        $layer1 = \App\Models\Layer::create([
            'name' => 'Soil Health Parameters',
            'type' => 'vector',
            'style' => ['color' => '#10b981', 'opacity' => 0.8],
            'is_public' => true,
            'status' => 'active',
            'created_by' => $admin->id,
        ]);

        $layer2 = \App\Models\Layer::create([
            'name' => 'Irrigation Networks',
            'type' => 'vector',
            'style' => ['color' => '#3b82f6', 'opacity' => 0.8],
            'is_public' => true,
            'status' => 'active',
            'created_by' => $admin->id,
        ]);

        $layer3 = \App\Models\Layer::create([
            'name' => 'Crop Health Satellites',
            'type' => 'raster',
            'style' => ['color' => '#8b5cf6', 'opacity' => 0.6],
            'is_public' => false,
            'status' => 'active',
            'created_by' => $admin->id,
        ]);

        // Default Approved GeoPoints
        \App\Models\GeoPoint::create([
            'name' => 'Ludhiana Farm Nitrogen Study',
            'description' => 'Soil nitrogen levels are optimal. PH is 6.5. High moisture retention.',
            'location' => [
                'type' => 'Point',
                'coordinates' => [75.8573, 30.9010]
            ],
            'status' => 'approved',
            'layer_id' => (string) $layer1->id,
            'submitted_by' => $manager->id,
            'approved_by' => $admin->id,
        ]);

        \App\Models\GeoPoint::create([
            'name' => 'Patiala Tube Well Alpha',
            'description' => 'High flow water pump supplying 30 acres of wheat fields.',
            'location' => [
                'type' => 'Point',
                'coordinates' => [76.3860, 30.3398]
            ],
            'status' => 'approved',
            'layer_id' => (string) $layer2->id,
            'submitted_by' => $manager->id,
            'approved_by' => $admin->id,
        ]);

        // Default Pending GeoPoints
        \App\Models\GeoPoint::create([
            'name' => 'jalandhar',
            'description' => 'Crop stress detected via leaf yellowing. Requires physical inspection.',
            'location' => [
                'type' => 'Point',
                'coordinates' => [75.5760, 31.3260]
            ],
            'status' => 'pending',
            'layer_id' => (string) $layer1->id,
            'submitted_by' => $manager->id,
        ]);
    }
}
