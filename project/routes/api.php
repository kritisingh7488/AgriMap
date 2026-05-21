<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MapDataController;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// Public Map Data API Endpoints (accessible via web session)
Route::middleware(['web', 'auth'])->group(function () {
    Route::get('/layers', [MapDataController::class, 'getLayers']);
    Route::get('/points', [MapDataController::class, 'getPoints']);
    Route::get('/points/{id}', [MapDataController::class, 'getPointDetails']);

    // Data Manager Routes
    Route::post('/points', [\App\Http\Controllers\Api\DataController::class, 'storePoint']);
    Route::post('/points/bulk', [\App\Http\Controllers\Api\DataController::class, 'storeBulkPoints']);

    // Admin Routes
    Route::get('/admin/submissions', [\App\Http\Controllers\Api\AdminController::class, 'getPendingSubmissions']);
    Route::post('/admin/submissions/{id}/approve', [\App\Http\Controllers\Api\AdminController::class, 'approveSubmission']);
    Route::post('/admin/submissions/{id}/reject', [\App\Http\Controllers\Api\AdminController::class, 'rejectSubmission']);
});

