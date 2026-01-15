package com.talentflow.api.config;

import com.talentflow.api.entity.*;
import com.talentflow.api.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final JobPositionRepository jobPositionRepository;
    private final CandidateRepository candidateRepository;
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
        employeeRepository.save(hrEmployee);

        // Definir gerentes dos departamentos
        techDept.setManager(adminEmployee);
        departmentRepository.save(techDept);

        hrDept.setManager(hrEmployee);
        departmentRepository.save(hrDept);

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
    }
}


