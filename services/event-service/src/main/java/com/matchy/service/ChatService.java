package com.matchy.service;

import com.matchy.dto.ChatMessageDTO;
import com.matchy.entity.Evenement;
import com.matchy.repository.EvenementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final EvenementRepository evenementRepository;
    private final RestTemplate restTemplate;

    @Value("${groq.api.key}")
    private String groqApiKey;

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final String MODEL = "llama-3.1-8b-instant";

    public String chat(String userMessage) {
        return chatWithHistory(List.of(new ChatMessageDTO("user", userMessage)));
    }

    public String chatWithHistory(List<ChatMessageDTO> history) {
        try {
            // Check for null or empty history
            if (history == null) {
                return "The conversation history is missing. Please try again.";
            }

            // Fetch all events from DB to give the AI context
            List<Evenement> events = evenementRepository.findAll();
            String eventsContext = buildEventsContext(events);
     
            String systemPrompt = """
                    You are a helpful assistant for the Matchy platform — a freelance and event management platform.
                    You help users discover events, register for them, and answer questions about freelancing.
                    
                    Here is the current list of events in the database (today is %s):
                    
                    %s
                    
                    Guidelines:
                    - Answer questions about events based ONLY on the data above.
                    - If a user asks about events on a specific date, check the list and respond accurately.
                    - If no events match, say so clearly.
                    - Be friendly, concise, and helpful.
                    - For registration questions, tell users to click the "Register" button on the event card.
                    - You can also give general freelancing advice when asked.
                    - ALWAYS respond in English.
                    """.formatted(LocalDate.now().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy")), eventsContext);

            // Build messages list including system prompt and history
            List<Map<String, String>> messages = new java.util.ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemPrompt));
            
            for (ChatMessageDTO msg : history) {
                if (msg.getContent() != null && !msg.getContent().isBlank()) {
                    messages.add(Map.of("role", msg.getRole(), "content", msg.getContent()));
                }
            }

            // Build Groq API request body
            Map<String, Object> requestBody = Map.of(
                    "model", MODEL,
                    "messages", messages,
                    "temperature", 0.7,
                    "max_tokens", 1024
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(groqApiKey);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(GROQ_URL, request, Map.class);
            Map body = response.getBody();
            if (body != null && body.containsKey("choices")) {
                List choices = (List) body.get("choices");
                if (!choices.isEmpty()) {
                    Map choice = (Map) choices.get(0);
                    Map message = (Map) choice.get("message");
                    return (String) message.get("content");
                }
            }
        } catch (Exception e) {
            log.error("Error in Matchy AI Service: {}", e.getMessage(), e);
            return "Sorry, I'm having trouble connecting to the AI service right now. Error details: " + e.getMessage();
        }

        return "I couldn't process your request. Please try again.";
    }

    private String buildEventsContext(List<Evenement> events) {
        if (events.isEmpty()) return "No events currently in the database.";

        StringBuilder sb = new StringBuilder();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMMM dd, yyyy 'at' HH:mm");

        for (Evenement e : events) {
            sb.append("- Title: ").append(e.getTitle()).append("\n");
            sb.append("  Type: ").append(e.getType()).append("\n");
            if (e.getDate() != null)
                sb.append("  Date: ").append(e.getDate().format(fmt)).append("\n");
            sb.append("  Location: ").append(e.getLocation() != null ? e.getLocation() : "Online").append("\n");
            sb.append("  Capacity: ").append(e.getCurrentParticipants()).append("/").append(e.getMaxParticipants()).append(" registered\n");
            sb.append("  Status: ").append(e.getStatus()).append("\n");
            if (e.getDescription() != null && !e.getDescription().isBlank())
                sb.append("  Description: ").append(e.getDescription()).append("\n");
            sb.append("\n");
        }
        return sb.toString();
    }
}
