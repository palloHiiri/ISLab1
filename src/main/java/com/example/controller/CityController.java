package com.example.controller;

import com.example.model.City;
import com.example.service.CityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cities")
public class CityController {
    private final CityService cityService;

    public CityController(CityService cityService) {
        this.cityService = cityService;
    }

    @PostMapping("/add")
    public ResponseEntity<City> addCity(@RequestBody City city) {
        try {
            Long id = cityService.addCity(city);
            return ResponseEntity.ok(city);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/get-by-id/{id}")
    public ResponseEntity<City> getCity(@PathVariable("id") Long id) {
        City city = cityService.getCity(id);
        if (city != null) {
            return ResponseEntity.ok(city);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllCities(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "6") int size) {

        List<City> allCities = cityService.getAllCities();
        int totalCities = allCities.size();
        int totalPages = (int) Math.ceil((double) totalCities / size);

        if (page < 0) page = 0;
        if (size <= 0) size = 6;

        int fromIndex = page * size;
        if (fromIndex >= totalCities) {
            fromIndex = Math.max(0, (totalPages - 1) * size);
            page = totalPages - 1;
        }

        int toIndex = Math.min(fromIndex + size, totalCities);
        List<City> pageContent = allCities.subList(fromIndex, toIndex);

        Map<String, Object> response = new HashMap<>();
        response.put("cities", pageContent);
        response.put("currentPage", page);
        response.put("totalItems", totalCities);
        response.put("totalPages", totalPages);
        response.put("pageSize", size);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/update-by-id/{id}")
    public ResponseEntity<City> updateCity(@PathVariable("id") Long id, @RequestBody City city) {
        try {
            city.setId(id);
            cityService.updateCity(city);
            return ResponseEntity.ok(city);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/delete-by-id/{id}")
    public ResponseEntity<Void> deleteCity(@PathVariable("id") Long id) {
        try {
            City city = cityService.getCity(id);
            if (city != null) {
                cityService.deleteCity(city);
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/sum-of-timezones")
    public ResponseEntity<Double> getSumOfTimezones() {
        try {
            Double sum = cityService.getSumOfTimezones();
            return ResponseEntity.ok(sum);
        }catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/average-car-code")
    public ResponseEntity<Double> getAverageCarCode() {
        try{
            Double averageCarCode = cityService.getAverageCarCode();
            return ResponseEntity.ok(averageCarCode);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/timezone-less-than/{timezone}")
    public ResponseEntity<List<City>> getCitiesWithTimezoneLessThan(@PathVariable("timezone") int timezone) {
        try {
            List<City> cities = cityService.getCitiesWithTimezoneLessThan(timezone);
            return ResponseEntity.ok(cities);
        }catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/distance-to-most-populated")
    public ResponseEntity<Double> getDistanceToMostPopulatedCity() {
        try{
            Double dist = cityService.calculateDistanceToTheMostPopulatedCity();
            return ResponseEntity.ok(dist);
        }catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/distance-to-newest")
    public ResponseEntity<Double> getDistanceToNewestCity() {
        try {
            Double dist = cityService.calculateDistanceToNewestCity();
            return ResponseEntity.ok(dist);
        }catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
