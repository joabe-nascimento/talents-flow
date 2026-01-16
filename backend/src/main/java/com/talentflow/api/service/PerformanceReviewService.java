package com.talentflow.api.service;

import com.talentflow.api.dto.PerformanceReviewDTO;
import com.talentflow.api.entity.Employee;
import com.talentflow.api.entity.PerformanceReview;
import com.talentflow.api.exception.BusinessException;
import com.talentflow.api.exception.ResourceNotFoundException;
import com.talentflow.api.repository.EmployeeRepository;
import com.talentflow.api.repository.PerformanceReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PerformanceReviewService {

    private final PerformanceReviewRepository performanceReviewRepository;
    private final EmployeeRepository employeeRepository;
    private final ActivityLogService activityLogService;

    public List<PerformanceReviewDTO> findAll() {
        return performanceReviewRepository.findAll(Sort.by(Sort.Direction.DESC, "reviewDate"))
                .stream()
                .map(PerformanceReviewDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public Page<PerformanceReviewDTO> findAllPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "reviewDate"));
        return performanceReviewRepository.findAll(pageable)
                .map(PerformanceReviewDTO::fromEntity);
    }

    public PerformanceReviewDTO findById(Long id) {
        PerformanceReview review = performanceReviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Avaliação não encontrada"));
        return PerformanceReviewDTO.fromEntity(review);
    }

    public List<PerformanceReviewDTO> findByEmployeeId(Long employeeId) {
        return performanceReviewRepository.findByEmployeeIdOrderByReviewDateDesc(employeeId)
                .stream()
                .map(PerformanceReviewDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<PerformanceReviewDTO> findByReviewerId(Long reviewerId) {
        return performanceReviewRepository.findByReviewerIdOrderByReviewDateDesc(reviewerId)
                .stream()
                .map(PerformanceReviewDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public PerformanceReviewDTO create(PerformanceReviewDTO dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário não encontrado"));

        Employee reviewer = employeeRepository.findById(dto.getReviewerId())
                .orElseThrow(() -> new ResourceNotFoundException("Avaliador não encontrado"));

        if (dto.getRating() < 1 || dto.getRating() > 5) {
            throw new BusinessException("A nota deve estar entre 1 e 5");
        }

        PerformanceReview review = PerformanceReview.builder()
                .employee(employee)
                .reviewer(reviewer)
                .reviewDate(dto.getReviewDate())
                .reviewPeriod(dto.getReviewPeriod())
                .rating(dto.getRating())
                .strengths(dto.getStrengths())
                .areasForImprovement(dto.getAreasForImprovement())
                .goals(dto.getGoals())
                .comments(dto.getComments())
                .status(PerformanceReview.ReviewStatus.DRAFT)
                .build();

        review = performanceReviewRepository.save(review);

        activityLogService.logCreate("PerformanceReview", review.getId(),
                "Nova avaliação de " + employee.getUser().getName() + " por " + reviewer.getUser().getName());

        return PerformanceReviewDTO.fromEntity(review);
    }

    @Transactional
    public PerformanceReviewDTO update(Long id, PerformanceReviewDTO dto) {
        PerformanceReview review = performanceReviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Avaliação não encontrada"));

        if (review.getStatus() == PerformanceReview.ReviewStatus.ACKNOWLEDGED) {
            throw new BusinessException("Avaliações já reconhecidas não podem ser editadas");
        }

        if (dto.getRating() != null) {
            if (dto.getRating() < 1 || dto.getRating() > 5) {
                throw new BusinessException("A nota deve estar entre 1 e 5");
            }
            review.setRating(dto.getRating());
        }

        if (dto.getReviewDate() != null) review.setReviewDate(dto.getReviewDate());
        if (dto.getReviewPeriod() != null) review.setReviewPeriod(dto.getReviewPeriod());
        if (dto.getStrengths() != null) review.setStrengths(dto.getStrengths());
        if (dto.getAreasForImprovement() != null) review.setAreasForImprovement(dto.getAreasForImprovement());
        if (dto.getGoals() != null) review.setGoals(dto.getGoals());
        if (dto.getComments() != null) review.setComments(dto.getComments());

        review = performanceReviewRepository.save(review);

        activityLogService.logUpdate("PerformanceReview", review.getId(),
                "Avaliação de " + review.getEmployee().getUser().getName() + " atualizada");

        return PerformanceReviewDTO.fromEntity(review);
    }

    @Transactional
    public PerformanceReviewDTO submit(Long id) {
        PerformanceReview review = performanceReviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Avaliação não encontrada"));

        if (review.getStatus() != PerformanceReview.ReviewStatus.DRAFT) {
            throw new BusinessException("Apenas rascunhos podem ser submetidos");
        }

        review.setStatus(PerformanceReview.ReviewStatus.SUBMITTED);
        review = performanceReviewRepository.save(review);

        activityLogService.logStatusChange("PerformanceReview", review.getId(),
                "Avaliação de " + review.getEmployee().getUser().getName() + " submetida");

        return PerformanceReviewDTO.fromEntity(review);
    }

    @Transactional
    public PerformanceReviewDTO acknowledge(Long id) {
        PerformanceReview review = performanceReviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Avaliação não encontrada"));

        if (review.getStatus() != PerformanceReview.ReviewStatus.SUBMITTED) {
            throw new BusinessException("Apenas avaliações submetidas podem ser reconhecidas");
        }

        review.setStatus(PerformanceReview.ReviewStatus.ACKNOWLEDGED);
        review = performanceReviewRepository.save(review);

        activityLogService.logStatusChange("PerformanceReview", review.getId(),
                "Avaliação reconhecida por " + review.getEmployee().getUser().getName());

        return PerformanceReviewDTO.fromEntity(review);
    }

    @Transactional
    public void delete(Long id) {
        PerformanceReview review = performanceReviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Avaliação não encontrada"));

        if (review.getStatus() == PerformanceReview.ReviewStatus.ACKNOWLEDGED) {
            throw new BusinessException("Avaliações reconhecidas não podem ser excluídas");
        }

        String employeeName = review.getEmployee().getUser().getName();
        performanceReviewRepository.delete(review);

        activityLogService.logDelete("PerformanceReview", id,
                "Avaliação de " + employeeName + " excluída");
    }

    public Double getAverageRatingByEmployee(Long employeeId) {
        return performanceReviewRepository.getAverageRatingByEmployee(employeeId);
    }

    public Long countByStatus(PerformanceReview.ReviewStatus status) {
        return performanceReviewRepository.countByStatus(status);
    }
}


