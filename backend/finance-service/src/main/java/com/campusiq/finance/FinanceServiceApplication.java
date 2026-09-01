package com.campusiq.finance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@EnableDiscoveryClient
@ComponentScan(basePackages = {"com.campusiq.finance", "com.campusiq.common"})
public class FinanceServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(FinanceServiceApplication.class, args);
    }
}
