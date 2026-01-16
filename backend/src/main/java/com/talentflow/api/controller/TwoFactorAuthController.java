package com.talentflow.api.controller;

import com.talentflow.api.entity.TwoFactorAuth;
import com.talentflow.api.service.TwoFactorAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/2fa")
@RequiredArgsConstructor
@Tag(name = "Autenticação 2FA", description = "Gestão de autenticação de dois fatores")
@SecurityRequirement(name = "bearerAuth")
public class TwoFactorAuthController {

    private final TwoFactorAuthService twoFactorAuthService;

    @GetMapping("/status/{userId}")
    @Operation(summary = "Verificar status do 2FA")
    public ResponseEntity<Map<String, Object>> getStatus(@PathVariable Long userId) {
        boolean enabled = twoFactorAuthService.isEnabled(userId);
        TwoFactorAuth.TwoFactorMethod method = twoFactorAuthService.getMethod(userId);
        
        return ResponseEntity.ok(Map.of(
                "enabled", enabled,
                "method", method != null ? method.name() : "NONE"
        ));
    }

    @PostMapping("/enable/{userId}")
    @Operation(summary = "Habilitar 2FA")
    public ResponseEntity<Map<String, Object>> enable(
            @PathVariable Long userId,
            @RequestParam TwoFactorAuth.TwoFactorMethod method) {
        return ResponseEntity.ok(twoFactorAuthService.enable(userId, method));
    }

    @PostMapping("/verify/{userId}")
    @Operation(summary = "Verificar código e ativar 2FA")
    public ResponseEntity<Map<String, String>> verify(
            @PathVariable Long userId,
            @RequestParam String code) {
        twoFactorAuthService.verify(userId, code);
        return ResponseEntity.ok(Map.of("message", "2FA ativado com sucesso"));
    }

    @PostMapping("/disable/{userId}")
    @Operation(summary = "Desabilitar 2FA")
    public ResponseEntity<Map<String, String>> disable(@PathVariable Long userId) {
        twoFactorAuthService.disable(userId);
        return ResponseEntity.ok(Map.of("message", "2FA desabilitado"));
    }

    @PostMapping("/send-code/{userId}")
    @Operation(summary = "Enviar código por email/SMS")
    public ResponseEntity<Map<String, String>> sendCode(@PathVariable Long userId) {
        twoFactorAuthService.sendCode(userId);
        return ResponseEntity.ok(Map.of("message", "Código enviado"));
    }

    @PostMapping("/validate/{userId}")
    @Operation(summary = "Validar código de login")
    public ResponseEntity<Map<String, Boolean>> validateLogin(
            @PathVariable Long userId,
            @RequestParam String code) {
        boolean valid = twoFactorAuthService.validateLogin(userId, code);
        return ResponseEntity.ok(Map.of("valid", valid));
    }

    @GetMapping("/methods")
    @Operation(summary = "Listar métodos de 2FA disponíveis")
    public ResponseEntity<TwoFactorAuth.TwoFactorMethod[]> getMethods() {
        return ResponseEntity.ok(TwoFactorAuth.TwoFactorMethod.values());
    }
}

