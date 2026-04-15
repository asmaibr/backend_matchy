package com.matchy.dto;

import com.matchy.entity.Evenement;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvenementCreateDTO {
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    @NotNull(message = "Date is required")
    @Future(message = "Event date must be in the future")
    private LocalDateTime date;
    
    private String location;
    
    @NotNull(message = "Event type is required")
    private Evenement.EvenementType type;
    
    @Positive(message = "Max participants must be positive")
    private Integer maxParticipants;
}
