package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.influxdb.client.InfluxDBClient;
import com.influxdb.client.InfluxDBClientFactory;

import org.springframework.beans.factory.annotation.Value;


@Configuration
public class InfluxDBConfig {
    @Value("${influxdb.url}")
    private String url;
    @Value("${influxdb.token}")
    private String token;
    @Value("${influxdb.org}")
    private String org;
    @Value("${influxdb.bucket}")
    private String bucket;
    @Bean
    public InfluxDBClient influxDBClient() {
        return InfluxDBClientFactory.create(url, token.toCharArray(), org, bucket);
    }
}
