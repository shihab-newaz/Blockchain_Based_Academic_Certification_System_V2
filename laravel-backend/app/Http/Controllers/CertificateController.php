<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class CertificateController extends Controller
{
    public function issue(Request $request)
    {
        try {
            Log::info('Received certificate issuance request', $request->all());

            $validator = Validator::make($request->all(), [
                'studentName' => 'required|string|max:255',
                'roll' => 'required|string|max:50',
                'degreeName' => 'required|string|max:255',
                'subject' => 'required|string|max:255',
                'expiry' => 'required|integer|min:1',
                'studentAddress' => 'required|string|size:42',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $response = Http::timeout(30)->withoutVerifying()->post(env('BLOCKCHAIN_SERVICE_URL') . '/issue-certificate', [
                'studentName' => $request->studentName,
                'roll' => $request->roll,
                'degreeName' => $request->degreeName,
                'subject' => $request->subject,
                'expiry' => $request->expiry,
                'studentAddress' => $request->studentAddress,
            ]);

            Log::info('Blockchain service response', ['status' => $response->status(), 'body' => $response->body()]);

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Certificate issued successfully',
                    'data' => $response->json()
                ]);
            } else {
                Log::error('Failed to issue certificate', ['response' => $response->body()]);
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to issue certificate',
                    'error' => $response->json() ?? $response->body()
                ], $response->status());
            }
        } catch (\Exception $e) {
            Log::error('Exception in certificate issuance', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while issuing the certificate',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function view($studentAddress)
    {
        try {
            Log::info("Attempting to view certificate for address: " . $studentAddress);
            $response = Http::timeout(30)->get(env('BLOCKCHAIN_SERVICE_URL') . '/view-certificate/' . $studentAddress);

            Log::info("Received response from blockchain service", ['status' => $response->status()]);

            if ($response->successful()) {
                return response()->json($response->json());
            } else {
                Log::error("Failed to view certificate", ['response' => $response->body()]);
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to view certificate',
                    'error' => $response->json() ?? $response->body()
                ], $response->status());
            }
        } catch (\Exception $e) {
            Log::error("Exception occurred while viewing certificate", [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while viewing the certificate',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function verify($studentAddress)
    {
        try {
            Log::info("Attempting to verify certificate for address: " . $studentAddress);
            $response = Http::timeout(30)->get(env('BLOCKCHAIN_SERVICE_URL') . '/verify-certificate/' . $studentAddress);

            Log::info("Received verification response from blockchain service", ['status' => $response->status()]);

            if ($response->successful()) {
                return response()->json($response->json());
            } else {
                Log::error("Failed to verify certificate", ['response' => $response->body()]);
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to verify certificate',
                    'error' => $response->json() ?? $response->body()
                ], $response->status());
            }
        } catch (\Exception $e) {
            Log::error("Exception occurred while verifying certificate", [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'An error occurred during verification',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}