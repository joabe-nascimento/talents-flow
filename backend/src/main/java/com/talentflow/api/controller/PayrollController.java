package com.talentflow.api.controller;

import com.talentflow.api.dto.PayrollDTO;
import com.talentflow.api.service.PayrollService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/payroll")
@RequiredArgsConstructor
@Tag(name = "Folha de Pagamento", description = "Gestão de folha de pagamento")
@SecurityRequirement(name = "bearerAuth")
public class PayrollController {

    private final PayrollService payrollService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Listar todas as folhas de pagamento")
    public ResponseEntity<List<PayrollDTO>> findAll() {
        return ResponseEntity.ok(payrollService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar folha de pagamento por ID")
    public ResponseEntity<PayrollDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(payrollService.findById(id));
    }

    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Listar folhas de pagamento por funcionário")
    public ResponseEntity<List<PayrollDTO>> findByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(payrollService.findByEmployee(employeeId));
    }

    @GetMapping("/period/{year}/{month}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Listar folhas de pagamento por período")
    public ResponseEntity<List<PayrollDTO>> findByPeriod(
            @PathVariable Integer year,
            @PathVariable Integer month) {
        return ResponseEntity.ok(payrollService.findByPeriod(year, month));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Criar nova folha de pagamento")
    public ResponseEntity<PayrollDTO> create(@RequestBody PayrollDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(payrollService.create(dto));
    }

    @PostMapping("/generate/{year}/{month}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Gerar folha de pagamento mensal para todos os funcionários ativos")
    public ResponseEntity<List<PayrollDTO>> generateMonthly(
            @PathVariable Integer year,
            @PathVariable Integer month) {
        return ResponseEntity.ok(payrollService.generateMonthlyPayroll(year, month));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Atualizar folha de pagamento")
    public ResponseEntity<PayrollDTO> update(
            @PathVariable Long id,
            @RequestBody PayrollDTO dto) {
        return ResponseEntity.ok(payrollService.update(id, dto));
    }

    @PostMapping("/{id}/calculate")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Calcular impostos e valores da folha")
    public ResponseEntity<PayrollDTO> calculate(@PathVariable Long id) {
        return ResponseEntity.ok(payrollService.calculate(id));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Aprovar folha de pagamento")
    public ResponseEntity<PayrollDTO> approve(@PathVariable Long id) {
        return ResponseEntity.ok(payrollService.approve(id));
    }

    @PostMapping("/{id}/pay")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Marcar folha como paga")
    public ResponseEntity<PayrollDTO> markAsPaid(@PathVariable Long id) {
        return ResponseEntity.ok(payrollService.markAsPaid(id));
    }

    @GetMapping("/stats/{year}/{month}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Estatísticas de folha de pagamento")
    public ResponseEntity<Map<String, Object>> getStats(
            @PathVariable Integer year,
            @PathVariable Integer month) {
        BigDecimal total = payrollService.getTotalPaidByPeriod(year, month);
        List<PayrollDTO> payrolls = payrollService.findByPeriod(year, month);
        
        return ResponseEntity.ok(Map.of(
                "totalPaid", total,
                "count", payrolls.size(),
                "period", month + "/" + year
        ));
    }
}

