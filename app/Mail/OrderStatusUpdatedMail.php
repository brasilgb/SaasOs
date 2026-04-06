<?php

namespace App\Mail;

use App\Models\App\Company;
use App\Models\App\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderStatusUpdatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public Order $order;

    public string $statusLabel;

    public ?string $note;
    public ?string $logoUrl;

    public function __construct(Order $order, string $statusLabel, ?string $note = null)
    {
        $this->order = $order;
        $this->statusLabel = $statusLabel;
        $this->note = $note;
        $this->logoUrl = $this->resolveLogoUrl($order);
    }

    public function envelope(): Envelope
    {
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

    private function resolveLogoUrl(Order $order): ?string
    {
        $companyLogo = Company::query()
            ->where('tenant_id', $order->tenant_id)
            ->value('logo');

        if (!empty($companyLogo) && file_exists(public_path('storage/logos/'.$companyLogo))) {
            return asset('storage/logos/'.$companyLogo);
        }

        return null;
    }
}
