package com.campusiq.assessment.dto;

import com.campusiq.assessment.entity.Exam.ExamStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class ExamRequest {

    @NotBlank(message = "Exam name is required")
    @Size(max = 200)
    private String examName;

    @NotNull(message = "Course ID is required")
    private Long courseId;

    @NotNull(message = "Scheduled date is required")
    private LocalDateTime scheduledDate;

    @NotNull(message = "Duration is required")
    @Min(value = 15, message = "Minimum duration is 15 minutes")
    @Max(value = 300, message = "Maximum duration is 300 minutes")
    private Integer durationMinutes;

    @NotNull(message = "Total marks is required")
    @Min(value = 1)
    private Integer totalMarks;

    @NotNull(message = "Passing marks is required")
    @Min(value = 1)
    private Integer passingMarks;

    @Size(max = 200)
    private String venue;

    @Size(max = 500)
    private String description;

    private String examType;
    private Integer semester;
    private ExamStatus status;

    public ExamRequest() {}

    public String getExamName() { return examName; }
    public void setExamName(String examName) { this.examName = examName; }
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    public LocalDateTime getScheduledDate() { return scheduledDate; }
    public void setScheduledDate(LocalDateTime scheduledDate) { this.scheduledDate = scheduledDate; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public Integer getTotalMarks() { return totalMarks; }
    public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }
    public Integer getPassingMarks() { return passingMarks; }
    public void setPassingMarks(Integer passingMarks) { this.passingMarks = passingMarks; }
    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getExamType() { return examType; }
    public void setExamType(String examType) { this.examType = examType; }
    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }
    public ExamStatus getStatus() { return status; }
    public void setStatus(ExamStatus status) { this.status = status; }
}
