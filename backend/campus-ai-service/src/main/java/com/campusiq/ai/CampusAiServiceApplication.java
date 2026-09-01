package com.campusiq.ai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@EnableDiscoveryClient
@ComponentScan(basePackages = {"com.campusiq.ai", "com.campusiq.common"})
public class CampusAiServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(CampusAiServiceApplication.class, args);
    }
}
