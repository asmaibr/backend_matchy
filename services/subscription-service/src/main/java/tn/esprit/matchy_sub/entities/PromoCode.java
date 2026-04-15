package tn.esprit.matchy_sub.entities;

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
public class PromoCode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String code; // e.g., "MATCHY-ABC12345"

    @Column(nullable = false)
    private Integer discountPercent; // Always 10% for now

    @Column(nullable = false)
    private Boolean active; // Can be deactivated by admin

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private Integer usageCount; // Track how many times used

    private LocalDateTime deactivatedAt; // When admin deactivated it

    private String notes; // Admin notes about this code
}
