package tn.esprit.matchy_sub.services;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.matchy_sub.entities.Payment;
import tn.esprit.matchy_sub.entities.PaymentStatus;
import tn.esprit.matchy_sub.entities.Subscription;
import tn.esprit.matchy_sub.entities.SubscriptionStatus;
import tn.esprit.matchy_sub.repositories.PaymentRepository;
import tn.esprit.matchy_sub.repositories.SubscriptionRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class PaymentImp implements IPayment {
    public final PaymentRepository paymentRepository;
    public final SubscriptionRepository subscriptionRepository;
    
    @Override
    @Transactional
    public Payment create(Payment payment) {
        // 1. Initialize transaction data
        payment.setTransactionDate(LocalDateTime.now());
        payment.setSubmittedAt(LocalDateTime.now());
        
        // 2. Set status to PENDING - waiting for admin confirmation
        payment.setStatus(PaymentStatus.PENDING);

        Payment savedPayment = paymentRepository.save(payment);
        
        // 3. NOTE: Subscription is NOT activated yet - waiting for admin approval
        return savedPayment;
    }
    
    @Override
    @Transactional
    public Payment approvePayment(Long id, Long adminId, String adminNotes) {
        Payment payment = getById(id);
        
        // Admin ID is optional - just store it if provided
        if (adminId != null) {
            payment.setApprovedByUserId(adminId);
        }
        
        // 1. Update payment status to COMPLETED
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setApprovedAt(LocalDateTime.now());
        payment.setAdminNotes(adminNotes);
        
        Payment approvedPayment = paymentRepository.save(payment);
        
        // 2. Activate the associated subscription
        if (payment.getSubscription() != null) {
            Subscription sub = payment.getSubscription();
            sub.setStatus(SubscriptionStatus.ACTIVE);
            subscriptionRepository.save(sub);
        }
        
        return approvedPayment;
    }
    
    @Override
    @Transactional
    public Payment rejectPayment(Long id, Long adminId, String reason) {
        Payment payment = getById(id);
        
        // Admin ID is optional - just store it if provided
        if (adminId != null) {
            payment.setApprovedByUserId(adminId);
        }
        
        // 1. Update payment status to FAILED
        payment.setStatus(PaymentStatus.FAILED);
        payment.setApprovedAt(LocalDateTime.now());
        payment.setAdminNotes(reason);
        
        return paymentRepository.save(payment);
    }
    
    @Override
    public List<Payment> getPendingPayments() {
        return paymentRepository.findByStatus(PaymentStatus.PENDING);
    }
    
    @Override
    @Transactional
    public Payment update(Long id, Payment payment) {
        if (!paymentRepository.existsById(id)) {
            throw new RuntimeException("Paiement " + id + " inexistant");
        }
        
        Payment existingPayment = getById(id);
        
        // Update payment fields
        payment.setId(id);
        Payment updatedPayment = paymentRepository.save(payment);
        
        // Synchronize with subscription if status changed
        if (updatedPayment.getSubscription() != null) {
            Subscription sub = updatedPayment.getSubscription();
            
            // If payment status changed to COMPLETED, activate subscription
            if (updatedPayment.getStatus() == PaymentStatus.COMPLETED && 
                existingPayment.getStatus() != PaymentStatus.COMPLETED) {
                sub.setStatus(SubscriptionStatus.ACTIVE);
                subscriptionRepository.save(sub);
            }
            
            // If payment status changed to FAILED, keep subscription PENDING or cancel it
            if (updatedPayment.getStatus() == PaymentStatus.FAILED && 
                existingPayment.getStatus() != PaymentStatus.FAILED) {
                // Keep subscription in PENDING state (admin can retry)
                // Or cancel it: sub.setStatus(SubscriptionStatus.CANCELLED);
            }
            
            // Update subscription amount if payment amount changed
            if (!updatedPayment.getAmount().equals(existingPayment.getAmount())) {
                sub.setPriceAtPurchase(updatedPayment.getAmount());
                subscriptionRepository.save(sub);
            }
        }
        
        return updatedPayment;
    }
    
    @Override
    public Payment getById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paiement non trouvé : " + id));
    }
    
    @Override
    public List<Payment> getAll() {
        return paymentRepository.findAll();
    }
    
    @Override
    public void delete(Long id) {
        if (!paymentRepository.existsById(id)) {
            throw new RuntimeException("Impossible de supprimer : ID inconnu");
        }
        paymentRepository.deleteById(id);
    }
}