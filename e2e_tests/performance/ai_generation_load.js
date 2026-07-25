import http from 'k6/http';
import { check, sleep } from 'k6';

// Load the admin token from JSON file (assuming generate_admin_token.py was run)
const adminTokenData = JSON.parse(open('./admin_token.json'));
const adminToken = adminTokenData.access_token;

export const options = {
  scenarios: {
    // Escenario de estrés para la IA (Groq Rate Limits)
    ai_burst: {
      executor: 'ramping-arrival-rate',
      startRate: 2, // 2 peticiones por segundo
      timeUnit: '1s',
      preAllocatedVUs: 10,
      maxVUs: 50, 
      stages: [
        { target: 10, duration: '15s' }, // Escalar a 10 req/s (muy alto para LLMs gratuitos)
        { target: 10, duration: '15s' }, // Mantener para forzar el rate limit (HTTP 429)
        { target: 0, duration: '10s' },  // Bajar
      ],
    },
  },
  thresholds: {
    // La respuesta de la IA suele tardar unos segundos
    http_req_duration: ['p(95)<10000'], // Menos de 10 segundos
    // Esperamos fallos por "429 Too Many Requests" de Groq
    http_req_failed: ['rate<0.50'], // Tolera hasta 50% de fallos por rate limit
  },
};

const baseUrl = __ENV.BASE_URL || 'http://localhost:8000';

export function setup() {
  // 1. Fetch available pets to get a valid profile ID
  const params = {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  };
  const res = http.get(`${baseUrl}/pets/`, params);

  if (res.status !== 200) {
    throw new Error(`API GET /pets/ failed! Status: ${res.status} Body: ${res.body}`);
  }

  const data = res.json();
  if (!data || !data.pets || data.pets.length === 0) {
    throw new Error(`API returned 200 but no pets! Data: ${JSON.stringify(data)}`);
  }

  let profileId = data.pets[0].profile_id;
  console.log(`DEBUG: Setup success. Using profileId: ${profileId}`);
  return { profileId: profileId };
}

export default function (data) {
  if (!data.profileId) {
    console.error("NO SE ENCONTRARON MASCOTAS EN LA DB. Ejecuta una prueba funcional o crea una mascota primero.");
    sleep(1);
    return;
  }

  const url = `${baseUrl}/pets/${data.profileId}/regenerate`;
  
  const params = {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
  };

  const res = http.post(url, null, params);

  // Verificamos si logramos un 200 OK (regeneración exitosa) o si rebotamos
  check(res, {
    'status is 200 (Success)': (r) => r.status === 200,
    'status is 429 (Rate Limit Groq)': (r) => r.status === 429 || (r.status === 500 && r.body.includes("Rate")),
  });
}
