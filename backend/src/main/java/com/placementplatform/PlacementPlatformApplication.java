package com.placementplatform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PlacementPlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(PlacementPlatformApplication.class, args);
        System.out.println("==================================================");
        System.out.println("AI Placement Preparation Platform Backend Started!");
        System.out.println("==================================================");
    }
}
