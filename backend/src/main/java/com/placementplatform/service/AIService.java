package com.placementplatform.service;

import java.util.List;
import java.util.Map;

public interface AIService {

    /**
     * Generates interview questions based on branch, target role, and difficulty level.
     */
    List<Map<String, String>> generateInterviewQuestions(String targetRole, String branch, List<String> skills, String interviewType, String difficulty);

    /**
     * Evaluates candidate answers and generates detailed scores, feedback, strengths, and weaknesses.
     */
    Map<String, Object> evaluateInterview(String targetRole, String interviewType, List<Map<String, String>> qaList);

    /**
     * Analyzes resume text/content and generates ATS keyword scores, formatting advice, and missing skills.
     */
    Map<String, Object> analyzeResume(String resumeText, String targetRole);

    /**
     * Generates a 3-week personalized learning path tailored to student weak areas.
     */
    List<Map<String, Object>> generateLearningPath(String branch, List<String> skills, String targetRole, List<String> weakAreas);
}
