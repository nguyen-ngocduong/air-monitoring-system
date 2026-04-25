package com.example.demo.airquality.service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
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

    private static final DateTimeFormatter INPUT_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

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
        String startRFC = convertToRFC3339(startTime);
        String endRFC = convertToRFC3339(endTime);
        
        List<AirQualityData> list = airQualityRepository.findByDeviceAndTimeRange(device, startRFC, endRFC);
        if(list.isEmpty()){
            return List.of();
        }
        return airQualityMapper.toResponse(list);
    }

    @Override
    public List<AirQualityResponse> getAirQualityChart(String device, String startTime, String endTime) {
        String startRFC = convertToRFC3339(startTime);
        String endRFC = convertToRFC3339(endTime);
        
        List<FluxTable> listTables = airQualityRepository.getChartData(device, startRFC, endRFC);
        return airQualityMapper.toChartResponse(listTables);
    }

    @Override
    public void deleteAirQualityData(String device, String startTime, String endTime) {
        OffsetDateTime start = OffsetDateTime.parse(convertToRFC3339(startTime));
        OffsetDateTime end = OffsetDateTime.parse(convertToRFC3339(endTime));
        airQualityRepository.deleteByDeviceAndTimeRange(device, start, end);
    }

    /**
     * Chuyển đổi từ định dạng yyyy-MM-dd HH:mm:ss sang RFC3339 (yyyy-MM-dd'T'HH:mm:ssXXX)
     */
    private String convertToRFC3339(String dateStr) {
        try {
            LocalDateTime localDateTime = LocalDateTime.parse(dateStr, INPUT_FORMATTER);
            // Chuyển sang ZonedDateTime với múi giờ hệ thống và định dạng lại
            ZonedDateTime zonedDateTime = localDateTime.atZone(ZoneId.systemDefault());
            return zonedDateTime.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
        } catch (Exception e) {
            // Nếu không đúng định dạng mong muốn, trả về giá trị gốc (có thể là RFC3339 sẵn)
            return dateStr;
        }
    }
}
