import nodemailer from 'nodemailer';

/**
 * @param {{ to: string; subject: string; html: string }} opts
 */
export async function sendMail(opts) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('[email] SMTP non configuré — contenu email (simulation) :');
    console.warn(opts.subject);
    console.warn(opts.html.replace(/<[^>]+>/g, ' ').slice(0, 400));
    return { status: 'skipped', reason: 'no_smtp' };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  await transporter.sendMail({
    from: user,
    to: opts.to,
    subject: opts.subject,
    html: opts.html
  });
  return { status: 'sent' };
}

/**
 * @param {{ userEmail: string; planName: string; amount: string; currency: string; start: string; end: string; txnRef: string }} d
 */
export async function sendPaymentApprovalEmail(d) {
  const base = process.env.FRONTEND_URL || 'http://localhost:4200';
  const support = process.env.SUPPORT_EMAIL || 'support@matchy.tn';
  const subject = `✅ Votre abonnement ${d.planName} est activé !`;
  const html = `
<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#0f1117;color:#e5e7eb;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#1a1f2e;border-radius:16px;padding:28px;border:1px solid #2d3348;">
    <h1 style="color:#22c55e;font-size:22px;">Félicitations, votre paiement a été approuvé !</h1>
    <p>Détails de l'abonnement :</p>
    <ul style="line-height:1.7;">
      <li><strong>Plan</strong> : ${d.planName}</li>
      <li><strong>Montant payé</strong> : ${d.amount} ${d.currency}</li>
      <li><strong>Date de début</strong> : ${d.start}</li>
      <li><strong>Date de fin</strong> : ${d.end}</li>
      <li><strong>Référence</strong> : ${d.txnRef}</li>
    </ul>
    <p style="margin:24px 0;">
      <a href="${base}" style="display:inline-block;background:#4f6ef7;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700;">Accéder à mon espace</a>
    </p>
    <p style="font-size:13px;color:#9ca3af;">Besoin d'aide ? ${support}</p>
  </div>
</body></html>`;
  return sendMail({ to: d.userEmail, subject, html });
}

export async function sendPaymentRejectedEmail(d) {
  const support = process.env.SUPPORT_EMAIL || 'support@matchy.tn';
  const subject = `Paiement non approuvé — ${d.planName}`;
  const html = `
<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#0f1117;color:#e5e7eb;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#1a1f2e;border-radius:16px;padding:28px;border:1px solid #7f1d1d;">
    <h1 style="color:#f87171;font-size:20px;">Votre paiement n'a pas été approuvé</h1>
    <p><strong>Raison :</strong> ${d.reason}</p>
    <p>Plan concerné : ${d.planName} — Réf. ${d.txnRef}</p>
    <p style="font-size:13px;color:#9ca3af;">Contact : ${support}</p>
  </div>
</body></html>`;
  return sendMail({ to: d.userEmail, subject, html });
}
