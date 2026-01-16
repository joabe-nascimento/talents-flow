package com.talentflow.api.controller;

import com.talentflow.api.dto.TimeRecordDTO;
import com.talentflow.api.service.TimeRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/time-records")
@RequiredArgsConstructor
@Tag(name = "Controle de Ponto", description = "Registro e gestão de ponto")
@SecurityRequirement(name = "bearerAuth")
public class TimeRecordController {

    private final TimeRecordService timeRecordService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Listar todos os registros de ponto")
    public ResponseEntity<List<TimeRecordDTO>> findAll() {
        return ResponseEntity.ok(timeRecordService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar registro por ID")
    public ResponseEntity<TimeRecordDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(timeRecordService.findById(id));
    }

    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Listar registros por funcionário")
    public ResponseEntity<List<TimeRecordDTO>> findByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(timeRecordService.findByEmployee(employeeId));
    }

    @GetMapping("/employee/{employeeId}/month/{year}/{month}")
    @Operation(summary = "Listar registros por funcionário e mês")
    public ResponseEntity<List<TimeRecordDTO>> findByEmployeeAndMonth(
            @PathVariable Long employeeId,
            @PathVariable Integer year,
            @PathVariable Integer month) {
        return ResponseEntity.ok(timeRecordService.findByEmployeeAndMonth(employeeId, year, month));
    }

    @GetMapping("/employee/{employeeId}/today")
    @Operation(summary = "Buscar registro de hoje")
    public ResponseEntity<TimeRecordDTO> findTodayRecord(@PathVariable Long employeeId) {
        return timeRecordService.findTodayRecord(employeeId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/clock-in/{employeeId}")
    @Operation(summary = "Registrar entrada")
    public ResponseEntity<TimeRecordDTO> clockIn(
            @PathVariable Long employeeId,
            @RequestParam(required = false) String location,
            HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        return ResponseEntity.ok(timeRecordService.clockIn(employeeId, ipAddress, location));
    }

    @PostMapping("/lunch-out/{employeeId}")
    @Operation(summary = "Registrar saída para almoço")
    public ResponseEntity<TimeRecordDTO> lunchOut(@PathVariable Long employeeId) {
        return ResponseEntity.ok(timeRecordService.lunchOut(employeeId));
    }

    @PostMapping("/lunch-in/{employeeId}")
    @Operation(summary = "Registrar retorno do almoço")
    public ResponseEntity<TimeRecordDTO> lunchIn(@PathVariable Long employeeId) {
        return ResponseEntity.ok(timeRecordService.lunchIn(employeeId));
    }

    @PostMapping("/clock-out/{employeeId}")
    @Operation(summary = "Registrar saída")
    public ResponseEntity<TimeRecordDTO> clockOut(@PathVariable Long employeeId) {
        return ResponseEntity.ok(timeRecordService.clockOut(employeeId));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Aprovar registro de ponto")
    public ResponseEntity<TimeRecordDTO> approve(
            @PathVariable Long id,
            @RequestParam Long approvedById) {
        return ResponseEntity.ok(timeRecordService.approve(id, approvedById));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Rejeitar registro de ponto")
    public ResponseEntity<TimeRecordDTO> reject(
            @PathVariable Long id,
            @RequestParam String justification) {
        return ResponseEntity.ok(timeRecordService.reject(id, justification));
    }

    @GetMapping("/stats/employee/{employeeId}")
    @Operation(summary = "Estatísticas de horas do funcionário")
    public ResponseEntity<Map<String, Object>> getEmployeeStats(
            @PathVariable Long employeeId,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        
        Integer workedMinutes = timeRecordService.getTotalWorkedMinutes(employeeId, start, end);
        Integer overtimeMinutes = timeRecordService.getTotalOvertimeMinutes(employeeId, start, end);
        
        return ResponseEntity.ok(Map.of(
                "workedMinutes", workedMinutes,
                "workedHours", String.format("%.1f", workedMinutes / 60.0),
                "overtimeMinutes", overtimeMinutes,
                "overtimeHours", String.format("%.1f", overtimeMinutes / 60.0)
        ));
    }

    @GetMapping("/pending/count")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Contar registros pendentes de aprovação")
    public ResponseEntity<Map<String, Long>> countPending() {
        return ResponseEntity.ok(Map.of("count", timeRecordService.countPending()));
    }
}

