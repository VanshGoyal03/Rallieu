USE defaultdb;

CREATE TABLE sports2025 (
    emailid VARCHAR(50) PRIMARY KEY,
    pwd VARCHAR(30),
    usertype VARCHAR(20),
    status INT,
    dos DATE
); /* dos-Date of Submission */

SELECT * FROM sports2025;

INSERT INTO sports2025
VALUES ('admin123@gmail.com', 'Admin123', 'Admin', 1, CURRENT_DATE());

CREATE TABLE org2025 (
    emailid VARCHAR(50) PRIMARY KEY,
    orgname VARCHAR(30),
    regnum VARCHAR(40),
    add1 VARCHAR(40),
    add2 VARCHAR(40),
    city VARCHAR(25),
    state VARCHAR(12),
    zip VARCHAR(8),
    sports VARCHAR(100),
    website VARCHAR(50),
    iandf VARCHAR(30),
    orghead VARCHAR(20),
    orghno VARCHAR(15),
    picurl VARCHAR(500),
    about VARCHAR(5000)
);

SELECT * FROM org2025;

CREATE TABLE orgevents (
    rid INT PRIMARY KEY AUTO_INCREMENT,
    emailid VARCHAR(50),
    events VARCHAR(198),
    doe DATE,
    toe TIME,
    address VARCHAR(100),
    city VARCHAR(25),
    sports VARCHAR(30),
    minage INT,
    maxage INT,
    lastdate DATE,
    fee INT,
    price INT,
    person VARCHAR(30),
    contact VARCHAR(13),
    guest VARCHAR(30)
);

SELECT * FROM orgevents;

CREATE TABLE playerprofile (
    emailid VARCHAR(50) PRIMARY KEY,
    picurl1 VARCHAR(500),
    picurl2 VARCHAR(500),
    address VARCHAR(100),
    city VARCHAR(25),
    state VARCHAR(12),
    zip VARCHAR(8),
    sports VARCHAR(30),
    number VARCHAR(14),
    about VARCHAR(300)
);

SELECT * FROM playerprofile;

ALTER TABLE playerprofile
ADD COLUMN aadhar_name VARCHAR(150) NULL,
ADD COLUMN aadhar_dob DATE NULL,
ADD COLUMN aadhar_gender VARCHAR(20) NULL,
ADD COLUMN aadhar_no VARCHAR(20) NULL;
