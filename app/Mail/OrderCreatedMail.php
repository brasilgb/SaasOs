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

class OrderCreatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public Order $order;
    public ?string $logoUrl;

    public function __construct(Order $order)
    {
        $this->order = $order;
        $this->logoUrl = $this->resolveLogoUrl($order);
    }

    public function envelope(): Envelope
    {
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
