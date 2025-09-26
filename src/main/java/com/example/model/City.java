package com.example.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;

@Entity
@Table(name="cities")
@Getter
@Setter
@AllArgsConstructor
public class City {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="name", nullable=false, length=100)
    private String name;

    @Column(name="coordinates", nullable=false)
    @Embedded
    private Coordinates coordinates;

    @CreationTimestamp
    @Column(name = "creationDate", updatable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate creationDate;

    @Column(name="area", nullable=false)
    @Min(value = 1, message = "Area must be greater than 0")
    private Double area;

    @Column(name="population", nullable=false)
    @Min(value = 1, message = "Population must be greater than 0")
    private Long population;

    @Column(name="establishmentDate", updatable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate establishmentDate;

    @Column(name="capital", nullable=false)
    private boolean capital;

    @Column(name="metersAboveSeaLevel")
    private Float metersAboveSeaLevel;

    @Column(name="timezone", nullable=false)
    @Min(value = -13, message = "Timezone must be greater than -13")
    @Max(value = 15, message = "Timezone must be less than 15")
    private Integer timezone;

    @Column(name="carCode", nullable=false)
    @Min(value = 1, message = "Car code must be greater than 0")
    @Max(value = 1000, message = "Car code must be less than 1000")
    private Integer carCode;

    @Column(name="government", nullable=false)
    private Government government;

    @Column(name="governor")
    @Embedded
    private Human governor;

    public City() {}


}
