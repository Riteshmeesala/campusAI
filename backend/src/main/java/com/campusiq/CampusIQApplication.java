package com.campusiq;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class CampusIQApplication {
    public static void main(String[] args) {
        SpringApplication.run(CampusIQApplication.class, args);
    }
}
