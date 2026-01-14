import { Injectable, Logger } from "@nestjs/common";
import TelegramBot from "node-telegram-bot-api";

/**
 * Servicio de notificaciones usando Telegram Bot API (GRATUITO)
 *
 * CONFIGURACIÓN:
 * 1. Hablar con @BotFather en Telegram
 * 2. Crear nuevo bot: /newbot
 * 3. Copiar el token y agregarlo en .env como TELEGRAM_BOT_TOKEN
 * 4. Los padres deben iniciar chat con el bot y vincular su cuenta
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private bot: TelegramBot | null = null;
  private readonly enabled: boolean;

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (token) {
      try {
        this.bot = new TelegramBot(token, { polling: false });
        this.enabled = true;
        this.logger.log("✅ Telegram Bot inicializado correctamente");
      } catch (error) {
        this.logger.error("❌ Error al inicializar Telegram Bot:", error);
        this.enabled = false;
      }
    } else {
      this.logger.warn(
        "⚠️ TELEGRAM_BOT_TOKEN no configurado - notificaciones deshabilitadas"
      );
      this.enabled = false;
    }
  }

  /**
   * Enviar notificación de retiro completado al padre
   */
  async notifyWithdrawalCompleted(
    telegramChatId: string | null,
    childName: string,
    pickerName: string,
    pickerRelationship: string,
    completionTime: Date
  ): Promise<boolean> {
    if (!this.enabled || !this.bot) {
      this.logger.warn("Notificaciones Telegram deshabilitadas");
      return false;
    }

    if (!telegramChatId) {
      this.logger.warn(`Padre no tiene Telegram Chat ID configurado`);
      return false;
    }

    try {
      const timeStr = completionTime.toLocaleString("es-ES", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "America/Mexico_City",
      });

      const message = `
🎒 *SafePick - Retiro Completado*

✅ Su hijo/a *${childName}* ha sido retirado exitosamente.

👤 *Recogido por:*
   Nombre: ${pickerName}
   Relación: ${pickerRelationship}

🕐 *Hora de retiro:*
   ${timeStr}

🔒 *Verificación:* QR validado por guardia de seguridad

_SafePick - Colegio Seguro_
      `.trim();

      await this.bot.sendMessage(telegramChatId, message, {
        parse_mode: "Markdown",
      });

      this.logger.log(
        `✅ Notificación enviada a Telegram chat ID: ${telegramChatId}`
      );
      return true;
    } catch (error) {
      this.logger.error(`❌ Error al enviar notificación Telegram:`, error);
      return false;
    }
  }

  /**
   * Enviar notificación de orden creada con credenciales
   */
  async notifyOrderCreated(
    telegramChatId: string | null,
    childName: string,
    pickerName: string,
    pickerCedula: string,
    temporaryCode: string,
    expiresAt: Date
  ): Promise<boolean> {
    if (!this.enabled || !this.bot || !telegramChatId) {
      return false;
    }

    try {
      const expiryStr = expiresAt.toLocaleString("es-ES", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "America/Mexico_City",
      });

      const message = `
🎒 *SafePick - Nueva Orden de Retiro*

✅ Orden creada para: *${childName}*

👤 *Persona autorizada:*
   Nombre: ${pickerName}
   Cédula: ${pickerCedula}

🔐 *Credenciales temporales:*
   Código: \`${temporaryCode}\`
   Expira: ${expiryStr}

⚠️ Comparta estas credenciales SOLO con ${pickerName}

_SafePick - Colegio Seguro_
      `.trim();

      await this.bot.sendMessage(telegramChatId, message, {
        parse_mode: "Markdown",
      });

      this.logger.log(`✅ Notificación de orden creada enviada`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Error al enviar notificación de orden:`, error);
      return false;
    }
  }

  /**
   * Enviar notificación de orden cancelada
   */
  async notifyOrderCancelled(
    telegramChatId: string | null,
    childName: string,
    reason?: string
  ): Promise<boolean> {
    if (!this.enabled || !this.bot || !telegramChatId) {
      return false;
    }

    try {
      const message = `
🚫 *SafePick - Orden Cancelada*

❌ La orden de retiro para *${childName}* ha sido cancelada.

${reason ? `Motivo: ${reason}` : ""}

_SafePick - Colegio Seguro_
      `.trim();

      await this.bot.sendMessage(telegramChatId, message, {
        parse_mode: "Markdown",
      });

      this.logger.log(`✅ Notificación de cancelación enviada`);
      return true;
    } catch (error) {
      this.logger.error(
        `❌ Error al enviar notificación de cancelación:`,
        error
      );
      return false;
    }
  }

  /**
   * Verificar si el servicio está habilitado
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Obtener información del bot
   */
  async getBotInfo() {
    if (!this.bot || !this.enabled) {
      return null;
    }

    try {
      return await this.bot.getMe();
    } catch (error) {
      this.logger.error("Error al obtener info del bot:", error);
      return null;
    }
  }
}
