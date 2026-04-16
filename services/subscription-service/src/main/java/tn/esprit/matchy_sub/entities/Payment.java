package tn.esprit.matchy_sub.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@EqualsAndHashCode
@Builder
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JsonIgnoreProperties({"payments"})
    private Subscription subscription;

    // ── User reference (communicates with User microservice) ──────────────────
    private Long userId;

    private Double amount;
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private PaymentStatus status;

    private LocalDateTime transactionDate;

    // Admin approval tracking
    private LocalDateTime submittedAt;
    private LocalDateTime approvedAt;

    // ── Admin reference (communicates with User microservice) ──────────────────
    private Long approvedByUserId; // Admin user ID who approved the payment

    private String adminNotes;
    private String transactionRef;

    // For audit (Don't store full card numbers for security!)
    private String lastFourDigits;
    private String cardholderName;
    
    // Bank transfer details
    @Column(length = 20)
    private String rib; // RIB/IBAN for bank transfers (max 20 digits)
    private String bankName;
    private String accountHolder;

    // ── Promo Code fields ──────────────────────────────────────────────────────
    private String promoCode;
    private Double discountAmountTnd; // Discount amount in TND (10% of original)
}
