package tn.esprit.matchy_sub.services;

import jakarta.mail.internet.MimeMessage;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import tn.esprit.matchy_sub.entities.Payment;
import tn.esprit.matchy_sub.entities.Subscription;

import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
@AllArgsConstructor
@Slf4j
public class EmailService {
    private final JavaMailSender mailSender;
    private final String supportEmail = "support@matchy.tn";
    private final String frontendUrl = "http://localhost:4200";

    // ─── Payment Received (PENDING) ───────────────────────────────────────────
    public void sendPaymentReceivedEmail(Payment payment) {
        try {
            Subscription subscription = payment.getSubscription();
            if (subscription == null || payment.getUserId() == null) {
                log.warn("sendPaymentReceivedEmail: missing subscription or userId");
                return;
            }
            // TODO: Fetch user email from User microservice using payment.getUserId()
            // For now, we'll skip email if we don't have the email
            String userEmail = getUserEmailFromMicroservice(payment.getUserId());
            if (userEmail == null) {
                log.warn("sendPaymentReceivedEmail: could not fetch user email for userId: {}", payment.getUserId());
                return;
            }
            String firstName = "User";
            String subject = "⏳ Paiement reçu — En attente de confirmation | Matchy";
            sendHtmlEmail(userEmail, subject, buildPendingTemplate(payment, subscription, firstName));
        } catch (Exception e) {
            log.error("Error sending payment received email", e);
        }
    }

    // ─── Payment Approved (COMPLETED) ─────────────────────────────────────────
    public void sendPaymentApprovedEmail(Payment payment) {
        try {
            Subscription subscription = payment.getSubscription();
            if (subscription == null || payment.getUserId() == null) {
                log.warn("sendPaymentApprovedEmail: missing subscription or userId");
                return;
            }
            // TODO: Fetch user email from User microservice using payment.getUserId()
            String userEmail = getUserEmailFromMicroservice(payment.getUserId());
            if (userEmail == null) {
                log.warn("sendPaymentApprovedEmail: could not fetch user email for userId: {}", payment.getUserId());
                return;
            }
            String firstName = "User";
            String planName  = subscription.getPlan() != null ? subscription.getPlan().getName().name() : "Matchy";
            String subject   = "✅ Paiement confirmé — Votre abonnement " + planName + " est actif !";
            sendHtmlEmail(userEmail, subject, buildApprovedTemplate(payment, subscription, firstName, planName));
        } catch (Exception e) {
            log.error("Error sending payment approved email", e);
        }
    }

    // ─── Payment Rejected (FAILED) ────────────────────────────────────────────
    public void sendPaymentRejectedEmail(Payment payment, String reason) {
        try {
            Subscription subscription = payment.getSubscription();
            if (subscription == null || payment.getUserId() == null) {
                log.warn("sendPaymentRejectedEmail: missing subscription or userId");
                return;
            }
            // TODO: Fetch user email from User microservice using payment.getUserId()
            String userEmail = getUserEmailFromMicroservice(payment.getUserId());
            if (userEmail == null) {
                log.warn("sendPaymentRejectedEmail: could not fetch user email for userId: {}", payment.getUserId());
                return;
            }
            String firstName = "User";
            String planName  = subscription.getPlan() != null ? subscription.getPlan().getName().name() : "Matchy";
            String subject   = "❌ Paiement non approuvé — " + planName + " | Matchy";
            sendHtmlEmail(userEmail, subject, buildRejectedTemplate(payment, subscription, firstName, planName, reason));
        } catch (Exception e) {
            log.error("Error sending payment rejected email", e);
        }
    }

    // ─── Fetch user email from User microservice ──────────────────────────────
    private String getUserEmailFromMicroservice(Long userId) {
        try {
            // TODO: Implement HTTP call to User microservice
            // Example: GET http://user-service:8080/users/{userId}
            // For now, return null to indicate not implemented
            log.warn("getUserEmailFromMicroservice: not yet implemented for userId: {}", userId);
            return null;
        } catch (Exception e) {
            log.error("Error fetching user email from microservice", e);
            return null;
        }
    }
    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setFrom("Matchy <" + supportEmail + ">");
            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("✅ Email sent to: {}", to);
        } catch (Exception e) {
            log.error("❌ Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    // ─── Shared helpers ───────────────────────────────────────────────────────
    private String formatDate(java.time.LocalDateTime dt) {
        if (dt == null) return "—";
        return dt.format(DateTimeFormatter.ofPattern("MMMM dd, yyyy", Locale.ENGLISH));
    }

    private String formatAmount(double amount, String currency) {
        return String.format("%.2f %s", amount, currency != null ? currency : "TND");
    }

    private String txnRef(Payment payment) {
        return payment.getTransactionRef() != null
                ? "#" + payment.getTransactionRef()
                : "#TXN-" + payment.getId();
    }

    private String methodLabel(Payment payment) {
        if (payment.getMethod() == null) return "Bank Transfer";
        return switch (payment.getMethod().name().toUpperCase()) {
            case "CARD"          -> "Visa / Mastercard";
            case "BANK_TRANSFER" -> "Virement bancaire";
            case "MOBILE"        -> "Paiement mobile";
            case "PAYPAL"        -> "PayPal";
            default              -> payment.getMethod().name();
        };
    }

    // ─── Shared CSS / wrapper ─────────────────────────────────────────────────
    private String wrapEmail(String headerColor, String headerContent, String bodyContent) {
        return """
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8"/>
          <meta name="viewport" content="width=device-width,initial-scale=1"/>
          <style>
            @keyframes fadeInDown {
              from { opacity:0; transform:translateY(-20px); }
              to   { opacity:1; transform:translateY(0); }
            }
            @keyframes scaleIn {
              from { opacity:0; transform:scale(0.5); }
              to   { opacity:1; transform:scale(1); }
            }
            @keyframes fadeIn {
              from { opacity:0; }
              to   { opacity:1; }
            }
            body { margin:0; padding:0; background:#f4f4f4;
                   font-family:'Segoe UI',Arial,sans-serif; }
            .wrapper { max-width:600px; margin:32px auto; background:#ffffff;
                       border-radius:8px; overflow:hidden;
                       box-shadow:0 4px 24px rgba(0,0,0,0.10); }
            .header  { background:%s; padding:40px 32px 32px;
                       text-align:center;
                       animation:fadeInDown 0.6s ease both; }
            .check-circle {
              width:72px; height:72px; border-radius:50%;
              border:3px solid rgba(255,255,255,0.7);
              display:inline-flex; align-items:center; justify-content:center;
              margin-bottom:16px;
              animation:scaleIn 0.5s ease 0.2s both;
            }
            .check-circle svg { width:36px; height:36px; }
            .header h1 { color:#fff; margin:0 0 6px; font-size:26px; font-weight:700; }
            .header p  { color:rgba(255,255,255,0.85); margin:0; font-size:14px; }
            .body { padding:32px; animation:fadeIn 0.6s ease 0.3s both; }
            .greeting { font-size:15px; color:#333; margin-bottom:24px; }
            .divider  { border:none; border-top:1px solid #e8e8e8; margin:20px 0; }
            .amount-label { font-size:11px; font-weight:700; color:#888;
                            letter-spacing:1px; text-transform:uppercase; }
            .amount-value { font-size:36px; font-weight:700; color:%s;
                            margin:4px 0 24px; }
            .details-table { width:100%%; border-collapse:collapse; }
            .details-table tr td { padding:10px 0; font-size:14px;
                                   border-bottom:1px solid #f0f0f0; }
            .details-table tr:last-child td { border-bottom:none; }
            .details-table .label { color:#666; }
            .details-table .value { text-align:right; color:#222; font-weight:500; }
            .status-paid   { color:#2e7d5e; font-weight:700; }
            .status-pending{ color:#d97706; font-weight:700; }
            .status-failed { color:#dc2626; font-weight:700; }
            .btn { display:block; width:100%%; box-sizing:border-box;
                   background:%s; color:#fff; text-align:center;
                   padding:16px; border-radius:6px; text-decoration:none;
                   font-size:16px; font-weight:700; margin-top:28px;
                   letter-spacing:0.5px; }
            .footer { text-align:center; padding:20px 32px 28px;
                      font-size:12px; color:#aaa; }
            .footer a { color:#aaa; text-decoration:underline; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="header">
              %s
            </div>
            <div class="body">
              %s
            </div>
            <div class="footer">
              Questions? Contact us at <a href="mailto:%s">%s</a><br/>
              &copy; 2026 Matchy Inc. &nbsp;·&nbsp; <a href="#">Unsubscribe</a>
            </div>
          </div>
        </body>
        </html>
        """.formatted(headerColor, headerColor, headerColor, headerContent, bodyContent, supportEmail, supportEmail);
    }

    // ─── APPROVED template ────────────────────────────────────────────────────
    private String buildApprovedTemplate(Payment payment, Subscription sub,
                                          String firstName, String planName) {
        String header = """
            <div class="check-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"
                   stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h1>Payment Confirmed!</h1>
            <p>Your transaction has been processed successfully</p>
            """;

        String endDate   = sub.getEndDate()   != null ? formatDate(sub.getEndDate())   : "—";
        String startDate = sub.getStartDate() != null ? formatDate(sub.getStartDate()) : "—";

        String body = """
            <p class="greeting">Hi <strong>%s</strong>, thank you for your payment.
            Here's your transaction summary:</p>
            <hr class="divider"/>
            <div class="amount-label">AMOUNT PAID</div>
            <div class="amount-value">%s</div>
            <table class="details-table">
              <tr>
                <td class="label">Plan</td>
                <td class="value">%s</td>
              </tr>
              <tr>
                <td class="label">Transaction ID</td>
                <td class="value">%s</td>
              </tr>
              <tr>
                <td class="label">Date</td>
                <td class="value">%s</td>
              </tr>
              <tr>
                <td class="label">Payment method</td>
                <td class="value">%s</td>
              </tr>
              <tr>
                <td class="label">Subscription valid until</td>
                <td class="value">%s</td>
              </tr>
              <tr>
                <td class="label">Status</td>
                <td class="value status-paid">Paid ✓</td>
              </tr>
            </table>
            <a href="%s/my-subscription" class="btn">View Receipt</a>
            """.formatted(
                firstName,
                formatAmount(payment.getAmount(), payment.getCurrency()),
                planName,
                txnRef(payment),
                formatDate(payment.getApprovedAt()),
                methodLabel(payment),
                endDate,
                frontendUrl
        );

        return wrapEmail("#2e7d5e", header, body);
    }

    // ─── PENDING template ─────────────────────────────────────────────────────
    private String buildPendingTemplate(Payment payment, Subscription sub,
                                         String firstName) {
        String planName = sub.getPlan() != null ? sub.getPlan().getName().name() : "Matchy";

        String header = """
            <div class="check-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"
                   stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h1>Payment Received!</h1>
            <p>Your payment is under review — we'll confirm within 24h</p>
            """;

        String body = """
            <p class="greeting">Hi <strong>%s</strong>, we've received your payment.
            Here's your transaction summary:</p>
            <hr class="divider"/>
            <div class="amount-label">AMOUNT SUBMITTED</div>
            <div class="amount-value">%s</div>
            <table class="details-table">
              <tr>
                <td class="label">Plan</td>
                <td class="value">%s</td>
              </tr>
              <tr>
                <td class="label">Transaction ID</td>
                <td class="value">%s</td>
              </tr>
              <tr>
                <td class="label">Date</td>
                <td class="value">%s</td>
              </tr>
              <tr>
                <td class="label">Payment method</td>
                <td class="value">%s</td>
              </tr>
              <tr>
                <td class="label">Status</td>
                <td class="value status-pending">Pending review ⏳</td>
              </tr>
            </table>
            <a href="%s/my-subscription" class="btn">View My Subscription</a>
            """.formatted(
                firstName,
                formatAmount(payment.getAmount(), payment.getCurrency()),
                planName,
                txnRef(payment),
                formatDate(payment.getTransactionDate()),
                methodLabel(payment),
                frontendUrl
        );

        return wrapEmail("#d97706", header, body);
    }

    // ─── REJECTED template ────────────────────────────────────────────────────
    private String buildRejectedTemplate(Payment payment, Subscription sub,
                                          String firstName, String planName, String reason) {
        String header = """
            <div class="check-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"
                   stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </div>
            <h1>Payment Not Approved</h1>
            <p>Unfortunately we could not validate your payment</p>
            """;

        String body = """
            <p class="greeting">Hi <strong>%s</strong>, your payment could not be approved.
            Here's the summary:</p>
            <hr class="divider"/>
            <div class="amount-label">AMOUNT</div>
            <div class="amount-value">%s</div>
            <table class="details-table">
              <tr>
                <td class="label">Plan</td>
                <td class="value">%s</td>
              </tr>
              <tr>
                <td class="label">Transaction ID</td>
                <td class="value">%s</td>
              </tr>
              <tr>
                <td class="label">Date</td>
                <td class="value">%s</td>
              </tr>
              <tr>
                <td class="label">Payment method</td>
                <td class="value">%s</td>
              </tr>
              <tr>
                <td class="label">Reason</td>
                <td class="value" style="color:#dc2626;">%s</td>
              </tr>
              <tr>
                <td class="label">Status</td>
                <td class="value status-failed">Not approved ✗</td>
              </tr>
            </table>
            <a href="%s/subscription-payment" class="btn" style="background:#dc2626;">Retry Payment</a>
            """.formatted(
                firstName,
                formatAmount(payment.getAmount(), payment.getCurrency()),
                planName,
                txnRef(payment),
                formatDate(payment.getTransactionDate()),
                methodLabel(payment),
                reason != null ? reason : "Contact support for details",
                frontendUrl
        );

        return wrapEmail("#dc2626", header, body);
    }
}
