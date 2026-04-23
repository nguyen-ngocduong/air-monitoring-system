package com.example.demo.airquality.mapper;

import com.example.demo.airquality.dto.AirQualityResponse;
import com.example.demo.airquality.enums.Role;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AirQualityMapperTest {

    private final AirQualityMapper mapper = new AirQualityMapper();

    @Test
    void calculateStatus_ShouldReturnHighTemperature_WhenTemperatureIsAbove35() {
        AirQualityResponse res = AirQualityResponse.builder()
                .temperature(36.0)
                .build();
        mapper.calculateStatus(res);
        assertEquals(Role.HIGH_TEMPERATURE, res.getStatus());
    }

    @Test
    void calculateStatus_ShouldReturnHumidityLow_WhenHumidityIsBelow30() {
        AirQualityResponse res = AirQualityResponse.builder()
                .temperature(25.0)
                .humidity(25.0)
                .build();
        mapper.calculateStatus(res);
        assertEquals(Role.HUMIDITY_LOW, res.getStatus());
    }

    @Test
    void calculateStatus_ShouldReturnHighCo_WhenCoIsAbove12_5() {
        AirQualityResponse res = AirQualityResponse.builder()
                .temperature(25.0)
                .humidity(50.0)
                .co(15.0)
                .build();
        mapper.calculateStatus(res);
        assertEquals(Role.HIGH_CO, res.getStatus());
    }

    @Test
    void calculateStatus_ShouldReturnHighPm25_WhenPm25IsAbove35() {
        AirQualityResponse res = AirQualityResponse.builder()
                .temperature(25.0)
                .humidity(50.0)
                .co(5.0)
                .pm2_5(40.0)
                .build();
        mapper.calculateStatus(res);
        assertEquals(Role.HIGH_PM25, res.getStatus());
    }

    @Test
    void calculateStatus_ShouldReturnGood_WhenAllValuesAreNormal() {
        AirQualityResponse res = AirQualityResponse.builder()
                .temperature(25.0)
                .humidity(50.0)
                .co(5.0)
                .pm2_5(10.0)
                .pm10(20.0)
                .nh3(5.0)
                .build();
        mapper.calculateStatus(res);
        assertEquals(Role.GOOD, res.getStatus());
    }
}
