package com.placementplatform.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "mentor_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String qualification;
    private String specialization;
    private Integer experienceYears;

    @Column(length = 2000)
    private String professionalProfile;

    private Double rating;
}
