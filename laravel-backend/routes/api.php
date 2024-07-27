<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CertificateController;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::post('issue-certificate', [CertificateController::class, 'issue']);
Route::post('verify-certificate', [CertificateController::class, 'verify']);
Route::post('revoke-certificate', [CertificateController::class, 'revoke']);
Route::post('view-certificate', [CertificateController::class, 'view']);
Route::post('update-certificate', [CertificateController::class, 'update']);
Route::get('/view-certificate/{studentAddress}', [CertificateController::class, 'view']);
Route::get('/verify-certificate/{studentAddress}', [CertificateController::class, 'verify']);

Route::get('ping', function () {
    return response()->json(['message' => 'API is working']);
});