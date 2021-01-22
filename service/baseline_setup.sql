CREATE DATABASE sd_arduino;

CREATE TABLE DATA_COLLECTION(
DTA_ID INT(11) PRIMARY KEY AUTO_INCREMENT,
DTA_TIMESTAMP DATETIME,
DTA_MOISTURE VARCHAR(200),
DTA_TEMPERATURE VARCHAR(200),
DTA_LUMINOSITY VARCHAR(200)
)ENGINE=INNODB;