package com.matchy.controller;

import com.matchy.dto.ChatRequestDTO;
import com.matchy.dto.ChatResponseDTO;
import com.matchy.dto.EvenementCreateDTO;
import com.matchy.dto.EvenementDTO;
import com.matchy.entity.Evenement;
import com.matchy.service.ChatService;
import com.matchy.service.EvenementService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evenements")
public class EvenementController {

    private final EvenementService evenementService;
    private ChatService chatService;

    @Autowired
    public EvenementController(EvenementService evenementService, @Autowired(required = false) ChatService chatService) {
        this.evenementService = evenementService;
        this.chatService = chatService;
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponseDTO> chat(@RequestBody ChatRequestDTO request) {
        try {
            if (chatService == null) {
                return ResponseEntity.ok(new ChatResponseDTO("Backend Error: ChatService was not properly injected. Please restart."));
            }
            String reply = chatService.chatWithHistory(request.getHistory());
            return ResponseEntity.ok(new ChatResponseDTO(reply));
        } catch (Exception e) {
            return ResponseEntity.ok(new ChatResponseDTO("Controller Error: " + e.getMessage()));
        }
    }

    @GetMapping("/chat/test")
    public ResponseEntity<String> testChat() {
        return ResponseEntity.ok("Chat system integrated into EvenementController is WORKING! ✅");
    }

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
