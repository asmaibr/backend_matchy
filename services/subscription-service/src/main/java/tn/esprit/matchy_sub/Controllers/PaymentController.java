package tn.esprit.matchy_sub.Controllers;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.matchy_sub.entities.Payment;
import tn.esprit.matchy_sub.entities.PaymentMethod;
import tn.esprit.matchy_sub.entities.Subscription;
import tn.esprit.matchy_sub.repositories.SubscriptionRepository;
import tn.esprit.matchy_sub.services.EmailService;
import tn.esprit.matchy_sub.services.PaymentImp;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("payment")
@AllArgsConstructor
@CrossOrigin("*")
public class PaymentController {
    public final PaymentImp paymentImp;
    public final EmailService emailService;
    public final SubscriptionRepository subscriptionRepository;

    /**
     * Create a payment from a flexible JSON body.
     * Resolves subscription by ID from the DB.
     * Accepts userId directly (no User entity lookup).
     */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        try {
            Payment payment = new Payment();

            // Amount
            if (body.get("amount") != null) {
                payment.setAmount(Double.parseDouble(body.get("amount").toString()));
            }

            // Currency
            payment.setCurrency(body.getOrDefault("currency", "TND").toString());

            // Transaction ref
            if (body.get("transactionRef") != null) {
                payment.setTransactionRef(body.get("transactionRef").toString());
            }

            // Cardholder / audit fields
            if (body.get("cardholderName") != null) {
                payment.setCardholderName(body.get("cardholderName").toString());
            }
            
            // Bank transfer fields
            if (body.get("rib") != null) {
                String rib = body.get("rib").toString().replaceAll("\\s", ""); // Remove spaces
                if (rib.length() <= 20 && rib.matches("\\d+")) {
                    payment.setRib(rib);
                }
            }
            if (body.get("bankName") != null) {
                payment.setBankName(body.get("bankName").toString());
            }
            if (body.get("accountHolder") != null) {
                payment.setAccountHolder(body.get("accountHolder").toString());
            }

            // Payment method — map string to enum safely
            if (body.get("method") != null) {
                try {
                    payment.setMethod(PaymentMethod.valueOf(body.get("method").toString().toUpperCase()));
                } catch (IllegalArgumentException e) {
                    payment.setMethod(PaymentMethod.CARD); // default
                }
            }

            // Resolve subscription by ID
            if (body.get("subscription") instanceof Map) {
                Map<?, ?> subMap = (Map<?, ?>) body.get("subscription");
                if (subMap.get("id") != null) {
                    Long subId = Long.parseLong(subMap.get("id").toString());
                    Subscription sub = subscriptionRepository.findById(subId).orElse(null);
                    payment.setSubscription(sub);
                }
            }

            // UserId — direct assignment (no User entity lookup)
            if (body.get("userId") != null) {
                payment.setUserId(Long.parseLong(body.get("userId").toString()));
            }

            // Promo code and discount
            if (body.get("promoCode") != null) {
                payment.setPromoCode(body.get("promoCode").toString());
            }
            if (body.get("discountAmountTnd") != null) {
                payment.setDiscountAmountTnd(Double.parseDouble(body.get("discountAmountTnd").toString()));
            }

            // Save payment (sets PENDING + timestamps in PaymentImp.create)
            Payment saved = paymentImp.create(payment);

            // Send email — will use userId to fetch user info from User microservice
            try {
                emailService.sendPaymentReceivedEmail(saved);
            } catch (Exception emailEx) {
                // log but don't fail the request
                System.err.println("[PaymentController] Email send failed: " + emailEx.getMessage());
            }

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Payment creation failed: " + e.getMessage());
        }
    }

    @GetMapping
    public List<Payment> getAll() {
        return paymentImp.getAll();
    }

    @GetMapping("/{id}")
    public Payment getById(@PathVariable Long id) {
        return paymentImp.getById(id);
    }

    @GetMapping("/pending")
    public List<Payment> getPendingPayments() {
        return paymentImp.getPendingPayments();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            Payment existingPayment = paymentImp.getById(id);
            
            // Update amount
            if (body.get("amount") != null) {
                existingPayment.setAmount(Double.parseDouble(body.get("amount").toString()));
            }
            
            // Update currency
            if (body.get("currency") != null) {
                existingPayment.setCurrency(body.get("currency").toString());
            }
            
            // Update transaction ref
            if (body.get("transactionRef") != null) {
                existingPayment.setTransactionRef(body.get("transactionRef").toString());
            }
            
            // Update cardholder name
            if (body.get("cardholderName") != null) {
                existingPayment.setCardholderName(body.get("cardholderName").toString());
            }
            
            // Update bank transfer fields
            if (body.get("rib") != null) {
                String rib = body.get("rib").toString().replaceAll("\\s", ""); // Remove spaces
                if (rib.length() <= 20 && rib.matches("\\d+")) {
                    existingPayment.setRib(rib);
                }
            }
            if (body.get("bankName") != null) {
                existingPayment.setBankName(body.get("bankName").toString());
            }
            if (body.get("accountHolder") != null) {
                existingPayment.setAccountHolder(body.get("accountHolder").toString());
            }
            
            // Update payment method
            if (body.get("method") != null) {
                try {
                    existingPayment.setMethod(PaymentMethod.valueOf(body.get("method").toString().toUpperCase()));
                } catch (IllegalArgumentException e) {
                    // Keep existing method if invalid
                }
            }
            
            // Update status
            if (body.get("status") != null) {
                try {
                    existingPayment.setStatus(
                        tn.esprit.matchy_sub.entities.PaymentStatus.valueOf(body.get("status").toString().toUpperCase())
                    );
                } catch (IllegalArgumentException e) {
                    // Keep existing status if invalid
                }
            }
            
            // Update subscription if provided
            if (body.get("subscription") instanceof Map) {
                Map<?, ?> subMap = (Map<?, ?>) body.get("subscription");
                if (subMap.get("id") != null) {
                    Long subId = Long.parseLong(subMap.get("id").toString());
                    Subscription sub = subscriptionRepository.findById(subId).orElse(null);
                    existingPayment.setSubscription(sub);
                }
            }
            
            // Update userId if provided
            if (body.get("userId") != null) {
                existingPayment.setUserId(Long.parseLong(body.get("userId").toString()));
            }
            
            // Save updated payment (will sync with subscription in PaymentImp.update)
            Payment updated = paymentImp.update(id, existingPayment);
            
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Payment update failed: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approvePayment(
            @PathVariable Long id,
            @RequestParam(required = false) Long adminId,
            @RequestParam(required = false) String adminNotes) {
        try {
            Payment approvedPayment = paymentImp.approvePayment(id, adminId, adminNotes);
            try {
                emailService.sendPaymentApprovedEmail(approvedPayment);
            } catch (Exception e) {
                System.err.println("[PaymentController] Approval email failed: " + e.getMessage());
            }
            return ResponseEntity.ok(approvedPayment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectPayment(
            @PathVariable Long id,
            @RequestParam(required = false) Long adminId,
            @RequestParam String reason) {
        try {
            Payment rejectedPayment = paymentImp.rejectPayment(id, adminId, reason);
            try {
                emailService.sendPaymentRejectedEmail(rejectedPayment, reason);
            } catch (Exception e) {
                System.err.println("[PaymentController] Rejection email failed: " + e.getMessage());
            }
            return ResponseEntity.ok(rejectedPayment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        paymentImp.delete(id);
    }
}
