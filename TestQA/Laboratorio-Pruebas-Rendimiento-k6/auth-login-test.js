import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import http from 'k6/http';
import { Trend, Rate, Counter } from 'k6/metrics';
import { check, sleep } from 'k6';
import exec from 'k6/execution';
import { buildSummary } from './summary-utils.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';
const SCENARIO = __ENV.SCENARIO || 'smoke';

const customDuracion = new Trend('custom_duracion');
const customFallos = new Rate('custom_fallos');

const scenarioReqs = { smoke: new Counter('reqs_smoke'), load: new Counter('reqs_load'), stress: new Counter('reqs_stress') };
const scenarioFails = { smoke: new Counter('fails_smoke'), load: new Counter('fails_load'), stress: new Counter('fails_stress') };
const scenarioDur = { smoke: new Trend('dur_smoke'), load: new Trend('dur_load'), stress: new Trend('dur_stress') };

// Configuración de umbrales y escenarios inspirada en el PDF
const allScenarios = {
    smoke: {
        executor: 'shared-iterations',
        vus: 2,
        iterations: 10,
        maxDuration: '10s',
    },
    load: {
        executor: 'ramping-vus',
        startVUs: 0,
        stages: [
            { duration: '30s', target: 10 },
            { duration: '1m', target: 10 },
            { duration: '30s', target: 0 },
        ],
    },
    stress: {
        executor: 'ramping-vus',
        startVUs: 0,
        stages: [
            { duration: '30s', target: 60 },
            { duration: '1m', target: 60 },
            { duration: '30s', target: 0 },
        ],
    },
};

export const options = {
    scenarios: {
        [SCENARIO]: allScenarios[SCENARIO] || allScenarios.smoke,
    },
    thresholds: {
        'http_req_duration': ['p(95)<1500'], // Bcrypt consume mucha CPU, p95 tolerante
        'http_req_duration{modulo:auth}': ['p(95)<1500'],
        'http_req_failed': ['rate<0.01'],    // Menos del 1% de fallos permitidos
    },
};

export default function () {
    const scName = exec.scenario.name;
    const userId = Math.floor(Math.random() * 120) + 1;
    const payload = JSON.stringify({
        email: `test_k6_${userId}@example.com`,
        password: 'Password123!',
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
        tags: { modulo: 'auth', expected_response: 'true' },
        timeout: '10s',
    };

    const res = http.post(`${BASE_URL}/auth/login`, payload, params);

    customDuracion.add(res.timings.duration);
    customFallos.add(res.status !== 200);
    scenarioReqs[scName].add(1);
    scenarioDur[scName].add(res.timings.duration);
    if (res.status !== 200) scenarioFails[scName].add(1);

    check(res, {
        'status es 200': (r) => r.status === 200,
        'tiene access_token': (r) => r.json('access_token') !== undefined,
    });

    sleep(1);
}

export function handleSummary(data) {
    return {
        stdout: buildSummary('Auth Login', data),
    };
}
