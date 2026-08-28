<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\HelpTopicImportRequest;
use App\Models\Admin\HelpTopic;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class HelpTopicController extends Controller
{
    /**
     * Caminho do JSON gerado por `php artisan vetoros:export-manual` a partir do manual HTML.
     */
    private const MANUAL_JSON_PATH = 'documentation/doc-vetoros.json';

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->search;

        $query = HelpTopic::orderBy('category')->orderBy('position')->orderBy('title');

        if ($search) {
            $query->where(function ($inner) use ($search) {
                $inner->where('title', 'like', '%'.$search.'%')
                    ->orWhere('slug', 'like', '%'.$search.'%');
            });
        }

        $topics = $query->paginate(15);

        return Inertia::render('admin/help-topics/index', ['topics' => $topics]);
    }

    /**
     * Importa os tópicos do manual a partir do JSON já publicado em public/documentation
     * (gerado via `php artisan vetoros:export-manual`). O arquivo é a fonte da verdade:
     * tópicos ausentes dele são removidos da tabela.
     */
    public function import(): RedirectResponse
    {
        $path = public_path(self::MANUAL_JSON_PATH);

        if (! is_file($path)) {
            return redirect()->route('admin.help-topics.index')->with(
                'import_error',
                'Arquivo doc-vetoros.json não encontrado. Rode "php artisan vetoros:export-manual" após atualizar o manual.'
            );
        }

        $data = json_decode((string) file_get_contents($path), true);

        if (! is_array($data)) {
            return redirect()->route('admin.help-topics.index')->with(
                'import_error',
                'O arquivo doc-vetoros.json não contém um JSON válido.'
            );
        }

        $validator = Validator::make($data, (new HelpTopicImportRequest())->rules());

        if ($validator->fails()) {
            return redirect()->route('admin.help-topics.index')->with(
                'import_error',
                $validator->errors()->first()
            );
        }

        $topics = collect($validator->validated()['topics']);

        $created = 0;
        $updated = 0;
        $removed = 0;

        DB::transaction(function () use ($topics, &$created, &$updated, &$removed) {
            $existingSlugs = HelpTopic::whereIn('slug', $topics->pluck('slug'))->pluck('slug')->flip();

            foreach ($topics as $topic) {
                HelpTopic::updateOrCreate(
                    ['slug' => $topic['slug']],
                    [
                        'title' => $topic['title'],
                        'content' => $topic['content'],
                        'category' => $topic['category'] ?? null,
                        'position' => $topic['position'] ?? 0,
                    ]
                );

                $existingSlugs->has($topic['slug']) ? $updated++ : $created++;
            }

            $removed = HelpTopic::whereNotIn('slug', $topics->pluck('slug'))->delete();
        });

        return redirect()->route('admin.help-topics.index')->with(
            'import_success',
            "Manual importado: {$created} criado(s), {$updated} atualizado(s), {$removed} removido(s)."
        );
    }
}
