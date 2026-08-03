package com.auctxi.core.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for Swagger UI and OpenAPI documentation.
 *
 * This class configures the automatic generation of API documentation
 * available at /swagger-ui.html. It also sets up the global JWT bearer token
 * security scheme so developers can authenticate directly from the UI.
 */
@Configuration
@OpenAPIDefinition(
        info = @Info(title = "AuctXI API", version = "1.0", description = "AuctXI Cricket Auction API"),
        security = @SecurityRequirement(name = "bearerAuth")
)
@SecurityScheme(
        name = "bearerAuth",
        description = "JWT auth description",
        scheme = "bearer",
        type = SecuritySchemeType.HTTP,
        bearerFormat = "JWT",
        in = SecuritySchemeIn.HEADER
)
public class OpenApiConfig {
}
