package com.matchy.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "evenements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Evenement {

    public enum EvenementType {
        CONFERENCE, WORKSHOP, NETWORKING, WEBINAR, OTHER,
        CERTIFICATION, TRAINING, FREELANCE_OPPORTUNITY, RECOMMENDATION
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDateTime date;

    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EvenementType type;

    private Integer maxParticipants;

    @Column(nullable = false)
    private Integer currentParticipants = 0;

    @Column(nullable = false)
    private String status = "ACTIVE";

    @OneToMany(mappedBy = "evenement", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Registration> registrations = new ArrayList<>();

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
