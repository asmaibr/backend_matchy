package com.matchy.controller;

import com.matchy.entity.Badge;
import com.matchy.service.GamificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/badges")
public class BadgeController {

    @Autowired private GamificationService gamificationService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Badge>> getBadges(@PathVariable Long userId) {
        return ResponseEntity.ok(gamificationService.getBadgesForUser(userId));
    }

    @PostMapping("/client/project-posted")
    public ResponseEntity<?> onClientProjectPosted(@RequestBody Map<String, Object> body) {
        Long clientId = Long.valueOf(String.valueOf(body.getOrDefault("clientId", "0")));
        long totalProjects = Long.parseLong(String.valueOf(body.getOrDefault("totalProjects", "0")));
        if (clientId <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "clientId is required"));
        }
        gamificationService.onClientProjectPosted(clientId, totalProjects);
        return ResponseEntity.ok(Map.of("message", "Client badges checked"));
    }

    @PostMapping("/notify")
    public ResponseEntity<?> notifyBadge(@RequestBody Map<String, String> body) {
        Long userId = Long.valueOf(String.valueOf(body.getOrDefault("userId", "0")));
        String email = body.getOrDefault("email", "");
        String badgeName = body.getOrDefault("badgeName", "Badge");
        String badgeDesc = body.getOrDefault("badgeDesc", "Achievement unlocked");
        if (userId <= 0 || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "userId and email are required"));
        }
        gamificationService.notifyBadgeByRequest(userId, email, badgeName, badgeDesc);
        return ResponseEntity.ok(Map.of("message", "Badge notification sent"));
    }
}