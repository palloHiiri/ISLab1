CREATE TABLE cities (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL CHECK (name <> ''),
    x BIGINT NOT NULL CHECK (x <= 913),
    y BIGINT NOT NULL CHECK (y > -243),
    creation_date DATE NOT NULL,
    area DOUBLE PRECISION NOT NULL CHECK (area > 0),
    population BIGINT NOT NULL CHECK (population > 0),
    establishment_date DATE,
    capital BOOLEAN NOT NULL,
    meters_above_sea_level FLOAT,
    timezone INTEGER NOT NULL CHECK (timezone > -13 AND timezone <= 15),
    car_code INTEGER CHECK (car_code > 0 AND car_code <= 1000),
    government VARCHAR(50) NOT NULL,
    governor_name VARCHAR(100) NOT NULL CHECK (governor_name <> '')
);
