<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\App\TechnicianPushToken;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TechnicianPushTokenController extends Controller
{
    private function technician(Request $request): User
    {
        $user = $request->user();

        abort_unless($user instanceof User && $user->canUseTechnicianApp(), 403);

        return $user;
    }

    public function store(Request $request)
    {
        $technician = $this->technician($request);
        $data = $request->validate([
            'expo_push_token' => ['required', 'string', 'max:255'],
            'platform' => ['nullable', 'string', 'max:30'],
            'device_name' => ['nullable', 'string', 'max:255'],
        ]);

        $token = TechnicianPushToken::query()->updateOrCreate(
            ['expo_push_token' => $data['expo_push_token']],
            [
                'tenant_id' => $technician->tenant_id,
                'user_id' => $technician->id,
                'platform' => $data['platform'] ?? null,
                'device_name' => $data['device_name'] ?? null,
                'last_used_at' => now(),
                'disabled_at' => null,
            ]
        );

        Log::info('Token push do técnico registrado.', [
            'token_id' => $token->id,
            'tenant_id' => $technician->tenant_id,
            'user_id' => $technician->id,
            'platform' => $data['platform'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'result' => [
                'id' => $token->id,
                'registered' => true,
            ],
        ]);
    }

    public function destroy(Request $request)
    {
        $technician = $this->technician($request);
        $data = $request->validate([
            'expo_push_token' => ['required', 'string', 'max:255'],
        ]);

        TechnicianPushToken::query()
            ->where('user_id', $technician->id)
            ->where('expo_push_token', $data['expo_push_token'])
            ->update(['disabled_at' => now()]);

        return response()->json([
            'success' => true,
            'result' => [
                'registered' => false,
            ],
        ]);
    }
}
