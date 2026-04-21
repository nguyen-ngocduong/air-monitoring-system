package com.example.demo.airquality.dto;

import java.time.Instant;
import com.example.demo.airquality.enums.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AirQualityResponse {
    private Instant time;
    private Double temperature;
    private Double humidity;
    private Double co;
    private Double pm2_5;
    private Double pm10;
    private Double nh3;
    private Role status;
}
