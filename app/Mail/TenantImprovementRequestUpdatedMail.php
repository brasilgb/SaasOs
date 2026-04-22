<?php

namespace App\Mail;

use App\Models\TenantImprovementRequest;
use App\Support\TenantMailConfig;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TenantImprovementRequestUpdatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public TenantImprovementRequest $requestItem,
    ) {}

    public function envelope(): Envelope
    {
        TenantMailConfig::applySystemDefault();

        return new Envelope(
            subject: 'Atualizacao da sua solicitacao no SigmaOS',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.tenant-improvement-request-updated',
            with: [
                'requestItem' => $this->requestItem,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
