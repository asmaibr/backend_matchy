package tn.esprit.matchy_sub.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString(exclude = {"password"})
@EqualsAndHashCode(exclude = {})
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false)
    private String email;
    
    @JsonIgnore
    private String password; // À encoder avec BCrypt
    
    private String firstName;
    private String lastName;

    @Enumerated(EnumType.STRING)
    private UserType user;
    
    // NOTE: Subscriptions are now managed via userId (Long) in Subscription entity
    // This enables microservices architecture where User service is separate
}
