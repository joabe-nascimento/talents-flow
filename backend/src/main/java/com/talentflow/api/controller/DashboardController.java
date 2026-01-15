package com.talentflow.api.controller;

import com.talentflow.api.dto.DashboardDTO;
import com.talentflow.api.service.CandidateService;
import com.talentflow.api.service.DepartmentService;
import com.talentflow.api.service.EmployeeService;
import com.talentflow.api.service.JobPositionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Métricas e estatísticas")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final EmployeeService employeeService;
    private final DepartmentService departmentService;
    private final JobPositionService jobPositionService;
    private final CandidateService candidateService;

    @GetMapping
    @Operation(summary = "Obter dados do dashboard")
    public ResponseEntity<DashboardDTO> getDashboard() {
        DashboardDTO dashboard = DashboardDTO.builder()
                .totalEmployees(employeeService.count())
                .totalDepartments(departmentService.count())
                .openPositions(jobPositionService.countOpen())
                .totalCandidates(candidateService.count())
                .build();

        return ResponseEntity.ok(dashboard);
    }
}

