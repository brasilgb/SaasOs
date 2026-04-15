<?php

namespace App\Mail;

use App\Mail\Concerns\AppliesTenantMailConfig;
use App\Models\App\Company;
use App\Models\App\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderBudgetFollowUpMail extends Mailable
{
    use AppliesTenantMailConfig, Queueable, SerializesModels;

    public Order $order;

    public int $daysPending;

    public ?string $logoUrl;

    public ?int $tenantId;

    public function __construct(Order $order, int $daysPending)
    {
        $this->order = $order;
        $this->daysPending = $daysPending;
        $this->tenantId = $order->tenant_id ? (int) $order->tenant_id : null;
        $this->logoUrl = $this->resolveLogoUrl($order);
    }

    public function envelope(): Envelope
    {
        $this->applyTenantMailConfig($this->tenantId);

        return new Envelope(
            subject: 'Lembrete de orçamento da ordem #'.$this->order->order_number,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order-budget-follow-up',
            with: [
                'order' => $this->order,
                'daysPending' => $this->daysPending,
                'logoUrl' => $this->logoUrl,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }

    private function resolveLogoUrl(Order $order): ?string
    {
        $companyLogo = Company::query()
            ->where('tenant_id', $order->tenant_id)
            ->value('logo');

        if (! empty($companyLogo) && file_exists(public_path('storage/logos/'.$companyLogo))) {
            return asset('storage/logos/'.$companyLogo);
        }

        return null;
    }
}
