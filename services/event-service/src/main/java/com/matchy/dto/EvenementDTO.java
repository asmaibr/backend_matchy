package com.matchy.dto;

import com.matchy.entity.Evenement;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvenementDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime date;
    private String location;
    private Evenement.EvenementType type;
    private Integer maxParticipants;
    private Integer currentParticipants;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
