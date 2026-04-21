package com.example.demo.airquality.repository;

import org.springframework.stereotype.Repository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;

import com.influxdb.client.DeleteApi;
import com.influxdb.client.InfluxDBClient;
import com.influxdb.client.domain.DeletePredicateRequest;
import com.influxdb.query.FluxTable;
import com.example.demo.airquality.entity.AirQualityData;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class AirQualityRepository{
    /*ket noi truc tiep bang influxDBClient */
    private final InfluxDBClient influxDBClient;
    @Value("${influxdb.bucket}")
    private String bucket;
    @Value("${influxdb.org}")
    private String org;
    //getRealTimeAirQualityData
    public List<AirQualityData> findLatestByDevice(String device) {
        String flux = String.format(
            "from(bucket: \"%s\") " + 
            "|> range(start: -24h) " +
            "|> filter(fn: (r) => r[\"device\"] == \"%s\") " +
            "|> filter(fn: (r) => r[\"_measurement\"] == \"air_quality\") " +
            "|> last()",
            bucket, device
        );
        return influxDBClient.getQueryApi().query(flux,  AirQualityData.class);
    }
    //getHistoricalAirQualityData
    public List<AirQualityData> findByDeviceAndTimeRange(String device, String startTime, String endTime) {
        String flux = String.format(
            "from(bucket: \"%s\") " + 
            "|> range(start: %s, stop: %s)" + 
            "|> filter(fn: (r) => r[\"device\"] == \"%s\") " + 
            "|> filter(fn: (r) => r[\"_measurement\"] == \"air_quality\") ",
            bucket, startTime, endTime, device
        );
        return influxDBClient.getQueryApi().query(flux, AirQualityData.class);
    }
    // get chart
    public List<FluxTable> getChartData(String device, String startTime, String endTime) {
        String flux = String.format("""
            from(bucket: "%s")
            |> range(start: %s, stop: %s)
            |> filter(fn: (r) => r._measurement == "air_quality")
            |> filter(fn: (r) => r.device == "%s")
            |> pivot(
                rowKey: ["_time"],
                columnKey: ["_field"],
                valueColumn: "_value"
            )
            """, bucket, startTime, endTime, device);
        return influxDBClient.getQueryApi().query(flux);
    }
    //deleteAirQualityData
    public void deleteByDeviceAndTimeRange(String device, OffsetDateTime startTime, OffsetDateTime endTime) {
        DeleteApi deleteApi = influxDBClient.getDeleteApi();
        DeletePredicateRequest request = new DeletePredicateRequest();
        request.setStart(startTime);
        request.setStop(endTime);
        request.setPredicate(String.format("_measurement=\"air_quality\" AND device=\"%s\"", device));
        deleteApi.delete(request, bucket, org);
    }
}