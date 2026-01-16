package com.talentflow.api.controller;

import com.talentflow.api.service.ReportExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/reports/export")
@RequiredArgsConstructor
@Tag(name = "Exportação de Relatórios", description = "Exportação de relatórios em PDF e Excel")
@SecurityRequirement(name = "bearerAuth")
public class ReportExportController {

    private final ReportExportService reportExportService;
    private static final DateTimeFormatter FILE_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @GetMapping("/employees/pdf")
    @Operation(summary = "Exportar funcionários em PDF")
    public ResponseEntity<byte[]> exportEmployeesPdf() {
        byte[] pdf = reportExportService.exportEmployeesToPdf();
        String filename = "funcionarios_" + LocalDate.now().format(FILE_DATE_FORMAT) + ".pdf";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/employees/excel")
    @Operation(summary = "Exportar funcionários em Excel")
    public ResponseEntity<byte[]> exportEmployeesExcel() throws IOException {
        byte[] excel = reportExportService.exportEmployeesToExcel();
        String filename = "funcionarios_" + LocalDate.now().format(FILE_DATE_FORMAT) + ".xlsx";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excel);
    }

    @GetMapping("/candidates/pdf")
    @Operation(summary = "Exportar candidatos em PDF")
    public ResponseEntity<byte[]> exportCandidatesPdf() {
        byte[] pdf = reportExportService.exportCandidatesToPdf();
        String filename = "candidatos_" + LocalDate.now().format(FILE_DATE_FORMAT) + ".pdf";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/candidates/excel")
    @Operation(summary = "Exportar candidatos em Excel")
    public ResponseEntity<byte[]> exportCandidatesExcel() throws IOException {
        byte[] excel = reportExportService.exportCandidatesToExcel();
        String filename = "candidatos_" + LocalDate.now().format(FILE_DATE_FORMAT) + ".xlsx";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excel);
    }

    @GetMapping("/vacations/pdf")
    @Operation(summary = "Exportar férias em PDF")
    public ResponseEntity<byte[]> exportVacationsPdf() {
        byte[] pdf = reportExportService.exportVacationsToPdf();
        String filename = "ferias_" + LocalDate.now().format(FILE_DATE_FORMAT) + ".pdf";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}



