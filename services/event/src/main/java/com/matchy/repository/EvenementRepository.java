package com.matchy.repository;

import com.matchy.entity.Evenement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EvenementRepository extends JpaRepository<Evenement, Long> {
    
    List<Evenement> findByType(Evenement.EvenementType type);
    
    List<Evenement> findByDateAfter(LocalDateTime date);
    
    List<Evenement> findByStatus(String status);
    
    List<Evenement> findByTypeAndStatus(Evenement.EvenementType type, String status);
}
