"""Database initialization and seed data for CURIFY AI Navigator."""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "curify.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('patient', 'lender')),
            name TEXT NOT NULL,
            city TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS hospitals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            city TEXT NOT NULL,
            state TEXT NOT NULL,
            phone TEXT,
            tier TEXT NOT NULL,
            accreditation TEXT,
            specialties TEXT,
            base_rate_surgery REAL,
            base_rate_doctor REAL,
            base_rate_room REAL,
            base_rate_diagnostics REAL,
            base_rate_medicines REAL,
            reputation_score REAL,
            lat REAL,
            lng REAL,
            beds INTEGER,
            icu_beds INTEGER,
            established_year INTEGER
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS patient_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            clerk_user_id TEXT UNIQUE NOT NULL,
            full_name TEXT NOT NULL,
            email TEXT,
            age INTEGER,
            date_of_birth TEXT,
            gender TEXT,
            blood_group TEXT,
            existing_conditions TEXT,
            allergies TEXT,
            city TEXT,
            area_pincode TEXT,
            emergency_name TEXT,
            emergency_phone TEXT,
            emergency_relation TEXT,
            role TEXT DEFAULT 'patient',
            lender_profile_completed INTEGER DEFAULT 0,
            min_loan REAL,
            max_loan REAL,
            min_rate REAL,
            max_rate REAL,
            approval_time TEXT,
            supported_loan_types TEXT,
            customer_type TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Ensure existing tables have the new columns (for local development)
    columns_to_add = [
        ("lender_profile_completed", "INTEGER DEFAULT 0"),
        ("min_loan", "REAL"),
        ("max_loan", "REAL"),
        ("min_rate", "REAL"),
        ("max_rate", "REAL"),
        ("approval_time", "TEXT"),
        ("supported_loan_types", "TEXT"),
        ("customer_type", "TEXT")
    ]
    for col_name, col_type in columns_to_add:
        try:
            c.execute(f"ALTER TABLE patient_profiles ADD COLUMN {col_name} {col_type}")
        except sqlite3.OperationalError:
            pass # Column already exists

    # Seed demo users
    demo_users = [
        ("patient@demo.com", "demo123", "patient", "Ravi Kumar", "Delhi"),
        ("lender@demo.com", "demo123", "lender", "Priya Finance", "Mumbai"),
        ("patient1@demo.com", "demo123", "patient", "Amit Sharma", "Bangalore"),
        ("patient2@demo.com", "demo123", "patient", "Sneha Patel", "Ahmedabad"),
        ("patient3@demo.com", "demo123", "patient", "Kiran Desai", "Pune"),
        ("patient4@demo.com", "demo123", "patient", "Rahul Singh", "Delhi"),
        ("patient5@demo.com", "demo123", "patient", "Neha Gupta", "Chennai"),
        ("lender1@demo.com", "demo123", "lender", "Apex Healthcare Capital", "Bangalore"),
        ("lender2@demo.com", "demo123", "lender", "MediFund Solutions", "Delhi"),
        ("lender3@demo.com", "demo123", "lender", "CareCredit India", "Pune"),
        ("lender4@demo.com", "demo123", "lender", "SecureHealth Finance", "Hyderabad"),
        ("lender5@demo.com", "demo123", "lender", "TrustMed Loans", "Chennai")
    ]
    try:
        c.executemany("INSERT INTO users (email, password, role, name, city) VALUES (?, ?, ?, ?, ?)", demo_users)
    except sqlite3.IntegrityError:
        pass

    # Seed hospitals — Target: 8 per city
    c.execute("SELECT COUNT(*) FROM hospitals")
    if c.fetchone()[0] == 0:
        hospitals_data = [
            # Chennai (8)
            ("Apollo Hospitals", "Chennai", "Tamil Nadu", "+91 44 2829 3333", "Metro", "NABH, JCI", "Cardiology,Orthopedics,Neurology,Oncology,Gastroenterology", 250000, 45000, 8000, 35000, 20000, 0.95, 13.0827, 80.2707, 700, 120, 1983),
            ("Sankara Nethralaya", "Chennai", "Tamil Nadu", "+91 44 4227 1500", "Metro", "NABH", "Ophthalmology,Retina,Glaucoma,Cornea,Neuro-ophthalmology", 100000, 20000, 3000, 18000, 10000, 0.92, 13.0569, 80.2425, 300, 30, 1978),
            ("SRM Medical College Hospital", "Chennai", "Tamil Nadu", "+91 44 4743 2345", "Tier2", "NABH", "General Surgery,Orthopedics,Cardiology,Neurology,Gastroenterology", 95000, 18000, 3000, 15000, 9000, 0.78, 12.8231, 80.0441, 700, 60, 2004),
            ("MIOT International", "Chennai", "Tamil Nadu", "+91 44 2249 2288", "Metro", "NABH", "Orthopedics,Cardiology,Nephrology,Thoracic Surgery", 210000, 40000, 7000, 30000, 18000, 0.89, 13.0234, 80.1844, 500, 90, 1999),
            ("Fortis Malar Hospital", "Chennai", "Tamil Nadu", "+91 44 4242 4242", "Metro", "NABH", "Cardiology,Neurology,Oncology,Urology", 190000, 38000, 6500, 28000, 16000, 0.88, 13.0033, 80.2544, 250, 40, 1992),
            ("Global Health City", "Chennai", "Tamil Nadu", "+91 44 4477 7000", "Metro", "NABH", "Transplant,Cardiology,Oncology", 220000, 42000, 7500, 32000, 18000, 0.86, 12.8944, 80.2144, 450, 80, 2008),
            ("MGM Healthcare", "Chennai", "Tamil Nadu", "+91 44 4524 2424", "Metro", "NABH, JCI", "Cardiology,Neurology,Robotics", 240000, 46000, 8500, 35000, 20000, 0.90, 13.0444, 80.2344, 400, 75, 2019),
            ("Kauvery Hospital", "Chennai", "Tamil Nadu", "+91 44 4000 6000", "Metro", "NABH", "Gastroenterology,Geriatrics,Orthopedics", 180000, 35000, 6000, 25000, 15000, 0.85, 13.0344, 80.2544, 200, 40, 1999),

            # Delhi (8)
            ("Max Super Speciality Hospital", "Delhi", "Delhi", "+91 11 2651 0050", "Metro", "NABH", "Cardiology,Neurology,Oncology,Orthopedics,Gastroenterology", 220000, 42000, 7500, 32000, 18000, 0.91, 28.5672, 77.2100, 500, 85, 2000),
            ("AIIMS", "Delhi", "Delhi", "+91 11 2658 8500", "Metro", "NAAC", "Cardiology,Neurology,Oncology,Orthopedics,General Surgery", 80000, 15000, 2000, 12000, 8000, 0.98, 28.5672, 77.2100, 2500, 400, 1956),
            ("BLK-Max Super Speciality Hospital", "Delhi", "Delhi", "+91 11 3040 3040", "Metro", "NABH", "Oncology,Transplant,Cardiology,Urology", 240000, 46000, 8200, 36000, 21000, 0.92, 28.6444, 77.1844, 650, 110, 1959),
            ("Sir Ganga Ram Hospital", "Delhi", "Delhi", "+91 11 2573 5205", "Metro", "NABH", "Gastroenterology,Nephrology,Urology", 180000, 35000, 6500, 28000, 15000, 0.89, 28.6344, 77.1944, 675, 100, 1954),
            ("Indraprastha Apollo", "Delhi", "Delhi", "+91 11 2692 5858", "Metro", "NABH, JCI", "Transplant,Cardiology,Oncology", 260000, 50000, 9000, 38000, 22000, 0.93, 28.5344, 77.2844, 710, 140, 1996),
            ("Holy Family Hospital", "Delhi", "Delhi", "+91 11 2684 5900", "Metro", "NABH", "General Surgery,Maternity,Pediatrics", 120000, 25000, 4000, 18000, 10000, 0.82, 28.5544, 77.2744, 345, 50, 1953),
            ("Moolchand Hospital", "Delhi", "Delhi", "+91 11 4200 0000", "Metro", "NABH", "Orthopedics,Infertility,Cardiology", 190000, 38000, 7000, 26000, 14000, 0.86, 28.5644, 77.2344, 300, 40, 1958),
            ("Primus Super Speciality", "Delhi", "Delhi", "+91 11 6620 6620", "Metro", "NABH", "Orthopedics,Neurology,Oncology", 210000, 40000, 7500, 30000, 16000, 0.84, 28.5844, 77.1844, 250, 35, 2007),

            # Gurgaon (8)
            ("Fortis Memorial Research Institute", "Gurgaon", "Haryana", "+91 124 4921 021", "Metro", "NABH, JCI", "Cardiology,Oncology,Neurology,Orthopedics,Urology", 280000, 50000, 9500, 40000, 22000, 0.93, 28.4595, 77.0266, 600, 100, 2012),
            ("Medanta – The Medicity", "Gurgaon", "Haryana", "+91 124 4141 414", "Metro", "NABH, JCI", "Cardiology,Oncology,Neurology,Liver Transplant,Robotics Surgery", 300000, 55000, 10000, 42000, 25000, 0.96, 28.4400, 77.0420, 1600, 300, 2009),
            ("Artemis Hospital", "Gurgaon", "Haryana", "+91 124 4511 111", "Metro", "NABH, JCI", "Cardiology,Oncology,Neurology,Orthopedics", 260000, 48000, 9000, 38000, 20000, 0.90, 28.4477, 77.0644, 400, 75, 2007),
            ("Paras Hospital", "Gurgaon", "Haryana", "+91 124 4585 555", "Metro", "NABH", "Neurology,Orthopedics,Gastroenterology", 210000, 40000, 7000, 30000, 15000, 0.85, 28.4344, 77.0844, 250, 50, 2006),
            ("Manipal Hospital Gurgaon", "Gurgaon", "Haryana", "+91 124 6165 666", "Metro", "NABH", "Oncology,Cardiology,Pediatrics", 230000, 44000, 8000, 32000, 18000, 0.88, 28.4244, 77.0444, 150, 30, 2010),
            ("CK Birla Hospital", "Gurgaon", "Haryana", "+91 124 4150 150", "Metro", "NABH", "Maternity,Orthopedics,Infertility", 200000, 38000, 8500, 25000, 14000, 0.84, 28.4444, 77.0744, 100, 20, 2018),
            ("Signature Hospital", "Gurgaon", "Haryana", "+91 124 4882 222", "Metro", "NABH", "General Surgery,Cardiology", 170000, 32000, 6000, 22000, 12000, 0.80, 28.4144, 77.0344, 120, 25, 2017),
            ("W Pratiksha Hospital", "Gurgaon", "Haryana", "+91 124 4131 091", "Metro", "NABH", "Maternity,Oncology", 195000, 37000, 7500, 28000, 16000, 0.82, 28.4344, 77.0944, 110, 20, 2015),

            # Bangalore (8)
            ("Narayana Health", "Bangalore", "Karnataka", "+91 80 7122 2222", "Metro", "NABH", "Cardiology,Oncology,Nephrology,Orthopedics,Neurology", 180000, 35000, 5500, 28000, 15000, 0.89, 12.9352, 77.6245, 800, 130, 2000),
            ("Manipal Hospitals", "Bangalore", "Karnataka", "+91 80 2502 4444", "Metro", "NABH, JCI", "Cardiology,Orthopedics,Neurology,Oncology,Transplant", 230000, 44000, 7800, 34000, 19000, 0.90, 12.9716, 77.5946, 650, 110, 1991),
            ("Aster CMI Hospital", "Bangalore", "Karnataka", "+91 80 4342 0100", "Metro", "NABH", "Neurology,Cardiology,Oncology,Gastroenterology", 240000, 46000, 8500, 36000, 21000, 0.91, 13.0644, 77.5944, 500, 80, 2014),
            ("Fortis Hospital, Bannerghatta", "Bangalore", "Karnataka", "+91 80 6621 4444", "Metro", "NABH, JCI", "Cardiology,Orthopedics,Neurology,Urology", 220000, 42000, 7500, 32000, 18000, 0.88, 12.8944, 77.6044, 300, 50, 2006),
            ("St. John's Medical College", "Bangalore", "Karnataka", "+91 80 2206 5000", "Metro", "NABH", "General Surgery,Neurology,Pediatrics", 110000, 20000, 3500, 15000, 9000, 0.94, 12.9344, 77.6144, 1350, 150, 1963),
            ("MS Ramaiah Memorial", "Bangalore", "Karnataka", "+91 80 2360 8888", "Metro", "NABH", "Neurology,Cardiology,Nephrology", 190000, 36000, 6500, 28000, 16000, 0.87, 13.0344, 77.5644, 500, 60, 1979),
            ("Sakra World Hospital", "Bangalore", "Karnataka", "+91 80 4969 4969", "Metro", "NABH", "Orthopedics,Neurology,Cardiac Sciences", 210000, 40000, 7500, 30000, 17000, 0.86, 12.9244, 77.6844, 300, 45, 2013),
            ("BGS Gleneagles Global", "Bangalore", "Karnataka", "+91 80 2625 5555", "Metro", "NABH", "Transplant,Laparoscopy,Gastroenterology", 225000, 43000, 8000, 33000, 19000, 0.85, 12.9044, 77.5144, 500, 70, 1998),

            # Mumbai (8)
            ("Kokilaben Dhirubhai Ambani Hospital", "Mumbai", "Maharashtra", "+91 22 3099 9999", "Metro", "NABH, JCI", "Cardiology,Oncology,Neurology,Orthopedics,Robotics", 320000, 58000, 12000, 45000, 28000, 0.92, 19.1290, 72.8276, 750, 120, 2009),
            ("Lilavati Hospital", "Mumbai", "Maharashtra", "+91 22 2675 1000", "Metro", "NABH", "Cardiology,Orthopedics,Neurology,General Surgery,Gastroenterology", 200000, 38000, 8500, 30000, 17000, 0.87, 19.0509, 72.8294, 400, 60, 1978),
            ("Tata Memorial Hospital", "Mumbai", "Maharashtra", "+91 22 2417 7000", "Metro", "NABH", "Oncology,Radiation Therapy,Surgical Oncology,Hematology", 150000, 30000, 4000, 25000, 14000, 0.97, 19.0048, 72.8435, 600, 80, 1941),
            ("Nanavati Max Super Speciality Hospital", "Mumbai", "Maharashtra", "+91 22 6836 0000", "Metro", "NABH", "Transplant,Oncology,Cardiology,Neurology", 260000, 50000, 9500, 38000, 22000, 0.89, 19.0944, 72.8444, 350, 65, 1950),
            ("H.N. Reliance Foundation Hospital", "Mumbai", "Maharashtra", "+91 22 6130 5000", "Metro", "NABH, JCI", "Cardiology,Oncology,Neurology,Robotics", 350000, 65000, 15000, 50000, 30000, 0.94, 18.9544, 72.8244, 345, 80, 2014),
            ("Jaslok Hospital", "Mumbai", "Maharashtra", "+91 22 6657 3333", "Metro", "NABH", "Nephrology,Urology,Cardiology", 240000, 46000, 9000, 35000, 19000, 0.91, 18.9744, 72.8044, 350, 50, 1973),
            ("Breach Candy Hospital", "Mumbai", "Maharashtra", "+91 22 2366 7788", "Metro", "NABH", "Maternity,Orthopedics,Cardiology", 280000, 52000, 11000, 40000, 24000, 0.93, 18.9744, 72.8044, 210, 40, 1950),
            ("SL Raheja Hospital", "Mumbai", "Maharashtra", "+91 22 6652 9999", "Metro", "NABH", "Diabetology,Oncology,Cardiology", 190000, 36000, 7500, 28000, 15000, 0.86, 19.0444, 72.8444, 170, 30, 1981),

            # Hyderabad (8)
            ("KIMS Hospital", "Hyderabad", "Telangana", "+91 40 4488 5000", "Metro", "NABH", "Cardiology,Orthopedics,Neurology,Gastroenterology,Oncology", 170000, 33000, 5000, 27000, 14500, 0.85, 17.4432, 78.3497, 500, 80, 2000),
            ("Yashoda Hospitals", "Hyderabad", "Telangana", "+91 40 4567 4567", "Metro", "NABH", "Cardiology,Neurology,Orthopedics,Gastroenterology,Urology", 160000, 31000, 4800, 26000, 14000, 0.84, 17.4156, 78.4347, 450, 70, 1989),
            ("Apollo Health City", "Hyderabad", "Telangana", "+91 40 2360 7777", "Metro", "NABH, JCI", "Cardiology,Oncology,Neurology,Orthopedics", 230000, 44000, 8000, 34000, 19000, 0.92, 17.4144, 78.4144, 600, 100, 1988),
            ("Continental Hospitals", "Hyderabad", "Telangana", "+91 40 6700 0000", "Metro", "NABH, JCI", "Cardiology,Gastroenterology,Oncology,Neurology", 250000, 48000, 9000, 38000, 21000, 0.90, 17.4244, 78.3444, 300, 55, 2013),
            ("Sunshine Hospitals", "Hyderabad", "Telangana", "+91 40 4455 0000", "Metro", "NABH", "Orthopedics,Joint Replacement,Trauma", 150000, 30000, 4500, 24000, 12000, 0.83, 17.4344, 78.4844, 350, 40, 2009),
            ("CARE Hospitals", "Hyderabad", "Telangana", "+91 40 6165 6565", "Metro", "NABH", "Cardiology,Nephrology,Urology", 185000, 35000, 6000, 28000, 15000, 0.88, 17.4144, 78.4444, 430, 60, 1997),
            ("Medicover Hospitals", "Hyderabad", "Telangana", "+91 40 6833 3333", "Metro", "NABH", "Neurology,Cardiology,Orthopedics", 195000, 37000, 7000, 30000, 16000, 0.86, 17.4544, 78.3844, 500, 80, 2011),
            ("Star Hospitals", "Hyderabad", "Telangana", "+91 40 4477 7777", "Metro", "NABH", "Cardiac Sciences,Neurology,Oncology", 210000, 40000, 7500, 32000, 18000, 0.87, 17.4244, 78.4544, 310, 50, 2008),

            # Pune (8)
            ("Ruby Hall Clinic", "Pune", "Maharashtra", "+91 20 6645 5100", "Tier2", "NABH", "Cardiology,Orthopedics,Neurology,General Surgery,Nephrology", 140000, 28000, 4500, 22000, 13000, 0.83, 18.5308, 73.8787, 550, 70, 1959),
            ("Jehangir Hospital", "Pune", "Maharashtra", "+91 20 6681 9999", "Tier2", "NABH", "Cardiology,Orthopedics,Neurology,Oncology", 130000, 26000, 4200, 21000, 12000, 0.82, 18.5244, 73.8744, 350, 50, 1946),
            ("Sahyadri Hospitals", "Pune", "Maharashtra", "+91 20 6721 5000", "Tier2", "NABH", "Neurology,Cardiology,Hematology,Transplant", 150000, 30000, 4800, 24000, 14000, 0.84, 18.5144, 73.8344, 450, 65, 2004),
            ("Inlaks & Budhrani", "Pune", "Maharashtra", "+91 20 6609 9999", "Tier2", "NABH", "Oncology,Cardiology,General Surgery", 110000, 22000, 3500, 18000, 10000, 0.79, 18.5344, 73.8844, 250, 30, 1989),
            ("Noble Hospital", "Pune", "Maharashtra", "+91 20 6628 5000", "Tier2", "NABH", "Orthopedics,Gastroenterology,Neurology", 125000, 25000, 4000, 20000, 11000, 0.81, 18.5044, 73.9144, 250, 40, 2007),
            ("Deenanath Mangeshkar Hospital", "Pune", "Maharashtra", "+91 20 4015 1000", "Tier2", "NABH", "Multi-speciality,Diagnostics,Transplant", 160000, 32000, 5000, 26000, 15000, 0.90, 18.5044, 73.8344, 800, 100, 2001),
            ("Jupiter Hospital", "Pune", "Maharashtra", "+91 20 2721 9000", "Tier2", "NABH", "Pediatrics,Cardiology,Orthopedics", 175000, 34000, 6000, 28000, 17000, 0.88, 18.5644, 73.7744, 350, 60, 2017),
            ("Sancheti Hospital", "Pune", "Maharashtra", "+91 20 2899 9999", "Tier2", "NABH", "Orthopedics,Spine Surgery,Sports Medicine", 145000, 30000, 4800, 25000, 14000, 0.92, 18.5344, 73.8544, 200, 30, 1965),

            # Ahmedabad (8)
            ("Sterling Hospital", "Ahmedabad", "Gujarat", "+91 79 4001 1111", "Tier2", "NABH", "Cardiology,Orthopedics,Neurology,General Surgery,Gastroenterology", 125000, 24000, 3800, 20000, 12000, 0.81, 23.0225, 72.5714, 350, 55, 2001),
            ("Zydus Hospital", "Ahmedabad", "Gujarat", "+91 79 6619 9999", "Tier2", "NABH", "Cardiology,Oncology,Neurology,Orthopedics", 160000, 32000, 5500, 26000, 15000, 0.85, 23.0444, 72.5144, 550, 80, 2015),
            ("Apollo Hospitals", "Ahmedabad", "Gujarat", "+91 79 6670 1800", "Tier2", "NABH, JCI", "Cardiology,Oncology,Orthopedics,Gastroenterology", 180000, 36000, 6000, 30000, 17000, 0.88, 23.1044, 72.6044, 300, 50, 2003),
            ("Shalby Hospital", "Ahmedabad", "Gujarat", "+91 79 4020 3000", "Tier2", "NABH", "Orthopedics,Joint Replacement,Cardiology", 140000, 28000, 4500, 22000, 13000, 0.83, 23.0344, 72.5144, 200, 40, 1994),
            ("KD Hospital", "Ahmedabad", "Gujarat", "+91 79 6673 3333", "Tier2", "NABH", "Transplant,Oncology,Neurology", 210000, 42000, 8000, 35000, 20000, 0.86, 23.0644, 72.5044, 300, 45, 2018),
            ("Marengo CIMS", "Ahmedabad", "Gujarat", "+91 79 2771 2771", "Tier2", "NABH, JCI", "Cardiology,Oncology,Transplant", 230000, 45000, 9000, 38000, 22000, 0.90, 23.0644, 72.5144, 350, 60, 2010),
            ("HCG Cancer Centre", "Ahmedabad", "Gujarat", "+91 79 4041 0101", "Tier2", "NABH", "Oncology,Radiation,Hematology", 190000, 38000, 7000, 32000, 18000, 0.84, 23.0244, 72.5544, 120, 20, 2012),
            ("SAL Hospital", "Ahmedabad", "Gujarat", "+91 79 6631 2000", "Tier2", "NABH", "Cardiology,Orthopedics,Neurology", 130000, 25000, 4200, 20000, 12000, 0.80, 23.0444, 72.5244, 300, 40, 2001),

            # Kochi (8)
            ("Amrita Hospital", "Kochi", "Kerala", "+91 484 285 1234", "Tier2", "NABH", "Cardiology,Neurology,Oncology,Orthopedics,Gastroenterology", 130000, 26000, 4000, 21000, 12500, 0.86, 10.0889, 76.3467, 1300, 200, 1998),
            ("Aster Medcity", "Kochi", "Kerala", "+91 484 669 9999", "Tier2", "NABH, JCI", "Cardiology,Neurology,Oncology,Transplant", 170000, 34000, 6500, 28000, 16000, 0.89, 10.0544, 76.2744, 670, 90, 2014),
            ("Rajagiri Hospital", "Kochi", "Kerala", "+91 484 290 5000", "Tier2", "NABH", "Cardiology,Oncology,Neurology,Gastroenterology", 140000, 28000, 4500, 23000, 13000, 0.84, 10.1144, 76.3544, 500, 70, 2014),
            ("VPS Lakeshore", "Kochi", "Kerala", "+91 484 270 1032", "Tier2", "NABH", "Gastroenterology,Orthopedics,Cardiology", 155000, 31000, 5000, 25000, 15000, 0.85, 9.9444, 76.3244, 350, 60, 2003),
            ("Medical Trust Hospital", "Kochi", "Kerala", "+91 484 235 8001", "Tier2", "NABH", "Neurology,Trauma,Cardiac Surgery", 120000, 24000, 3500, 18000, 11000, 0.82, 9.9644, 76.2844, 750, 100, 1973),
            ("Lisie Hospital", "Kochi", "Kerala", "+91 484 240 2044", "Tier2", "NABH", "Cardiology,Urology,Nephrology", 110000, 22000, 3000, 16000, 10000, 0.83, 9.9944, 76.2844, 1000, 120, 1957),
            ("Sunrise Hospital", "Kochi", "Kerala", "+91 484 266 0000", "Tier2", "NABH", "Laparoscopy,Obesity,Pediatrics", 125000, 25000, 4200, 20000, 12000, 0.80, 10.0244, 76.3244, 250, 35, 2005),
            ("Renai Medicity", "Kochi", "Kerala", "+91 484 280 1000", "Tier2", "NABH", "Multi-speciality,Diagnostics", 135000, 27000, 4800, 22000, 13000, 0.81, 10.0144, 76.3044, 500, 75, 2012),

            # Kolkata (8)
            ("AMRI Hospitals", "Kolkata", "West Bengal", "+91 33 6606 1000", "Metro", "NABH", "Cardiology,Orthopedics,Neurology,Oncology,Gastroenterology", 140000, 28000, 4500, 22000, 13000, 0.85, 22.5144, 88.3644, 400, 70, 1996),
            ("Apollo Multispeciality", "Kolkata", "West Bengal", "+91 33 2320 3040", "Metro", "NABH, JCI", "Cardiology,Oncology,Neurology,Transplant", 230000, 45000, 8500, 35000, 20000, 0.91, 22.5744, 88.4044, 700, 120, 2003),
            ("Fortis Hospital Anandapur", "Kolkata", "West Bengal", "+91 33 6628 4444", "Metro", "NABH", "Cardiology,Neurology,Orthopedics,Urology", 210000, 42000, 7500, 32000, 18000, 0.88, 22.5144, 88.4044, 400, 60, 2011),
            ("Medica Superspecialty", "Kolkata", "West Bengal", "+91 33 6652 0000", "Metro", "NABH", "Neurology,Cardiology,Orthopedics", 195000, 38000, 7000, 30000, 17000, 0.86, 22.4844, 88.3944, 500, 80, 2010),
            ("Peerless Hospital", "Kolkata", "West Bengal", "+91 33 4011 1222", "Metro", "NABH", "Orthopedics,Gastroenterology,Maternity", 130000, 25000, 4000, 20000, 12000, 0.82, 22.4844, 88.3944, 400, 50, 1993),
            ("Ruby General Hospital", "Kolkata", "West Bengal", "+91 33 6687 1800", "Metro", "NABH", "General Surgery,Cardiology,Oncology", 115000, 22000, 3500, 18000, 10000, 0.80, 22.5144, 88.3944, 280, 40, 1995),
            ("Woodlands Hospital", "Kolkata", "West Bengal", "+91 33 2456 7075", "Metro", "NABH", "Maternity,Orthopedics,Diagnostics", 180000, 35000, 6500, 28000, 16000, 0.89, 22.5344, 88.3344, 250, 35, 1946),
            ("CMRI", "Kolkata", "West Bengal", "+91 33 3090 3090", "Metro", "NABH", "Orthopedics,Neurology,Cardiology", 200000, 38000, 7500, 30000, 18000, 0.87, 22.5344, 88.3244, 440, 60, 1969),

            # Madurai (8)
            ("Meenakshi Mission Hospital", "Madurai", "Tamil Nadu", "+91 452 258 8741", "Tier2", "NABH", "Cardiology,Orthopedics,Neurology,General Surgery,Oncology", 110000, 22000, 3200, 18000, 11000, 0.80, 9.9252, 78.1198, 600, 80, 1992),
            ("Apollo Speciality Hospital", "Madurai", "Tamil Nadu", "+91 452 258 0892", "Tier2", "NABH", "Cardiology,Neurology,Oncology,Orthopedics", 130000, 26000, 4000, 22000, 12000, 0.83, 9.9144, 78.1444, 250, 40, 1997),
            ("Vadamalayan Hospitals", "Madurai", "Tamil Nadu", "+91 452 254 3000", "Tier2", "NABH", "Multi-speciality,Diagnostics", 95000, 18000, 2800, 15000, 9000, 0.78, 9.9244, 78.1244, 300, 40, 1957),
            ("Velammal Medical College", "Madurai", "Tamil Nadu", "+91 452 711 3333", "Tier2", "NABH", "General Surgery,Cardiology,Neurology", 100000, 19000, 3000, 16000, 9500, 0.75, 9.8944, 78.1544, 1000, 150, 2011),
            ("Hanna Joseph Hospital", "Madurai", "Tamil Nadu", "+91 452 258 4585", "Tier2", "NABH", "Neurology,Orthopedics", 120000, 24000, 3800, 20000, 11000, 0.77, 9.9344, 78.1344, 150, 25, 2008),
            ("Devadoss Hospital", "Madurai", "Tamil Nadu", "+91 452 252 3252", "Tier2", "NABH", "Orthopedics,Trauma,Cardiology", 105000, 20000, 3200, 17000, 10000, 0.76, 9.9444, 78.1444, 180, 25, 2006),
            ("Aravind Eye Hospital", "Madurai", "Tamil Nadu", "+91 452 435 6500", "Tier2", "NABH", "Ophthalmology", 60000, 12000, 2000, 8000, 5000, 0.95, 9.9244, 78.1344, 500, 20, 1976),
            ("Bose Hospital", "Madurai", "Tamil Nadu", "+91 452 253 2531", "Tier2", "NABH", "General Medicine,Pediatrics", 85000, 16000, 2500, 12000, 8000, 0.72, 9.9144, 78.1244, 100, 15, 1980),

            # Patna (8)
            ("Paras Hospital", "Patna", "Bihar", "+91 612 710 7700", "Tier3", "NABH", "Cardiology,Orthopedics,Neurology,General Surgery,Nephrology", 80000, 15000, 2500, 12000, 8000, 0.72, 25.6093, 85.1376, 300, 40, 2007),
            ("Ruban Memorial Hospital", "Patna", "Bihar", "+91 612 231 0000", "Tier3", "NABH", "Cardiology,Neurology,Orthopedics,Urology", 75000, 14000, 2200, 11000, 7500, 0.70, 25.6144, 85.1044, 200, 30, 1996),
            ("Ford Hospital", "Patna", "Bihar", "+91 612 235 0000", "Tier3", "NABH", "Neurology,Cardiology,Orthopedics", 90000, 17000, 2800, 14000, 9000, 0.74, 25.5944, 85.1544, 150, 25, 2010),
            ("Kurji Holy Family", "Patna", "Bihar", "+91 612 226 2156", "Tier3", "NABH", "Maternity,General Surgery,Pediatrics", 70000, 13000, 2000, 10000, 7000, 0.76, 25.6344, 85.1044, 300, 30, 1958),
            ("Mediversal Hospital", "Patna", "Bihar", "+91 612 350 0000", "Tier3", "NABH", "Cardiology,Oncology,Transplant", 110000, 22000, 4000, 18000, 12000, 0.78, 25.6244, 85.1644, 250, 40, 2020),
            ("Heart Hospital", "Patna", "Bihar", "+91 612 221 0000", "Tier3", "NABH", "Cardiac Sciences,Diagnostics", 95000, 18000, 3000, 15000, 9500, 0.73, 25.6044, 85.1344, 100, 20, 2000),
            ("Hi-Tech Hospital", "Patna", "Bihar", "+91 612 254 0000", "Tier3", "NABH", "General Surgery,Orthopedics", 65000, 12000, 1800, 9000, 6000, 0.68, 25.5844, 85.1444, 120, 15, 2005),
            ("Jeevak Heart Hospital", "Patna", "Bihar", "+91 612 236 0000", "Tier3", "NABH", "Cardiology,Urology", 85000, 16000, 2500, 13000, 8500, 0.71, 25.5944, 85.1244, 80, 15, 1990),

            # Vellore (8)
            ("CMC Vellore", "Vellore", "Tamil Nadu", "+91 416 228 2000", "Tier2", "NABH, NAAC", "Cardiology,Neurology,Oncology,Orthopedics,General Surgery", 120000, 25000, 3500, 20000, 12000, 0.94, 12.9165, 79.1325, 2700, 250, 1900),
            ("Apollo KH Hospital", "Vellore", "Tamil Nadu", "+91 4172 232 244", "Tier2", "NABH", "General Surgery,Cardiology,Orthopedics,Diagnostics", 100000, 20000, 3000, 18000, 10000, 0.81, 12.9244, 79.1244, 200, 30, 2003),
            ("Naruvi Hospitals", "Vellore", "Tamil Nadu", "+91 416 666 0000", "Tier2", "NABH, JCI", "Cardiology,Oncology,Neurology", 140000, 28000, 4500, 22000, 13000, 0.88, 12.9444, 79.1444, 500, 75, 2020),
            ("Sri Narayani Hospital", "Vellore", "Tamil Nadu", "+91 416 220 6300", "Tier2", "NABH", "Neurology,Orthopedics,Transplant", 115000, 22000, 3200, 19000, 11000, 0.84, 12.8744, 79.1244, 400, 60, 2004),
            ("Scudder Memorial", "Vellore", "Tamil Nadu", "+91 4172 222 102", "Tier2", "NABH", "General Surgery,Maternity", 85000, 16000, 2500, 12000, 8000, 0.76, 12.8944, 79.3244, 200, 25, 1866),
            ("Christian Fellowship Hospital", "Vellore", "Tamil Nadu", "+91 416 226 2261", "Tier2", "NABH", "Pediatrics,General Medicine", 75000, 14000, 2000, 10000, 7000, 0.78, 12.8544, 79.2344, 150, 20, 1954),
            ("Government Vellore Medical College", "Vellore", "Tamil Nadu", "+91 416 223 2101", "Tier2", "NABH", "General Surgery,Trauma", 50000, 10000, 1500, 8000, 5000, 0.80, 12.8444, 79.1544, 800, 100, 2005),
            ("Annamalai Hospital", "Vellore", "Tamil Nadu", "+91 416 222 2222", "Tier2", "NABH", "Orthopedics,Maternity", 90000, 18000, 2800, 15000, 9000, 0.75, 12.9144, 79.1344, 100, 15, 1995),
        ]

        for h in hospitals_data:
            c.execute("""
                INSERT INTO hospitals (name, city, state, phone, tier, accreditation, specialties,
                    base_rate_surgery, base_rate_doctor, base_rate_room, base_rate_diagnostics,
                    base_rate_medicines, reputation_score, lat, lng, beds, icu_beds, established_year)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, h)

    conn.commit()
    conn.close()
