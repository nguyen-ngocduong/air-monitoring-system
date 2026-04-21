package com.example.demo.airquality.service;

import java.util.List;
import com.example.demo.airquality.dto.*;

public interface AirQualityService {
    //Use case1: Get real-time air quality data
    AirQualityRealtimeResponse getRealTimeAirQualityData(String deviceId);
    //Use case2: Get historical air quality data
    List<AirQualityResponse> getHistoricalAirQualityData(String deviceId, String startTime, String endTime);
    //Use case3: Get air quality chart
    List<AirQualityResponse> getAirQualityChart(String deviceId, String startTime, String endTime);
    //Use case4: Admin can delete air quality data
    void deleteAirQualityData(String deviceId, String startTime, String endTime);
}
