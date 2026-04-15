package com.matchy.controller;

import com.matchy.dto.EvenementCreateDTO;
import com.matchy.dto.EvenementDTO;
import com.matchy.entity.Evenement;
import com.matchy.service.EvenementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evenements")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class EvenementController {

    private final EvenementService evenementService;

    @GetMapping
    public ResponseEntity<List<EvenementDTO>> getAllEvenements() {
        return ResponseEntity.ok(evenementService.getAllEvenements());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EvenementDTO> getEvenementById(@PathVariable Long id) {
        return ResponseEntity.ok(evenementService.getEvenementById(id));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<EvenementDTO>> getUpcomingEvenements() {
        return ResponseEntity.ok(evenementService.getUpcomingEvenements());
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<EvenementDTO>> getEvenementsByType(@PathVariable Evenement.EvenementType type) {
        return ResponseEntity.ok(evenementService.getEvenementsByType(type));
    }

    @PostMapping
    public ResponseEntity<EvenementDTO> createEvenement(@Valid @RequestBody EvenementCreateDTO createDTO) {
        return new ResponseEntity<>(evenementService.createEvenement(createDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EvenementDTO> updateEvenement(@PathVariable Long id, @Valid @RequestBody EvenementCreateDTO updateDTO) {
        return ResponseEntity.ok(evenementService.updateEvenement(id, updateDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvenement(@PathVariable Long id) {
        evenementService.deleteEvenement(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/participate")
    public ResponseEntity<EvenementDTO> participate(@PathVariable Long id) {
        return ResponseEntity.ok(evenementService.participateInEvenement(id));
    }

    @PostMapping("/{id}/cancel-participation")
    public ResponseEntity<EvenementDTO> cancelParticipation(@PathVariable Long id) {
        return ResponseEntity.ok(evenementService.cancelParticipation(id));
    }
}
