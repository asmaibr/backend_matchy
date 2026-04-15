package tn.esprit.matchy_sub.Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/flouci")
@CrossOrigin("*")
@RequiredArgsConstructor
public class FlouciController {

    // Set these in application.properties
    @Value("${flouci.app_token:your_app_token}")
    private String appToken;

    @Value("${flouci.app_secret:your_app_secret}")
    private String appSecret;

    @Value("${flouci.success_url:http://localhost:4200/payment-success}")
    private String successUrl;

    @Value("${flouci.fail_url:http://localhost:4200/payment-fail}")
    private String failUrl;

    private static final String FLOUCI_INIT_URL = "https://developers.flouci.com/api/generate_payment";
    private static final String FLOUCI_VERIFY_URL = "https://developers.flouci.com/api/verify_payment/";

    /**
     * Initiate a Flouci payment.
     * Body: { "amount": 29, "transactionRef": "TXN-2026-XXXXX" }
     * Returns: { "paymentUrl": "https://app.flouci.com/...", "paymentId": "..." }
     */
    @PostMapping("/init")
    public ResponseEntity<?> initPayment(@RequestBody Map<String, Object> body) {
        try {
            double amountTnd = Double.parseDouble(body.getOrDefault("amount", 0).toString());
            String ref = body.getOrDefault("transactionRef", "TXN-REF").toString();

            // Flouci expects amount in millimes (1 TND = 1000 millimes)
            long amountMillimes = Math.round(amountTnd * 1000);

            Map<String, Object> payload = new HashMap<>();
            payload.put("app_token", appToken);
            payload.put("app_secret", appSecret);
            payload.put("amount", amountMillimes);
            payload.put("accept_card", false);
            payload.put("session_timeout_secs", 1200);
            payload.put("success_link", successUrl + "?ref=" + ref);
            payload.put("fail_link", failUrl + "?ref=" + ref);
            payload.put("developer_tracking_id", ref);

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(FLOUCI_INIT_URL, request, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<?, ?> result = response.getBody();
                // Flouci returns: { "result": { "link": "...", "payment_id": "..." } }
                Map<?, ?> resultData = (Map<?, ?>) result.get("result");
                if (resultData != null) {
                    Map<String, Object> resp = new HashMap<>();
                    resp.put("paymentUrl", resultData.get("link"));
                    resp.put("paymentId", resultData.get("payment_id"));
                    resp.put("ref", ref);
                    return ResponseEntity.ok(resp);
                }
            }
            return ResponseEntity.badRequest().body("Flouci init failed");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Flouci error: " + e.getMessage());
        }
    }

    /**
     * Verify a Flouci payment after redirect.
     * GET /flouci/verify/{paymentId}
     */
    @GetMapping("/verify/{paymentId}")
    public ResponseEntity<?> verifyPayment(@PathVariable String paymentId) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("apppublic", appToken);
            headers.set("appsecret", appSecret);
            HttpEntity<Void> request = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                FLOUCI_VERIFY_URL + paymentId,
                HttpMethod.GET,
                request,
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return ResponseEntity.ok(response.getBody());
            }
            return ResponseEntity.badRequest().body("Verification failed");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Verify error: " + e.getMessage());
        }
    }
}
