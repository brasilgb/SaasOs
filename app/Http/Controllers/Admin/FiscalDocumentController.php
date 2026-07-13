<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin\AdminFiscalDocument;
use Inertia\Inertia;
use Inertia\Response;

class FiscalDocumentController extends Controller
{
    public function index(): Response
    {
        $documents = AdminFiscalDocument::query()
            ->with(['tenant:id,company,name,cnpj,email', 'registeredBy:id,name'])
            ->latest()
            ->paginate(15);

        return Inertia::render('admin/fiscal-documents/index', [
            'documents' => $documents,
            'settingConfigured' => false,
        ]);
    }
}
