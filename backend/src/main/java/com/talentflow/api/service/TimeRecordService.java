package com.talentflow.api.service;

import com.talentflow.api.dto.TimeRecordDTO;
import com.talentflow.api.entity.Employee;
import com.talentflow.api.entity.TimeRecord;
import com.talentflow.api.exception.ResourceNotFoundException;
import com.talentflow.api.repository.EmployeeRepository;
import com.talentflow.api.repository.TimeRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TimeRecordService {

    private final TimeRecordRepository timeRecordRepository;
    private final EmployeeRepository employeeRepository;

    private static final LocalTime STANDARD_START = LocalTime.of(9, 0);
    private static final LocalTime STANDARD_END = LocalTime.of(18, 0);
    private static final int STANDARD_WORK_MINUTES = 480; // 8 hours

    public List<TimeRecordDTO> findAll() {
        return timeRecordRepository.findAll().stream()
                .map(TimeRecordDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public TimeRecordDTO findById(Long id) {
        TimeRecord record = timeRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registro de ponto não encontrado"));
        return TimeRecordDTO.fromEntity(record);
    }

    public List<TimeRecordDTO> findByEmployee(Long employeeId) {
        return timeRecordRepository.findByEmployeeId(employeeId).stream()
                .map(TimeRecordDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<TimeRecordDTO> findByEmployeeAndMonth(Long employeeId, Integer year, Integer month) {
        return timeRecordRepository.findByEmployeeAndMonth(employeeId, year, month).stream()
                .map(TimeRecordDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public Optional<TimeRecordDTO> findTodayRecord(Long employeeId) {
        return timeRecordRepository.findByEmployeeIdAndRecordDate(employeeId, LocalDate.now())
                .map(TimeRecordDTO::fromEntity);
    }

    @Transactional
    public TimeRecordDTO clockIn(Long employeeId, String ipAddress, String location) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado"));

        LocalDate today = LocalDate.now();
        Optional<TimeRecord> existingRecord = timeRecordRepository
                .findByEmployeeIdAndRecordDate(employeeId, today);

        if (existingRecord.isPresent() && existingRecord.get().getClockIn() != null) {
            throw new IllegalStateException("Já existe registro de entrada para hoje");
        }

        TimeRecord record = existingRecord.orElse(TimeRecord.builder()
                .employee(employee)
                .recordDate(today)
                .type(TimeRecord.RecordType.NORMAL)
                .status(TimeRecord.RecordStatus.PENDING)
                .build());

        LocalTime now = LocalTime.now();
        record.setClockIn(now);
        record.setIpAddress(ipAddress);
        record.setLocation(location);

        // Calcular atraso
        if (now.isAfter(STANDARD_START)) {
            int lateMinutes = (int) ChronoUnit.MINUTES.between(STANDARD_START, now);
            record.setLateMinutes(lateMinutes);
        } else {
            record.setLateMinutes(0);
        }

        record = timeRecordRepository.save(record);
        return TimeRecordDTO.fromEntity(record);
    }

    @Transactional
    public TimeRecordDTO lunchOut(Long employeeId) {
        TimeRecord record = timeRecordRepository.findByEmployeeIdAndRecordDate(employeeId, LocalDate.now())
                .orElseThrow(() -> new ResourceNotFoundException("Não há registro de entrada para hoje"));

        if (record.getClockIn() == null) {
            throw new IllegalStateException("É necessário registrar entrada primeiro");
        }
        if (record.getLunchOut() != null) {
            throw new IllegalStateException("Saída para almoço já registrada");
        }

        record.setLunchOut(LocalTime.now());
        record = timeRecordRepository.save(record);
        return TimeRecordDTO.fromEntity(record);
    }

    @Transactional
    public TimeRecordDTO lunchIn(Long employeeId) {
        TimeRecord record = timeRecordRepository.findByEmployeeIdAndRecordDate(employeeId, LocalDate.now())
                .orElseThrow(() -> new ResourceNotFoundException("Não há registro de entrada para hoje"));

        if (record.getLunchOut() == null) {
            throw new IllegalStateException("É necessário registrar saída para almoço primeiro");
        }
        if (record.getLunchIn() != null) {
            throw new IllegalStateException("Retorno do almoço já registrado");
        }

        record.setLunchIn(LocalTime.now());
        record = timeRecordRepository.save(record);
        return TimeRecordDTO.fromEntity(record);
    }

    @Transactional
    public TimeRecordDTO clockOut(Long employeeId) {
        TimeRecord record = timeRecordRepository.findByEmployeeIdAndRecordDate(employeeId, LocalDate.now())
                .orElseThrow(() -> new ResourceNotFoundException("Não há registro de entrada para hoje"));

        if (record.getClockIn() == null) {
            throw new IllegalStateException("É necessário registrar entrada primeiro");
        }
        if (record.getClockOut() != null) {
            throw new IllegalStateException("Saída já registrada");
        }

        LocalTime now = LocalTime.now();
        record.setClockOut(now);

        // Calcular saída antecipada
        if (now.isBefore(STANDARD_END)) {
            int earlyMinutes = (int) ChronoUnit.MINUTES.between(now, STANDARD_END);
            record.setEarlyDepartureMinutes(earlyMinutes);
        } else {
            record.setEarlyDepartureMinutes(0);
        }

        // Calcular horas trabalhadas
        int workedMinutes = calculateWorkedMinutes(record);
        record.setWorkedMinutes(workedMinutes);

        // Calcular horas extras
        if (workedMinutes > STANDARD_WORK_MINUTES) {
            record.setOvertimeMinutes(workedMinutes - STANDARD_WORK_MINUTES);
        } else {
            record.setOvertimeMinutes(0);
        }

        record = timeRecordRepository.save(record);
        return TimeRecordDTO.fromEntity(record);
    }

    private int calculateWorkedMinutes(TimeRecord record) {
        if (record.getClockIn() == null || record.getClockOut() == null) {
            return 0;
        }

        int totalMinutes = (int) ChronoUnit.MINUTES.between(record.getClockIn(), record.getClockOut());

        // Subtrair tempo de almoço se houver
        if (record.getLunchOut() != null && record.getLunchIn() != null) {
            int lunchMinutes = (int) ChronoUnit.MINUTES.between(record.getLunchOut(), record.getLunchIn());
            totalMinutes -= lunchMinutes;
        }

        return Math.max(0, totalMinutes);
    }

    @Transactional
    public TimeRecordDTO approve(Long id, Long approvedById) {
        TimeRecord record = timeRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registro não encontrado"));

        Employee approver = employeeRepository.findById(approvedById)
                .orElseThrow(() -> new ResourceNotFoundException("Aprovador não encontrado"));

        record.setStatus(TimeRecord.RecordStatus.APPROVED);
        record.setApprovedBy(approver);
        record.setApprovedAt(LocalDateTime.now());

        record = timeRecordRepository.save(record);
        return TimeRecordDTO.fromEntity(record);
    }

    @Transactional
    public TimeRecordDTO reject(Long id, String justification) {
        TimeRecord record = timeRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registro não encontrado"));

        record.setStatus(TimeRecord.RecordStatus.REJECTED);
        record.setJustification(justification);

        record = timeRecordRepository.save(record);
        return TimeRecordDTO.fromEntity(record);
    }

    public Integer getTotalWorkedMinutes(Long employeeId, LocalDate startDate, LocalDate endDate) {
        Integer total = timeRecordRepository.getTotalWorkedMinutes(employeeId, startDate, endDate);
        return total != null ? total : 0;
    }

    public Integer getTotalOvertimeMinutes(Long employeeId, LocalDate startDate, LocalDate endDate) {
        Integer total = timeRecordRepository.getTotalOvertimeMinutes(employeeId, startDate, endDate);
        return total != null ? total : 0;
    }

    public Long countPending() {
        return timeRecordRepository.countPending();
    }
}

