<?php

namespace App\Mail;

use App\Mail\Concerns\AppliesTenantMailConfig;
use App\Models\App\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderCreatedMail extends Mailable
{
    use AppliesTenantMailConfig, Queueable, SerializesModels;

    public Order $order;
    public ?string $logoUrl;
    public ?int $tenantId;

    public function __construct(Order $order)
    {
        $this->order = $order;
        $this->tenantId = $order->tenant_id ? (int) $order->tenant_id : null;
        $this->logoUrl = $this->resolveLogoUrl();
    }

    public function envelope(): Envelope
    {
        $this->applyTenantMailConfig($this->tenantId);

        return new Envelope(
            subject: 'Ordem de serviço criada #'.$this->order->order_number,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order-created',
            with: [
                'order' => $this->order,
                'logoUrl' => $this->logoUrl,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }

    private function resolveLogoUrl(): ?string
    {
        return file_exists(public_path('images/vetor.png')) ? asset('images/vetor.png') : null;
    }
}
