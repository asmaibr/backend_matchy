package tn.esprit.matchy_sub.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
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
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double priceAtPurchase;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    // ── Free Trial fields ──────────────────────────────────────────────────────
    private Boolean isTrial;
    private LocalDateTime trialStartDate;
    private LocalDateTime trialEndDate;

    // ── User reference (communicates with User microservice) ──────────────────
    private Long userId;

    @ManyToOne
    @JsonIgnoreProperties({"subscriptions"})
    private Plan plan;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private SubscriptionStatus status;
}

