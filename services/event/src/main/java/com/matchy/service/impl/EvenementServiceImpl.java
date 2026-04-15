package com.matchy.service.impl;

import com.matchy.dto.EvenementCreateDTO;
import com.matchy.dto.EvenementDTO;
import com.matchy.entity.Evenement;
import com.matchy.exception.ResourceNotFoundException;
import com.matchy.repository.EvenementRepository;
import com.matchy.service.EvenementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EvenementServiceImpl implements EvenementService {
    
    private final EvenementRepository evenementRepository;
    
    @Override
    public EvenementDTO createEvenement(EvenementCreateDTO createDTO) {
        Evenement evenement = new Evenement();
        evenement.setTitle(createDTO.getTitle());
        evenement.setDescription(createDTO.getDescription());
        evenement.setDate(createDTO.getDate());
        evenement.setLocation(createDTO.getLocation());
        evenement.setType(createDTO.getType());
        evenement.setMaxParticipants(createDTO.getMaxParticipants());
        evenement.setCurrentParticipants(0);
        evenement.setStatus("ACTIVE");
        
        Evenement saved = evenementRepository.save(evenement);
        return convertToDTO(saved);
    }
    
    @Override
    public EvenementDTO updateEvenement(Long id, EvenementCreateDTO updateDTO) {
        Evenement evenement = evenementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evenement not found with id: " + id));
        
        evenement.setTitle(updateDTO.getTitle());
        evenement.setDescription(updateDTO.getDescription());
        evenement.setDate(updateDTO.getDate());
        evenement.setLocation(updateDTO.getLocation());
        evenement.setType(updateDTO.getType());
        evenement.setMaxParticipants(updateDTO.getMaxParticipants());
        
        Evenement updated = evenementRepository.save(evenement);
        return convertToDTO(updated);
    }
    
    @Override
    public void deleteEvenement(Long id) {
        if (!evenementRepository.existsById(id)) {
            throw new ResourceNotFoundException("Evenement not found with id: " + id);
        }
        evenementRepository.deleteById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public EvenementDTO getEvenementById(Long id) {
        Evenement evenement = evenementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evenement not found with id: " + id));
        return convertToDTO(evenement);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<EvenementDTO> getAllEvenements() {
        return evenementRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<EvenementDTO> getEvenementsByType(Evenement.EvenementType type) {
        return evenementRepository.findByType(type).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<EvenementDTO> getUpcomingEvenements() {
        return evenementRepository.findByDateAfter(LocalDateTime.now()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public EvenementDTO participateInEvenement(Long id) {
        Evenement evenement = evenementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evenement not found with id: " + id));
        
        if (evenement.getMaxParticipants() != null && 
            evenement.getCurrentParticipants() >= evenement.getMaxParticipants()) {
            throw new RuntimeException("Event is full");
        }
        
        evenement.setCurrentParticipants(evenement.getCurrentParticipants() + 1);
        Evenement updated = evenementRepository.save(evenement);
        return convertToDTO(updated);
    }
    
    @Override
    public EvenementDTO cancelParticipation(Long id) {
        Evenement evenement = evenementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evenement not found with id: " + id));
        
        if (evenement.getCurrentParticipants() > 0) {
            evenement.setCurrentParticipants(evenement.getCurrentParticipants() - 1);
        }
        
        Evenement updated = evenementRepository.save(evenement);
        return convertToDTO(updated);
    }
    
    private EvenementDTO convertToDTO(Evenement evenement) {
        EvenementDTO dto = new EvenementDTO();
        dto.setId(evenement.getId());
        dto.setTitle(evenement.getTitle());
        dto.setDescription(evenement.getDescription());
        dto.setDate(evenement.getDate());
        dto.setLocation(evenement.getLocation());
        dto.setType(evenement.getType());
        dto.setMaxParticipants(evenement.getMaxParticipants());
        dto.setCurrentParticipants(evenement.getCurrentParticipants());
        dto.setStatus(evenement.getStatus());
        dto.setCreatedAt(evenement.getCreatedAt());
        dto.setUpdatedAt(evenement.getUpdatedAt());
        return dto;
    }
}
