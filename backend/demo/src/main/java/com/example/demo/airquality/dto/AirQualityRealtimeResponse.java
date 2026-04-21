package com.example.demo.airquality.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

import com.example.demo.airquality.enums.Role;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AirQualityRealtimeResponse {
    private String device;
    private Instant time;
    private Double temperature;
    private Double humidity;
    private Double pm25;
    private Double pm10;
    private Double co;
    private Double nh3;
    private Role Status;
}
