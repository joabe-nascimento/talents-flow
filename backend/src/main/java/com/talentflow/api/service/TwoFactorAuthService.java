package com.talentflow.api.service;

import com.talentflow.api.entity.TwoFactorAuth;
import com.talentflow.api.entity.User;
import com.talentflow.api.exception.ResourceNotFoundException;
import com.talentflow.api.repository.TwoFactorAuthRepository;
import com.talentflow.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class TwoFactorAuthService {

    private final TwoFactorAuthRepository twoFactorAuthRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    // Armazenamento temporário de códigos (em produção, usar Redis)
    private final Map<Long, String> pendingCodes = new ConcurrentHashMap<>();
    private final Map<Long, LocalDateTime> codeExpiry = new ConcurrentHashMap<>();

    private static final int CODE_LENGTH = 6;
    private static final int CODE_EXPIRY_MINUTES = 5;
    private static final int BACKUP_CODES_COUNT = 8;

    public boolean isEnabled(Long userId) {
        return twoFactorAuthRepository.existsByUserIdAndIsEnabledTrue(userId);
    }

    public TwoFactorAuth.TwoFactorMethod getMethod(Long userId) {
        return twoFactorAuthRepository.findByUserId(userId)
                .map(TwoFactorAuth::getMethod)
                .orElse(null);
    }

    @Transactional
    public Map<String, Object> enable(Long userId, TwoFactorAuth.TwoFactorMethod method) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        TwoFactorAuth twoFactorAuth = twoFactorAuthRepository.findByUserId(userId)
                .orElse(TwoFactorAuth.builder().user(user).build());

        twoFactorAuth.setMethod(method);

        // Gerar backup codes
        List<String> backupCodes = generateBackupCodes();
        twoFactorAuth.setBackupCodes(String.join(",", backupCodes));

        if (method == TwoFactorAuth.TwoFactorMethod.AUTHENTICATOR) {
            // Gerar secret key para TOTP
            String secretKey = generateSecretKey();
            twoFactorAuth.setSecretKey(secretKey);
            
            twoFactorAuthRepository.save(twoFactorAuth);
            
            return Map.of(
                "secretKey", secretKey,
                "backupCodes", backupCodes,
                "qrCodeUrl", generateQRCodeUrl(user.getEmail(), secretKey)
            );
        } else {
            twoFactorAuthRepository.save(twoFactorAuth);
            
            return Map.of(
                "backupCodes", backupCodes,
                "method", method.name()
            );
        }
    }

    @Transactional
    public void verify(Long userId, String code) {
        TwoFactorAuth twoFactorAuth = twoFactorAuthRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("2FA não configurado"));

        // Verificar código
        boolean valid = verifyCode(userId, code, twoFactorAuth);
        
        if (!valid) {
            // Tentar backup code
            valid = verifyBackupCode(twoFactorAuth, code);
        }

        if (!valid) {
            throw new IllegalArgumentException("Código inválido");
        }

        // Ativar 2FA se ainda não estiver ativo
        if (!Boolean.TRUE.equals(twoFactorAuth.getIsEnabled())) {
            twoFactorAuth.setIsEnabled(true);
            twoFactorAuth.setVerifiedAt(LocalDateTime.now());
        }
        
        twoFactorAuth.setLastUsedAt(LocalDateTime.now());
        twoFactorAuthRepository.save(twoFactorAuth);
    }

    @Transactional
    public void disable(Long userId) {
        TwoFactorAuth twoFactorAuth = twoFactorAuthRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("2FA não configurado"));

        twoFactorAuth.setIsEnabled(false);
        twoFactorAuth.setSecretKey(null);
        twoFactorAuth.setBackupCodes(null);
        
        twoFactorAuthRepository.save(twoFactorAuth);
    }

    public void sendCode(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        TwoFactorAuth twoFactorAuth = twoFactorAuthRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("2FA não configurado"));

        String code = generateNumericCode();
        pendingCodes.put(userId, code);
        codeExpiry.put(userId, LocalDateTime.now().plusMinutes(CODE_EXPIRY_MINUTES));

        if (twoFactorAuth.getMethod() == TwoFactorAuth.TwoFactorMethod.EMAIL) {
            emailService.send2FACode(user.getEmail(), code);
        } else if (twoFactorAuth.getMethod() == TwoFactorAuth.TwoFactorMethod.SMS) {
            // Implementar envio de SMS
            throw new UnsupportedOperationException("SMS não implementado");
        }
    }

    public boolean validateLogin(Long userId, String code) {
        TwoFactorAuth twoFactorAuth = twoFactorAuthRepository.findByUserId(userId)
                .orElse(null);

        if (twoFactorAuth == null || !Boolean.TRUE.equals(twoFactorAuth.getIsEnabled())) {
            return true; // 2FA não habilitado, login permitido
        }

        boolean valid = verifyCode(userId, code, twoFactorAuth);
        
        if (!valid) {
            valid = verifyBackupCode(twoFactorAuth, code);
            if (valid) {
                // Remover backup code usado
                removeBackupCode(twoFactorAuth, code);
            }
        }

        if (valid) {
            twoFactorAuth.setLastUsedAt(LocalDateTime.now());
            twoFactorAuthRepository.save(twoFactorAuth);
        }

        return valid;
    }

    private boolean verifyCode(Long userId, String code, TwoFactorAuth twoFactorAuth) {
        if (twoFactorAuth.getMethod() == TwoFactorAuth.TwoFactorMethod.AUTHENTICATOR) {
            return verifyTOTP(twoFactorAuth.getSecretKey(), code);
        } else {
            // Email ou SMS
            String pendingCode = pendingCodes.get(userId);
            LocalDateTime expiry = codeExpiry.get(userId);
            
            if (pendingCode != null && expiry != null && 
                LocalDateTime.now().isBefore(expiry) && 
                pendingCode.equals(code)) {
                pendingCodes.remove(userId);
                codeExpiry.remove(userId);
                return true;
            }
            return false;
        }
    }

    private boolean verifyBackupCode(TwoFactorAuth twoFactorAuth, String code) {
        if (twoFactorAuth.getBackupCodes() == null) return false;
        
        String[] codes = twoFactorAuth.getBackupCodes().split(",");
        for (String backupCode : codes) {
            if (backupCode.equals(code)) {
                return true;
            }
        }
        return false;
    }

    private void removeBackupCode(TwoFactorAuth twoFactorAuth, String usedCode) {
        if (twoFactorAuth.getBackupCodes() == null) return;
        
        String[] codes = twoFactorAuth.getBackupCodes().split(",");
        List<String> remaining = new ArrayList<>();
        for (String code : codes) {
            if (!code.equals(usedCode)) {
                remaining.add(code);
            }
        }
        twoFactorAuth.setBackupCodes(String.join(",", remaining));
        twoFactorAuthRepository.save(twoFactorAuth);
    }

    private String generateNumericCode() {
        SecureRandom random = new SecureRandom();
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < CODE_LENGTH; i++) {
            code.append(random.nextInt(10));
        }
        return code.toString();
    }

    private String generateSecretKey() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[20];
        random.nextBytes(bytes);
        return Base64.getEncoder().encodeToString(bytes);
    }

    private List<String> generateBackupCodes() {
        SecureRandom random = new SecureRandom();
        List<String> codes = new ArrayList<>();
        for (int i = 0; i < BACKUP_CODES_COUNT; i++) {
            StringBuilder code = new StringBuilder();
            for (int j = 0; j < 8; j++) {
                code.append(random.nextInt(10));
            }
            codes.add(code.toString());
        }
        return codes;
    }

    private String generateQRCodeUrl(String email, String secretKey) {
        return "otpauth://totp/TalentFlow:" + email + "?secret=" + secretKey + "&issuer=TalentFlow";
    }

    private boolean verifyTOTP(String secretKey, String code) {
        // Implementação simplificada - em produção usar biblioteca TOTP
        // Por agora, aceitar qualquer código de 6 dígitos para teste
        return code != null && code.length() == 6 && code.matches("\\d+");
    }
}

