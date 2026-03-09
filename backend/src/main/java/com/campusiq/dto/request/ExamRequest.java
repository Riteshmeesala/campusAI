package com.campusiq.dto.request;

import com.campusiq.entity.Exam.ExamStatus;
import lombok.Data;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Data
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

    /** MID_SEM, END_SEM, QUIZ, LAB, ASSIGNMENT */
    private String examType;

    /** Semester number (e.g. 4) */
    private Integer semester;

    /** SCHEDULED, ONGOING, COMPLETED, CANCELLED — optional, defaults to SCHEDULED */
    private ExamStatus status;
}