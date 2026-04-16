package tn.esprit.matchy_sub.Controllers;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.matchy_sub.entities.Plan;
import tn.esprit.matchy_sub.entities.PlanType;
import tn.esprit.matchy_sub.entities.Subscription;
import tn.esprit.matchy_sub.repositories.PlanRepository;
import tn.esprit.matchy_sub.services.SubscriptionImp;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/subscriptions")
@AllArgsConstructor
@CrossOrigin("*")
public class SubscriptionController {
    public final SubscriptionImp subscriptionService;
    public final PlanRepository planRepository;

    /**
     * Create a subscription.
     * Accepts either:
     *   - plan: { id: 1 }          (numeric ID from DB)
     *   - planName: "PRO"          (string name, resolved to Plan entity)
     *   - userId: 1                (numeric user ID for microservice communication)
     */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        try {
            Subscription subscription = new Subscription();

            // Amount
            if (body.get("priceAtPurchase") != null) {
                subscription.setPriceAtPurchase(Double.parseDouble(body.get("priceAtPurchase").toString()));
            }

            // UserId — direct assignment (no User entity lookup)
            if (body.get("userId") != null) {
                subscription.setUserId(Long.parseLong(body.get("userId").toString()));
            }

            // Plan — try by ID first, then by name
            Plan resolvedPlan = null;
            if (body.get("plan") instanceof Map) {
                Map<?, ?> planMap = (Map<?, ?>) body.get("plan");
                if (planMap.get("id") != null) {
                    try {
                        long planId = Long.parseLong(planMap.get("id").toString());
                        resolvedPlan = planRepository.findById(planId).orElse(null);
                    } catch (NumberFormatException ignored) {}
                }
            }
            // Fallback: resolve by planName field
            if (resolvedPlan == null && body.get("planName") != null) {
                try {
                    PlanType pt = PlanType.valueOf(body.get("planName").toString().toUpperCase());
                    resolvedPlan = planRepository.findByName(pt).orElse(null);
                } catch (Exception ignored) {}
            }
            subscription.setPlan(resolvedPlan);

            Subscription saved = subscriptionService.createSubscription(subscription);
            // Reload from DB to get full relations (plan)
            Subscription full = subscriptionService.findById(saved.getId());
            return ResponseEntity.ok(full);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public Subscription getById(@PathVariable Long id) {
        return subscriptionService.findById(id);
    }

    @GetMapping
    public List<Subscription> getAll() {
        return subscriptionService.findAll();
    }

    @PutMapping("/{id}")
    public Subscription update(@PathVariable Long id, @RequestBody Subscription subscription) {
        return subscriptionService.updateSubscription(id, subscription);
    }

    @PostMapping("/upgrade")
    public ResponseEntity<?> upgradeSubscription(
            @RequestParam Long userId,
            @RequestParam Long newPlanId) {
        try {
            Subscription newSubscription = subscriptionService.upgradeSubscription(userId, newPlanId);
            return ResponseEntity.ok(newSubscription);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        subscriptionService.deleteSubscription(id);
    }

    /**
     * Returns trial status info for a subscription:
     * daysRemaining, isTrial, isExpired, trialEndDate
     */
    @GetMapping("/{id}/trial-status")
    public ResponseEntity<?> getTrialStatus(@PathVariable Long id) {
        try {
            Subscription sub = subscriptionService.findById(id);
            if (sub.getIsTrial() == null || !sub.getIsTrial()) {
                return ResponseEntity.ok(Map.of("isTrial", false));
            }
            long daysRemaining = 0;
            if (sub.getTrialEndDate() != null) {
                daysRemaining = java.time.temporal.ChronoUnit.DAYS.between(
                        java.time.LocalDateTime.now(), sub.getTrialEndDate());
                daysRemaining = Math.max(0, daysRemaining);
            }
            return ResponseEntity.ok(Map.of(
                    "isTrial", true,
                    "status", sub.getStatus().name(),
                    "daysRemaining", daysRemaining,
                    "trialEndDate", sub.getTrialEndDate() != null ? sub.getTrialEndDate().toString() : null,
                    "isExpired", sub.getStatus() == tn.esprit.matchy_sub.entities.SubscriptionStatus.EXPIRED
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
