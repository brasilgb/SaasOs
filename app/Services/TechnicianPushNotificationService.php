<?php

namespace App\Services;

use App\Models\App\Schedule;
use App\Models\App\TechnicianPushToken;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TechnicianPushNotificationService
{
    public function notifyScheduleSent(Schedule $schedule): void
    {
        if (! $schedule->send_to_technician || ! $schedule->user_id) {
            return;
        }

        $tokens = TechnicianPushToken::query()
            ->where('user_id', $schedule->user_id)
            ->whereNull('disabled_at')
            ->get(['id', 'expo_push_token'])
            ->filter(fn (TechnicianPushToken $token) => $this->isExpoPushToken($token->expo_push_token))
            ->values();

        if ($tokens->isEmpty()) {
            Log::info('Nenhum token push ativo encontrado para técnico.', [
                'schedule_id' => $schedule->id,
                'user_id' => $schedule->user_id,
            ]);

            return;
        }

        $schedule->loadMissing('customer');
        $visitDate = $schedule->schedules ? Carbon::parse($schedule->schedules)->format('d/m/Y H:i') : null;
        $customerName = $schedule->customer?->name;

        $messages = $tokens->map(fn (TechnicianPushToken $token) => [
            'to' => $token->expo_push_token,
            'sound' => 'default',
            'priority' => 'high',
            'channelId' => 'technician-schedules',
            'title' => 'Novo atendimento técnico',
            'body' => trim("Agendamento #{$schedule->schedules_number}".($customerName ? " - {$customerName}" : '').($visitDate ? " em {$visitDate}" : '')),
            'data' => [
                'type' => 'technician_schedule',
                'schedule_id' => $schedule->id,
                'schedules_number' => $schedule->schedules_number,
            ],
        ])->all();

        try {
            $response = Http::timeout(8)
                ->acceptJson()
                ->post('https://exp.host/--/api/v2/push/send', $messages)
                ->throw();

            $tickets = collect($response->json('data') ?? []);
            $tickets->each(function (array $ticket, int $index) use ($schedule, $tokens): void {
                if (($ticket['status'] ?? null) !== 'error') {
                    return;
                }

                $token = $tokens->get($index);
                $error = $ticket['details']['error'] ?? null;

                Log::warning('Expo retornou erro ao enviar notificação push.', [
                    'schedule_id' => $schedule->id,
                    'user_id' => $schedule->user_id,
                    'token_id' => $token?->id,
                    'error' => $error,
                    'message' => $ticket['message'] ?? null,
                ]);

                if ($token && $error === 'DeviceNotRegistered') {
                    $token->update(['disabled_at' => now()]);
                }
            });
        } catch (\Throwable $exception) {
            Log::warning('Falha ao enviar notificação push para técnico.', [
                'schedule_id' => $schedule->id,
                'user_id' => $schedule->user_id,
                'tokens_count' => $tokens->count(),
                'error' => $exception->getMessage(),
            ]);
        }
    }

    private function isExpoPushToken(string $token): bool
    {
        return str_starts_with($token, 'ExponentPushToken[')
            || str_starts_with($token, 'ExpoPushToken[');
    }
}
