package com.matchy.service;

import com.matchy.entity.Badge;
import com.matchy.entity.Proposal;
import com.matchy.entity.User;
import com.matchy.repository.BadgeRepository;
import com.matchy.repository.ProposalRepository;
import com.matchy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class GamificationService {

    @Autowired private BadgeRepository badgeRepository;
    @Autowired private ProposalRepository proposalRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private EmailService emailService;

    @Value("${services.notification.url:http://localhost:8080/api/notifications}")
    private String notificationsUrl;

    // Called when a freelancer submits a proposal
    public void onProposalSubmitted(Long freelancerId) {
        long totalSubmitted = proposalRepository.countByFreelancerId(freelancerId);

        // First Step — 1st proposal submitted
        if (totalSubmitted >= 1) {
            awardBadge(freelancerId, Badge.BadgeType.FIRST_PROPOSAL,
                "First Step", "Submitted your first proposal", "🌱");
        }

        // Prolific — 20+ proposals submitted
        if (totalSubmitted >= 20) {
            awardBadge(freelancerId, Badge.BadgeType.PROLIFIC,
                "Prolific", "Submitted 20+ proposals", "📝");
        }

        // Fast Starter — 3 proposals in less than 1 week
        checkFastStarter(freelancerId);
    }

    // Called when a proposal is accepted
    public void onProposalAccepted(Long freelancerId) {
        long accepted = proposalRepository.countByFreelancerIdAndStatus(freelancerId, Proposal.ProposalStatus.ACCEPTED);
        long total    = proposalRepository.countByFreelancerId(freelancerId);

        // Rising Talent — 1 accepted
        if (accepted >= 1) {
            awardBadge(freelancerId, Badge.BadgeType.RISING_TALENT,
                "Rising Talent", "Got your first proposal accepted", "🥉");
        }

        // Experienced — 5 accepted
        if (accepted >= 5) {
            awardBadge(freelancerId, Badge.BadgeType.EXPERIENCED,
                "Experienced", "Got 5 proposals accepted", "🥈");
        }

        // Expert — 10 accepted
        if (accepted >= 10) {
            awardBadge(freelancerId, Badge.BadgeType.EXPERT,
                "Expert", "Got 10 proposals accepted", "🥇");
        }

        // Elite — 20 accepted
        if (accepted >= 20) {
            awardBadge(freelancerId, Badge.BadgeType.ELITE,
                "Elite", "Got 20 proposals accepted", "💎");
        }

        // High Acceptance — acceptance rate >= 50% (min 5 proposals)
        if (total >= 5) {
            double rate = (double) accepted / total * 100;
            if (rate >= 50) {
                awardBadge(freelancerId, Badge.BadgeType.HIGH_ACCEPTANCE,
                    "High Acceptance", "Acceptance rate of 50% or more", "🎯");
            }
        }
    }

    // Called when a proposal is rejected
    public void onProposalRejected(Long freelancerId) {
        long accepted = proposalRepository.countByFreelancerIdAndStatus(freelancerId, Proposal.ProposalStatus.ACCEPTED);
        long total    = proposalRepository.countByFreelancerId(freelancerId);

        // Re-check High Acceptance rate after rejection
        if (total >= 5) {
            double rate = (double) accepted / total * 100;
            if (rate >= 50) {
                awardBadge(freelancerId, Badge.BadgeType.HIGH_ACCEPTANCE,
                    "High Acceptance", "Acceptance rate of 50% or more", "🎯");
            }
        }
    }

    // Called when admin verifies a user
    public void onUserVerified(Long userId) {
        awardBadge(userId, Badge.BadgeType.VERIFIED_PRO,
            "Verified Pro", "Account verified by Matchy team", "✅");
    }

    public void onClientProjectPosted(Long clientId, long totalProjects) {
        if (totalProjects >= 1) {
            awardBadge(clientId, Badge.BadgeType.FIRST_PROJECT,
                "First Project", "Posted your first project", "🚀");
        }
        if (totalProjects >= 3) {
            awardBadge(clientId, Badge.BadgeType.ACTIVE_CLIENT,
                "Active Client", "Actively posting projects", "📋");
        }
        if (totalProjects >= 5) {
            awardBadge(clientId, Badge.BadgeType.POWER_CLIENT,
                "Power Client", "Completed 5+ projects", "💪");
        }
        if (totalProjects >= 10) {
            awardBadge(clientId, Badge.BadgeType.MEGA_CLIENT,
                "Mega Client", "Completed 10+ projects", "🏆");
        }
        if (totalProjects >= 25) {
            awardBadge(clientId, Badge.BadgeType.LEGEND,
                "Legend", "Complete 25+ projects", "👑");
        }
    }

    // Check Fast Starter: 3 proposals in less than 1 week
    private void checkFastStarter(Long freelancerId) {
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusWeeks(1);
        long recentCount = proposalRepository.countByFreelancerIdAndCreatedAtAfter(freelancerId, oneWeekAgo);
        if (recentCount >= 3) {
            awardBadge(freelancerId, Badge.BadgeType.FAST_STARTER,
                "Fast Starter", "Submitted 3 proposals in less than a week", "⚡");
        }
    }

    // Award badge only if not already earned
    private void awardBadge(Long userId, Badge.BadgeType type, String title, String description, String icon) {
        if (!badgeRepository.existsByUserIdAndType(userId, type)) {
            Badge badge = new Badge();
            badge.setUserId(userId);
            badge.setType(type);
            badge.setTitle(title);
            badge.setDescription(description);
            badge.setIcon(icon);
            badgeRepository.save(badge);
            System.out.println("[BADGE] Awarded " + title + " to userId=" + userId);
            notifyBadgeAwarded(userId, title, description);
        }
    }

    private void notifyBadgeAwarded(Long userId, String badgeTitle, String badgeDescription) {
        userRepository.findById(userId).ifPresent(user -> {
            try {
                emailService.sendBadgeUnlocked(user.getEmail(), user.getFirstName(), badgeTitle, badgeDescription);
            } catch (Exception e) {
                System.err.println("[BADGE] Email notification failed for userId=" + userId + ": " + e.getMessage());
            }
            try {
                RestTemplate restTemplate = new RestTemplate();
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                Map<String, Object> payload = Map.of(
                    "recipientId", userId,
                    "recipientEmail", user.getEmail(),
                    "title", "New Badge Unlocked 🏅",
                    "message", "You earned \"" + badgeTitle + "\" - " + badgeDescription,
                    "type", "SYSTEM",
                    "read", false,
                    "relatedEntityType", "BADGE"
                );
                restTemplate.postForEntity(notificationsUrl, new HttpEntity<>(payload, headers), Object.class);
            } catch (Exception e) {
                System.err.println("[BADGE] In-app notification failed for userId=" + userId + ": " + e.getMessage());
            }
        });
    }

    public void notifyBadgeByRequest(Long userId, String email, String badgeName, String badgeDesc) {
        String firstName = userRepository.findById(userId).map(User::getFirstName).orElse("there");
        try {
            emailService.sendBadgeUnlocked(email, firstName, badgeName, badgeDesc);
        } catch (Exception e) {
            System.err.println("[BADGE] Manual email notification failed for userId=" + userId + ": " + e.getMessage());
        }
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            Map<String, Object> payload = Map.of(
                "recipientId", userId,
                "recipientEmail", email,
                "title", "New Badge Unlocked 🏅",
                "message", "You earned \"" + badgeName + "\" - " + badgeDesc,
                "type", "SYSTEM",
                "read", false,
                "relatedEntityType", "BADGE"
            );
            restTemplate.postForEntity(notificationsUrl, new HttpEntity<>(payload, headers), Object.class);
        } catch (Exception e) {
            System.err.println("[BADGE] Manual in-app notification failed for userId=" + userId + ": " + e.getMessage());
        }
    }

    // Get all badges for a user
    public List<Badge> getBadgesForUser(Long userId) {
        return badgeRepository.findByUserId(userId);
    }
}