import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { Env } from "../config/env.validation.js";

type BrevoPayload = {
  htmlContent: string;
  sender: {
    email: string;
    name: string;
  };
  subject: string;
  to: Array<{
    email: string;
    name?: string;
  }>;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService<Env, true>) {}

  async sendEmailVerification(input: { email: string; name: string; token: string }) {
    const verifyUrl = this.webUrl(`/verificar-email?token=${encodeURIComponent(input.token)}`);

    await this.send({
      htmlContent: this.layout({
        body: `
          <p>Ola, ${input.name}.</p>
          <p>Recebemos seu cadastro no BioConecta. Confirme seu e-mail para liberar cadastro de perfil, candidaturas, vagas e demais acoes da plataforma.</p>
          <p style="margin: 28px 0;">
            <a href="${verifyUrl}" style="${buttonStyle}">Verificar e-mail</a>
          </p>
          <p>Se o botao nao funcionar, acesse este link:</p>
          <p style="word-break: break-all; color: #0e7490;">${verifyUrl}</p>
          <p style="margin-top:24px;font-size:13px;color:#64748b;">Por seguranca, ignore este e-mail se voce nao criou uma conta no BioConecta.</p>
        `,
        title: "Confirme seu e-mail",
      }),
      subject: "Confirme seu e-mail no BioConecta",
      to: [{ email: input.email, name: input.name }],
    });
  }

  async sendPasswordReset(input: { email: string; name: string; token: string }) {
    const resetUrl = this.webUrl(`/redefinir-senha?token=${encodeURIComponent(input.token)}`);

    await this.send({
      htmlContent: this.layout({
        body: `
          <p>Ola, ${input.name}.</p>
          <p>Recebemos uma solicitacao para redefinir a senha da sua conta no BioConecta.</p>
          <p>Use o botao abaixo para criar uma nova senha. O link expira em breve por seguranca.</p>
          <p style="margin: 28px 0;">
            <a href="${resetUrl}" style="${buttonStyle}">Redefinir senha</a>
          </p>
          <p>Se o botao nao funcionar, acesse este link:</p>
          <p style="word-break: break-all; color: #0e7490;">${resetUrl}</p>
          <p style="margin-top:24px;font-size:13px;color:#64748b;">Se voce nao pediu isso, nenhuma acao e necessaria.</p>
        `,
        title: "Redefinicao de senha",
      }),
      subject: "Redefina sua senha no BioConecta",
      to: [{ email: input.email, name: input.name }],
    });
  }

  private async send(input: Omit<BrevoPayload, "sender">) {
    const apiKey = this.configService.get("BREVO_API_KEY", { infer: true });
    const fromEmail = this.configService.get("MAIL_FROM_EMAIL", { infer: true });
    const fromName = this.configService.get("MAIL_FROM_NAME", { infer: true });

    if (!apiKey || !fromEmail) {
      this.logger.warn("Brevo nao configurado. E-mail nao enviado.");
      return;
    }

    const payload: BrevoPayload = {
      ...input,
      sender: {
        email: fromEmail,
        name: fromName,
      },
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      body: JSON.stringify(payload),
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      this.logger.error(`Falha ao enviar e-mail pela Brevo: ${response.status} ${body}`);
      throw new Error("Falha ao enviar e-mail.");
    }
  }

  private layout(input: { body: string; title: string }) {
    return `
      <div style="margin:0;padding:0;background:#eef7f3;font-family:Arial,sans-serif;color:#0f172a;">
        <div style="max-width:620px;margin:0 auto;padding:32px 20px;">
          <div style="background:#ffffff;border:1px solid #cbe2db;border-radius:8px;overflow:hidden;">
            <div style="background:#0f3d3e;padding:18px 28px;">
              <p style="margin:0;color:#d7fbfd;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;">BioConecta</p>
            </div>
            <div style="padding:28px;">
            <h1 style="margin:0 0 18px;font-size:28px;line-height:1.2;color:#0f172a;">${input.title}</h1>
            <div style="font-size:16px;line-height:1.6;color:#334155;">${input.body}</div>
            </div>
          </div>
          <p style="margin:16px 0 0;text-align:center;font-size:12px;color:#64748b;">BioConecta - Plataforma profissional para a Biologia no Brasil.</p>
        </div>
      </div>
    `;
  }

  private webUrl(path: string) {
    const baseUrl = this.configService.get("APP_WEB_URL", { infer: true }).replace(/\/$/, "");
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    return `${baseUrl}${normalizedPath}`;
  }
}

const buttonStyle =
  "display:inline-block;background:#22d3ee;color:#101820;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:8px;";
