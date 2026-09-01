package com.campusiq.auth.controller;

import com.campusiq.auth.entity.StudentRegistration;
import com.campusiq.auth.entity.User;
import com.campusiq.auth.repository.StudentRegistrationRepository;
import com.campusiq.auth.repository.UserRepository;
import com.campusiq.common.dto.ApiResponse;
import com.campusiq.common.enums.Role;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/registrations")
public class StudentRegistrationController {

    private final StudentRegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public StudentRegistrationController(StudentRegistrationRepository registrationRepository,
                                         UserRepository userRepository,
                                         PasswordEncoder passwordEncoder) {
        this.registrationRepository = registrationRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Public Student Registration endpoint (Called when a student scans the QR code and submits details)
     */
    @PostMapping("/public")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> submitPublicRegistration(@RequestBody Map<String, Object> payload) {
        String name             = (String) payload.getOrDefault("name", "");
        String enrollmentNumber = (String) payload.getOrDefault("enrollmentNumber", "");
        String email            = (String) payload.getOrDefault("email", "");
        String phoneNumber      = (String) payload.getOrDefault("phoneNumber", "");
        String department       = (String) payload.getOrDefault("department", "Computer Science");
        String course           = (String) payload.getOrDefault("course", "B.Tech Computer Science");
        String year             = (String) payload.getOrDefault("year", "1st Year");
        String semester         = (String) payload.getOrDefault("semester", "1-1");
        String section          = (String) payload.getOrDefault("section", "Section A");
        String username         = (String) payload.getOrDefault("username", "");
        String rawPassword      = (String) payload.getOrDefault("password", "");

        // Validation
        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Student Name is required"));
        }
        if (enrollmentNumber == null || enrollmentNumber.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Enrollment Number is required"));
        }
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email Address is required"));
        }
        if (username == null || username.trim().isEmpty()) {
            username = enrollmentNumber.trim().toLowerCase();
        }
        if (rawPassword == null || rawPassword.trim().isEmpty()) {
            rawPassword = "Student@" + enrollmentNumber.trim();
        }

        enrollmentNumber = enrollmentNumber.trim().toUpperCase();
        email = email.trim().toLowerCase();
        username = username.trim();

        // Duplicate checks in existing users
        if (userRepository.existsByEnrollmentNumber(enrollmentNumber)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("A student with Enrollment Number " + enrollmentNumber + " already exists in the system."));
        }
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("A user with Email " + email + " is already registered."));
        }
        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Username '" + username + "' is already taken."));
        }

        // Duplicate checks in pending registrations
        if (registrationRepository.existsByEnrollmentNumber(enrollmentNumber)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("A registration request with Enrollment Number " + enrollmentNumber + " is already pending."));
        }
        if (registrationRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("A registration request with Email " + email + " is already submitted."));
        }

        String encodedPassword = passwordEncoder.encode(rawPassword);

        String dateOfBirth      = (String) payload.getOrDefault("dateOfBirth", "");
        String gender           = (String) payload.getOrDefault("gender", "");
        String address          = (String) payload.getOrDefault("address", "");
        String emergencyContact = (String) payload.getOrDefault("emergencyContact", "");
        String guardianName     = (String) payload.getOrDefault("guardianName", "");
        String guardianPhone    = (String) payload.getOrDefault("guardianPhone", "");
        String guardianEmail    = (String) payload.getOrDefault("guardianEmail", "");
        String guardianRelation = (String) payload.getOrDefault("guardianRelation", "");
        String batchYear        = (String) payload.getOrDefault("batchYear", "");
        String admissionQuota   = (String) payload.getOrDefault("admissionQuota", "Convenor Quota");

        // 1. Save in StudentRegistration repository
        StudentRegistration reg = StudentRegistration.builder()
                .name(name.trim())
                .enrollmentNumber(enrollmentNumber)
                .email(email)
                .phoneNumber(phoneNumber != null ? phoneNumber.trim() : null)
                .department(department)
                .course(course)
                .year(year)
                .semester(semester)
                .section(section)
                .username(username)
                .password(encodedPassword)
                .status("REGISTERED")
                .build();
        StudentRegistration savedReg = registrationRepository.save(reg);

        Integer semNum = 1;
        if (semester != null && semester.contains("-")) {
            try {
                String[] parts = semester.split("-");
                int yr = Integer.parseInt(parts[0].trim());
                int sm = Integer.parseInt(parts[1].trim());
                semNum = (yr - 1) * 2 + sm;
            } catch (Exception ignored) { semNum = 1; }
        }

        // 2. Also create User account directly so student can log in or be managed
        User user = User.builder()
                .name(name.trim())
                .username(username)
                .email(email)
                .password(encodedPassword)
                .role(Role.STUDENT)
                .department(department)
                .enrollmentNumber(enrollmentNumber)
                .phoneNumber(phoneNumber != null ? phoneNumber.trim() : null)
                .section(section)
                .semester(semNum)
                .course(course)
                .year(year)
                .batchYear(batchYear)
                .dateOfBirth(dateOfBirth)
                .gender(gender)
                .address(address)
                .emergencyContact(emergencyContact)
                .guardianName(guardianName)
                .guardianPhone(guardianPhone)
                .guardianEmail(guardianEmail)
                .guardianRelation(guardianRelation)
                .admissionStatus("ADMITTED")
                .admissionDate(java.time.LocalDate.now().toString())
                .admissionQuota(admissionQuota)
                .isVerified(true)
                .active(true)
                .build();
        userRepository.save(user);

        Map<String, Object> resp = new HashMap<>();
        resp.put("registrationId", savedReg.getId());
        resp.put("name", savedReg.getName());
        resp.put("enrollmentNumber", savedReg.getEnrollmentNumber());
        resp.put("email", savedReg.getEmail());
        resp.put("username", savedReg.getUsername());
        resp.put("status", "SUCCESS");

        return ResponseEntity.ok(ApiResponse.success(resp, "Student registration successful! Your student account is now active."));
    }

    /**
     * Admin: Get all student registrations
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<StudentRegistration>>> getAllRegistrations() {
        return ResponseEntity.ok(ApiResponse.success(registrationRepository.findAllByOrderByCreatedAtDesc()));
    }

    /**
     * Admin: Get registration statistics
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRegistrationStats() {
        long total = registrationRepository.count();
        long registered = registrationRepository.countByStatus("REGISTERED");
        long imported = registrationRepository.countByStatus("IMPORTED");
        long approved = registrationRepository.countByStatus("APPROVED");

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", total);
        stats.put("registered", registered);
        stats.put("imported", imported);
        stats.put("approved", approved);

        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    /**
     * Admin: Import students from parsed Excel dataset with duplicate detection & detailed report
     */
    @PostMapping("/import-excel")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> importStudentsFromExcel(@RequestBody Map<String, Object> payload) {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> students = (List<Map<String, Object>>) payload.get("students");

        if (students == null || students.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("No student records provided in Excel import payload."));
        }

        int totalRecords = students.size();
        int importedSuccessfully = 0;
        int duplicateRecords = 0;
        int invalidRecords = 0;

        List<Map<String, Object>> errorList = new ArrayList<>();
        List<Map<String, Object>> successList = new ArrayList<>();

        Set<String> batchEnrollments = new HashSet<>();
        Set<String> batchEmails = new HashSet<>();
        Set<String> batchUsernames = new HashSet<>();

        for (int i = 0; i < students.size(); i++) {
            Map<String, Object> row = students.get(i);
            int rowNum = i + 1;

            String name             = (String) row.getOrDefault("name", "");
            String enrollmentNumber = (String) row.getOrDefault("enrollmentNumber", "");
            String email            = (String) row.getOrDefault("email", "");
            String phoneNumber      = (String) row.getOrDefault("phoneNumber", "");
            String department       = (String) row.getOrDefault("department", "Computer Science");
            String course           = (String) row.getOrDefault("course", "B.Tech Computer Science");
            String year             = (String) row.getOrDefault("year", "1st Year");
            String semester         = (String) row.getOrDefault("semester", "1-1");
            String section          = (String) row.getOrDefault("section", "Section A");
            String username         = (String) row.getOrDefault("username", "");
            String password         = (String) row.getOrDefault("password", "");

            // 1. Missing Required Fields Validation
            if (name == null || name.trim().isEmpty()) {
                invalidRecords++;
                Map<String, Object> err = new HashMap<>();
                err.put("row", rowNum);
                err.put("enrollmentNumber", enrollmentNumber);
                err.put("error", "Student Name is missing or blank");
                errorList.add(err);
                continue;
            }
            if (enrollmentNumber == null || enrollmentNumber.trim().isEmpty()) {
                invalidRecords++;
                Map<String, Object> err = new HashMap<>();
                err.put("row", rowNum);
                err.put("name", name);
                err.put("error", "Enrollment Number is missing or blank");
                errorList.add(err);
                continue;
            }
            if (email == null || email.trim().isEmpty()) {
                invalidRecords++;
                Map<String, Object> err = new HashMap<>();
                err.put("row", rowNum);
                err.put("name", name);
                err.put("error", "Email address is missing or blank");
                errorList.add(err);
                continue;
            }

            name = name.trim();
            enrollmentNumber = enrollmentNumber.trim().toUpperCase();
            email = email.trim().toLowerCase();

            if (username == null || username.trim().isEmpty()) {
                username = enrollmentNumber.toLowerCase();
            } else {
                username = username.trim();
            }

            if (password == null || password.trim().isEmpty()) {
                password = "Student@" + enrollmentNumber;
            }

            // 2. Intra-Batch Duplicate Checks
            if (batchEnrollments.contains(enrollmentNumber)) {
                duplicateRecords++;
                Map<String, Object> err = new HashMap<>();
                err.put("row", rowNum);
                err.put("name", name);
                err.put("enrollmentNumber", enrollmentNumber);
                err.put("error", "Duplicate Enrollment Number within Excel file: " + enrollmentNumber);
                errorList.add(err);
                continue;
            }
            if (batchEmails.contains(email)) {
                duplicateRecords++;
                Map<String, Object> err = new HashMap<>();
                err.put("row", rowNum);
                err.put("name", name);
                err.put("email", email);
                err.put("error", "Duplicate Email within Excel file: " + email);
                errorList.add(err);
                continue;
            }
            if (batchUsernames.contains(username)) {
                duplicateRecords++;
                Map<String, Object> err = new HashMap<>();
                err.put("row", rowNum);
                err.put("name", name);
                err.put("username", username);
                err.put("error", "Duplicate Username within Excel file: " + username);
                errorList.add(err);
                continue;
            }

            // 3. Database Duplicate Checks
            if (userRepository.existsByEnrollmentNumber(enrollmentNumber)) {
                duplicateRecords++;
                Map<String, Object> err = new HashMap<>();
                err.put("row", rowNum);
                err.put("name", name);
                err.put("enrollmentNumber", enrollmentNumber);
                err.put("error", "Student with Enrollment Number '" + enrollmentNumber + "' already exists in database");
                errorList.add(err);
                continue;
            }
            if (userRepository.existsByEmail(email)) {
                duplicateRecords++;
                Map<String, Object> err = new HashMap<>();
                err.put("row", rowNum);
                err.put("name", name);
                err.put("email", email);
                err.put("error", "Email '" + email + "' already registered in database");
                errorList.add(err);
                continue;
            }
            if (userRepository.existsByUsername(username)) {
                duplicateRecords++;
                Map<String, Object> err = new HashMap<>();
                err.put("row", rowNum);
                err.put("name", name);
                err.put("username", username);
                err.put("error", "Username '" + username + "' already in use in database");
                errorList.add(err);
                continue;
            }

            // Track in batch
            batchEnrollments.add(enrollmentNumber);
            batchEmails.add(email);
            batchUsernames.add(username);

            // 4. Create User Account
            String encodedPassword = passwordEncoder.encode(password);
            User newUser = User.builder()
                    .name(name)
                    .username(username)
                    .email(email)
                    .password(encodedPassword)
                    .role(Role.STUDENT)
                    .department(department)
                    .enrollmentNumber(enrollmentNumber)
                    .phoneNumber(phoneNumber != null ? phoneNumber.trim() : null)
                    .section(section)
                    .active(true)
                    .build();
            userRepository.save(newUser);

            // 5. Update or Create StudentRegistration record
            Optional<StudentRegistration> existingReg = registrationRepository.findByEnrollmentNumber(enrollmentNumber);
            if (existingReg.isPresent()) {
                StudentRegistration r = existingReg.get();
                r.setStatus("IMPORTED");
                registrationRepository.save(r);
            } else {
                StudentRegistration newReg = StudentRegistration.builder()
                        .name(name)
                        .enrollmentNumber(enrollmentNumber)
                        .email(email)
                        .phoneNumber(phoneNumber)
                        .department(department)
                        .course(course)
                        .year(year)
                        .semester(semester)
                        .section(section)
                        .username(username)
                        .password(encodedPassword)
                        .status("IMPORTED")
                        .build();
                registrationRepository.save(newReg);
            }

            importedSuccessfully++;

            Map<String, Object> succ = new HashMap<>();
            succ.put("row", rowNum);
            succ.put("name", name);
            succ.put("enrollmentNumber", enrollmentNumber);
            succ.put("username", username);
            succ.put("email", email);
            successList.add(succ);
        }

        Map<String, Object> report = new HashMap<>();
        report.put("totalRecords", totalRecords);
        report.put("importedSuccessfully", importedSuccessfully);
        report.put("duplicateRecords", duplicateRecords);
        report.put("invalidRecords", invalidRecords);
        report.put("failedRecords", duplicateRecords + invalidRecords);
        report.put("errors", errorList);
        report.put("importedStudents", successList);

        return ResponseEntity.ok(ApiResponse.success(report, "Excel processing completed. " + importedSuccessfully + " of " + totalRecords + " students imported successfully."));
    }

    /**
     * Admin: Delete student registration record
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteRegistration(@PathVariable Long id) {
        if (!registrationRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        registrationRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Registration record deleted."));
    }
}
