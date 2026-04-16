package tn.esprit.matchy_sub.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.matchy_sub.entities.User;

@Repository
public interface UserRepository extends JpaRepository<User,Long>{
}
