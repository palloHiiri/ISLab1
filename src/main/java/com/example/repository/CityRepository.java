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

    public Double getSumOfTimezones() {
        try (Session session = sessionFactory.openSession()) {
            Query<Long> sumQuery = session.createQuery("select sum(cast(c.timezone as long)) from City c where c.timezone is not null", Long.class);
            Long result = sumQuery.uniqueResult();
            System.out.println("Sum query result: " + result);

            return result != null ? result.doubleValue() : 0.0;

        } catch (Exception e) {
            System.err.println("Error in getSumOfTimezones: " + e.getMessage());
            return 0.0;
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

    public Double calculateDistanceToTheMostPopulatedCity() {
        try (Session session = sessionFactory.openSession()) {

            Query<Long> maxPopQuery = session.createQuery(
                    "select max(c.population) from City c where c.population is not null",
                    Long.class
            );
            Long maxPopulation = maxPopQuery.uniqueResult();
            System.out.println("Max population: " + maxPopulation);

            if (maxPopulation == null) {
                return 0.0;
            }

            Query<Object[]> query = session.createQuery(
                    "select c.coordinates.x, c.coordinates.y, c.name, c.population from City c " +
                            "where c.population = :maxPopulation and c.coordinates is not null order by c.id",
                    Object[].class
            );
            query.setParameter("maxPopulation", maxPopulation);
            query.setMaxResults(1);
            List<Object[]> results = query.list();

            if (results.isEmpty()) {
                return 0.0;
            }

            Object[] result = results.get(0);
            if (result[0] == null || result[1] == null) {
                return 0.0;
            }

            Double x = ((Number) result[0]).doubleValue();
            Double y = ((Number) result[1]).doubleValue();

            return Math.sqrt(x * x + y * y);

        } catch (Exception e) {
            System.err.println("Error in calculateDistanceToTheMostPopulatedCity: " + e.getMessage());
            return 0.0;
        }
    }

    public Double calculateDistanceToNewestCity() {
        try (Session session = sessionFactory.openSession()) {
            Query<Long> countQuery = session.createQuery("select count(c) from City c", Long.class);
            Long count = countQuery.uniqueResult();

            if (count == null || count == 0) {
                System.out.println("No cities found in the database.");
                return 0.0;
            }

            Query<java.time.LocalDate> maxDateQuery = session.createQuery(
                    "select max(c.establishmentDate) from City c where c.establishmentDate is not null ",
                    java.time.LocalDate.class
            );
            java.time.LocalDate maxDate = maxDateQuery.uniqueResult();
            System.out.println("Max establishment date: " + maxDate);

            Query<Object[]> query = session.createQuery(
                    "select c.coordinates.x, c.coordinates.y, c.name from City c " +
                            "where c.establishmentDate = :maxDate and c.coordinates is not null order by c.id",
                    Object[].class
            );
            query.setParameter("maxDate", maxDate);
            query.setMaxResults(1);

            List<Object[]> results = query.list();

            if (results.isEmpty()) {
                return 0.0;
            }

            Object[] result = results.get(0);

            Double x = ((Number) result[0]).doubleValue();
            Double y = ((Number) result[1]).doubleValue();
            String cityName = (String) result[2];

            Double distance = Math.sqrt(x * x + y * y);
            System.out.println("Newest city: " + cityName + " at (" + x + ", " + y + "), distance: " + distance);

            return distance;

        } catch (Exception e) {
            System.err.println("Error in calculateDistanceToNewestCity: " + e.getMessage());
            return 0.0;
        }
    }



}
