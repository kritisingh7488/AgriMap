<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\DataManager\DashboardController as DataManagerDashboardController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/about', function () {
    return Inertia::render('About', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->name('about');

Route::get('/contact', function () {
    return Inertia::render('Contact', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->name('contact');

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::post('/bookmarks/{id}/toggle', [DashboardController::class, 'toggleBookmark'])
    ->middleware(['auth'])
    ->name('bookmarks.toggle');

Route::post('/feedback', [\App\Http\Controllers\FeedbackController::class, 'store'])
    ->middleware(['auth'])
    ->name('feedback.store');

Route::post('/map/preferences', [DashboardController::class, 'updatePreferences'])
    ->middleware(['auth'])
    ->name('map.preferences');




Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    
    // User Management
    Route::get('/users/export', [\App\Http\Controllers\Admin\UserController::class, 'export'])->name('users.export');
    Route::post('/users/bulk', [\App\Http\Controllers\Admin\UserController::class, 'storeBulk'])->name('users.bulk');
    Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index'])->name('users.index');
    Route::get('/users/{user}/edit', [\App\Http\Controllers\Admin\UserController::class, 'edit'])->name('users.edit');
    Route::put('/users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'destroy'])->name('users.destroy');

    // Approvals
    Route::get('/approvals', [\App\Http\Controllers\Admin\ApprovalController::class, 'index'])->name('approvals.index');
    Route::put('/approvals/{geopoint}', [\App\Http\Controllers\Admin\ApprovalController::class, 'update'])->name('approvals.update');
    Route::delete('/approvals/{geopoint}', [\App\Http\Controllers\Admin\ApprovalController::class, 'destroy'])->name('approvals.destroy');

    // Layer CRUD Management
    Route::resource('layers', \App\Http\Controllers\Admin\LayerController::class);

    // System Settings
    Route::get('/settings', [\App\Http\Controllers\Admin\SettingController::class, 'index'])->name('settings.index');
    Route::post('/settings', [\App\Http\Controllers\Admin\SettingController::class, 'update'])->name('settings.update');

    // Feedback Management
    Route::get('/feedbacks', [\App\Http\Controllers\FeedbackController::class, 'adminIndex'])->name('feedbacks.index');
    Route::put('/feedbacks/{id}', [\App\Http\Controllers\FeedbackController::class, 'updateStatus'])->name('feedbacks.update');
    Route::post('/feedbacks/{id}/reply', [\App\Http\Controllers\FeedbackController::class, 'reply'])->name('feedbacks.reply');
});

Route::middleware(['auth', 'verified', 'role:data_manager'])->prefix('manager')->name('manager.')->group(function () {
    Route::get('/dashboard', [DataManagerDashboardController::class, 'index'])->name('dashboard');
    
    // GeoPoint Submissions & File Uploads
    Route::post('/geopoints', [\App\Http\Controllers\DataManager\GeoPointController::class, 'store'])->name('geopoints.store');
    Route::post('/files/upload', [\App\Http\Controllers\DataManager\GeoPointController::class, 'uploadFile'])->name('files.upload');
});

Route::get('/map', function () {
    return Inertia::render('Map/Index');
})->middleware(['auth', 'verified'])->name('map');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
