package com.example.demo.airquality.mapper;

import com.example.demo.airquality.dto.AirQualityRealtimeResponse;
import com.example.demo.airquality.dto.AirQualityResponse;
import com.example.demo.airquality.entity.AirQualityData;
import com.example.demo.airquality.enums.Role;
import com.influxdb.query.FluxRecord;
import com.influxdb.query.FluxTable;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class AirQualityMapper {

    public void calculateStatus(AirQualityResponse res){
        if (res.getTemperature() != null && res.getTemperature() >= 35) {
            res.setStatus(Role.HIGH_TEMPERATURE);
            return;
        }
        if (res.getHumidity() != null) {
            if (res.getHumidity() < 30) {
                res.setStatus(Role.HUMIDITY_LOW);
                return;
            } else if (res.getHumidity() > 90) {
                res.setStatus(Role.HUMIDITY_HIGH);
                return;
            }
        }
        if (res.getCo() != null && res.getCo() > 12.5) {
            res.setStatus(Role.HIGH_CO);
            return;
        }
        if (res.getNh3() != null && res.getNh3() > 20) {
            res.setStatus(Role.HIGH_NH3);
            return;
        }
        if (res.getPm2_5() != null && res.getPm2_5() > 35) {
            res.setStatus(Role.HIGH_PM25);
            return;
        }
        if (res.getPm10() != null && res.getPm10() > 50) {
            res.setStatus(Role.HIGH_PM10);
            return;
        }
        res.setStatus(Role.GOOD);
    }

    public List<AirQualityResponse> toResponse(List<AirQualityData> dataList) {
        Map<Instant, AirQualityResponse> groupMap = new HashMap<>();

        for (AirQualityData data : dataList) {
            AirQualityResponse res = groupMap.computeIfAbsent(data.getTime(), t -> {
                AirQualityResponse newRes = new AirQualityResponse();
                newRes.setTime(t);
                return newRes;
            });

            mapFieldToResponse(data, res);
        }

        List<AirQualityResponse> result = new ArrayList<>(groupMap.values());
        result.forEach(this::calculateStatus);
        return result;
    }

    public AirQualityRealtimeResponse toRealTimeResponse(List<AirQualityData> dataList) {
        if (dataList == null || dataList.isEmpty()) return null;
        
        AirQualityRealtimeResponse response = new AirQualityRealtimeResponse();
        response.setTime(dataList.get(0).getTime());
        response.setDevice(dataList.get(0).getDevice());

        for (AirQualityData data : dataList) {
            switch (data.getField()) {
                case "temperature" -> response.setTemperature(data.getValue());
                case "humidity" -> response.setHumidity(data.getValue());
                case "co" -> response.setCo(data.getValue());
                case "pm2_5", "pm2.5" -> response.setPm25(data.getValue());
                case "pm10" -> response.setPm10(data.getValue());
                case "nh3" -> response.setNh3(data.getValue());
            }
        }
        
        // Tính toán status cho Realtime
        AirQualityResponse tempRes = new AirQualityResponse();
        tempRes.setTemperature(response.getTemperature());
        tempRes.setHumidity(response.getHumidity());
        tempRes.setCo(response.getCo());
        tempRes.setPm2_5(response.getPm25());
        tempRes.setPm10(response.getPm10());
        tempRes.setNh3(response.getNh3());
        calculateStatus(tempRes);
        response.setStatus(tempRes.getStatus());
        
        return response;
    }

    private void mapFieldToResponse(AirQualityData data, AirQualityResponse res) {
        switch (data.getField()) {
            case "temperature" -> res.setTemperature(data.getValue());
            case "humidity" -> res.setHumidity(data.getValue());
            case "co" -> res.setCo(data.getValue());
            case "pm2_5", "pm2.5" -> res.setPm2_5(data.getValue());
            case "pm10" -> res.setPm10(data.getValue());
            case "nh3" -> res.setNh3(data.getValue());
        }
    }

    public List<AirQualityResponse> toChartResponse(List<FluxTable> chartData){
        List<AirQualityResponse> responses = new ArrayList<>();
        for(FluxTable table : chartData){
            for(FluxRecord record : table.getRecords()){
                AirQualityResponse response = new AirQualityResponse();
                response.setTime(record.getTime());
                response.setTemperature(record.getValueByKey("temperature") != null ? ((Number) record.getValueByKey("temperature")).doubleValue() : null);
                response.setHumidity(record.getValueByKey("humidity") != null ? ((Number) record.getValueByKey("humidity")).doubleValue() : null);
                response.setCo(record.getValueByKey("co") != null ? ((Number) record.getValueByKey("co")).doubleValue() : null);
                response.setPm2_5(record.getValueByKey("pm2_5") != null ? ((Number) record.getValueByKey("pm2_5")).doubleValue() : null);
                response.setPm10(record.getValueByKey("pm10") != null ? ((Number) record.getValueByKey("pm10")).doubleValue() : null);
                calculateStatus(response);
                responses.add(response);
            }
        }
        return responses;
    }
}
