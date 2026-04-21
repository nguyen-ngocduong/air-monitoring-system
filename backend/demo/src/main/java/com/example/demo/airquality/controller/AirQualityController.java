package com.example.demo.airquality.controller;

import com.example.demo.airquality.dto.AirQualityRealtimeResponse;
import com.example.demo.airquality.dto.AirQualityResponse;
import com.example.demo.airquality.service.AirQualityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/air-quality")
@RequiredArgsConstructor
public class AirQualityController {

    private final AirQualityService airQualityService;

    @GetMapping("/latest/{device}")
    public ResponseEntity<AirQualityRealtimeResponse> getLatestData(@PathVariable String device) {
        return ResponseEntity.ok(airQualityService.getRealTimeAirQualityData(device));
    }

    @GetMapping("/history/{device}")
    public ResponseEntity<List<AirQualityResponse>> getHistoryData(
            @PathVariable String device,
            @RequestParam String startTime,
            @RequestParam String endTime) {
        return ResponseEntity.ok(airQualityService.getHistoricalAirQualityData(device, startTime, endTime));
    }

    @DeleteMapping("/{device}")
    public ResponseEntity<Void> deleteData(
            @PathVariable String device,
            @RequestParam String startTime,
            @RequestParam String endTime) {
        airQualityService.deleteAirQualityData(device, startTime, endTime);
        return ResponseEntity.noContent().build();
    }
}
