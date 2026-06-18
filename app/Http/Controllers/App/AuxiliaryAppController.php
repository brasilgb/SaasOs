<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AuxiliaryAppController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('auxiliary-apps.access');

        $apps = collect([
            [
                'name' => 'Vetor Imagem',
                'filename' => 'vetor-imagem.apk',
                'description' => 'Aplicativo para localizar ordens de serviço e enviar imagens diretamente para o VetorOS.',
            ],
            [
                'name' => 'Vetor Atendimento',
                'filename' => 'vetor-atendimento.apk',
                'description' => 'Aplicativo para pré-cadastro de clientes e consulta de orçamentos.',
            ],
            [
                'name' => 'Vetor Técnico',
                'filename' => 'vetor-tecnico.apk',
                'description' => 'Aplicativo destinado aos técnicos para consultar e executar os atendimentos atribuídos.',
            ],
        ])->map(function (array $app): array {
            $path = public_path('apk/'.$app['filename']);
            $available = is_file($path);

            return [
                ...$app,
                'url' => asset('apk/'.$app['filename']),
                'available' => $available,
                'size' => $available ? $this->formatFileSize((int) filesize($path)) : null,
            ];
        });

        return Inertia::render('app/auxiliary-apps/index', [
            'apps' => $apps,
        ]);
    }

    private function formatFileSize(int $bytes): string
    {
        if ($bytes >= 1024 * 1024) {
            return number_format($bytes / (1024 * 1024), 1, ',', '.').' MB';
        }

        return number_format($bytes / 1024, 1, ',', '.').' KB';
    }
}
