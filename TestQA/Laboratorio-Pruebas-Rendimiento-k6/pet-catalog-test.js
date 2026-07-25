import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import http from 'k6/http';
import { Trend, Counter } from 'k6/metrics';
import { check, sleep } from 'k6';
import exec from 'k6/execution';
import { buildSummary } from './summary-utils.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';
const SCENARIO = __ENV.SCENARIO || 'smoke';

const scenarioReqs = { smoke: new Counter('reqs_smoke'), load: new Counter('reqs_load'), stress: new Counter('reqs_stress') };
const scenarioFails = { smoke: new Counter('fails_smoke'), load: new Counter('fails_load'), stress: new Counter('fails_stress') };
const scenarioDur = { smoke: new Trend('dur_smoke'), load: new Trend('dur_load'), stress: new Trend('dur_stress') };

// Configuración de umbrales y escenarios
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
            { duration: '30s', target: 20 },
            { duration: '1m', target: 20 },
            { duration: '30s', target: 0 },
        ],
    },
    stress: {
        executor: 'ramping-vus',
        startVUs: 0,
        stages: [
            { duration: '30s', target: 100 },
            { duration: '1m', target: 100 },
            { duration: '30s', target: 0 },
        ],
    },
};

export const options = {
    scenarios: {
        [SCENARIO]: allScenarios[SCENARIO] || allScenarios.smoke,
    },
    thresholds: {
        http_req_duration: ['p(95)<800'],
        http_req_failed: ['rate<0.01'],
    },
};

export function setup() {
    const r = Math.floor(Math.random() * 1000000);
    const email = `test_k6_cat_${r}@example.com`;
    const password = 'Password123!';
    const timeout = '10s';

    http.post(`${BASE_URL}/auth/register`, JSON.stringify({
        email, password,
        first_name: 'Test', last_name: 'User',
        phone_number: '0912345678', requested_role: 'adopter'
    }), { headers: { 'Content-Type': 'application/json' }, timeout });

    const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({ email, password }), {
        headers: { 'Content-Type': 'application/json' },
        timeout,
    });

    if (loginRes.status !== 200) {
        throw new Error(`Falló el login en setup: ${loginRes.status}`);
    }

    return { token: loginRes.json('access_token') };
}

export default function (data) {
    const scName = exec.scenario.name;
    const page = Math.floor(Math.random() * 5) + 1;
    const limit = 20;
    
    const params = {
        headers: { 'Authorization': `Bearer ${data.token}` },
        timeout: '5s'
    };
    
    const res = http.get(`${BASE_URL}/pets/?page=${page}&limit=${limit}`, params);

    scenarioReqs[scName].add(1);
    scenarioDur[scName].add(res.timings.duration);
    if (res.status !== 200) scenarioFails[scName].add(1);

    check(res, {
        'status es 200': (r) => r.status === 200,
        'tiene resultados': (r) => r.body && r.body.length > 0, 
    });

    sleep(1);
}

export function handleSummary(data) {
    return {
        stdout: buildSummary('Catálogo Mascotas', data),
    };
}
