<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;
use App\Models\User;
use App\Models\Layer;
use App\Models\GeoPoint;
use App\Models\Category;
use App\Models\Feedback;

class DemoShowcaseSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('en_IN'); // Indian localization for names/cities

        // 1. Truncate existing
        User::truncate();
        Layer::truncate();
        GeoPoint::truncate();
        Category::truncate();
        Feedback::truncate();

        // 2. Create Core Users
        $admin = User::create([
            'name' => 'System Admin',
            'email' => 'admin@gis.com',
            'password' => Hash::make('password'),
            'roles' => ['admin'],
        ]);

        $manager = User::create([
            'name' => 'AgriTech Data Manager',
            'email' => 'manager@gis.com',
            'password' => Hash::make('password'),
            'roles' => ['data_manager'],
        ]);

        $coreUser = User::create([
            'name' => 'Field Agronomist',
            'email' => 'user@gis.com',
            'password' => Hash::make('password'),
            'roles' => ['user'],
        ]);

        // Bulk Users
        $users = [$admin, $manager, $coreUser];
        for ($i = 0; $i < 50; $i++) {
            $users[] = User::create([
                'name' => $faker->name,
                'email' => $faker->unique()->safeEmail,
                'password' => Hash::make('password'),
                'roles' => ['user'],
            ]);
        }

        // 3. Create Categories
        $categories = [
            Category::create(['name' => 'Agriculture', 'slug' => 'agriculture', 'description' => 'Farms and crops', 'color' => '#10b981']),
            Category::create(['name' => 'Water Resources', 'slug' => 'water', 'description' => 'Wells, rivers, and irrigation', 'color' => '#3b82f6']),
            Category::create(['name' => 'Infrastructure', 'slug' => 'infra', 'description' => 'Silos, storage, markets', 'color' => '#64748b']),
            Category::create(['name' => 'Soil Health', 'slug' => 'soil', 'description' => 'Soil testing sites', 'color' => '#d97706']),
        ];

        // 4. Create Diverse Layers
        $layers = [
            Layer::create([
                'name' => 'Nitrogen & Phosphorus Sensors',
                'type' => 'vector',
                'style' => ['color' => '#10b981', 'opacity' => 0.8], // Emerald
                'is_public' => true,
                'status' => 'active',
                'created_by' => $admin->id,
            ]),
            Layer::create([
                'name' => 'Irrigation & Well Systems',
                'type' => 'vector',
                'style' => ['color' => '#3b82f6', 'opacity' => 0.8], // Blue
                'is_public' => true,
                'status' => 'active',
                'created_by' => $admin->id,
            ]),
            Layer::create([
                'name' => 'Crop Stress NDVI Imagery',
                'type' => 'raster',
                'style' => ['color' => '#8b5cf6', 'opacity' => 0.6], // Purple
                'is_public' => true,
                'status' => 'active',
                'created_by' => $admin->id,
            ]),
            Layer::create([
                'name' => 'Pest & Disease Outbreaks',
                'type' => 'vector',
                'style' => ['color' => '#ef4444', 'opacity' => 0.8], // Red
                'is_public' => false,
                'status' => 'active',
                'created_by' => $manager->id,
            ]),
            Layer::create([
                'name' => 'Organic Certified Farms',
                'type' => 'vector',
                'style' => ['color' => '#eab308', 'opacity' => 0.8], // Yellow
                'is_public' => true,
                'status' => 'active',
                'created_by' => $manager->id,
            ])
        ];

        // 5. Generate 1000 Realistic Bulk GeoPoints across India using curated hubs
        $crops = ['Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Maize', 'Mustard', 'Sunflower', 'Tea', 'Coffee'];
        
        // Accurate coordinates for Indian hubs to prevent ocean/border issues
        $indianHubs = [
            ['state' => 'Punjab', 'city' => 'Ludhiana', 'lat' => 30.9010, 'lng' => 75.8573],
            ['state' => 'Punjab', 'city' => 'Amritsar', 'lat' => 31.6340, 'lng' => 74.8723],
            ['state' => 'Maharashtra', 'city' => 'Pune', 'lat' => 18.5204, 'lng' => 73.8567],
            ['state' => 'Maharashtra', 'city' => 'Nashik', 'lat' => 20.0059, 'lng' => 73.7898],
            ['state' => 'Maharashtra', 'city' => 'Nagpur', 'lat' => 21.1458, 'lng' => 79.0882],
            ['state' => 'Karnataka', 'city' => 'Mysore', 'lat' => 12.2958, 'lng' => 76.6394],
            ['state' => 'Karnataka', 'city' => 'Hubballi', 'lat' => 15.3647, 'lng' => 75.1240],
            ['state' => 'Gujarat', 'city' => 'Ahmedabad', 'lat' => 23.0225, 'lng' => 72.5714],
            ['state' => 'Gujarat', 'city' => 'Rajkot', 'lat' => 22.3039, 'lng' => 70.8022],
            ['state' => 'Uttar Pradesh', 'city' => 'Lucknow', 'lat' => 26.8467, 'lng' => 80.9462],
            ['state' => 'Uttar Pradesh', 'city' => 'Kanpur', 'lat' => 26.4499, 'lng' => 80.3319],
            ['state' => 'Tamil Nadu', 'city' => 'Coimbatore', 'lat' => 11.0168, 'lng' => 76.9558],
            ['state' => 'Tamil Nadu', 'city' => 'Madurai', 'lat' => 9.9252, 'lng' => 78.1198],
            ['state' => 'Madhya Pradesh', 'city' => 'Indore', 'lat' => 22.7196, 'lng' => 75.8577],
            ['state' => 'Madhya Pradesh', 'city' => 'Bhopal', 'lat' => 23.2599, 'lng' => 77.4126],
            ['state' => 'Haryana', 'city' => 'Karnal', 'lat' => 29.6857, 'lng' => 76.9905],
            ['state' => 'Rajasthan', 'city' => 'Jaipur', 'lat' => 26.9124, 'lng' => 75.7873],
            ['state' => 'West Bengal', 'city' => 'Burdwan', 'lat' => 23.2324, 'lng' => 87.8615],
            ['state' => 'Andhra Pradesh', 'city' => 'Guntur', 'lat' => 16.3067, 'lng' => 80.4365],
            ['state' => 'Telangana', 'city' => 'Warangal', 'lat' => 17.9689, 'lng' => 79.5941],
            ['state' => 'Bihar', 'city' => 'Patna', 'lat' => 25.5941, 'lng' => 85.1376],
            ['state' => 'Assam', 'city' => 'Jorhat', 'lat' => 26.7509, 'lng' => 94.2037],
            ['state' => 'Kerala', 'city' => 'Palakkad', 'lat' => 10.7867, 'lng' => 76.6548]
        ];

        $pointsToCreate = 1000;
        $geoPoints = [];

        for ($i = 0; $i < $pointsToCreate; $i++) {
            $layer = $faker->randomElement($layers);
            $category = $faker->randomElement($categories);
            $crop = $faker->randomElement($crops);
            
            // Pick a valid Indian hub
            $hub = $faker->randomElement($indianHubs);
            $state = $hub['state'];
            $city = $hub['city'];
            
            // Apply a very small random jitter (approx max 30km) so points aren't exactly stacked, but stay well inland
            // 0.3 degrees is roughly 30km
            $lat = $hub['lat'] + $faker->randomFloat(5, -0.3, 0.3);
            $lng = $hub['lng'] + $faker->randomFloat(5, -0.3, 0.3);

            // Determine status
            $statusOptions = array_merge(
                array_fill(0, 60, 'approved'),
                array_fill(0, 30, 'pending'),
                array_fill(0, 10, 'rejected')
            );
            $status = $faker->randomElement($statusOptions);
            
            $submitter = $faker->randomElement($users);
            $approverId = ($status !== 'pending') ? $manager->id : null;

            // Realistic Description
            $desc = match($layer->name) {
                'Nitrogen & Phosphorus Sensors' => "Soil analysis for $crop field near $city, $state. NPK levels are " . $faker->randomElement(['optimal', 'deficient', 'excessive']) . ". pH is " . $faker->randomFloat(1, 5.5, 8.5) . ".",
                'Irrigation & Well Systems' => "Tube well servicing " . $faker->numberBetween(10, 100) . " acres near $city. Current flow rate: " . $faker->numberBetween(50, 200) . " liters/min.",
                'Crop Stress NDVI Imagery' => "Satellite scan near $city indicates " . $faker->randomElement(['high', 'medium', 'low']) . " stress due to " . $faker->randomElement(['water deficit', 'heat stress', 'nutrient deficiency']) . ".",
                'Pest & Disease Outbreaks' => "Identified " . $faker->randomElement(['Aphids', 'Whitefly', 'Blight', 'Rust']) . " affecting $crop in $state. " . $faker->randomElement(['Requires immediate spraying', 'Under observation']) . ".",
                'Organic Certified Farms' => "Certified organic farm producing $crop near $city. Audited on " . $faker->date() . ".",
                default => "Farm monitoring node in $city, $state."
            };

            $geoPoints[] = GeoPoint::create([
                'name' => "$city $crop Node " . $faker->unique()->numerify('ID-#####'),
                'description' => $desc,
                'location' => [
                    'type' => 'Point',
                    'coordinates' => [$lng, $lat] // GeoJSON format: [lng, lat]
                ],
                'status' => $status,
                'layer_id' => (string) $layer->id,
                'category_id' => (string) $category->id,
                'submitted_by' => $submitter->id,
                'approved_by' => $approverId,
                'attributes' => [
                    'area_acres' => $faker->randomFloat(1, 5, 250),
                    'last_inspection' => $faker->dateTimeThisYear()->format('Y-m-d')
                ]
            ]);
        }

        // 6. Generate Realistic English Feedbacks
        $subjects = [
            "Layer not displaying correctly",
            "Incorrect coordinates for my farm",
            "Requesting new crop layer",
            "App is crashing on mobile",
            "Water Resources data is outdated",
            "Excellent visualization tools",
            "Can I export data to CSV?",
            "Soil Health markers missing",
            "Bug in the navigation routing",
            "Feedback on recent UI update"
        ];
        
        $messages = [
            "I was trying to view the Nitrogen & Phosphorus layer near my location but the map tiles are not loading properly. Can you check the server?",
            "The coordinates for the recently approved waypoint seem to be off by a few kilometers. Please investigate.",
            "It would be great if you could add a new thematic layer for seasonal rainfall patterns in the region.",
            "Every time I try to submit a new waypoint from my mobile device, the application crashes during the upload phase.",
            "I noticed the well systems data for Punjab is from last year. Is there an updated dataset available?",
            "The new NDVI imagery layer is fantastic! It really helps us plan our fertilizer application for the upcoming season.",
            "I need to export the approved geopoints for my district. Is there a way to download them as a CSV or GeoJSON file for local analysis?",
            "Some of the soil health markers that I submitted yesterday are no longer visible on the map. Were they rejected?",
            "The A-to-B navigation feature is routing me through restricted agricultural zones. Can we update the road weights?",
            "The recent update to the admin dashboard is very helpful, but I think the charts could use more detailed labels."
        ];

        for ($i = 0; $i < 100; $i++) {
            $user = $faker->randomElement($users);
            $point = $faker->boolean(70) ? $faker->randomElement($geoPoints) : null;
            
            Feedback::create([
                'user_id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'subject' => $faker->randomElement($subjects),
                'message' => $faker->randomElement($messages),
                'geopoint_id' => $point ? (string) $point->id : null,
                'status' => $faker->randomElement(['unread', 'read', 'resolved']),
            ]);
        }
    }
}
