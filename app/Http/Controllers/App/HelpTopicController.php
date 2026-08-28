<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\Admin\HelpTopic;
use Illuminate\Http\JsonResponse;

class HelpTopicController extends Controller
{
    /**
     * Lista leve (sem conteúdo) usada para alimentar a busca com autocomplete.
     */
    public function index(): JsonResponse
    {
        $topics = HelpTopic::query()
            ->select(['id', 'slug', 'title', 'category'])
            ->orderBy('category')
            ->orderBy('position')
            ->orderBy('title')
            ->get();

        return response()->json($topics);
    }

    /**
     * Conteúdo completo de um tópico, buscado sob demanda ao selecionar um resultado.
     */
    public function show(string $slug): JsonResponse
    {
        $topic = HelpTopic::query()
            ->select(['title', 'content'])
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json($topic);
    }
}
