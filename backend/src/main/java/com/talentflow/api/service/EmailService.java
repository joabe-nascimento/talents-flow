package com.talentflow.api.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@talentflow.com}")
    private String fromEmail;

    @Value("${app.email.enabled:false}")
    private boolean emailEnabled;

    @Async
    public void sendSimpleEmail(String to, String subject, String body) {
        if (!emailEnabled) {
            log.info("Email disabled. Would send to: {} - Subject: {}", to, subject);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to: {}", to, e);
        }
    }

    @Async
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        if (!emailEnabled) {
            log.info("Email disabled. Would send HTML to: {} - Subject: {}", to, subject);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("HTML email sent to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send HTML email to: {}", to, e);
        }
    }

    // Notification templates
    public void sendVacationRequestNotification(String employeeEmail, String employeeName, String type, String startDate, String endDate) {
        String subject = "TalentFlow - Solicitação de " + type + " Registrada";
        String body = String.format("""
                Olá %s,
                
                Sua solicitação de %s foi registrada com sucesso!
                
                Período: %s a %s
                
                Você receberá uma notificação quando sua solicitação for analisada.
                
                Atenciosamente,
                TalentFlow
                """, employeeName, type, startDate, endDate);
        
        sendSimpleEmail(employeeEmail, subject, body);
    }

    public void sendVacationApprovalNotification(String employeeEmail, String employeeName, String type, boolean approved, String reason) {
        String status = approved ? "Aprovada" : "Rejeitada";
        String subject = "TalentFlow - Solicitação de " + type + " " + status;
        
        StringBuilder body = new StringBuilder();
        body.append(String.format("Olá %s,%n%n", employeeName));
        body.append(String.format("Sua solicitação de %s foi %s.%n%n", type, status.toLowerCase()));
        
        if (!approved && reason != null && !reason.isEmpty()) {
            body.append(String.format("Motivo: %s%n%n", reason));
        }
        
        body.append("Atenciosamente,\nTalentFlow");
        
        sendSimpleEmail(employeeEmail, subject, body.toString());
    }

    public void sendCandidateStatusNotification(String candidateEmail, String candidateName, String jobTitle, String newStatus) {
        String subject = "TalentFlow - Atualização da sua candidatura";
        String body = String.format("""
                Olá %s,
                
                Houve uma atualização na sua candidatura para a vaga de %s.
                
                Novo status: %s
                
                Continue acompanhando o processo através do nosso sistema.
                
                Atenciosamente,
                TalentFlow
                """, candidateName, jobTitle, newStatus);
        
        sendSimpleEmail(candidateEmail, subject, body);
    }

    public void sendPerformanceReviewNotification(String employeeEmail, String employeeName, String reviewerName, String period) {
        String subject = "TalentFlow - Nova Avaliação de Desempenho";
        String body = String.format("""
                Olá %s,
                
                Uma nova avaliação de desempenho foi criada para você.
                
                Avaliador: %s
                Período: %s
                
                Acesse o sistema para visualizar os detalhes.
                
                Atenciosamente,
                TalentFlow
                """, employeeName, reviewerName, period);
        
        sendSimpleEmail(employeeEmail, subject, body);
    }

    public void sendWelcomeEmail(String employeeEmail, String employeeName, String password) {
        String subject = "Bem-vindo ao TalentFlow!";
        String body = String.format("""
                Olá %s,
                
                Bem-vindo ao TalentFlow!
                
                Suas credenciais de acesso:
                Email: %s
                Senha temporária: %s
                
                Por favor, altere sua senha no primeiro acesso.
                
                Atenciosamente,
                TalentFlow
                """, employeeName, employeeEmail, password);
        
        sendSimpleEmail(employeeEmail, subject, body);
    }

    public void sendNotificationEmail(String email, String title, String message) {
        String subject = "TalentFlow - " + title;
        String body = String.format("""
                %s
                
                ---
                Esta é uma notificação automática do TalentFlow.
                """, message);
        
        sendSimpleEmail(email, subject, body);
    }

    public void send2FACode(String email, String code) {
        String subject = "TalentFlow - Código de Verificação";
        String body = String.format("""
                Seu código de verificação é: %s
                
                Este código expira em 5 minutos.
                
                Se você não solicitou este código, ignore este email.
                
                Atenciosamente,
                TalentFlow
                """, code);
        
        sendSimpleEmail(email, subject, body);
    }

    public void sendPayrollNotification(String email, String employeeName, String period) {
        String subject = "TalentFlow - Holerite Disponível";
        String body = String.format("""
                Olá %s,
                
                Seu holerite de %s está disponível no sistema.
                
                Acesse o TalentFlow para visualizar os detalhes.
                
                Atenciosamente,
                TalentFlow
                """, employeeName, period);
        
        sendSimpleEmail(email, subject, body);
    }

    public void sendDocumentExpiringNotification(String email, String employeeName, String documentName, int daysUntilExpiry) {
        String subject = "TalentFlow - Documento Expirando";
        String body = String.format("""
                Olá %s,
                
                O documento "%s" está prestes a expirar em %d dias.
                
                Por favor, providencie a renovação o mais breve possível.
                
                Atenciosamente,
                TalentFlow
                """, employeeName, documentName, daysUntilExpiry);
        
        sendSimpleEmail(email, subject, body);
    }
}


