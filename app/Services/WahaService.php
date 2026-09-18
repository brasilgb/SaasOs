<?php

namespace App\Services;

use App\Exceptions\WhatsAppException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Adapter fino sobre a REST API do WAHA (https://waha.devlike.pro/).
 *
 * Não conhece tenant, conexão local ou templates — apenas fala HTTP com o
 * WAHA usando o nome de sessão que o chamador (WhatsAppService) fornecer.
 * Nunca deve ser chamado diretamente por controllers/jobs.
 */
class WahaService
{
    private function client(): PendingRequest
    {
        $baseUrl = config('services.waha.base_url');

        if (! $baseUrl) {
            throw WhatsAppException::unavailable();
        }

        $client = Http::baseUrl(rtrim($baseUrl, '/'))
            ->timeout(15)
            ->acceptJson();

        $apiKey = config('services.waha.api_key');

        return $apiKey ? $client->withHeaders(['X-Api-Key' => $apiKey]) : $client;
    }

    /**
     * Cria (ou reinicia) uma sessão WAHA para o identificador informado.
     */
    public function createSession(string $sessionName): array
    {
        return $this->request(fn (PendingRequest $client) => $client->post('/api/sessions', [
            'name' => $sessionName,
            'start' => true,
            'config' => [
                'webhooks' => array_values(array_filter([$this->webhookConfig()])),
            ],
        ]));
    }

    public function getSessionStatus(string $sessionName): array
    {
        return $this->request(fn (PendingRequest $client) => $client->get("/api/sessions/{$sessionName}"));
    }

    /**
     * Retorna o QR Code atual da sessão como imagem PNG (bytes brutos) para
     * ser embutido diretamente numa tag <img> (data URI) no frontend.
     */
    public function getQrCodeImage(string $sessionName): string
    {
        $baseUrl = config('services.waha.base_url');

        if (! $baseUrl) {
            throw WhatsAppException::unavailable();
        }

        try {
            $response = $this->client()->get("/api/{$sessionName}/auth/qr", ['format' => 'image']);
        } catch (\Throwable $exception) {
            Log::warning('Falha ao buscar QR Code do WAHA.', ['session' => $sessionName, 'error' => $exception->getMessage()]);

            throw WhatsAppException::unavailable();
        }

        if (! $response->successful()) {
            Log::warning('WAHA retornou erro ao buscar QR Code.', [
                'session' => $sessionName,
                'status' => $response->status(),
            ]);

            throw WhatsAppException::unavailable();
        }

        return $response->body();
    }

    public function stopSession(string $sessionName): void
    {
        $this->request(fn (PendingRequest $client) => $client->post("/api/sessions/{$sessionName}/stop"));
    }

    public function logoutSession(string $sessionName): void
    {
        $this->request(fn (PendingRequest $client) => $client->post("/api/sessions/{$sessionName}/logout"));
    }

    /**
     * @param  string  $chatId  Telefone já normalizado no padrão E.164 sem "+" (ex.: 5551999999999).
     */
    public function sendText(string $sessionName, string $chatId, string $text): array
    {
        return $this->request(fn (PendingRequest $client) => $client->post('/api/sendText', [
            'session' => $sessionName,
            'chatId' => "{$chatId}@c.us",
            'text' => $text,
        ]));
    }

    public function sendFile(string $sessionName, string $chatId, string $url, ?string $filename = null, ?string $caption = null): array
    {
        return $this->request(fn (PendingRequest $client) => $client->post('/api/sendFile', [
            'session' => $sessionName,
            'chatId' => "{$chatId}@c.us",
            'file' => array_filter([
                'url' => $url,
                'filename' => $filename,
            ]),
            'caption' => $caption,
        ]));
    }

    private function webhookConfig(): ?array
    {
        $url = config('services.waha.webhook_url');

        if (! $url) {
            return null;
        }

        return [
            'url' => $url,
            'events' => ['session.status', 'message'],
        ];
    }

    /**
     * @param  \Closure(PendingRequest): \Illuminate\Http\Client\Response  $callback
     */
    private function request(\Closure $callback): array
    {
        try {
            $response = $callback($this->client());
        } catch (\Throwable $exception) {
            Log::warning('Falha de comunicação com o WAHA.', ['error' => $exception->getMessage()]);

            throw WhatsAppException::unavailable();
        }

        if (! $response->successful()) {
            Log::warning('WAHA retornou erro.', [
                'status' => $response->status(),
                'body' => $response->json() ?? $response->body(),
            ]);

            throw WhatsAppException::unavailable();
        }

        return $response->json() ?? [];
    }
}
