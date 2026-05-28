<?php

namespace App\Mail;

use App\Models\Admin\AdminFiscalDocument;
use App\Models\Admin\Plan;
use App\Models\App\Payment;
use App\Models\Tenant;
use App\Support\TenantMailConfig;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SubscriptionInvoicePaidMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Tenant $tenant,
        public Plan $plan,
        public Payment $payment,
        public ?AdminFiscalDocument $fiscalDocument = null
    ) {}

    public function envelope(): Envelope
    {
        TenantMailConfig::applySystemDefault();

        return new Envelope(
            subject: 'Fatura VetorOS paga - '.$this->plan->name,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.subscription-invoice-paid',
            with: [
                'tenant' => $this->tenant,
                'plan' => $this->plan,
                'payment' => $this->payment,
                'fiscalDocument' => $this->fiscalDocument,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
