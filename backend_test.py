import requests
import sys
from datetime import datetime, timedelta
import json

class NamazAPITester:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            response = None
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            else:
                print(f"❌ Failed - Unsupported HTTP method: {method}")
                return False, {}

            if response is None:
                print(f"❌ Failed - No response received")
                return False, {}

            print(f"   Status Code: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout")
            return False, {}
        except requests.exceptions.ConnectionError:
            print(f"❌ Failed - Connection error")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        return self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )

    def test_prayer_times_today(self):
        """Test getting prayer times for today"""
        today = datetime.now()
        date_str = today.strftime('%d-%b-%Y')
        
        success, response = self.run_test(
            f"Prayer Times for Today ({date_str})",
            "GET",
            f"prayer-times/{date_str}",
            200
        )
        
        if success and response:
            # Validate response structure
            required_fields = ['date', 'hijri_date', 'hijri_month', 'hijri_year', 'prayers']
            for field in required_fields:
                if field not in response:
                    print(f"❌ Missing field: {field}")
                    return False
            
            # Validate prayers
            if len(response['prayers']) != 5:
                print(f"❌ Expected 5 prayers, got {len(response['prayers'])}")
                return False
            
            prayer_names = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
            for i, prayer in enumerate(response['prayers']):
                if prayer['name'] != prayer_names[i]:
                    print(f"❌ Expected prayer {prayer_names[i]}, got {prayer['name']}")
                    return False
                
                # Check time format (should be 12h without AM/PM)
                start_time = prayer['start_time']
                if ':' not in start_time:
                    print(f"❌ Invalid time format for {prayer['name']}: {start_time}")
                    return False
            
            print("✅ Prayer times structure validation passed")
            return True
        
        return False

    def test_prayer_times_future_date(self):
        """Test getting prayer times for a future date"""
        future_date = datetime.now() + timedelta(days=7)
        date_str = future_date.strftime('%d-%b-%Y')
        
        return self.run_test(
            f"Prayer Times for Future Date ({date_str})",
            "GET",
            f"prayer-times/{date_str}",
            200
        )

    def test_prayer_times_past_date(self):
        """Test getting prayer times for a past date"""
        past_date = datetime.now() - timedelta(days=7)
        date_str = past_date.strftime('%d-%b-%Y')
        
        return self.run_test(
            f"Prayer Times for Past Date ({date_str})",
            "GET",
            f"prayer-times/{date_str}",
            200
        )

    def test_manual_adjustments(self):
        """Test saving and retrieving manual adjustments"""
        today = datetime.now()
        date_str = today.strftime('%d-%b-%Y')
        
        # Test saving adjustments
        adjustment_data = {
            "adjustments": [
                {"prayer_name": "Fajr", "adjustment": 5},
                {"prayer_name": "Dhuhr", "adjustment": -3},
                {"prayer_name": "Asr", "adjustment": 2}
            ]
        }
        
        success, _ = self.run_test(
            f"Save Manual Adjustments ({date_str})",
            "POST",
            f"adjust-prayers/{date_str}",
            200,
            data=adjustment_data
        )
        
        if not success:
            return False
        
        # Test retrieving adjustments
        success, response = self.run_test(
            f"Get Manual Adjustments ({date_str})",
            "GET",
            f"adjustments/{date_str}",
            200
        )
        
        if success and response:
            if len(response) == 3:
                print("✅ Adjustments saved and retrieved correctly")
                return True
            else:
                print(f"❌ Expected 3 adjustments, got {len(response)}")
        
        return False

    def test_prayer_times_with_adjustments(self):
        """Test that prayer times reflect saved adjustments"""
        today = datetime.now()
        date_str = today.strftime('%d-%b-%Y')
        
        # First get original times
        success, original_response = self.run_test(
            f"Original Prayer Times ({date_str})",
            "GET",
            f"prayer-times/{date_str}",
            200
        )
        
        if not success:
            return False
        
        # Save some adjustments
        adjustment_data = {
            "adjustments": [
                {"prayer_name": "Fajr", "adjustment": 10}
            ]
        }
        
        success, _ = self.run_test(
            f"Save Test Adjustment ({date_str})",
            "POST",
            f"adjust-prayers/{date_str}",
            200,
            data=adjustment_data
        )
        
        if not success:
            return False
        
        # Get adjusted times
        success, adjusted_response = self.run_test(
            f"Adjusted Prayer Times ({date_str})",
            "GET",
            f"prayer-times/{date_str}",
            200
        )
        
        if success and adjusted_response:
            # Check if Fajr has adjustment indicator
            fajr_prayer = next((p for p in adjusted_response['prayers'] if p['name'] == 'Fajr'), None)
            if fajr_prayer and fajr_prayer['adjustment'] == 10:
                print("✅ Adjustments are reflected in prayer times")
                return True
            else:
                print(f"❌ Adjustment not reflected. Fajr adjustment: {fajr_prayer['adjustment'] if fajr_prayer else 'Not found'}")
        
        return False

    def test_invalid_date_format(self):
        """Test API with invalid date format"""
        return self.run_test(
            "Invalid Date Format",
            "GET",
            "prayer-times/2025-08-27",  # Wrong format, should be DD-MMM-YYYY
            400
        )

    def test_api_connectivity(self):
        """Test basic API connectivity"""
        try:
            response = requests.get(f"{self.base_url}/api", timeout=5)
            if response.status_code == 200:
                print("✅ API is accessible")
                return True
            else:
                print(f"❌ API returned status {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ API connectivity failed: {str(e)}")
            return False

def main():
    print("🕌 Starting Namaz Timing App API Tests")
    print("=" * 50)
    
    tester = NamazAPITester()
    
    # Test API connectivity first
    if not tester.test_api_connectivity():
        print("\n❌ API is not accessible. Stopping tests.")
        return 1
    
    # Run all tests
    test_methods = [
        tester.test_root_endpoint,
        tester.test_prayer_times_today,
        tester.test_prayer_times_future_date,
        tester.test_prayer_times_past_date,
        tester.test_manual_adjustments,
        tester.test_prayer_times_with_adjustments,
        tester.test_invalid_date_format
    ]
    
    for test_method in test_methods:
        try:
            test_method()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())