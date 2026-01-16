package com.talentflow.api.service;

import com.talentflow.api.dto.PayrollDTO;
import com.talentflow.api.entity.Employee;
import com.talentflow.api.entity.Payroll;
import com.talentflow.api.exception.ResourceNotFoundException;
import com.talentflow.api.repository.EmployeeRepository;
import com.talentflow.api.repository.PayrollRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;

    public List<PayrollDTO> findAll() {
        return payrollRepository.findAll().stream()
                .map(PayrollDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public PayrollDTO findById(Long id) {
        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Folha de pagamento não encontrada"));
        return PayrollDTO.fromEntity(payroll);
    }

    public List<PayrollDTO> findByEmployee(Long employeeId) {
        return payrollRepository.findByEmployeeId(employeeId).stream()
                .map(PayrollDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<PayrollDTO> findByPeriod(Integer year, Integer month) {
        return payrollRepository.findByReferenceYearAndReferenceMonth(year, month).stream()
                .map(PayrollDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public PayrollDTO create(PayrollDTO dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado"));

        Payroll payroll = Payroll.builder()
                .employee(employee)
                .referenceMonth(dto.getReferenceMonth())
                .referenceYear(dto.getReferenceYear())
                .baseSalary(employee.getSalary())
                .status(Payroll.PayrollStatus.DRAFT)
                .build();

        payroll = payrollRepository.save(payroll);
        return PayrollDTO.fromEntity(payroll);
    }

    @Transactional
    public PayrollDTO calculate(Long id) {
        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Folha de pagamento não encontrada"));

        // Calcular salário bruto
        BigDecimal grossSalary = payroll.getBaseSalary()
                .add(payroll.getOvertimeValue())
                .add(payroll.getBonus())
                .add(payroll.getCommission())
                .add(payroll.getMealAllowance())
                .add(payroll.getTransportAllowance())
                .add(payroll.getHealthAllowance())
                .add(payroll.getOtherEarnings());
        payroll.setGrossSalary(grossSalary);

        // Calcular INSS (tabela simplificada 2024)
        BigDecimal inssValue = calculateINSS(grossSalary);
        payroll.setInssValue(inssValue);
        payroll.setInssRate(inssValue.divide(grossSalary, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100)));

        // Base de cálculo do IRRF (salário bruto - INSS)
        BigDecimal irrfBase = grossSalary.subtract(inssValue);

        // Calcular IRRF (tabela simplificada 2024)
        BigDecimal irrfValue = calculateIRRF(irrfBase);
        payroll.setIrrfValue(irrfValue);
        payroll.setIrrfRate(irrfValue.compareTo(BigDecimal.ZERO) > 0 ?
                irrfValue.divide(grossSalary, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)) :
                BigDecimal.ZERO);

        // Calcular FGTS (8% do salário bruto)
        BigDecimal fgtsValue = grossSalary.multiply(BigDecimal.valueOf(0.08))
                .setScale(2, RoundingMode.HALF_UP);
        payroll.setFgtsValue(fgtsValue);

        // Total de descontos
        BigDecimal totalDeductions = inssValue
                .add(irrfValue)
                .add(payroll.getHealthDiscount())
                .add(payroll.getDentalDiscount())
                .add(payroll.getMealDiscount())
                .add(payroll.getTransportDiscount())
                .add(payroll.getLoanDiscount())
                .add(payroll.getOtherDeductions());
        payroll.setTotalDeductions(totalDeductions);

        // Salário líquido
        BigDecimal netSalary = grossSalary.subtract(totalDeductions);
        payroll.setNetSalary(netSalary);

        payroll.setStatus(Payroll.PayrollStatus.CALCULATED);
        payroll.setProcessedAt(LocalDateTime.now());

        payroll = payrollRepository.save(payroll);
        return PayrollDTO.fromEntity(payroll);
    }

    private BigDecimal calculateINSS(BigDecimal salary) {
        // Tabela INSS 2024 (valores simplificados)
        BigDecimal inss = BigDecimal.ZERO;
        
        if (salary.compareTo(BigDecimal.valueOf(1412.00)) <= 0) {
            inss = salary.multiply(BigDecimal.valueOf(0.075));
        } else if (salary.compareTo(BigDecimal.valueOf(2666.68)) <= 0) {
            inss = salary.multiply(BigDecimal.valueOf(0.09));
        } else if (salary.compareTo(BigDecimal.valueOf(4000.03)) <= 0) {
            inss = salary.multiply(BigDecimal.valueOf(0.12));
        } else if (salary.compareTo(BigDecimal.valueOf(7786.02)) <= 0) {
            inss = salary.multiply(BigDecimal.valueOf(0.14));
        } else {
            inss = BigDecimal.valueOf(908.85); // Teto INSS
        }
        
        return inss.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateIRRF(BigDecimal base) {
        // Tabela IRRF 2024 (valores simplificados)
        BigDecimal irrf = BigDecimal.ZERO;
        
        if (base.compareTo(BigDecimal.valueOf(2259.20)) <= 0) {
            irrf = BigDecimal.ZERO; // Isento
        } else if (base.compareTo(BigDecimal.valueOf(2826.65)) <= 0) {
            irrf = base.multiply(BigDecimal.valueOf(0.075)).subtract(BigDecimal.valueOf(169.44));
        } else if (base.compareTo(BigDecimal.valueOf(3751.05)) <= 0) {
            irrf = base.multiply(BigDecimal.valueOf(0.15)).subtract(BigDecimal.valueOf(381.44));
        } else if (base.compareTo(BigDecimal.valueOf(4664.68)) <= 0) {
            irrf = base.multiply(BigDecimal.valueOf(0.225)).subtract(BigDecimal.valueOf(662.77));
        } else {
            irrf = base.multiply(BigDecimal.valueOf(0.275)).subtract(BigDecimal.valueOf(896.00));
        }
        
        return irrf.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
    }

    @Transactional
    public PayrollDTO approve(Long id) {
        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Folha de pagamento não encontrada"));
        
        payroll.setStatus(Payroll.PayrollStatus.APPROVED);
        payroll = payrollRepository.save(payroll);
        return PayrollDTO.fromEntity(payroll);
    }

    @Transactional
    public PayrollDTO markAsPaid(Long id) {
        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Folha de pagamento não encontrada"));
        
        payroll.setStatus(Payroll.PayrollStatus.PAID);
        payroll = payrollRepository.save(payroll);
        return PayrollDTO.fromEntity(payroll);
    }

    @Transactional
    public PayrollDTO update(Long id, PayrollDTO dto) {
        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Folha de pagamento não encontrada"));

        payroll.setOvertimeHours(dto.getOvertimeHours());
        payroll.setOvertimeValue(dto.getOvertimeValue());
        payroll.setBonus(dto.getBonus());
        payroll.setCommission(dto.getCommission());
        payroll.setMealAllowance(dto.getMealAllowance());
        payroll.setTransportAllowance(dto.getTransportAllowance());
        payroll.setHealthAllowance(dto.getHealthAllowance());
        payroll.setOtherEarnings(dto.getOtherEarnings());
        payroll.setHealthDiscount(dto.getHealthDiscount());
        payroll.setDentalDiscount(dto.getDentalDiscount());
        payroll.setMealDiscount(dto.getMealDiscount());
        payroll.setTransportDiscount(dto.getTransportDiscount());
        payroll.setLoanDiscount(dto.getLoanDiscount());
        payroll.setOtherDeductions(dto.getOtherDeductions());
        payroll.setNotes(dto.getNotes());

        payroll = payrollRepository.save(payroll);
        return PayrollDTO.fromEntity(payroll);
    }

    @Transactional
    public List<PayrollDTO> generateMonthlyPayroll(Integer year, Integer month) {
        List<Employee> employees = employeeRepository.findByStatus(Employee.EmployeeStatus.ACTIVE);
        
        return employees.stream()
                .filter(emp -> !payrollRepository.findByEmployeeIdAndReferenceYearAndReferenceMonth(
                        emp.getId(), year, month).isPresent())
                .map(emp -> {
                    Payroll payroll = Payroll.builder()
                            .employee(emp)
                            .referenceMonth(month)
                            .referenceYear(year)
                            .baseSalary(emp.getSalary())
                            .status(Payroll.PayrollStatus.DRAFT)
                            .build();
                    return PayrollDTO.fromEntity(payrollRepository.save(payroll));
                })
                .collect(Collectors.toList());
    }

    public BigDecimal getTotalPaidByPeriod(Integer year, Integer month) {
        BigDecimal total = payrollRepository.getTotalPaidByPeriod(year, month);
        return total != null ? total : BigDecimal.ZERO;
    }
}

