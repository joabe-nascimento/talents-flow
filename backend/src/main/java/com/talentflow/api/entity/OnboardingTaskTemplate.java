package com.talentflow.api.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "onboarding_task_templates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnboardingTaskTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    @ToString.Exclude
    private OnboardingTemplate template;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskCategory category;

    @Column(name = "order_index")
    private Integer orderIndex;

    @Column(name = "due_days")
    private Integer dueDays; // Dias após início para conclusão

    @Column(name = "is_required")
    @Builder.Default
    private Boolean isRequired = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "assigned_to_role")
    private Role assignedToRole; // Quem é responsável

    public enum TaskCategory {
        DOCUMENTATION,   // Documentação
        IT_SETUP,       // Configuração de TI
        TRAINING,       // Treinamento
        INTRODUCTION,   // Apresentação
        COMPLIANCE,     // Compliance
        EQUIPMENT,      // Equipamentos
        ACCESS,         // Acessos
        OTHER           // Outros
    }
}

