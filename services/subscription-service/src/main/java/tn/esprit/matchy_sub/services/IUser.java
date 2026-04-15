package tn.esprit.matchy_sub.services;

import tn.esprit.matchy_sub.entities.User;

import java.util.List;

public interface IUser {
    User create(User user);
    User update(Long id, User user);
    User getById(Long id);
    List<User> getAll();
    void delete(Long id);
}
