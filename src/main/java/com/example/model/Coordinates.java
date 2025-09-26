package com.example.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@AllArgsConstructor
public class Coordinates {

    @Column(name="x", nullable=false)
    @NotNull(message = "X coordinate cannot be null")
    @Max(value = 913, message = "X coordinate must be less than or equal to 913")
    private Long x;

    @Column(name="y", nullable=false)
    @NotNull(message = "Y coordinate cannot be null")
    @Min(value = -243, message = "Y coordinate must be greater than -243")
    private Long y;

    public Coordinates() {

    }
}
