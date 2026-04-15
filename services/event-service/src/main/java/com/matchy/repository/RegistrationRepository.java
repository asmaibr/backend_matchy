package com.matchy.repository;

import com.matchy.entity.Registration;
import com.matchy.entity.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    
    List<Registration> findByEvenementId(Long evenementId);
    
    List<Registration> findByUserId(Long userId);
    
    List<Registration> findByStatus(RegistrationStatus status);
    
    @Query("SELECT r FROM Registration r WHERE r.evenement.id = :evenementId AND r.status = :status")
    List<Registration> findByEvenementIdAndStatus(Long evenementId, RegistrationStatus status);
    
    @Query("SELECT COUNT(r) FROM Registration r WHERE r.evenement.id = :evenementId AND r.status = 'APPROVED'")
    Long countApprovedByEvenementId(Long evenementId);
    
    Optional<Registration> findByUserIdAndEvenementId(Long userId, Long evenementId);
    
    boolean existsByUserIdAndEvenementId(Long userId, Long evenementId);
}
