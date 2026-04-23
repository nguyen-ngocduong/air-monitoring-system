/**
 * File này dùng để ánh xạ tên Icon sang mã Unicode của Font Awesome.
 * Giúp bạn sử dụng icon bằng tên gợi nhớ thay vì mã Hex khó nhớ.
 * 
 * Cách dùng: 
 * 1. Đảm bảo bạn đã có file FontAwesome5_Solid.ttf trong cùng thư mục này.
 * 2. Import FontAwesomeMap vào component và sử dụng.
 */
export const DataIcons = {
    temperature: '\uf2c9', // Icon nhiệt độ
    humidity: '\uf043',    // Icon độ ẩm
    co: '\uf55d',          // Icon carbon monoxide
    nh3: '\uf0c3',         // Icon ammonia
    pm10: '\uf72e',        // Icon PM10
    pm25: '\uf75f',        // Icon PM25
    snow: '\uf7d0',        // Icon tuyết
    sun: '\uf185',         // Icon mặt trời
    cloud: '\uf0c2',       // Icon mây
    thunderstorm: '\uf76c',// Icon giông bão
};
export const StatusIcons = {
    GOOD: '\uf118',        // Icon trạng thái tốt
    HIGH_TEMPERATURE: '\uf2c7', // Icon nhiệt độ cao
    LOW_TEMPERATURE: '\uf2c9',  // Icon nhiệt độ thấp
    HIGH_HUMIDITY: '\uf07a',    // Icon độ ẩm cao
    LOW_HUMIDITY: '\uf078',     // Icon độ ẩm thấp
    HIGH_CO: '\uf55d',         // Icon carbon monoxide cao
    HIGH_NH3: '\uf0c3',        // Icon ammonia cao
    HIGH_PM10: '\uf72e',       // Icon PM10 cao
    HIGH_PM25: '\uf75f',       // Icon PM25 cao
};
export const UIIcons = {
    user: '\uf007',
    home: '\uf015',
    alert: '\uf071',
};
export const FontFamily = {
  solid: 'FontAwesome5_Solid', // Tên này phải khớp chính xác với tên file .ttf (không có đuôi)
  regular: 'FontAwesome5_Regular',
  brands: 'FontAwesome5_Brands',
};
