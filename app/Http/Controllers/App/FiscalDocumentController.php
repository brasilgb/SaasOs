<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\App\FiscalDocument;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class FiscalDocumentController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('fiscal-documents.access');

        $documents = FiscalDocument::query()
            ->latest()
            ->limit(20)
            ->get([
                'id',
                'documentable_type',
                'documentable_id',
                'type',
                'provider',
                'number',
                'status',
                'pdf_url',
                'xml_url',
                'issued_at',
                'created_at',
            ]);

        return Inertia::render('app/fiscal-documents/index', ['documents' => $documents]);
    }
}
