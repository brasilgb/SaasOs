<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class N8nManualAssistantService
{
    /**
     * Envia a pergunta do usuário para o workflow n8n do assistente de manual
     * e retorna a resposta em texto. A chamada é síncrona porque o frontend
     * precisa exibir a resposta na mesma interação.
     *
     * @throws RuntimeException quando o assistente não está configurado, não responde a tempo ou retorna algo inválido.
     */
    public function ask(string $question, int $tenantId): string
    {
        $url = config('services.n8n.webhook_assistente_manual');

        if (! $url) {
            Log::warning('Assistente de manual chamado sem N8N_WEBHOOK_ASSISTENTE_MANUAL configurado.');

            throw new RuntimeException('O assistente de manual não está configurado.');
        }

        try {
            $response = Http::timeout(30)
                ->acceptJson()
                ->withHeaders([
                    'X-Internal-Secret' => config('services.n8n.webhook_secret'),
                ])
                ->post($url, [
                    'question' => $question,
                    'tenant_id' => $tenantId,
                ])
                ->throw();
        } catch (\Throwable $exception) {
            Log::warning('Falha ao consultar o assistente de manual via n8n.', [
                'tenant_id' => $tenantId,
                'error' => $exception->getMessage(),
            ]);

            throw new RuntimeException('Não foi possível obter resposta do assistente agora. Tente novamente em instantes.', previous: $exception);
        }

        $answer = $response->json('answer');

        if (! is_string($answer) || trim($answer) === '') {
            Log::warning('Assistente de manual retornou resposta vazia ou em formato inesperado.', [
                'tenant_id' => $tenantId,
            ]);

            throw new RuntimeException('O assistente não retornou uma resposta válida.');
        }

        return $answer;
    }
}
