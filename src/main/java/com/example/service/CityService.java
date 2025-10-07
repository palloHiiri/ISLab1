package com.example.service;

import com.example.model.City;
import com.example.model.Coordinates;
import com.example.model.Human;
import com.example.repository.CityRepository;
import com.example.websocket.CityWebSocketHandler;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class CityService {
    private final CityRepository cityRepository;
    private final CityWebSocketHandler webSocketHandler;

    public CityService(CityRepository cityRepository, CityWebSocketHandler webSocketHandler) {
        this.webSocketHandler = webSocketHandler;
        this.cityRepository = cityRepository;

    }

    @Transactional
    public Long addCity(City city) {
        if (city.getCreationDate() == null) {
            city.setCreationDate(java.time.LocalDate.now());
        }
        Long id = cityRepository.save(city);
        webSocketHandler.broadcastUpdate("CITY_ADDED", city);
        return id;
    }

    @Transactional(readOnly = true)
    public City getCity(Long id) {
        return cityRepository.findById(id);
    }

    @Transactional
    public void updateCity(City city) {
        webSocketHandler.broadcastUpdate("CITY_UPDATED", city);
        cityRepository.update(city);
    }

    @Transactional(readOnly = true)
    public Double getAverageCarCode(){
        return cityRepository.getAverageCarCode();
    }

    @Transactional(readOnly = true)
    public Double getSumOfTimezones(){
        return cityRepository.getSumOfTimezones();
    }

    @Transactional(readOnly = true)
    public List<City> getCitiesWithTimezoneLessThan(int timezone){
        return cityRepository.getCitiesWithTimezoneLessThan(timezone);
    }

    @Transactional(readOnly = true)
    public Double calculateDistanceToTheMostPopulatedCity(){
        return cityRepository.calculateDistanceToTheMostPopulatedCity();
    }

    @Transactional(readOnly = true)
    public List<Human> getAllGovernors() {
        return cityRepository.findAllGovernors();
    }

    @Transactional(readOnly = true)
    public List<Coordinates> getAllCoordinates() {
        return cityRepository.findAllCoordinates();
    }

    @Transactional
    public void deleteCityCascade(City city) {
        cityRepository.delete(city);
        webSocketHandler.broadcastUpdate("CITY_DELETED", city);
    }

    @Transactional(readOnly = true)
    public Double calculateDistanceToNewestCity(){
        return cityRepository.calculateDistanceToNewestCity();
    }

    @Transactional(readOnly = true)
    public List<City> getCitiesWithFiltersAndSort(Map<String, String> filters, String sortBy, String sortDirection) {
        return cityRepository.findWithFiltersAndSort(filters, sortBy, sortDirection);
    }
}