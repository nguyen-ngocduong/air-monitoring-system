package com.example.demo.airquality.service;

import java.time.OffsetDateTime;

import java.util.List;

import com.example.demo.airquality.entity.AirQualityData;
import com.example.demo.airquality.mapper.AirQualityMapper;
import com.example.demo.airquality.repository.AirQualityRepository;
import com.influxdb.query.FluxTable;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.example.demo.airquality.dto.AirQualityRealtimeResponse;
import com.example.demo.airquality.dto.AirQualityResponse;

@Service
@RequiredArgsConstructor
public class AirQualityServiceImpl implements AirQualityService {
    private final AirQualityRepository airQualityRepository;
    private final AirQualityMapper airQualityMapper;

    @Override
    public AirQualityRealtimeResponse getRealTimeAirQualityData(String device) {
        List<AirQualityData> datas = airQualityRepository.findLatestByDevice(device);
        if(datas.isEmpty()){
            return null;
        }
        return airQualityMapper.toRealTimeResponse(datas);
    }


    @Override
    public List<AirQualityResponse> getHistoricalAirQualityData(String device, String startTime, String endTime) {
        List<AirQualityData> list = airQualityRepository.findByDeviceAndTimeRange(device, startTime, endTime);
        if(list.isEmpty()){
            return List.of();
        }
        return airQualityMapper.toResponse(list);
    }

    @Override
    public List<AirQualityResponse> getAirQualityChart(String device, String startTime, String endTime) {
        List<FluxTable> listTables = airQualityRepository.getChartData(device, startTime, endTime);
        return airQualityMapper.toChartResponse(listTables);
    }

    @Override
    public void deleteAirQualityData(String device, String startTime, String endTime) {
        OffsetDateTime start = OffsetDateTime.parse(startTime);
        OffsetDateTime end = OffsetDateTime.parse(endTime);
        airQualityRepository.deleteByDeviceAndTimeRange(device, start, end);
    }
}
