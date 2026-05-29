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

class OrderStatusUpdatedMail extends Mailable
{
    use AppliesTenantMailConfig, Queueable, SerializesModels;

    public Order $order;

    public string $statusLabel;

    public ?string $note;
    public ?string $logoUrl;
    public ?int $tenantId;

    public function __construct(Order $order, string $statusLabel, ?string $note = null)
    {
        $this->order = $order;
        $this->statusLabel = $statusLabel;
        $this->note = $note;
        $this->tenantId = $order->tenant_id ? (int) $order->tenant_id : null;
        $this->logoUrl = $this->resolveLogoUrl();
    }

    public function envelope(): Envelope
    {
        $this->applyTenantMailConfig($this->tenantId);

        return new Envelope(
            subject: 'Atualização da sua ordem #'.$this->order->order_number,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order-status-updated',
            with: [
                'order' => $this->order,
                'statusLabel' => $this->statusLabel,
                'note' => $this->note,
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
