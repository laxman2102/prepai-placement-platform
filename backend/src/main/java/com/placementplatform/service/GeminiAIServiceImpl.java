package com.placementplatform.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class GeminiAIServiceImpl implements AIService {

    @Value("${app.ai.api-key}")
    private String apiKey;

    @Override
    public List<Map<String, String>> generateInterviewQuestions(String targetRole, String branch, List<String> skills, String interviewType, String difficulty) {
        // Fallback / standard structured questions generator
        List<Map<String, String>> questions = new ArrayList<>();
        
        Map<String, String> q1 = new HashMap<>();
        q1.put("id", "iq_1");
        q1.put("question", "How do you handle database indexing and query optimization in " + targetRole + " services?");
        q1.put("category", "DBMS");
        q1.put("hint", "Explain EXPLAIN plans and B-Tree indexes.");
        questions.add(q1);

        Map<String, String> q2 = new HashMap<>();
        q2.put("id", "iq_2");
        q2.put("question", "Explain the difference between synchronous and asynchronous API communication in microservices.");
        q2.put("category", "Architecture");
        q2.put("hint", "Compare REST/gRPC against Message Queues like Kafka.");
        questions.add(q2);

        return questions;
    }

    @Override
    public Map<String, Object> evaluateInterview(String targetRole, String interviewType, List<Map<String, String>> qaList) {
        Map<String, Object> evaluation = new HashMap<>();
        evaluation.put("overallScore", 82);
        evaluation.put("communicationScore", 85);
        evaluation.put("technicalScore", 80);
        evaluation.put("confidenceScore", 82);
        evaluation.put("answerQuality", "Strong conceptual articulation with structured technical answers.");
        evaluation.put("strengths", Arrays.asList("Clear communication", "Good architectural awareness"));
        evaluation.put("weaknesses", Arrays.asList("Needs deeper familiarity with edge-case error handling"));
        evaluation.put("suggestions", Arrays.asList("Practice live coding with edge cases under timer"));
        evaluation.put("recommendedTopics", Arrays.asList("Spring Security", "JVM Memory Model"));
        return evaluation;
    }

    @Override
    public Map<String, Object> analyzeResume(String resumeText, String targetRole) {
        Map<String, Object> analysis = new HashMap<>();
        analysis.put("resumeScore", 82);
        analysis.put("detectedSkills", Arrays.asList("Java 21", "Spring Boot", "REST APIs", "MySQL", "React.js"));
        analysis.put("missingSkills", Arrays.asList("Docker", "JUnit 5", "Redis", "CI/CD"));
        analysis.put("formattingSuggestions", Arrays.asList("Use strong action verbs in bullet points", "Quantify achievements with metrics"));
        analysis.put("keywordSuggestions", Arrays.asList("Microservices", "JWT Authentication", "Agile"));
        analysis.put("summary", "Solid technical foundation for entry-level SDE role.");
        return analysis;
    }

    @Override
    public List<Map<String, Object>> generateLearningPath(String branch, List<String> skills, String targetRole, List<String> weakAreas) {
        List<Map<String, Object>> path = new ArrayList<>();
        Map<String, Object> week1 = new HashMap<>();
        week1.put("weekNumber", 1);
        week1.put("title", "Week 1: Core Fundamentals & Aptitude");
        week1.put("focusArea", "Core Java, Collections & Time/Work Aptitude");
        path.add(week1);
        return path;
    }
}
