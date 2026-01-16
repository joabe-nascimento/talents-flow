package com.talentflow.api.dto;

import com.talentflow.api.entity.TimeRecord;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeRecordDTO {

    private Long id;
    private Long employeeId;
    private String employeeName;
    private String departmentName;
    
    private LocalDate recordDate;
    private String dayOfWeek;
    
    private LocalTime clockIn;
    private LocalTime lunchOut;
    private LocalTime lunchIn;
    private LocalTime clockOut;
    
    private Integer workedMinutes;
    private String workedTime; // "8h 30min"
    private Integer overtimeMinutes;
    private String overtimeTime;
    private Integer lateMinutes;
    private Integer earlyDepartureMinutes;
    
    private TimeRecord.RecordType type;
    private TimeRecord.RecordStatus status;
    
    private String justification;
    private String location;
    
    private LocalDateTime createdAt;
    private String approvedByName;
    private LocalDateTime approvedAt;

    public static TimeRecordDTO fromEntity(TimeRecord record) {
        String[] days = {"Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"};
        
        // Get employee name - check if user exists, otherwise use firstName + lastName
        String employeeName = getEmployeeName(record.getEmployee());
        
        // Get approver name if exists
        String approvedByName = null;
        if (record.getApprovedBy() != null) {
            approvedByName = getEmployeeName(record.getApprovedBy());
        }
        
        return TimeRecordDTO.builder()
                .id(record.getId())
                .employeeId(record.getEmployee().getId())
                .employeeName(employeeName)
                .departmentName(record.getEmployee().getDepartment() != null ?
                               record.getEmployee().getDepartment().getName() : null)
                .recordDate(record.getRecordDate())
                .dayOfWeek(days[record.getRecordDate().getDayOfWeek().getValue() % 7])
                .clockIn(record.getClockIn())
                .lunchOut(record.getLunchOut())
                .lunchIn(record.getLunchIn())
                .clockOut(record.getClockOut())
                .workedMinutes(record.getWorkedMinutes())
                .workedTime(formatMinutes(record.getWorkedMinutes()))
                .overtimeMinutes(record.getOvertimeMinutes())
                .overtimeTime(formatMinutes(record.getOvertimeMinutes()))
                .lateMinutes(record.getLateMinutes())
                .earlyDepartureMinutes(record.getEarlyDepartureMinutes())
                .type(record.getType())
                .status(record.getStatus())
                .justification(record.getJustification())
                .location(record.getLocation())
                .createdAt(record.getCreatedAt())
                .approvedByName(approvedByName)
                .approvedAt(record.getApprovedAt())
                .build();
    }
    
    private static String getEmployeeName(com.talentflow.api.entity.Employee employee) {
        if (employee == null) return null;
        if (employee.getUser() != null) {
            return employee.getUser().getName();
        }
        return "Funcionário #" + employee.getId();
    }

    private static String formatMinutes(Integer minutes) {
        if (minutes == null || minutes == 0) return "0h";
        int hours = minutes / 60;
        int mins = minutes % 60;
        if (mins == 0) return hours + "h";
        return hours + "h " + mins + "min";
    }
}

