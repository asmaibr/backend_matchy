package com.matchy.dto;

import com.matchy.entity.RegistrationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationDTO {
    
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private Long userId;
    private String userFullName;
    private Long evenementId;
    private String evenementTitle;
    private RegistrationStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
