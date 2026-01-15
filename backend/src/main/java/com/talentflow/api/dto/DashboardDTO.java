package com.talentflow.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    
    private Long totalEmployees;
    private Long totalDepartments;
    private Long openPositions;
    private Long totalCandidates;
    private Long pendingReviews;
    
    private List<DepartmentStats> departmentStats;
    private List<RecentCandidate> recentCandidates;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentStats {
        private String name;
        private Long employeeCount;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentCandidate {
        private String name;
        private String position;
        private String status;
    }
}


