package com.matchy.service;

import com.matchy.entity.User;
import com.matchy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;
import java.util.List;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private UserRepository userRepository;

    @Value("${spring.mail.username}")
    private String fromEmail;

    // ─────────────────────────────────────────────────────────────
    // CORE HELPER
    // ─────────────────────────────────────────────────────────────
    private void sendEmail(String to, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
            System.out.println("Email sent to " + to + " — " + subject);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
        }
    }

    private void sendPlainTextEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            System.out.println("Plain text email sent to " + to + " — " + subject);
        } catch (Exception e) {
            System.err.println("Failed to send plain text email to " + to + ": " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────
    // HTML BUILDER
    // ─────────────────────────────────────────────────────────────
    private String buildEmail(String badgeText, String badgeColor, String headline, String bodyContent, String ctaText, String ctaUrl) {
        String cta = ctaText != null
            ? "<div class='cta-wrapper'><a href='" + ctaUrl + "' class='cta-btn'>" + ctaText + " &rarr;</a></div>"
            : "";
        return "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'>" +
            "<style>" +
            "*{margin:0;padding:0;box-sizing:border-box;}" +
            "body{background:#0f0c29;font-family:'Segoe UI',Helvetica,Arial,sans-serif;}" +
            ".outer{padding:40px 16px;}" +
            ".card{max-width:580px;margin:0 auto;background:#1a1a2e;border-radius:20px;overflow:hidden;box-shadow:0 25px 60px rgba(0,0,0,0.5);}" +
            ".banner{background:linear-gradient(135deg,#667eea,#f64f59);padding:44px 40px;text-align:center;position:relative;}" +
            ".banner::after{content:'';position:absolute;bottom:-1px;left:0;right:0;height:40px;background:#1a1a2e;clip-path:ellipse(55% 100% at 50% 100%);}" +
            ".logo{font-size:34px;font-weight:800;color:white;letter-spacing:2px;}" +
            ".tagline{color:rgba(255,255,255,0.8);font-size:12px;margin-top:6px;letter-spacing:1px;text-transform:uppercase;}" +
            ".badge{display:inline-block;background:" + badgeColor + ";color:white;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:5px 16px;border-radius:20px;margin-top:14px;}" +
            ".content{padding:38px 40px 28px;}" +
            ".headline{font-size:22px;font-weight:700;color:#fff;margin-bottom:16px;line-height:1.4;}" +
            ".headline span{color:#667eea;}" +
            ".body-text{color:#a0a0b8;font-size:15px;line-height:1.8;margin-bottom:24px;}" +
            ".info-box{background:linear-gradient(135deg,#16213e,#0f3460);border:1px solid rgba(102,126,234,0.3);border-radius:14px;padding:22px 26px;margin-bottom:26px;position:relative;overflow:hidden;}" +
            ".info-box::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#667eea,#f64f59);}" +
            ".cta-wrapper{text-align:center;margin:28px 0;}" +
            ".cta-btn{display:inline-block;background:linear-gradient(135deg,#667eea,#f64f59);color:#fff !important;text-decoration:none;padding:15px 42px;border-radius:50px;font-size:15px;font-weight:700;box-shadow:0 8px 25px rgba(102,126,234,0.4);}" +
            ".divider{height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent);margin:24px 0;}" +
            ".footer{padding:0 40px 34px;text-align:center;}" +
            ".footer-logo{font-size:18px;font-weight:800;color:#667eea;letter-spacing:2px;margin-bottom:8px;}" +
            ".footer-text{color:#505070;font-size:12px;line-height:1.8;}" +
            ".footer-text a{color:#667eea;text-decoration:none;}" +
            "</style></head><body><div class='outer'><div class='card'>" +
            "<div class='banner'>" +
            "<div class='logo'>MATCHY</div>" +
            "<div class='tagline'>Tunisia's #1 Freelance Marketplace</div>" +
            "<div class='badge'>" + badgeText + "</div>" +
            "</div>" +
            "<div class='content'>" +
            "<div class='headline'>" + headline + "</div>" +
            bodyContent + cta +
            "<div class='divider'></div>" +
            "<p style='color:#505070;font-size:12px;text-align:center;'>You received this email because you are registered on Matchy.<br>" +
            "Questions? <a href='mailto:support@matchy.tn' style='color:#667eea;'>support@matchy.tn</a></p>" +
            "</div>" +
            "<div class='footer'><div class='footer-logo'>MATCHY</div>" +
            "<div class='footer-text'>&copy; 2026 Matchy &mdash; Connecting Talent with Opportunity<br>" +
            "<a href='http://localhost:4200'>matchy.tn</a> &nbsp;|&nbsp; <a href='mailto:support@matchy.tn'>support@matchy.tn</a></div>" +
            "</div></div></div></body></html>";
    }

    private String infoBox(String content) {
        return "<div class='info-box'>" + content + "</div>";
    }

    private String lbl(String text, String color) {
        return "<p style='color:" + color + ";font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;'>" + text + "</p>";
    }

    private String ttl(String text) {
        return "<p style='color:#fff;font-size:19px;font-weight:700;margin-bottom:8px;'>" + text + "</p>";
    }

    private String sub(String text) {
        return "<p style='color:#a0a0b8;font-size:13px;'>" + text + "</p>";
    }

    // ═══════════════════════════════════════════════════════════════
    // FREELANCER EMAILS
    // ═══════════════════════════════════════════════════════════════

    /** 1. Welcome — Freelancer */
    public void sendWelcomeFreelancer(String toEmail, String firstName) {
        String headline = "Welcome to Matchy, <span>" + firstName + "</span>! &#127881;";
        String body =
            "<p class='body-text'>Your freelancer account is now active. Start exploring projects and submit your first proposal today!</p>" +
            infoBox(
                lbl("&#128640; Get started", "#a0b4ff") +
                "<p style='color:#c0c0d8;font-size:14px;line-height:1.8;'>" +
                "&#10004; Complete your profile (photo, bio, skills)<br>" +
                "&#10004; Browse available projects<br>" +
                "&#10004; Submit your first proposal</p>"
            );
        String html = buildEmail("Welcome!", "rgba(102,126,234,0.45)", headline, body,
            "Browse Projects", "http://localhost:4200/freelancer/projects");
        sendEmail(toEmail, "Welcome to Matchy, " + firstName + "!", html);
    }

    /** 2. Proposal Accepted — Freelancer */
    public void sendProposalAccepted(String toEmail, String firstName, String projectTitle, String clientName) {
        String headline = "&#127881; Congratulations, <span>" + firstName + "</span>!";
        String body =
            "<p class='body-text'>Your proposal has been <strong style='color:#4ade80'>accepted</strong> by the client. Time to deliver outstanding work!</p>" +
            infoBox(
                lbl("&#9989; Proposal Accepted", "#4ade80") +
                ttl(projectTitle) +
                sub("Client: <strong style='color:#fff'>" + clientName + "</strong>")
            );
        String html = buildEmail("Accepted &#10003;", "rgba(74,222,128,0.35)", headline, body,
            "View My Project", "http://localhost:4200/freelancer/proposals");
        sendEmail(toEmail, "Your proposal was accepted — " + projectTitle, html);
    }

    /** 3. Proposal Rejected — Freelancer */
    public void sendProposalRejected(String toEmail, String firstName, String projectTitle) {
        String headline = "Your proposal was not selected, <span>" + firstName + "</span>";
        String body =
            "<p class='body-text'>Unfortunately, your proposal for <strong style='color:#fff'>" + projectTitle + "</strong> was not selected this time.</p>" +
            infoBox(
                lbl("&#128161; Don't give up!", "#f87171") +
                "<p style='color:#c0c0d8;font-size:14px;line-height:1.8;'>" +
                "New projects are posted every day. Refine your profile and keep applying — your next win is just around the corner!</p>"
            );
        String html = buildEmail("Not Selected", "rgba(248,113,113,0.35)", headline, body,
            "Explore Other Projects", "http://localhost:4200/freelancer/projects");
        sendEmail(toEmail, "Proposal result — " + projectTitle, html);
    }

    /** 4. New Message Received — Freelancer */
    public void sendNewMessageToFreelancer(String toEmail, String firstName, String senderName, String preview) {
        String headline = "&#128172; New message from <span>" + senderName + "</span>";
        String body =
            "<p class='body-text'>Hi <strong style='color:#fff'>" + firstName + "</strong>, you have a new message from a client.</p>" +
            infoBox(
                lbl("&#128172; Message Preview", "#a0b4ff") +
                "<p style='color:#c0c0d8;font-size:14px;line-height:1.7;font-style:italic;'>\"" + preview + "\"</p>" +
                "<p style='color:#667eea;font-size:12px;margin-top:10px;'>From: " + senderName + "</p>"
            );
        String html = buildEmail("New Message", "rgba(102,126,234,0.45)", headline, body,
            "Reply Now", "http://localhost:4200/freelancer/messages");
        sendEmail(toEmail, "New message from " + senderName, html);
    }

    /** 5. Deadline Reminder — Freelancer */
    public void sendDeadlineReminderFreelancer(String toEmail, String firstName, String projectTitle, String deadline) {
        String headline = "&#9201; Deadline reminder, <span>" + firstName + "</span>";
        String body =
            "<p class='body-text'>Your project delivery deadline is approaching. Make sure you are on track!</p>" +
            infoBox(
                lbl("&#9888; Upcoming Deadline", "#fbbf24") +
                ttl(projectTitle) +
                "<p style='color:#fbbf24;font-size:15px;font-weight:600;margin-top:6px;'>&#128197; Due: " + deadline + "</p>"
            );
        String html = buildEmail("Deadline Reminder", "rgba(251,191,36,0.35)", headline, body,
            "View My Project", "http://localhost:4200/freelancer/proposals");
        sendEmail(toEmail, "Deadline approaching — " + projectTitle, html);
    }

    /** 6. New Project Available — notify all active freelancers */
    public void notifyFreelancersNewProject(String projectTitle, Long projectId) {
        List<User> freelancers = userRepository.findByRole(User.Role.FREELANCER);
        for (User freelancer : freelancers) {
            if (freelancer.getStatus() == User.UserStatus.ACTIVE) {
                sendNewProjectEmail(freelancer.getEmail(), freelancer.getFirstName(), projectTitle, projectId);
            }
        }
    }

    private void sendNewProjectEmail(String toEmail, String firstName, String projectTitle, Long projectId) {
        String headline = "New project available, <span>" + firstName + "</span> &#128075;";
        String body =
            "<p class='body-text'>A new project has just been posted on Matchy. Don't miss the opportunity to apply!</p>" +
            infoBox(
                lbl("&#128203; New Project", "#a0b4ff") +
                ttl(projectTitle) +
                "<p style='color:#a0a0b8;font-size:13px;margin-top:6px;'>Status: <span style='color:#4ade80;font-weight:600;'>Open for proposals</span></p>"
            ) +
            infoBox(
                "<span style='font-size:20px;vertical-align:middle;'>&#9889;</span>" +
                "<span style='color:#c0c0d8;font-size:14px;margin-left:10px;'>Freelancers who apply early have a significantly higher chance of being selected.</span>"
            );
        String html = buildEmail("New Opportunity", "rgba(102,126,234,0.45)", headline, body,
            "View Project & Apply", "http://localhost:4200/freelancer/projects");
        sendEmail(toEmail, "New project on Matchy: " + projectTitle, html);
    }

    // ═══════════════════════════════════════════════════════════════
    // CLIENT EMAILS
    // ═══════════════════════════════════════════════════════════════

    /** 7. Welcome — Client */
    public void sendWelcomeClient(String toEmail, String firstName) {
        String headline = "Welcome to Matchy, <span>" + firstName + "</span>! &#127881;";
        String body =
            "<p class='body-text'>Your client account is now active. Post your first project and connect with top Tunisian freelancers today!</p>" +
            infoBox(
                lbl("&#128640; Get started", "#a0b4ff") +
                "<p style='color:#c0c0d8;font-size:14px;line-height:1.8;'>" +
                "&#10004; Post your first project<br>" +
                "&#10004; Receive proposals from talented freelancers<br>" +
                "&#10004; Select the best match for your needs</p>"
            );
        String html = buildEmail("Welcome!", "rgba(102,126,234,0.45)", headline, body,
            "Post a Project", "http://localhost:4200/client/projects/new");
        sendEmail(toEmail, "Welcome to Matchy, " + firstName + "!", html);
    }

    /** 8. New Proposal Received — Client */
    public void sendNewProposalToClient(String toEmail, String firstName, String projectTitle, String freelancerName, String freelancerBio) {
        String headline = "&#128235; New proposal received, <span>" + firstName + "</span>";
        String body =
            "<p class='body-text'>A freelancer just submitted a proposal on your project. Review it now!</p>" +
            infoBox(
                lbl("&#128203; Project", "#a0b4ff") +
                ttl(projectTitle) +
                "<br>" +
                lbl("&#128100; Freelancer", "#a0b4ff") +
                "<p style='color:#fff;font-size:15px;font-weight:600;margin-bottom:6px;'>" + freelancerName + "</p>" +
                "<p style='color:#a0a0b8;font-size:13px;line-height:1.6;font-style:italic;'>\"" +
                (freelancerBio != null && !freelancerBio.isEmpty() ? freelancerBio : "Profile available on the platform") +
                "\"</p>"
            );
        String html = buildEmail("New Proposal", "rgba(102,126,234,0.45)", headline, body,
            "View Proposal", "http://localhost:4200/client/projects");
        sendEmail(toEmail, "New proposal received — " + projectTitle, html);
    }

    /** 9. Work Delivered — Client */
    public void sendWorkDelivered(String toEmail, String firstName, String projectTitle, String freelancerName) {
        String headline = "&#128230; Work delivered on <span>" + projectTitle + "</span>";
        String body =
            "<p class='body-text'>Hi <strong style='color:#fff'>" + firstName + "</strong>, " +
            "freelancer <strong style='color:#fff'>" + freelancerName + "</strong> has marked your project as delivered. Please review and validate the work.</p>" +
            infoBox(
                lbl("&#9989; Delivery Received", "#4ade80") +
                ttl(projectTitle) +
                sub("Delivered by: <strong style='color:#fff'>" + freelancerName + "</strong>")
            ) +
            "<p class='body-text'>Log in to review the delivery, leave feedback, and close the project.</p>";
        String html = buildEmail("Work Delivered", "rgba(74,222,128,0.35)", headline, body,
            "Review Delivery", "http://localhost:4200/client/projects");
        sendEmail(toEmail, "Work delivered — " + projectTitle, html);
    }

    /** 10. No Proposals Reminder — Client */
    public void sendNoProposalsReminder(String toEmail, String firstName, String projectTitle, int daysSincePosted) {
        String headline = "&#128276; Your project needs attention, <span>" + firstName + "</span>";
        String body =
            "<p class='body-text'>Your project has been live for <strong style='color:#fff'>" + daysSincePosted + " days</strong> but has not received any proposals yet.</p>" +
            infoBox(
                lbl("&#128202; Project Status", "#fbbf24") +
                ttl(projectTitle) +
                "<p style='color:#fbbf24;font-size:14px;font-weight:600;margin-top:6px;'>&#128197; " + daysSincePosted + " days with no proposals</p>"
            ) +
            infoBox(
                lbl("&#128161; Tips to attract freelancers", "#a0b4ff") +
                "<p style='color:#c0c0d8;font-size:14px;line-height:1.8;'>" +
                "&#10004; Add a more detailed project description<br>" +
                "&#10004; Specify your budget clearly<br>" +
                "&#10004; Set a realistic deadline</p>"
            );
        String html = buildEmail("No Proposals Yet", "rgba(251,191,36,0.35)", headline, body,
            "Update My Project", "http://localhost:4200/client/projects");
        sendEmail(toEmail, "Your project has no proposals yet — " + projectTitle, html);
    }
    public void sendResetPassword(String toEmail, String firstName, String resetLink) {
    String headline = "&#128274; Reset your password, <span>" + firstName + "</span>";
    String body =
        "<p class='body-text'>We received a request to reset your Matchy admin password. Click the button below to set a new password. This link is valid for <strong style='color:#fff'>30 minutes</strong>.</p>" +
        infoBox(
            lbl("&#9888; Security Notice", "#fbbf24") +
            "<p style='color:#c0c0d8;font-size:14px;line-height:1.8;'>" +
            "If you did not request a password reset, you can safely ignore this email. " +
            "Your password will not be changed.</p>"
        );
    String html = buildEmail("Password Reset", "rgba(251,191,36,0.35)", headline, body,
        "Reset My Password", resetLink);
    sendEmail(toEmail, "Reset your Matchy password", html);
}

    public void sendBadgeUnlocked(String toEmail, String firstName, String badgeTitle, String badgeDescription) {
        String headline = "New badge unlocked, <span>" + firstName + "</span>! &#127942;";
        String body =
            "<p class='body-text'>Great job! You just earned a new achievement on Matchy.</p>" +
            infoBox(
                lbl("&#127775; Badge Unlocked", "#a0b4ff") +
                ttl(badgeTitle) +
                sub(badgeDescription)
            );
        String html = buildEmail(
            "Badge Unlocked",
            "rgba(102,126,234,0.45)",
            headline,
            body,
            "View My Profile",
            "http://localhost:4200/freelancer/profile"
        );
        sendEmail(toEmail, "Matchy update - New badge unlocked", html);
    }
}


