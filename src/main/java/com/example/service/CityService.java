package com.example.service;

import com.example.repository.CityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.model.City;

import java.util.List;

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

    @Transactional
    public Double getAverageCarCode(){
        return cityRepository.getAverageCarCode();
    }

    @Transactional
    public Double getSumOfTimezones(){
        return cityRepository.getSumOfTimezones();
    }

    @Transactional
    public List<City> getCitiesWithTimezoneLessThan(int timezone){
        return cityRepository.getCitiesWithTimezoneLessThan(timezone);
    }

    @Transactional
    public Double calculateDistanceToTheMostPopulatedCity(){
        return cityRepository.calculateDistanceToTheMostPopulatedCity();
    }

    @Transactional
    public Double calculateDistanceToNewestCity(){
        return cityRepository.calculateDistanceToNewestCity();
    }


}
