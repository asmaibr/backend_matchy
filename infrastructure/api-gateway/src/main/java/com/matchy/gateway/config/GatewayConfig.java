package com.matchy.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // Route for Backend API - Users
                .route("user-service", r -> r
                        .path("/api/users/**")
                        .filters(f -> f
                                .stripPrefix(0)
                                .addRequestHeader("X-Gateway", "API-Gateway")
                                .addResponseHeader("X-Powered-By", "Matchy-Gateway"))
                        .uri("lb://MATCHY-BACKEND"))
                
                // Route for Backend API - Events
                .route("event-service", r -> r
                        .path("/api/evenements/**")
                        .filters(f -> f
                                .stripPrefix(0)
                                .addRequestHeader("X-Gateway", "API-Gateway")
                                .addResponseHeader("X-Powered-By", "Matchy-Gateway"))
                        .uri("lb://MATCHY-BACKEND"))
                
                // Route for Backend API - Registrations
                .route("registration-service", r -> r
                        .path("/api/registrations/**")
                        .filters(f -> f
                                .stripPrefix(0)
                                .addRequestHeader("X-Gateway", "API-Gateway")
                                .addResponseHeader("X-Powered-By", "Matchy-Gateway"))
                        .uri("lb://MATCHY-BACKEND"))
                
                // Route for Backend API - Health Check
                .route("health-check", r -> r
                        .path("/api/health/**")
                        .filters(f -> f
                                .stripPrefix(0)
                                .addRequestHeader("X-Gateway", "API-Gateway"))
                        .uri("lb://MATCHY-BACKEND"))

                // Route for Chat AI
                .route("chat-service", r -> r
                        .path("/api/chat/**")
                        .filters(f -> f
                                .stripPrefix(0)
                                .addRequestHeader("X-Gateway", "API-Gateway")
                                .addResponseHeader("X-Powered-By", "Matchy-Gateway"))
                        .uri("lb://MATCHY-BACKEND"))
                
                // Route for Actuator endpoints
                .route("actuator", r -> r
                        .path("/actuator/**")
                        .uri("lb://MATCHY-BACKEND"))
                
                .build();
    }
}
