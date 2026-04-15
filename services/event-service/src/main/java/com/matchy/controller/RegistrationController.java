package com.matchy.controller;

import com.matchy.dto.RegistrationCreateDTO;
import com.matchy.dto.RegistrationDTO;
import com.matchy.entity.RegistrationStatus;
import com.matchy.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/registrations")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class RegistrationController {
    
    private final RegistrationService registrationService;
    
    @PostMapping
    public ResponseEntity<RegistrationDTO> createRegistration(@Valid @RequestBody RegistrationCreateDTO createDTO) {
        RegistrationDTO registration = registrationService.createRegistration(createDTO);
        return new ResponseEntity<>(registration, HttpStatus.CREATED);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<RegistrationDTO> getRegistrationById(@PathVariable Long id) {
        RegistrationDTO registration = registrationService.getRegistrationById(id);
        return ResponseEntity.ok(registration);
    }
    
    @GetMapping
    public ResponseEntity<List<RegistrationDTO>> getAllRegistrations() {
        List<RegistrationDTO> registrations = registrationService.getAllRegistrations();
        return ResponseEntity.ok(registrations);
    }
    
    @GetMapping("/evenement/{evenementId}")
    public ResponseEntity<List<RegistrationDTO>> getRegistrationsByEvenement(@PathVariable Long evenementId) {
        List<RegistrationDTO> registrations = registrationService.getRegistrationsByEvenementId(evenementId);
        return ResponseEntity.ok(registrations);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RegistrationDTO>> getRegistrationsByUser(@PathVariable Long userId) {
        List<RegistrationDTO> registrations = registrationService.getRegistrationsByUserId(userId);
        return ResponseEntity.ok(registrations);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<RegistrationDTO>> getRegistrationsByStatus(@PathVariable RegistrationStatus status) {
        List<RegistrationDTO> registrations = registrationService.getRegistrationsByStatus(status);
        return ResponseEntity.ok(registrations);
    }
    
    @PutMapping("/{id}/approve")
    public ResponseEntity<RegistrationDTO> approveRegistration(@PathVariable Long id) {
        RegistrationDTO registration = registrationService.approveRegistration(id);
        return ResponseEntity.ok(registration);
    }
    
    @PutMapping("/{id}/reject")
    public ResponseEntity<RegistrationDTO> rejectRegistration(@PathVariable Long id) {
        RegistrationDTO registration = registrationService.rejectRegistration(id);
        return ResponseEntity.ok(registration);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRegistration(@PathVariable Long id) {
        registrationService.deleteRegistration(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/evenement/{evenementId}/approved-count")
    public ResponseEntity<Long> getApprovedCount(@PathVariable Long evenementId) {
        Long count = registrationService.getApprovedCountByEvenementId(evenementId);
        return ResponseEntity.ok(count);
    }
}
