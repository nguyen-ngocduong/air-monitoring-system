package com.example.demo.airquality.controller;

import com.example.demo.airquality.dto.AirQualityRealtimeResponse;
import com.example.demo.airquality.dto.AirQualityResponse;
import com.example.demo.airquality.service.AirQualityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/air-quality")
@RequiredArgsConstructor
@Tag(name = "Air Quality", description = "Endpoints for air quality data (latest and historical)")
public class AirQualityController {

    private final AirQualityService airQualityService;

    @GetMapping("/latest/{device}")
    @Operation(summary = "Get latest air quality data", description = "Retrieve the most recent air quality readings for a specific device")
    public ResponseEntity<AirQualityRealtimeResponse> getLatestData(@PathVariable String device) {
        return ResponseEntity.ok(airQualityService.getRealTimeAirQualityData(device));
    }

    @GetMapping("/history/{device}")
    @Operation(summary = "Get historical air quality data", description = "Retrieve historical air quality data for a specific device within a time range")
    public ResponseEntity<List<AirQualityResponse>> getHistoryData(
            @PathVariable String device,
            @RequestParam String startTime,
            @RequestParam String endTime) {
        return ResponseEntity.ok(airQualityService.getHistoricalAirQualityData(device, startTime, endTime));
    }

    @GetMapping("/chart/{device}")
    @Operation(summary = "Get air quality chart data", description = "Retrieve air quality data formatted for charts for a specific device within a time range")
    public ResponseEntity<List<AirQualityResponse>> getChartData(
            @PathVariable String device,
            @RequestParam String startTime,
            @RequestParam String endTime) {
        return ResponseEntity.ok(airQualityService.getAirQualityChart(device, startTime, endTime));
    }
    
    @DeleteMapping("/{device}")
    @Operation(summary = "Delete air quality data", description = "Delete air quality records for a specific device within a time range (Admin only)")
    public ResponseEntity<Void> deleteData(
            @PathVariable String device,
            @RequestParam String startTime,
            @RequestParam String endTime) {
        airQualityService.deleteAirQualityData(device, startTime, endTime);
        return ResponseEntity.noContent().build();
    }
}
