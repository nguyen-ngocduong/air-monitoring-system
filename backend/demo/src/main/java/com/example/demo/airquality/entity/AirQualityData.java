package com.example.demo.airquality.entity;

import com.influxdb.annotations.Column;
import com.influxdb.annotations.Measurement;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;


@Getter
@Setter
@Measurement(name = "air_quality")
public class AirQualityData {
    @Column(name = "_field")
    private String field;
    @Column(name = "_value")
    private double value;
    @Column(timestamp = true)
    private Instant time;
    @Column(tag = true)
    private String device;
    @Column(tag = true)
    private String topic;
    @Column(tag = true)
    private String host;
}
