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
            @RequestParam(value = "size", defaultValue = "5") int size,
            // Фильтры для всех полей
            @RequestParam(value = "idFilter", defaultValue = "") String idFilter,
            @RequestParam(value = "nameFilter", defaultValue = "") String nameFilter,
            @RequestParam(value = "coordinatesXFilter", defaultValue = "") String coordinatesXFilter,
            @RequestParam(value = "coordinatesYFilter", defaultValue = "") String coordinatesYFilter,
            @RequestParam(value = "creationDateFilter", defaultValue = "") String creationDateFilter,
            @RequestParam(value = "areaFilter", defaultValue = "") String areaFilter,
            @RequestParam(value = "populationFilter", defaultValue = "") String populationFilter,
            @RequestParam(value = "establishmentDateFilter", defaultValue = "") String establishmentDateFilter,
            @RequestParam(value = "capitalFilter", defaultValue = "") String capitalFilter,
            @RequestParam(value = "metersAboveSeaLevelFilter", defaultValue = "") String metersAboveSeaLevelFilter,
            @RequestParam(value = "timezoneFilter", defaultValue = "") String timezoneFilter,
            @RequestParam(value = "carCodeFilter", defaultValue = "") String carCodeFilter,
            @RequestParam(value = "governmentFilter", defaultValue = "") String governmentFilter,
            @RequestParam(value = "governorFilter", defaultValue = "") String governorFilter,
            @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(value = "sortDirection", defaultValue = "asc") String sortDirection) {

        try {
            Map<String, String> filters = new HashMap<>();
            filters.put("id", idFilter);
            filters.put("name", nameFilter);
            filters.put("coordinatesX", coordinatesXFilter);
            filters.put("coordinatesY", coordinatesYFilter);
            filters.put("creationDate", creationDateFilter);
            filters.put("area", areaFilter);
            filters.put("population", populationFilter);
            filters.put("establishmentDate", establishmentDateFilter);
            filters.put("capital", capitalFilter);
            filters.put("metersAboveSeaLevel", metersAboveSeaLevelFilter);
            filters.put("timezone", timezoneFilter);
            filters.put("carCode", carCodeFilter);
            filters.put("government", governmentFilter);
            filters.put("governor", governorFilter);

            System.out.println("Received filters: " + filters);
            System.out.println("Sort by: " + sortBy + ", direction: " + sortDirection);

            List<City> filteredCities = cityService.getCitiesWithFiltersAndSort(filters, sortBy, sortDirection);

            int totalCities = filteredCities.size();
            int totalPages = (int) Math.ceil((double) totalCities / size);

            if (page < 0) page = 0;
            if (size <= 0) size = 5;

            int fromIndex = page * size;
            if (fromIndex >= totalCities) {
                fromIndex = Math.max(0, (totalPages - 1) * size);
                page = Math.max(0, totalPages - 1);
            }

            int toIndex = Math.min(fromIndex + size, totalCities);
            List<City> pageContent = fromIndex < totalCities ?
                    filteredCities.subList(fromIndex, toIndex) : List.of();

            Map<String, Object> response = new HashMap<>();
            response.put("cities", pageContent);
            response.put("currentPage", page);
            response.put("totalItems", totalCities);
            response.put("totalPages", totalPages);
            response.put("pageSize", size);
            response.put("filters", filters);
            response.put("sortBy", sortBy);
            response.put("sortDirection", sortDirection);

            System.out.println("Returning " + pageContent.size() + " cities out of " + totalCities);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error in getAllCities: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
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