<?php

namespace App\Mail\Transport;

use Illuminate\Support\Facades\Http;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;
use Symfony\Component\Mime\MessageConverter;

class BrevoApiTransport extends AbstractTransport
{
    protected $key;

    public function __construct(string $key)
    {
        parent::__construct();
        $this->key = $key;
    }

    protected function doSend(SentMessage $message): void
    {
        $email = MessageConverter::toEmail($message->getOriginalMessage());
        
        $payload = [
            'sender' => $this->getSender($email),
            'to' => $this->getRecipients($email),
            'subject' => $email->getSubject(),
            'htmlContent' => $email->getHtmlBody(),
            'textContent' => $email->getTextBody(),
        ];

        $response = Http::withHeaders([
            'api-key' => $this->key,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ])->post('https://api.brevo.com/v3/smtp/email', $payload);

        if ($response->failed()) {
            throw new \Exception('Brevo API Error: ' . $response->body());
        }
    }

    protected function getSender(Email $email): array
    {
        $from = $email->getFrom()[0] ?? null;
        if (!$from) return ['email' => config('mail.from.address'), 'name' => config('mail.from.name')];
        
        return [
            'email' => $from->getAddress(),
            'name' => $from->getName(),
        ];
    }

    protected function getRecipients(Email $email): array
    {
        return collect($email->getTo())->map(function (Address $address) {
            return [
                'email' => $address->getAddress(),
                'name' => $address->getName(),
            ];
        })->toArray();
    }

    public function __toString(): string
    {
        return 'brevo-api';
    }
}
