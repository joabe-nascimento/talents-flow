package com.talentflow.api.controller;

import com.talentflow.api.dto.ActivityLogDTO;
import com.talentflow.api.dto.DashboardDTO;
import com.talentflow.api.entity.VacationRequest;
import com.talentflow.api.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

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
    private final ActivityLogService activityLogService;
    private final VacationRequestService vacationRequestService;

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

    @GetMapping("/stats")
    @Operation(summary = "Obter estatísticas detalhadas")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(Map.of(
                "totalEmployees", employeeService.count(),
                "totalDepartments", departmentService.count(),
                "openPositions", jobPositionService.countOpen(),
                "totalCandidates", candidateService.count(),
                "totalJobs", jobPositionService.count(),
                "pendingVacations", vacationRequestService.countByStatus(VacationRequest.VacationStatus.PENDING),
                "onVacationToday", vacationRequestService.countOnVacationToday()
        ));
    }

    @GetMapping("/activities")
    @Operation(summary = "Obter atividades recentes")
    public ResponseEntity<List<ActivityLogDTO>> getRecentActivities() {
        return ResponseEntity.ok(activityLogService.getRecentActivities());
    }
}
