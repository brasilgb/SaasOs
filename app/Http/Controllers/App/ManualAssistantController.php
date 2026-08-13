<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Services\N8nManualAssistantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class ManualAssistantController extends Controller
{
    public function __construct(private readonly N8nManualAssistantService $manualAssistantService) {}

    /**
     * Recebe a pergunta do usuário logado e repassa ao workflow n8n do
     * assistente de manual, junto do tenant_id do usuário autenticado.
     */
    public function ask(Request $request): JsonResponse
    {
        $data = $request->validate([
            'question' => ['required', 'string', 'max:2000'],
        ]);

        try {
            $answer = $this->manualAssistantService->ask($data['question'], $request->user()->tenant_id);
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 502);
        }

        return response()->json([
            'answer' => $answer,
        ]);
    }
}
