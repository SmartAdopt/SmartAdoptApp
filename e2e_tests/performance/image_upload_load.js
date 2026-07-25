import http from 'k6/http';
import { check } from 'k6';
import { SharedArray } from 'k6/data';

// Load the admin token from JSON file
const adminTokenData = JSON.parse(open('./admin_token.json'));
const adminToken = adminTokenData.access_token;

// Read the image file as binary
const imageFile = open('../functional/dummy_pet.jpg', 'b');

// Configure the load test
export const options = {
  scenarios: {
    // Scenario to simulate multiple simultaneous image uploads
    image_upload_burst: {
      executor: 'ramping-arrival-rate',
      startRate: 5, // 5 uploads per second
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 200, 
      stages: [
        { target: 20, duration: '15s' }, // Ramp up to 20 concurrent uploads per second
        { target: 20, duration: '20s' }, // Hold at 20 uploads per second
        { target: 0, duration: '10s' },  // Scale down
      ],
    },
  },
  thresholds: {
    // Uploads are heavier, so we allow more time (p95 < 4000ms)
    http_req_duration: ['p(95)<4000'],
    http_req_failed: ['rate<0.05'], // Acceptable failure rate < 5% due to third party API limits
  },
};

export default function () {
  const baseUrl = __ENV.BASE_URL || 'http://localhost:8000';
  const url = `${baseUrl}/backblaze/upload`;
  
  // Construct a multipart/form-data payload natively with k6
  const data = {
    file: http.file(imageFile, 'dummy_pet.jpg', 'image/jpeg'),
  };

  const params = {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  };

  const res = http.post(url, data, params);

  // We expect a 201 Created and an 'url' in the JSON response
  check(res, {
    'status is 201': (r) => r.status === 201,
    'has image url': (r) => {
        try {
            return r.json('url') !== undefined;
        } catch(e) {
            return false;
        }
    }
  });
}
