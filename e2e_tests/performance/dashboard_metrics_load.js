import http from 'k6/http';
import { check, sleep } from 'k6';

// Load the admin token from JSON file (assuming generate_admin_token.py was run)
const adminTokenData = JSON.parse(open('./admin_token.json'));
const adminToken = adminTokenData.access_token;

export const options = {
  scenarios: {
    // Escenario de carga sobre consultas complejas al dashboard de admin
    dashboard_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 20 }, // Subir a 20 usuarios (muchas queries simultaneas a BD)
        { duration: '30s', target: 20 }, // Mantener para observar consumo de CPU/RAM de MongoDB y FastAPI
        { duration: '10s', target: 0 },  // Bajar a 0
      ],
      gracefulRampDown: '5s',
    },
  },
  thresholds: {
    // Las operaciones a base de datos deberían ser relativamente rápidas (ideal < 500ms, pero toleramos hasta 1.5s bajo carga)
    http_req_duration: ['p(95)<1500'], 
    // Fallos por timeout o conexión rechazada por la base de datos
    http_req_failed: ['rate<0.05'], // Tolerancia del 5% de errores
  },
};

const baseUrl = __ENV.BASE_URL || 'http://localhost:8000';

export default function () {
  const url = `${baseUrl}/admin/dashboard`;
  
  const params = {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
  };

  const res = http.get(url, params);

  check(res, {
    'status is 200 (Dashboard Success)': (r) => r.status === 200,
    'has dashboard data': (r) => r.status === 200 && r.json().dashboard_data !== undefined,
  });

  // Pausa corta para simular comportamiento humano recargando el dashboard
  sleep(1);
}
