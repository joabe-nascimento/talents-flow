package com.talentflow.api.service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.talentflow.api.dto.CandidateDTO;
import com.talentflow.api.dto.EmployeeDTO;
import com.talentflow.api.dto.VacationRequestDTO;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportExportService {

    private final EmployeeService employeeService;
    private final CandidateService candidateService;
    private final VacationRequestService vacationRequestService;

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    // ==================== PDF EXPORTS ====================

    public byte[] exportEmployeesToPdf() {
        List<EmployeeDTO> employees = employeeService.findAll();
        
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4.rotate());
        
        try {
            PdfWriter.getInstance(document, out);
            document.open();
            
            addHeader(document, "Relatório de Funcionários");
            addDate(document);
            
            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{2.5f, 3f, 2f, 2f, 1.5f, 1.5f});
            
            addTableHeader(table, new String[]{"Nome", "Email", "Cargo", "Departamento", "Data Admissão", "Status"});
            
            for (EmployeeDTO emp : employees) {
                table.addCell(createCell(emp.getName()));
                table.addCell(createCell(emp.getEmail()));
                table.addCell(createCell(emp.getPosition()));
                table.addCell(createCell(emp.getDepartmentName() != null ? emp.getDepartmentName() : "-"));
                table.addCell(createCell(emp.getHireDate() != null ? emp.getHireDate().format(DATE_FORMAT) : "-"));
                table.addCell(createCell(getStatusLabel(emp.getStatus().name())));
            }
            
            document.add(table);
            addFooter(document, employees.size());
            
        } catch (DocumentException e) {
            throw new RuntimeException("Erro ao gerar PDF", e);
        } finally {
            document.close();
        }
        
        return out.toByteArray();
    }

    public byte[] exportCandidatesToPdf() {
        List<CandidateDTO> candidates = candidateService.findAll();
        
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4.rotate());
        
        try {
            PdfWriter.getInstance(document, out);
            document.open();
            
            addHeader(document, "Relatório de Candidatos");
            addDate(document);
            
            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{2.5f, 3f, 2.5f, 2f, 2f});
            
            addTableHeader(table, new String[]{"Nome", "Email", "Vaga", "Status", "Data Aplicação"});
            
            for (CandidateDTO cand : candidates) {
                table.addCell(createCell(cand.getName()));
                table.addCell(createCell(cand.getEmail()));
                table.addCell(createCell(cand.getJobPositionTitle() != null ? cand.getJobPositionTitle() : "-"));
                table.addCell(createCell(getCandidateStatusLabel(cand.getStatus().name())));
                table.addCell(createCell(cand.getApplicationDate() != null ? 
                        cand.getApplicationDate().toLocalDate().format(DATE_FORMAT) : "-"));
            }
            
            document.add(table);
            addFooter(document, candidates.size());
            
        } catch (DocumentException e) {
            throw new RuntimeException("Erro ao gerar PDF", e);
        } finally {
            document.close();
        }
        
        return out.toByteArray();
    }

    public byte[] exportVacationsToPdf() {
        List<VacationRequestDTO> vacations = vacationRequestService.findAll();
        
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4.rotate());
        
        try {
            PdfWriter.getInstance(document, out);
            document.open();
            
            addHeader(document, "Relatório de Férias e Ausências");
            addDate(document);
            
            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{2.5f, 2f, 2f, 2f, 1.5f, 1.5f});
            
            addTableHeader(table, new String[]{"Funcionário", "Tipo", "Início", "Fim", "Dias", "Status"});
            
            for (VacationRequestDTO vac : vacations) {
                table.addCell(createCell(vac.getEmployeeName()));
                table.addCell(createCell(getVacationTypeLabel(vac.getType().name())));
                table.addCell(createCell(vac.getStartDate().format(DATE_FORMAT)));
                table.addCell(createCell(vac.getEndDate().format(DATE_FORMAT)));
                table.addCell(createCell(String.valueOf(vac.getDays())));
                table.addCell(createCell(getVacationStatusLabel(vac.getStatus().name())));
            }
            
            document.add(table);
            addFooter(document, vacations.size());
            
        } catch (DocumentException e) {
            throw new RuntimeException("Erro ao gerar PDF", e);
        } finally {
            document.close();
        }
        
        return out.toByteArray();
    }

    // ==================== EXCEL EXPORTS ====================

    public byte[] exportEmployeesToExcel() throws IOException {
        List<EmployeeDTO> employees = employeeService.findAll();
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Funcionários");
            
            CellStyle headerStyle = createHeaderStyle(workbook);
            
            org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(0);
            String[] headers = {"ID", "Nome", "Email", "Cargo", "Departamento", "Data Admissão", "Telefone", "Status"};
            for (int i = 0; i < headers.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            int rowNum = 1;
            for (EmployeeDTO emp : employees) {
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(emp.getId());
                row.createCell(1).setCellValue(emp.getName());
                row.createCell(2).setCellValue(emp.getEmail());
                row.createCell(3).setCellValue(emp.getPosition());
                row.createCell(4).setCellValue(emp.getDepartmentName() != null ? emp.getDepartmentName() : "");
                row.createCell(5).setCellValue(emp.getHireDate() != null ? emp.getHireDate().format(DATE_FORMAT) : "");
                row.createCell(6).setCellValue(emp.getPhone() != null ? emp.getPhone() : "");
                row.createCell(7).setCellValue(getStatusLabel(emp.getStatus().name()));
            }
            
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }

    public byte[] exportCandidatesToExcel() throws IOException {
        List<CandidateDTO> candidates = candidateService.findAll();
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Candidatos");
            
            CellStyle headerStyle = createHeaderStyle(workbook);
            
            org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(0);
            String[] headers = {"ID", "Nome", "Email", "Telefone", "Vaga", "Status", "LinkedIn", "Data Aplicação"};
            for (int i = 0; i < headers.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            int rowNum = 1;
            for (CandidateDTO cand : candidates) {
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(cand.getId());
                row.createCell(1).setCellValue(cand.getName());
                row.createCell(2).setCellValue(cand.getEmail());
                row.createCell(3).setCellValue(cand.getPhone() != null ? cand.getPhone() : "");
                row.createCell(4).setCellValue(cand.getJobPositionTitle() != null ? cand.getJobPositionTitle() : "");
                row.createCell(5).setCellValue(getCandidateStatusLabel(cand.getStatus().name()));
                row.createCell(6).setCellValue(cand.getLinkedinUrl() != null ? cand.getLinkedinUrl() : "");
                row.createCell(7).setCellValue(cand.getApplicationDate() != null ? 
                        cand.getApplicationDate().toLocalDate().format(DATE_FORMAT) : "");
            }
            
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }

    // ==================== HELPER METHODS ====================

    private void addHeader(Document document, String title) throws DocumentException {
        Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD, new Color(124, 58, 237));
        Paragraph header = new Paragraph(title, titleFont);
        header.setAlignment(Element.ALIGN_CENTER);
        header.setSpacingAfter(10);
        document.add(header);
        
        Font subtitleFont = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.GRAY);
        Paragraph subtitle = new Paragraph("TalentFlow - Sistema de Gestão de Talentos", subtitleFont);
        subtitle.setAlignment(Element.ALIGN_CENTER);
        subtitle.setSpacingAfter(20);
        document.add(subtitle);
    }

    private void addDate(Document document) throws DocumentException {
        Font dateFont = new Font(Font.HELVETICA, 9, Font.ITALIC, Color.GRAY);
        Paragraph date = new Paragraph("Gerado em: " + LocalDate.now().format(DATE_FORMAT), dateFont);
        date.setAlignment(Element.ALIGN_RIGHT);
        date.setSpacingAfter(15);
        document.add(date);
    }

    private void addTableHeader(PdfPTable table, String[] headers) {
        Font headerFont = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
            cell.setBackgroundColor(new Color(124, 58, 237));
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setPadding(8);
            table.addCell(cell);
        }
    }

    private PdfPCell createCell(String text) {
        Font cellFont = new Font(Font.HELVETICA, 9, Font.NORMAL, Color.DARK_GRAY);
        PdfPCell cell = new PdfPCell(new Phrase(text, cellFont));
        cell.setPadding(6);
        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
        return cell;
    }

    private void addFooter(Document document, int totalRecords) throws DocumentException {
        Font footerFont = new Font(Font.HELVETICA, 9, Font.ITALIC, Color.GRAY);
        Paragraph footer = new Paragraph("\nTotal de registros: " + totalRecords, footerFont);
        footer.setSpacingBefore(15);
        document.add(footer);
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        org.apache.poi.ss.usermodel.Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.VIOLET.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }

    private String getStatusLabel(String status) {
        return switch (status) {
            case "ACTIVE" -> "Ativo";
            case "ON_LEAVE" -> "Afastado";
            case "TERMINATED" -> "Desligado";
            default -> status;
        };
    }

    private String getCandidateStatusLabel(String status) {
        return switch (status) {
            case "NEW" -> "Novo";
            case "SCREENING" -> "Triagem";
            case "INTERVIEW" -> "Entrevista";
            case "HIRED" -> "Contratado";
            case "REJECTED" -> "Rejeitado";
            default -> status;
        };
    }

    private String getVacationTypeLabel(String type) {
        return switch (type) {
            case "VACATION" -> "Férias";
            case "SICK_LEAVE" -> "Licença Médica";
            case "PERSONAL" -> "Pessoal";
            case "MATERNITY" -> "Maternidade";
            case "PATERNITY" -> "Paternidade";
            default -> type;
        };
    }

    private String getVacationStatusLabel(String status) {
        return switch (status) {
            case "PENDING" -> "Pendente";
            case "APPROVED" -> "Aprovada";
            case "REJECTED" -> "Rejeitada";
            case "CANCELLED" -> "Cancelada";
            default -> status;
        };
    }
}

