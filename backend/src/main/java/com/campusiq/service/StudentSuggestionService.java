package com.campusiq.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class StudentSuggestionService {

    public static final String CATEGORY_EXCELLENT = "Excellent";
    public static final String CATEGORY_STRONG = "Strong";
    public static final String CATEGORY_MODERATE = "Moderate";
    public static final String CATEGORY_AT_RISK = "At Risk";
    public static final String CATEGORY_CRITICAL = "Critical";

    public String determineCategory(BigDecimal percentage) {
        if (percentage == null) return CATEGORY_CRITICAL;
        double pct = percentage.doubleValue();
        if (pct >= 90) return CATEGORY_EXCELLENT;
        if (pct >= 75) return CATEGORY_STRONG;
        if (pct >= 60) return CATEGORY_MODERATE;
        if (pct >= 40) return CATEGORY_AT_RISK;
        return CATEGORY_CRITICAL;
    }

    public List<String> generateSuggestions(BigDecimal percentage, BigDecimal attendancePercentage) {
        String category = determineCategory(percentage);
        List<String> suggestions = new ArrayList<>();

        switch (category) {
            case CATEGORY_EXCELLENT:
                suggestions.add("Outstanding performance! You are in the top tier. Keep maintaining this standard.");
                suggestions.add("Consider participating in research projects, olympiads, or advanced certifications.");
                suggestions.add("Help peers through study groups — teaching reinforces your own mastery.");
                suggestions.add("Explore internship and scholarship opportunities to leverage your academic standing.");
                suggestions.add("Set even higher goals: aim for publication, competitions, or higher studies.");
                break;

            case CATEGORY_STRONG:
                suggestions.add("Great performance! You are performing well above average.");
                suggestions.add("Focus on the few subjects where you score below 75% and bring them up.");
                suggestions.add("Develop a consistent daily revision habit for all subjects.");
                suggestions.add("Take on leadership roles in academic projects and group activities.");
                suggestions.add("Build your skill portfolio with online certifications relevant to your field.");
                break;

            case CATEGORY_MODERATE:
                suggestions.add("You are performing adequately, but there is clear room for improvement.");
                suggestions.add("Identify your 2-3 weakest subjects and create a targeted study plan for them.");
                suggestions.add("Attend faculty office hours and ask questions—never hesitate to seek help.");
                suggestions.add("Form a dedicated study group with consistent toppers in your class.");
                suggestions.add("Practice previous year exam papers and time yourself to improve speed and accuracy.");
                suggestions.add("Reduce distractions and allocate structured study blocks of 2-3 hours daily.");
                break;

            case CATEGORY_AT_RISK:
                suggestions.add("WARNING: Your academic performance needs immediate serious attention.");
                suggestions.add("Meet your academic advisor or faculty mentor this week without fail.");
                suggestions.add("Create a strict daily timetable giving minimum 5-6 hours to academics.");
                suggestions.add("Revisit fundamental concepts in subjects where you are below 40%.");
                suggestions.add("Avoid missing any class or assignment from this point forward.");
                suggestions.add("Request a counseling session to identify any underlying barriers to your studies.");
                suggestions.add("Consider forming a study partnership with a high-performing peer.");
                break;

            case CATEGORY_CRITICAL:
                suggestions.add("CRITICAL ALERT: Your academic performance is at a failing level. Immediate action is required.");
                suggestions.add("Schedule an urgent meeting with your faculty mentor and head of department today.");
                suggestions.add("Attend ALL remaining classes — zero absence policy must be followed strictly.");
                suggestions.add("Seek academic remediation support if available at your institution.");
                suggestions.add("Request special coaching or tutorial sessions for core subjects.");
                suggestions.add("Evaluate and remove all major distractions from your daily schedule.");
                suggestions.add("Inform your parents/guardians and seek their support and accountability.");
                suggestions.add("Use every available resource: library, online courses (NPTEL, Coursera), and study materials.");
                break;

            default:
                suggestions.add("No performance data available yet. Begin attending classes and submitting assignments.");
        }

        // Additional attendance-based suggestions
        if (attendancePercentage != null && attendancePercentage.doubleValue() < 75) {
            suggestions.add("ATTENDANCE WARNING: Your attendance is " +
                    String.format("%.1f", attendancePercentage.doubleValue()) +
                    "%, which is below the minimum 75% requirement. Risk of debarment from exams.");
            suggestions.add("Prioritize class attendance — regular presence is directly correlated with academic success.");
        }

        return suggestions;
    }

    public String getPriorityAction(BigDecimal percentage, BigDecimal attendancePercentage) {
        String category = determineCategory(percentage);
        double attendance = attendancePercentage != null ? attendancePercentage.doubleValue() : 0;

        if (attendance < 75) {
            return "URGENT: Improve attendance immediately to avoid exam debarment (Current: " +
                    String.format("%.1f", attendance) + "%)";
        }

        switch (category) {
            case CATEGORY_EXCELLENT:
                return "Explore advanced opportunities: research, competitions, internships.";
            case CATEGORY_STRONG:
                return "Target weak subjects for focused improvement to reach excellence.";
            case CATEGORY_MODERATE:
                return "Create structured daily study plan and seek faculty guidance.";
            case CATEGORY_AT_RISK:
                return "Meet academic advisor ASAP and create emergency study plan.";
            case CATEGORY_CRITICAL:
                return "EMERGENCY: Report to Head of Department for academic intervention immediately.";
            default:
                return "Start attending classes and submitting all assignments.";
        }
    }
}
