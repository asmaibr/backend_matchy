package tn.esprit.matchy_sub.services;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.matchy_sub.entities.User;
import tn.esprit.matchy_sub.repositories.UserRepository;

import java.util.List;

@Service
@AllArgsConstructor
public class UserImp implements IUser{

    private final UserRepository userRepository;

    @Override
    public User create(User user) {
        return userRepository.save(user);
    }
    @Override
    public User update(Long id, User user) {
        return userRepository.save(user);
    }
    @Override
    public User getById(Long id) {
        return userRepository.findById(id).orElseThrow();
    }
    @Override
    public List<User> getAll() {
        return userRepository.findAll();
    }
    @Override
    public void delete(Long id) {
        userRepository.deleteById(id);
    }
}
