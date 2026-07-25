import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.4/index.js";
import http from 'k6/http';
import { Trend, Rate, Counter } from 'k6/metrics';
import { check, sleep } from 'k6';
import exec from 'k6/execution';
import { buildSummary } from './summary-utils.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';
const SCENARIO = __ENV.SCENARIO || 'smoke';

const scenarioReqs = { smoke: new Counter('reqs_smoke'), load: new Counter('reqs_load'), stress: new Counter('reqs_stress') };
const scenarioFails = { smoke: new Counter('fails_smoke'), load: new Counter('fails_load'), stress: new Counter('fails_stress') };
const scenarioDur = { smoke: new Trend('dur_smoke'), load: new Trend('dur_load'), stress: new Trend('dur_stress') };

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
            { duration: '30s', target: 80 },
            { duration: '1m', target: 80 },
            { duration: '30s', target: 0 },
        ],
    },
};

export const options = {
    scenarios: {
        [SCENARIO]: allScenarios[SCENARIO] || allScenarios.smoke,
    },
    thresholds: {
        http_req_duration: ['p(95)<2000'],
        http_req_failed: ['rate<0.01'],
    },
};

export function setup() {
    const r = Math.floor(Math.random() * 1000000);
    const email = `test_k6_adopt_${r}@example.com`;
    const password = 'Password123!';
    const timeout = '10s';

    console.log(`[setup] Registrando usuario ${email}...`);
    const regRes = http.post(`${BASE_URL}/auth/register`, JSON.stringify({
        email, password,
        first_name: 'Test', last_name: 'User',
        phone_number: '0912345678', requested_role: 'adopter'
    }), { headers: { 'Content-Type': 'application/json' }, timeout });
    console.log(`[setup] Register status: ${regRes.status}, body: ${regRes.body}`);

    console.log(`[setup] Iniciando login...`);
    const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({ email, password }), {
        headers: { 'Content-Type': 'application/json' },
        timeout,
    });
    console.log(`[setup] Login status: ${loginRes.status}`);

    if (loginRes.status !== 200) {
        console.log(`[setup] ERROR login: body: ${loginRes.body}`);
        throw new Error(`Falló el login en setup: ${loginRes.status}`);
    }

    const token = loginRes.json('access_token');
    console.log(`[setup] Login exitoso`);
    return { token };
}

export default function (data) {
    const scName = exec.scenario.name;
    const payload = JSON.stringify({
        neighborhood: "Palermo",
        address: "Calle de prueba 123",
        employment_status: "employed",
        housing_type: "apartment",
        has_natural_space: true,
        has_pets: false,
        household_energy: "moderate",
        has_children: false,
        long_term_commitment: true,
        preferred_species: "dog",
        preferred_gender: "no_preference",
        preferred_energy: "medium",
        daily_time_dedication: ">2",
        sleeping_location: "inside",
        behavior_approach: "positive_education",
        emergency_plan: "family_friend",
        motivation: "Quiero adoptar una mascota para pruebas de estrés.",
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.token}`,
        },
        timeout: '10s'
    };

    console.log(`[solicitud VU=${__VU} ITER=${__ITER}] Enviando formulario de adopción...`);
    const res = http.post(`${BASE_URL}/adoption-forms/submit`, payload, params);
    console.log(`[solicitud VU=${__VU} ITER=${__ITER}] POST status: ${res.status}, duracion: ${res.timings.duration}ms`);

    scenarioReqs[scName].add(1);
    scenarioDur[scName].add(res.timings.duration);
    if (res.status !== 201) scenarioFails[scName].add(1);

    check(res, {
        'Formulario enviado (201)': (r) => r.status === 201,
    });

    sleep(1);
}

export function handleSummary(data) {
    return {
        stdout: buildSummary('Adopción', data),
    };
}
