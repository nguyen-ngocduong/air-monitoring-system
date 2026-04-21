package com.example.demo.airquality.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HistoryRequest {
    private String device;
    private List<String> fields;
    private String startTime;
    private String endTime;
}
