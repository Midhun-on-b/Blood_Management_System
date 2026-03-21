CREATE DATABASE IF NOT EXISTS blood_management;
USE blood_management;

-- ==============================
-- 1. USERS
-- ==============================
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'hospital', 'donor') NOT NULL,
    phone_no VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive') DEFAULT 'active'
);

-- ==============================
-- 2. BLOOD BANK
-- ==============================
CREATE TABLE IF NOT EXISTS blood_bank (
    bank_id INT(11) NOT NULL AUTO_INCREMENT,
    bank_name VARCHAR(100),
    city VARCHAR(100),
    contact_no VARCHAR(15),
    PRIMARY KEY (bank_id)
);

-- ==============================
-- 3. HOSPITAL
-- ==============================
CREATE TABLE IF NOT EXISTS hospital (
    hospital_id INT(11) NOT NULL AUTO_INCREMENT,
    hospital_name VARCHAR(100),
    city VARCHAR(100),
    contact_no VARCHAR(15),
    PRIMARY KEY (hospital_id)
);

-- ==============================
-- 4. DONOR
-- ==============================
CREATE TABLE IF NOT EXISTS donor (
    donor_id INT(11) NOT NULL AUTO_INCREMENT,
    name VARCHAR(100),
    age INT(11),
    gender VARCHAR(10),
    phone_no VARCHAR(15),
    blood_group VARCHAR(5),
    last_donation_date DATE,
    city VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    PRIMARY KEY (donor_id)
);

-- ==============================
-- 5. HEALTH CHECK
-- ==============================
CREATE TABLE IF NOT EXISTS health_check (
    check_id INT(11) NOT NULL AUTO_INCREMENT,
    donor_id INT(11),
    check_date DATE,
    weight FLOAT,
    blood_pressure VARCHAR(20),
    hemoglobin FLOAT,
    eligibility_status VARCHAR(20),
    PRIMARY KEY (check_id),
    FOREIGN KEY (donor_id) REFERENCES donor(donor_id)
);

-- ==============================
-- 6. DONATION RECORD
-- ==============================
CREATE TABLE IF NOT EXISTS donation_record (
    donation_id INT(11) NOT NULL AUTO_INCREMENT,
    donor_id INT(11),
    check_id INT(11),
    bank_id INT(11),
    donation_date DATE,
    quantity INT(11),
    PRIMARY KEY (donation_id),
    FOREIGN KEY (donor_id) REFERENCES donor(donor_id),
    FOREIGN KEY (check_id) REFERENCES health_check(check_id),
    FOREIGN KEY (bank_id) REFERENCES blood_bank(bank_id)
);

-- ==============================
-- 7. BLOOD STOCK
-- ==============================
CREATE TABLE IF NOT EXISTS blood_stock (
    stock_id INT(11) NOT NULL AUTO_INCREMENT,
    bank_id INT(11),
    blood_group VARCHAR(5),
    available_units INT(11),
    last_updated DATE,
    PRIMARY KEY (stock_id),
    FOREIGN KEY (bank_id) REFERENCES blood_bank(bank_id)
);

-- ==============================
-- 8. PATIENT
-- ==============================
CREATE TABLE IF NOT EXISTS patient (
    patient_id INT(11) NOT NULL AUTO_INCREMENT,
    hospital_id INT(11),
    name VARCHAR(100),
    age INT(11),
    gender VARCHAR(10),
    blood_group VARCHAR(5),
    PRIMARY KEY (patient_id),
    FOREIGN KEY (hospital_id) REFERENCES hospital(hospital_id)
);

-- ==============================
-- 9. BLOOD REQUEST
-- ==============================
CREATE TABLE IF NOT EXISTS blood_request (
    request_id INT(11) NOT NULL AUTO_INCREMENT,
    hospital_id INT(11),
    patient_id INT(11),
    bank_id INT(11),
    request_date DATE,
    units_required INT(11),
    status VARCHAR(20),
    PRIMARY KEY (request_id),
    FOREIGN KEY (hospital_id) REFERENCES hospital(hospital_id),
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id),
    FOREIGN KEY (bank_id) REFERENCES blood_bank(bank_id)
);

-- ==============================
-- 10. BLOOD ISSUE
-- ==============================
CREATE TABLE IF NOT EXISTS blood_issue (
    issue_id INT(11) NOT NULL AUTO_INCREMENT,
    request_id INT(11),
    issue_date DATE,
    units_issued INT(11),
    PRIMARY KEY (issue_id),
    FOREIGN KEY (request_id) REFERENCES blood_request(request_id)
);

-- ==============================
-- 11. PAYMENT
-- ==============================
CREATE TABLE IF NOT EXISTS payment (
    payment_id INT(11) NOT NULL AUTO_INCREMENT,
    request_id INT(11),
    hospital_id INT(11),
    bank_id INT(11),
    payment_date DATE,
    amount DECIMAL(10,2),
    payment_status VARCHAR(20),
    PRIMARY KEY (payment_id),
    FOREIGN KEY (request_id) REFERENCES blood_request(request_id),
    FOREIGN KEY (hospital_id) REFERENCES hospital(hospital_id),
    FOREIGN KEY (bank_id) REFERENCES blood_bank(bank_id)
);

-- ==============================
-- INSERT SAMPLE DATA
-- ==============================

-- BLOOD BANK
INSERT INTO blood_bank (bank_id, bank_name, city, contact_no)
VALUES (1, 'Kerala Central Blood Bank', 'Trivandrum', '9876543210');

INSERT INTO blood_bank (bank_name, city, contact_no) VALUES
('Kochi Blood Bank', 'Kochi', '9123456780'),
('Calicut Blood Bank', 'Calicut', '9012345678');

-- BLOOD STOCK
INSERT INTO blood_stock
(bank_id, blood_group, available_units, last_updated)
VALUES
(1, 'O+', 50, '2026-03-02');

INSERT INTO blood_stock
(bank_id, blood_group, available_units, last_updated)
VALUES
(1, 'A+', 30, '2026-03-02'),
(1, 'B+', 20, '2026-03-02'),
(2, 'O+', 25, '2026-03-02'),
(3, 'AB+', 15, '2026-03-02');

-- DONOR
INSERT INTO donor
(name, age, gender, phone_no, blood_group, last_donation_date, city, status)
VALUES
('Arun Kumar', 27, 'Male', '8888888888', 'O+', '2025-01-09', 'Kochi', 'inactive');

INSERT INTO donor
(name, age, gender, phone_no, blood_group, last_donation_date, city, status)
VALUES
('Neha Nair', 24, 'Female', '7777777777', 'A+', '2025-02-15', 'Trivandrum', 'active'),
('Rahul Das', 30, 'Male', '6666666666', 'B+', '2025-01-20', 'Kochi', 'active'),
('Sneha Pillai', 28, 'Female', '5555555555', 'AB+', '2024-12-10', 'Calicut', 'inactive');

-- HEALTH CHECK
INSERT INTO health_check
(donor_id, check_date, weight, blood_pressure, hemoglobin, eligibility_status)
VALUES
(1, '2025-03-01', 70, '120/80', 14.5, 'Eligible');

INSERT INTO health_check
(donor_id, check_date, weight, blood_pressure, hemoglobin, eligibility_status)
VALUES
(2, '2025-03-05', 55, '110/70', 13.2, 'Eligible'),
(3, '2025-03-06', 72, '120/80', 14.0, 'Eligible'),
(4, '2025-03-07', 60, '115/75', 11.5, 'Not Eligible');

-- MORE HEALTH CHECKS (same donors, different dates)
INSERT INTO health_check
(donor_id, check_date, weight, blood_pressure, hemoglobin, eligibility_status)
VALUES
(1, '2025-02-01', 68, '118/78', 13.8, 'Eligible'),
(2, '2025-02-10', 56, '110/70', 13.0, 'Eligible'),
(3, '2025-02-15', 71, '122/82', 14.2, 'Eligible'),
(4, '2025-02-20', 60, '115/75', 11.8, 'Not Eligible');

-- DONATION RECORD
INSERT INTO donation_record
(donor_id, check_id, bank_id, donation_date, quantity)
VALUES
(1, 1, 1, '2024-06-10', 450);

INSERT INTO donation_record
(donor_id, check_id, bank_id, donation_date, quantity)
VALUES
(2, 2, 1, '2025-03-05', 450),
(3, 3, 2, '2025-03-06', 450);

-- MORE DONATION RECORDS
INSERT INTO donation_record
(donor_id, check_id, bank_id, donation_date, quantity)
VALUES
(1, 5, 1, '2025-02-01', 450),
(2, 6, 1, '2025-02-10', 450),
(3, 7, 2, '2025-02-15', 450);

-- HOSPITAL
INSERT INTO hospital
(hospital_name, city, contact_no)
VALUES
('KIMS Hospital', 'Trivandrum', '9998887776');

INSERT INTO hospital
(hospital_name, city, contact_no)
VALUES
('City Care Hospital', 'Kochi', '9998887775'),
('Aster MIMS', 'Calicut', '9988776655');

-- PATIENT
INSERT INTO patient
(hospital_id, name, age, gender, blood_group)
VALUES
(1, 'Ravi Kumar', 45, 'Male', 'O+'),
(2, 'Anjali Menon', 30, 'Female', 'A+'),
(3, 'Suresh Babu', 50, 'Male', 'B+');

-- MORE PATIENTS (same hospitals)
INSERT INTO patient
(hospital_id, name, age, gender, blood_group)
VALUES
(1, 'Manoj Nair', 38, 'Male', 'O+'),
(2, 'Divya S', 26, 'Female', 'A+'),
(3, 'Ramesh Kumar', 60, 'Male', 'B+');

-- BLOOD REQUEST
INSERT INTO blood_request
(hospital_id, patient_id, bank_id, request_date, units_required, status)
VALUES
(1, 1, 1, '2026-03-10', 2, 'approved'),
(2, 2, 2, '2026-03-11', 1, 'pending'),
(3, 3, 3, '2026-03-12', 3, 'approved');

-- MORE BLOOD REQUESTS (real scenarios)
INSERT INTO blood_request
(hospital_id, patient_id, bank_id, request_date, units_required, status)
VALUES
(1, 4, 1, '2026-03-13', 1, 'approved'),
(2, 5, 2, '2026-03-14', 2, 'approved'),
(3, 6, 3, '2026-03-15', 1, 'pending'),
(1, 1, 1, '2026-03-16', 3, 'approved');

-- BLOOD ISSUE
INSERT INTO blood_issue
(request_id, issue_date, units_issued)
VALUES
(1, '2026-03-10', 2),
(3, '2026-03-12', 3);

-- MORE BLOOD ISSUES
INSERT INTO blood_issue
(request_id, issue_date, units_issued)
VALUES
(4, '2026-03-13', 1),
(5, '2026-03-14', 2),
(7, '2026-03-16', 3);

-- PAYMENT
INSERT INTO payment
(request_id, hospital_id, bank_id, payment_date, amount, payment_status)
VALUES
(1, 1, 1, '2026-03-10', 1000.00, 'paid'),
(2, 2, 2, '2026-03-11', 500.00, 'pending'),
(3, 3, 3, '2026-03-12', 1500.00, 'paid');

-- MORE PAYMENTS
INSERT INTO payment
(request_id, hospital_id, bank_id, payment_date, amount, payment_status)
VALUES
(4, 1, 1, '2026-03-13', 500.00, 'paid'),
(5, 2, 2, '2026-03-14', 1000.00, 'paid'),
(6, 3, 3, '2026-03-15', 500.00, 'pending'),
(7, 1, 1, '2026-03-16', 1500.00, 'paid');

-- UPDATE STOCK (simulate real usage)
INSERT INTO blood_stock
(bank_id, blood_group, available_units, last_updated)
VALUES
(1, 'O+', 45, '2026-03-05'),
(2, 'A+', 28, '2026-03-05'),
(3, 'B+', 18, '2026-03-05');
