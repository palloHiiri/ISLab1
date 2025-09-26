package com.example.repository;

import com.example.model.City;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class CityRepository {
    private final SessionFactory sessionFactory;

    public CityRepository(SessionFactory sessionFactory) {
        this.sessionFactory = sessionFactory;
    }

    public List<City> findAll() {
        try (var session = sessionFactory.openSession()) {
            return session.createQuery("from City", City.class).list();
        }
    }

    public City findById(Long id) {
        try (var session = sessionFactory.openSession()) {
            return session.get(City.class, id);
        }
    }

    public Long save(City city) {
        Session session = sessionFactory.openSession();
        Transaction transaction = null;
        Long id = null;

        try {
            transaction = session.beginTransaction();
            id = (Long) session.save(city);
            transaction.commit();
        } catch (Exception e) {
            if (transaction != null) transaction.rollback();
            throw e;
        } finally {
            session.close();
        }
        return id;
    }

    public void update(City city) {

        try (Session session = sessionFactory.openSession()) {
            Transaction transaction = null;
            transaction = session.beginTransaction();
            session.update(city);
            transaction.commit();
        }
    }

    public void delete(City city) {

        try (Session session = sessionFactory.openSession()) {
            Transaction transaction = null;
            transaction = session.beginTransaction();
            session.delete(city);
            transaction.commit();
        }
    }

    public Double getSumOfTimezones(){
        try (Session session = sessionFactory.openSession()) {
            Query<Double> query = session.createQuery("select sum(t.timezone) from City t", Double.class);
            return query.getSingleResult();
        }
    }

    public Double getAverageCarCode() {
        try (var session = sessionFactory.openSession()) {
            Query<Double> query = session.createQuery(
                    "select avg(c.carCode) from City c", Double.class);
            return query.uniqueResult();
        }
    }

    public List<City> getCitiesWithTimezoneLessThan(Integer timezone){
        try (Session session = sessionFactory.openSession()) {
            Query<City> query = session.createQuery("from City c where c.timezone > :timezone", City.class);
            query.setParameter("timezone", timezone);
            return query.list();
        }
    }

    public Double calculateDistanceToTheMostPopulatedCity(){
        try (Session session = sessionFactory.openSession()) {
            Query<Double> query = session.createNativeQuery("SELECT SQRT(POWER(c.coordinates_x, 2) + POWER(c.coordinates_y, 2)) " +
                    "FROM cities c WHERE c.population = (SELECT MAX(population) FROM cities)", Double.class);
            return query.getSingleResult();
        }
    }

    public Double calculateDistanceToNewestCity(){
        try (Session session = sessionFactory.openSession()) {
            Query<Double> query = session.createNativeQuery("SELECT SQRT(POWER(c.coordinates_x, 2) + POWER(c.coordinates_y, 2)) " +
                    "FROM cities c WHERE c.establishmentDate = (SELECT MAX(establishmentDate) FROM cities)", Double.class);
            return query.getSingleResult();
        }
    }


}
