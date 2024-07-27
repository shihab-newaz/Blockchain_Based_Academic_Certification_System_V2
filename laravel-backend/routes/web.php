<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CertificateController;


// Route::post('/api/issue-certificate', [CertificateController::class, 'issue']);
// Route::post('/api/verify-certificate', [CertificateController::class, 'verify']);
// Route::post('/api/revoke-certificate', [CertificateController::class, 'revoke']);
// Route::post('/api/view-certificate', [CertificateController::class, 'view']);
// Route::post('/api/update-certificate', [CertificateController::class, 'update']);


Route::get('/', function () {
    return view('welcome');
});