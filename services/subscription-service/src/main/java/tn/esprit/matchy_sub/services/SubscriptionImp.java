package tn.esprit.matchy_sub.services;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.matchy_sub.entities.Plan;
import tn.esprit.matchy_sub.entities.Subscription;
import tn.esprit.matchy_sub.entities.SubscriptionStatus;
import tn.esprit.matchy_sub.repositories.PlanRepository;
import tn.esprit.matchy_sub.repositories.SubscriptionRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class SubscriptionImp implements ISubscription{
    public final SubscriptionRepository subscriptionRepository;
    public final PlanRepository planRepository;

    @Override
    public Subscription createSubscription(Subscription subscription) {
        subscription.setStartDate(LocalDateTime.now());

        if (subscription.getEndDate() == null) {
            subscription.setEndDate(LocalDateTime.now().plusMonths(1));
        }

        // Start a 7-day free trial for PRO and PREMIUM plans
        boolean isTrialEligible = subscription.getPlan() != null &&
                subscription.getPlan().getName() != null &&
                (subscription.getPlan().getName() == tn.esprit.matchy_sub.entities.PlanType.PRO ||
                 subscription.getPlan().getName() == tn.esprit.matchy_sub.entities.PlanType.PREMIUM);

        // If plan is only partially loaded (just id), reload from DB
        if (subscription.getPlan() != null && subscription.getPlan().getName() == null) {
            planRepository.findById(subscription.getPlan().getId()).ifPresent(fullPlan -> {
                subscription.setPlan(fullPlan);
            });
        }

        // Re-check after potential reload
        isTrialEligible = subscription.getPlan() != null &&
                subscription.getPlan().getName() != null &&
                (subscription.getPlan().getName().name().equals("PRO") ||
                 subscription.getPlan().getName().name().equals("PREMIUM"));

        if (isTrialEligible) {
            subscription.setIsTrial(true);
            subscription.setTrialStartDate(LocalDateTime.now());
            subscription.setTrialEndDate(LocalDateTime.now().plusDays(7));
            subscription.setStatus(SubscriptionStatus.TRIAL);
        } else {
            subscription.setIsTrial(false);
            subscription.setStatus(SubscriptionStatus.PENDING);
        }

        return subscriptionRepository.save(subscription);
    }
    
    @Override
    public Subscription upgradeSubscription(Long userId, Long newPlanId) {
        Plan newPlan = planRepository.findById(newPlanId)
                .orElseThrow(() -> new RuntimeException("Plan non trouvé : " + newPlanId));
        
        // 1. Find and cancel current subscription if exists
        List<Subscription> userSubs = subscriptionRepository.findAll().stream()
                .filter(s -> s.getUserId() != null && s.getUserId().equals(userId))
                .filter(s -> s.getStatus() == SubscriptionStatus.ACTIVE || s.getStatus() == SubscriptionStatus.TRIAL)
                .toList();
        
        for (Subscription currentSub : userSubs) {
            currentSub.setStatus(SubscriptionStatus.CANCELLED);
            subscriptionRepository.save(currentSub);
        }
        
        // 2. Create new subscription with PENDING status
        Subscription newSubscription = new Subscription();
        newSubscription.setUserId(userId);
        newSubscription.setPlan(newPlan);
        newSubscription.setPriceAtPurchase(newPlan.getPrice());
        newSubscription.setStartDate(LocalDateTime.now());
        newSubscription.setEndDate(LocalDateTime.now().plusMonths(1));
        // Status is PENDING until admin approves the payment
        newSubscription.setStatus(SubscriptionStatus.PENDING);
        
        return subscriptionRepository.save(newSubscription);
    }
    
    @Override
    public Subscription updateSubscription(Long id, Subscription subscription) {
        if (!subscriptionRepository.existsById(id)) {
            throw new RuntimeException("Modification impossible : ID introuvable");
        }
        subscription.setId(id);
        return subscriptionRepository.save(subscription);
    }
    
    @Override
    public Subscription findById(Long id) {
        return subscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Souscription " + id + " non trouvée"));
    }
    
    @Override
    public List<Subscription> findAll() {
        return subscriptionRepository.findAll();
    }
    
    @Override
    public void deleteSubscription(Long id) {
        subscriptionRepository.deleteById(id);
    }
}


