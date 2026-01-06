const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Test the learning endpoint
async function testLearningEndpoint() {
  try {
    console.log('🧪 Testing Learning Materials Endpoint...\n');
    
    // Get API URL from environment
    const port = process.env.PORT || 5000;
    const apiUrl = `http://localhost:${port}/api/learning/materials`;
    
    // Create a test token (normally you'd need a real token, but let's try without auth first)
    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': 'Bearer test_token'  // Dummy token for testing
      }
    }).catch(err => {
      if (err.response?.status === 401) {
        console.log('⚠️ Auth required. Testing without auth token...');
        return axios.get(apiUrl);
      }
      throw err;
    });

    console.log('✅ Response received!');
    console.log('Status:', response.status);
    console.log('\nData:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testLearningEndpoint();
