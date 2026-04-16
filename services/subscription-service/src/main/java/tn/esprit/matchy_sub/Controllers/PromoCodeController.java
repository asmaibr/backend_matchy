package tn.esprit.matchy_sub.Controllers;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.matchy_sub.entities.PromoCode;
import tn.esprit.matchy_sub.services.PromoCodeService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/promo-codes")
@AllArgsConstructor
@CrossOrigin("*")
public class PromoCodeController {
    private final PromoCodeService promoCodeService;

    // ── Admin: Generate new promo code (auto-generated) ─────────────────────────
    @PostMapping("/generate")
    public ResponseEntity<?> generateCode(@RequestParam(required = false) String notes) {
        try {
            PromoCode code = promoCodeService.generateCode(notes);
            return ResponseEntity.ok(code);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ── Admin: Create promo code with custom code ──────────────────────────────
    @PostMapping("/create")
    public ResponseEntity<?> createCode(@RequestBody Map<String, Object> body) {
        try {
            String code = body.get("code") != null ? body.get("code").toString().trim().toUpperCase() : null;
            Integer discountPercent = body.get("discountPercent") != null ? 
                Integer.parseInt(body.get("discountPercent").toString()) : 10;
            String notes = body.get("notes") != null ? body.get("notes").toString() : null;
            
            if (code == null || code.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Code cannot be empty"));
            }
            
            PromoCode created = promoCodeService.createCode(code, discountPercent, notes);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── Admin: Get all promo codes ─────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<?> getAllCodes() {
        try {
            List<PromoCode> codes = promoCodeService.getAllCodes();
            return ResponseEntity.ok(codes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ── Admin: Get active promo codes ──────────────────────────────────────────
    @GetMapping("/active")
    public ResponseEntity<?> getActiveCodes() {
        try {
            List<PromoCode> codes = promoCodeService.getActiveCodes();
            return ResponseEntity.ok(codes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ── Frontend: Validate promo code ──────────────────────────────────────────
    @PostMapping("/validate")
    public ResponseEntity<?> validateCode(
            @RequestParam String code,
            @RequestParam Double amountTnd) {
        try {
            Map<String, Object> result = promoCodeService.validateCode(code, amountTnd);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ── Admin: Deactivate a promo code ────────────────────────────────────────
    @PostMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateCode(@PathVariable Long id) {
        try {
            PromoCode code = promoCodeService.deactivateCode(id);
            return ResponseEntity.ok(code);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ── Admin: Reactivate a promo code ────────────────────────────────────────
    @PostMapping("/{id}/reactivate")
    public ResponseEntity<?> reactivateCode(@PathVariable Long id) {
        try {
            PromoCode code = promoCodeService.reactivateCode(id);
            return ResponseEntity.ok(code);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ── Admin: Delete a promo code ────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCode(@PathVariable Long id) {
        try {
            promoCodeService.deleteCode(id);
            return ResponseEntity.ok(Map.of("message", "Promo code deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
