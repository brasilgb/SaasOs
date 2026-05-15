<?php

namespace App\Services;

use App\Mail\SubscriptionInvoicePaidMail;
use App\Models\Admin\AdminFiscalDocument;
use App\Models\Admin\Plan;
use App\Models\App\Payment;
use App\Models\Tenant;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class SubscriptionInvoiceService
{
    public function __construct(private readonly AdminFocusNfeService $adminFocusNfeService) {}

    public function sendPaidInvoice(Payment $payment, Tenant $tenant, Plan $plan): void
    {
        $payment->refresh();

        if ($payment->invoice_email_sent_at) {
            return;
        }

        $email = trim((string) $tenant->email);
        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $payment->update([
                'invoice_email' => $email ?: null,
                'invoice_email_error' => 'E-mail do tenant inválido para envio da fatura.',
            ]);

            return;
        }

        $fiscalDocument = $this->resolveFiscalDocument($payment, $tenant, $plan);

        try {
            Mail::to($email)->send(new SubscriptionInvoicePaidMail($tenant, $plan, $payment->fresh(), $fiscalDocument));

            $payment->update([
                'invoice_email' => $email,
                'invoice_email_sent_at' => now(),
                'invoice_email_error' => null,
            ]);
        } catch (\Throwable $exception) {
            $payment->update([
                'invoice_email' => $email,
                'invoice_email_error' => Str::limit($exception->getMessage(), 2000, ''),
            ]);

            Log::error('Falha ao enviar fatura paga da assinatura.', [
                'payment_id' => $payment->payment_id,
                'tenant_id' => $tenant->id,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    private function resolveFiscalDocument(Payment $payment, Tenant $tenant, Plan $plan): ?AdminFiscalDocument
    {
        if ($payment->admin_fiscal_document_id) {
            return AdminFiscalDocument::query()->find($payment->admin_fiscal_document_id);
        }

        try {
            $document = $this->adminFocusNfeService->issueTenantSubscriptionNfse(
                $tenant->loadMissing('plan'),
                (float) $payment->amount,
                'Assinatura SigmaOS - '.$plan->name,
                $payment
            );

            $payment->update([
                'admin_fiscal_document_id' => $document->id,
            ]);

            return $document;
        } catch (\Throwable $exception) {
            Log::warning('Fatura paga enviada sem NFS-e SaaS emitida.', [
                'payment_id' => $payment->payment_id,
                'tenant_id' => $tenant->id,
                'error' => $exception->getMessage(),
            ]);

            return null;
        }
    }
}
