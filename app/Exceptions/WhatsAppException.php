<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Erro funcional de integração com o WhatsApp (via WAHA).
 *
 * A mensagem desta exceção é sempre segura para exibir ao usuário final
 * (nunca contém detalhes técnicos da requisição HTTP subjacente).
 */
class WhatsAppException extends RuntimeException
{
    public static function notConnected(): self
    {
        return new self('O WhatsApp desta empresa está desconectado. Reconecte-o nas configurações.');
    }

    public static function unavailable(): self
    {
        return new self('Serviço de WhatsApp temporariamente indisponível. Tente novamente em instantes.');
    }

    public static function invalidPhone(): self
    {
        return new self('Número de WhatsApp inválido.');
    }

    public static function notOnWhatsapp(): self
    {
        return new self('Este número não possui WhatsApp ativo. Confira o número e tente novamente.');
    }

    public static function sendFailed(): self
    {
        return new self('Falha ao enviar a mensagem pelo WhatsApp. Tente novamente.');
    }
}
