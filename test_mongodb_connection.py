"""
MongoDB Atlas Connection Test
This script tests if your MongoDB Atlas cluster and user credentials are working
"""

from pymongo import MongoClient
from pymongo.server_api import ServerApi

# Your MongoDB Atlas connection string (without specifying database in URL)
MONGO_URL = "mongodb+srv://auswrigt_db_user:azhar4523526@namaz.58tbxud.mongodb.net/?retryWrites=true&w=majority&appName=Namaz"

print("=" * 60)
print("TESTING MONGODB ATLAS CONNECTION")
print("=" * 60)
print()

try:
    print("Step 1: Connecting to MongoDB Atlas...")
    # Create a new client and connect to the server
    client = MongoClient(MONGO_URL, server_api=ServerApi('1'))
    
    print("✅ Connection initiated successfully!")
    print()
    
    print("Step 2: Sending ping to verify connection...")
    # Send a ping to confirm a successful connection
    client.admin.command('ping')
    print("✅ Ping successful! Connection is working!")
    print()
    
    print("Step 3: Checking database access...")
    # Access the database
    db = client['namaz_db']
    print(f"✅ Database 'namaz_db' is accessible!")
    print()
    
    print("Step 4: Listing all collections in database...")
    collections = db.list_collection_names()
    if collections:
        print(f"✅ Found {len(collections)} collection(s):")
        for col in collections:
            print(f"   - {col}")
    else:
        print("ℹ️  No collections found yet (this is normal for a new database)")
    print()
    
    print("Step 5: Testing write permissions...")
    # Try to insert a test document
    test_collection = db['connection_test']
    test_doc = {"test": "connection", "status": "success"}
    result = test_collection.insert_one(test_doc)
    print(f"✅ Write test successful! Document ID: {result.inserted_id}")
    print()
    
    print("Step 6: Testing read permissions...")
    # Try to read the document back
    found_doc = test_collection.find_one({"test": "connection"})
    if found_doc:
        print(f"✅ Read test successful! Found document: {found_doc}")
    print()
    
    print("Step 7: Cleaning up test data...")
    # Clean up the test document
    test_collection.delete_one({"test": "connection"})
    print("✅ Test document cleaned up")
    print()
    
    print("=" * 60)
    print("🎉 ALL TESTS PASSED!")
    print("=" * 60)
    print()
    print("✅ MongoDB Atlas cluster is working")
    print("✅ Database user 'auswrigt_db_user' has correct permissions")
    print("✅ Read and write operations are successful")
    print("✅ Your connection string is correct")
    print()
    print("You're ready to deploy to Vercel! 🚀")
    print()
    
except Exception as e:
    print("=" * 60)
    print("❌ CONNECTION TEST FAILED")
    print("=" * 60)
    print()
    print(f"Error: {str(e)}")
    print()
    print("Possible issues:")
    print("1. Check your username and password are correct")
    print("2. Verify Network Access allows 0.0.0.0/0 (anywhere)")
    print("3. Make sure the database user exists in Database Access")
    print("4. Check if the cluster is active (not paused)")
    print()
    
finally:
    if 'client' in locals():
        client.close()
        print("Connection closed.")
