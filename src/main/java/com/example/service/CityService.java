package com.example.service;

import com.example.model.City;
import com.example.repository.CityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class CityService {
    private final CityRepository cityRepository;

    public CityService(CityRepository cityRepository) {
        this.cityRepository = cityRepository;
    }

    @Transactional
    public Long addCity(City city) {
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
        cityRepository.update(city);
    }

    @Transactional
    public void deleteCity(City city) {
        cityRepository.delete(city);
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
    public Double calculateDistanceToNewestCity(){
        return cityRepository.calculateDistanceToNewestCity();
    }

    @Transactional(readOnly = true)
    public List<City> getCitiesWithFiltersAndSort(Map<String, String> filters, String sortBy, String sortDirection) {
        return cityRepository.findWithFiltersAndSort(filters, sortBy, sortDirection);
    }
}