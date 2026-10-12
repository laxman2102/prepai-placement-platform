package com.placementplatform.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "student_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String college;
    private String degree;
    private String branch;
    private Integer graduationYear;
    private Integer profileCompletion;
    private String skills; // Comma separated
    private String targetRole;
    private Double cgpa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_mentor_id")
    private User assignedMentor;
}
