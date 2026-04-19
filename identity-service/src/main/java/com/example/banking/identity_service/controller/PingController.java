package com.example.banking.identity_service.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/identity")
public class PingController {
    @GetMapping("/ping")
    public String ping() {
        return "Identity Service is alive again!";
    }

}
