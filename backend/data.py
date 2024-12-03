from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def connect_to_mongodb():
    # Get connection details from environment variables
    DB_USER = os.getenv('DB_USER')
    DB_PASS = os.getenv('DB_PASS')
    CLUSTER_NAME = os.getenv('MONGODB_CLUSTER_NAME')
    DB_NAME = os.getenv('MONGODB_DB_NAME')
    
    # Basic connection URI
    uri = f"mongodb+srv://{DB_USER}:{DB_PASS}@cluster0.f26vm.mongodb.net/?retryWrites=true&w=majority"
    
    try:
        # Create client
        client = MongoClient(uri)
        
        # Test the connection
        client.admin.command('ping')
        print("Successfully connected to MongoDB")
        
        # Get database
        db = client[DB_NAME]
        return db
    
    except Exception as e:
        print(f"Connection error: {e}")
        return None

def insert_sample_data():
    db = connect_to_mongodb()
    if not db:
        print("Failed to connect to database")
        return
    
    # Sample doctors data
    doctors = [
        {
            "id": "1",
            "name": "Dr. Sarah Wilson",
            "email": "sarah.wilson@example.com",
            "img": "https://i.ibb.co/Sn7zB4q/doctor-1.png",
            "designation": "Senior Consultant",
            "department": "Medicine & Heart Diseases",
            "hospital": "Mount Adora Hospital",
            "category": "Medicine Specialist",
            "education": "MBBS, FCPS (Medicine), FACP (USA), FRCP (UK), Ph.D. (Cardiology)",
            "availability": ["Sun", "Mon", "Wed"]
        },
        {
            "id": "2",
            "name": "Dr. Michael Chen",
            "email": "michael.chen@example.com",
            "img": "https://i.ibb.co/wYZj4Sw/doctor-2.png",
            "designation": "Associate Professor",
            "department": "Neurology",
            "hospital": "Central Medical Center",
            "category": "Neurologist",
            "education": "MBBS, MD (Neurology), Fellowship in Neuroscience (USA)",
            "availability": ["Mon", "Tue", "Thu"]
        }
    ]
    
    # Sample appointments data
    appointments = [
        {
            "apId": "1",
            "date": "15-3-2024",
            "time": "9:00 AM - 11:00 AM",
            "status": "Pending",
            "meetLink": "https://meet.google.com/abc-defg-hij",
            "patientInfo": {
                "name": "John Smith",
                "phone": "123-456-7890",
                "email": "john.smith@example.com",
                "gender": "Male",
                "age": 35,
                "weight": 75,
                "problem": "Recurring headaches and dizziness"
            }
        },
        {
            "apId": "2",
            "date": "16-3-2024",
            "time": "9:00 AM - 11:00 AM",
            "status": "Confirmed",
            "meetLink": "https://meet.google.com/xyz-mnop-qrs",
            "patientInfo": {
                "name": "Alice Johnson",
                "phone": "234-567-8901",
                "email": "alice.j@example.com",
                "gender": "Female",
                "age": 28,
                "weight": 62,
                "problem": "Lower back pain"
            }
        },
        {
            "apId": "3",
            "date": "15-3-2024",
            "time": "2:00 PM - 4:00 PM",
            "status": "Completed",
            "meetLink": "https://meet.google.com/lmn-opqr-stu",
            "patientInfo": {
                "name": "Robert Wilson",
                "phone": "345-678-9012",
                "email": "robert.w@example.com",
                "gender": "Male",
                "age": 45,
                "weight": 80,
                "problem": "Annual checkup"
            }
        }
    ]
    
    # Sample reviews data
    reviews = [
        {
            "name": "John Smith",
            "quote": "Excellent service and very professional doctors. Highly recommended!",
            "from": "New York",
            "img": "https://i.ibb.co/zPqRPGx/people-1.png"
        },
        {
            "name": "Emma Wilson",
            "quote": "Very satisfied with the consultation. The doctor was very thorough.",
            "from": "Chicago",
            "img": "https://i.ibb.co/zPqRPGx/people-2.png"
        },
        {
            "name": "Michael Brown",
            "quote": "Great experience! The staff was very helpful and friendly.",
            "from": "Los Angeles",
            "img": "https://i.ibb.co/zPqRPGx/people-3.png"
        }
    ]
    
    try:
        # Insert doctors
        result_doctors = db.doctors.insert_many(doctors)
        print(f"Inserted {len(result_doctors.inserted_ids)} doctors")
        
        # Insert appointments
        result_appointments = db.appointments.insert_many(appointments)
        print(f"Inserted {len(result_appointments.inserted_ids)} appointments")
        
        # Insert reviews
        result_reviews = db.reviews.insert_many(reviews)
        print(f"Inserted {len(result_reviews.inserted_ids)} reviews")
        
    except Exception as e:
        print(f"An error occurred while inserting data: {e}")

if __name__ == "__main__":
    insert_sample_data()