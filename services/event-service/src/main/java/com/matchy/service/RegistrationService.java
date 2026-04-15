package com.matchy.service;

import com.matchy.dto.RegistrationCreateDTO;
import com.matchy.dto.RegistrationDTO;
import com.matchy.entity.RegistrationStatus;

import java.util.List;

public interface RegistrationService {

    RegistrationDTO createRegistration(RegistrationCreateDTO createDTO);

    RegistrationDTO getRegistrationById(Long id);

    List<RegistrationDTO> getAllRegistrations();

    List<RegistrationDTO> getRegistrationsByEvenementId(Long evenementId);

    List<RegistrationDTO> getRegistrationsByUserId(Long userId);

    List<RegistrationDTO> getRegistrationsByStatus(RegistrationStatus status);

    RegistrationDTO approveRegistration(Long id);

    RegistrationDTO rejectRegistration(Long id);

    void deleteRegistration(Long id);

    Long getApprovedCountByEvenementId(Long evenementId);
}
