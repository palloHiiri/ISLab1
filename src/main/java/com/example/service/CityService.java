package com.example.service;

import com.example.repository.CityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.model.City;

import java.util.List;

@Service
public class CityService {
    private final CityRepository cityRepository;
    private final WebSocketService webSocketService;

    public CityService(CityRepository cityRepository, WebSocketService webSocketService) {
        this.cityRepository = cityRepository;
        this.webSocketService = webSocketService;
    }

    @Transactional
    public Long addCity(City city) {
        webSocketService.cityCreated(city);
        return cityRepository.save(city);
    }

    @Transactional(readOnly = true)
    public City getCity(Long id) {
        return cityRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<City> getAllCities() {
        return cityRepository.findAll();
    }

    @Transactional
    public void updateCity(City city) {
        webSocketService.cityUpdated(city);
        cityRepository.update(city);
    }

    @Transactional
    public void deleteCity(City city) {
        webSocketService.cityDeleted(city);
        cityRepository.delete(city);
    }


}
