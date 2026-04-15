package com.matchy.service;

import com.matchy.dto.EvenementCreateDTO;
import com.matchy.dto.EvenementDTO;
import com.matchy.entity.Evenement;

import java.util.List;

public interface EvenementService {
    
    EvenementDTO createEvenement(EvenementCreateDTO createDTO);
    
    EvenementDTO updateEvenement(Long id, EvenementCreateDTO updateDTO);
    
    void deleteEvenement(Long id);
    
    EvenementDTO getEvenementById(Long id);
    
    List<EvenementDTO> getAllEvenements();
    
    List<EvenementDTO> getEvenementsByType(Evenement.EvenementType type);
    
    List<EvenementDTO> getUpcomingEvenements();
    
    EvenementDTO participateInEvenement(Long id);
    
    EvenementDTO cancelParticipation(Long id);
}
