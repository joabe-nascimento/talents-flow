package com.talentflow.api.config;

import com.talentflow.api.entity.*;
import com.talentflow.api.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final JobPositionRepository jobPositionRepository;
    private final CandidateRepository candidateRepository;
    private final VacationRequestRepository vacationRequestRepository;
    private final PerformanceReviewRepository performanceReviewRepository;
    private final ActivityLogRepository activityLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Carregando dados iniciais...");
            loadData();
            log.info("Dados iniciais carregados com sucesso!");
        }
    }

    private void loadData() {
        // Criar usuário Admin
        User adminUser = User.builder()
                .name("Administrador")
                .email("admin@talentflow.com")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .isActive(true)
                .build();
        adminUser = userRepository.save(adminUser);

        // Criar usuário HR
        User hrUser = User.builder()
                .name("Maria Silva")
                .email("maria.silva@talentflow.com")
                .password(passwordEncoder.encode("hr123456"))
                .role(Role.HR)
                .isActive(true)
                .build();
        hrUser = userRepository.save(hrUser);

        // Criar mais usuários funcionários
        User user1 = User.builder()
                .name("Carlos Oliveira")
                .email("carlos.oliveira@talentflow.com")
                .password(passwordEncoder.encode("123456"))
                .role(Role.EMPLOYEE)
                .isActive(true)
                .build();
        user1 = userRepository.save(user1);

        User user2 = User.builder()
                .name("Ana Santos")
                .email("ana.santos@talentflow.com")
                .password(passwordEncoder.encode("123456"))
                .role(Role.EMPLOYEE)
                .isActive(true)
                .build();
        user2 = userRepository.save(user2);

        User user3 = User.builder()
                .name("Roberto Lima")
                .email("roberto.lima@talentflow.com")
                .password(passwordEncoder.encode("123456"))
                .role(Role.MANAGER)
                .isActive(true)
                .build();
        user3 = userRepository.save(user3);

        User user4 = User.builder()
                .name("Fernanda Costa")
                .email("fernanda.costa@talentflow.com")
                .password(passwordEncoder.encode("123456"))
                .role(Role.EMPLOYEE)
                .isActive(true)
                .build();
        user4 = userRepository.save(user4);

        // Criar departamentos
        Department techDept = Department.builder()
                .name("Tecnologia")
                .description("Departamento de Tecnologia da Informação")
                .build();
        techDept = departmentRepository.save(techDept);

        Department hrDept = Department.builder()
                .name("Recursos Humanos")
                .description("Departamento de Gestão de Pessoas")
                .build();
        hrDept = departmentRepository.save(hrDept);

        Department financeDept = Department.builder()
                .name("Financeiro")
                .description("Departamento Financeiro e Contábil")
                .build();
        financeDept = departmentRepository.save(financeDept);

        Department marketingDept = Department.builder()
                .name("Marketing")
                .description("Departamento de Marketing e Comunicação")
                .build();
        marketingDept = departmentRepository.save(marketingDept);

        // Criar funcionários
        Employee adminEmployee = Employee.builder()
                .user(adminUser)
                .position("Diretor de Tecnologia")
                .department(techDept)
                .hireDate(LocalDate.of(2020, 1, 15))
                .salary(new BigDecimal("25000.00"))
                .phone("(11) 99999-0001")
                .status(Employee.EmployeeStatus.ACTIVE)
                .build();
        adminEmployee = employeeRepository.save(adminEmployee);

        Employee hrEmployee = Employee.builder()
                .user(hrUser)
                .position("Gerente de RH")
                .department(hrDept)
                .hireDate(LocalDate.of(2021, 3, 10))
                .salary(new BigDecimal("15000.00"))
                .phone("(11) 99999-0002")
                .status(Employee.EmployeeStatus.ACTIVE)
                .build();
        hrEmployee = employeeRepository.save(hrEmployee);

        Employee employee1 = Employee.builder()
                .user(user1)
                .position("Desenvolvedor Senior")
                .department(techDept)
                .hireDate(LocalDate.of(2022, 5, 1))
                .salary(new BigDecimal("12000.00"))
                .phone("(11) 99999-0003")
                .status(Employee.EmployeeStatus.ACTIVE)
                .build();
        employee1 = employeeRepository.save(employee1);

        Employee employee2 = Employee.builder()
                .user(user2)
                .position("Analista de RH")
                .department(hrDept)
                .hireDate(LocalDate.of(2023, 2, 15))
                .salary(new BigDecimal("7000.00"))
                .phone("(11) 99999-0004")
                .status(Employee.EmployeeStatus.ACTIVE)
                .build();
        employee2 = employeeRepository.save(employee2);

        Employee employee3 = Employee.builder()
                .user(user3)
                .position("Gerente Financeiro")
                .department(financeDept)
                .hireDate(LocalDate.of(2021, 8, 1))
                .salary(new BigDecimal("18000.00"))
                .phone("(11) 99999-0005")
                .status(Employee.EmployeeStatus.ACTIVE)
                .build();
        employee3 = employeeRepository.save(employee3);

        Employee employee4 = Employee.builder()
                .user(user4)
                .position("Analista de Marketing")
                .department(marketingDept)
                .hireDate(LocalDate.of(2023, 6, 1))
                .salary(new BigDecimal("6500.00"))
                .phone("(11) 99999-0006")
                .status(Employee.EmployeeStatus.ACTIVE)
                .build();
        employee4 = employeeRepository.save(employee4);

        // Definir gerentes dos departamentos
        techDept.setManager(adminEmployee);
        departmentRepository.save(techDept);

        hrDept.setManager(hrEmployee);
        departmentRepository.save(hrDept);

        financeDept.setManager(employee3);
        departmentRepository.save(financeDept);

        // Criar vagas
        JobPosition devJob = JobPosition.builder()
                .title("Desenvolvedor Full Stack")
                .description("Desenvolvimento de aplicações web usando Java/Spring Boot e Angular")
                .requirements("Java, Spring Boot, Angular, PostgreSQL, Docker")
                .department(techDept)
                .salaryMin(new BigDecimal("8000.00"))
                .salaryMax(new BigDecimal("15000.00"))
                .type(JobPosition.JobType.FULL_TIME)
                .status(JobPosition.JobStatus.OPEN)
                .openingDate(LocalDate.now())
                .build();
        devJob = jobPositionRepository.save(devJob);

        JobPosition analystJob = JobPosition.builder()
                .title("Analista de RH")
                .description("Análise e gestão de processos de RH")
                .requirements("Experiência em RH, Excel avançado, Comunicação")
                .department(hrDept)
                .salaryMin(new BigDecimal("5000.00"))
                .salaryMax(new BigDecimal("8000.00"))
                .type(JobPosition.JobType.FULL_TIME)
                .status(JobPosition.JobStatus.OPEN)
                .openingDate(LocalDate.now())
                .build();
        jobPositionRepository.save(analystJob);

        JobPosition internJob = JobPosition.builder()
                .title("Estagiário de Marketing")
                .description("Apoio nas atividades de marketing digital")
                .requirements("Cursando Marketing, Comunicação ou áreas afins")
                .department(marketingDept)
                .salaryMin(new BigDecimal("1500.00"))
                .salaryMax(new BigDecimal("2000.00"))
                .type(JobPosition.JobType.INTERNSHIP)
                .status(JobPosition.JobStatus.OPEN)
                .openingDate(LocalDate.now())
                .build();
        jobPositionRepository.save(internJob);

        // Criar candidatos
        Candidate candidate1 = Candidate.builder()
                .name("João Santos")
                .email("joao.santos@email.com")
                .phone("(11) 98765-4321")
                .linkedinUrl("https://linkedin.com/in/joaosantos")
                .jobPosition(devJob)
                .status(Candidate.CandidateStatus.INTERVIEW_SCHEDULED)
                .build();
        candidateRepository.save(candidate1);

        Candidate candidate2 = Candidate.builder()
                .name("Ana Oliveira")
                .email("ana.oliveira@email.com")
                .phone("(11) 98765-4322")
                .linkedinUrl("https://linkedin.com/in/anaoliveira")
                .jobPosition(devJob)
                .status(Candidate.CandidateStatus.APPLIED)
                .build();
        candidateRepository.save(candidate2);

        Candidate candidate3 = Candidate.builder()
                .name("Pedro Costa")
                .email("pedro.costa@email.com")
                .phone("(11) 98765-4323")
                .jobPosition(devJob)
                .status(Candidate.CandidateStatus.SCREENING)
                .build();
        candidateRepository.save(candidate3);

        Candidate candidate4 = Candidate.builder()
                .name("Lucia Mendes")
                .email("lucia.mendes@email.com")
                .phone("(11) 98765-4324")
                .jobPosition(devJob)
                .status(Candidate.CandidateStatus.HIRED)
                .build();
        candidateRepository.save(candidate4);

        Candidate candidate5 = Candidate.builder()
                .name("Marcos Pereira")
                .email("marcos.pereira@email.com")
                .phone("(11) 98765-4325")
                .jobPosition(devJob)
                .status(Candidate.CandidateStatus.REJECTED)
                .build();
        candidateRepository.save(candidate5);

        // Criar solicitações de férias
        VacationRequest vacation1 = VacationRequest.builder()
                .employee(employee1)
                .startDate(LocalDate.now().plusDays(10))
                .endDate(LocalDate.now().plusDays(20))
                .type(VacationRequest.VacationType.VACATION)
                .status(VacationRequest.VacationStatus.PENDING)
                .days(11)
                .reason("Férias anuais")
                .build();
        vacationRequestRepository.save(vacation1);

        VacationRequest vacation2 = VacationRequest.builder()
                .employee(employee2)
                .startDate(LocalDate.now().plusDays(5))
                .endDate(LocalDate.now().plusDays(7))
                .type(VacationRequest.VacationType.PERSONAL)
                .status(VacationRequest.VacationStatus.PENDING)
                .days(3)
                .reason("Compromisso pessoal")
                .build();
        vacationRequestRepository.save(vacation2);

        VacationRequest vacation3 = VacationRequest.builder()
                .employee(employee4)
                .startDate(LocalDate.now().minusDays(5))
                .endDate(LocalDate.now().plusDays(5))
                .type(VacationRequest.VacationType.VACATION)
                .status(VacationRequest.VacationStatus.APPROVED)
                .approvedBy(hrEmployee)
                .days(11)
                .build();
        vacationRequestRepository.save(vacation3);

        VacationRequest vacation4 = VacationRequest.builder()
                .employee(hrEmployee)
                .startDate(LocalDate.now().minusDays(30))
                .endDate(LocalDate.now().minusDays(20))
                .type(VacationRequest.VacationType.SICK_LEAVE)
                .status(VacationRequest.VacationStatus.APPROVED)
                .approvedBy(adminEmployee)
                .days(11)
                .build();
        vacationRequestRepository.save(vacation4);

        // Criar avaliações de desempenho
        PerformanceReview review1 = PerformanceReview.builder()
                .employee(employee1)
                .reviewer(adminEmployee)
                .reviewDate(LocalDate.now().minusMonths(3))
                .reviewPeriod("Q4 2025")
                .rating(4)
                .strengths("Excelente conhecimento técnico, boa comunicação, proativo")
                .areasForImprovement("Documentação de código pode melhorar")
                .goals("Liderar o projeto de modernização do sistema")
                .comments("Carlos tem se destacado na equipe")
                .status(PerformanceReview.ReviewStatus.ACKNOWLEDGED)
                .build();
        performanceReviewRepository.save(review1);

        PerformanceReview review2 = PerformanceReview.builder()
                .employee(employee2)
                .reviewer(hrEmployee)
                .reviewDate(LocalDate.now().minusMonths(2))
                .reviewPeriod("Q4 2025")
                .rating(5)
                .strengths("Organização, atendimento, conhecimento das políticas")
                .areasForImprovement("Pode desenvolver mais habilidades analíticas")
                .goals("Implementar novo sistema de avaliação 360")
                .comments("Ana é uma funcionária exemplar")
                .status(PerformanceReview.ReviewStatus.SUBMITTED)
                .build();
        performanceReviewRepository.save(review2);

        PerformanceReview review3 = PerformanceReview.builder()
                .employee(employee4)
                .reviewer(adminEmployee)
                .reviewDate(LocalDate.now().minusDays(15))
                .reviewPeriod("Q4 2025")
                .rating(3)
                .strengths("Criatividade, bom relacionamento com stakeholders")
                .areasForImprovement("Precisa melhorar gestão de prazos")
                .goals("Aumentar engajamento nas redes sociais em 30%")
                .status(PerformanceReview.ReviewStatus.DRAFT)
                .build();
        performanceReviewRepository.save(review3);

        // Criar logs de atividade iniciais
        ActivityLog log1 = ActivityLog.builder()
                .action("Login")
                .entityType("User")
                .description("Usuário admin fez login no sistema")
                .userName("Administrador")
                .type(ActivityLog.ActivityType.LOGIN)
                .build();
        activityLogRepository.save(log1);

        ActivityLog log2 = ActivityLog.builder()
                .action("Criação")
                .entityType("Candidate")
                .entityId(candidate1.getId())
                .description("Novo candidato João Santos cadastrado")
                .userName("Maria Silva")
                .type(ActivityLog.ActivityType.CREATE)
                .build();
        activityLogRepository.save(log2);

        ActivityLog log3 = ActivityLog.builder()
                .action("Mudança de Status")
                .entityType("Candidate")
                .entityId(candidate1.getId())
                .description("Candidato João Santos movido para Entrevista")
                .userName("Maria Silva")
                .type(ActivityLog.ActivityType.STATUS_CHANGE)
                .build();
        activityLogRepository.save(log3);

        ActivityLog log4 = ActivityLog.builder()
                .action("Aprovação")
                .entityType("Vacation")
                .entityId(vacation3.getId())
                .description("Férias de Fernanda Costa aprovadas")
                .userName("Maria Silva")
                .type(ActivityLog.ActivityType.APPROVAL)
                .build();
        activityLogRepository.save(log4);

        ActivityLog log5 = ActivityLog.builder()
                .action("Criação")
                .entityType("PerformanceReview")
                .entityId(review1.getId())
                .description("Avaliação de Carlos Oliveira criada")
                .userName("Administrador")
                .type(ActivityLog.ActivityType.CREATE)
                .build();
        activityLogRepository.save(log5);
    }
}
