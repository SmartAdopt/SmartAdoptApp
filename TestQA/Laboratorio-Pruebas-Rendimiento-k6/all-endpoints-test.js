import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';
import { buildAllEndpointsSummary } from './summary-utils.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';
const SCENARIO = __ENV.SCENARIO || 'smoke';

const customDuracion = new Trend('custom_duracion');
const customFallos = new Rate('custom_fallos');

const reqs_auth = new Counter('reqs_auth');
const fails_auth = new Counter('fails_auth');
const reqs_catalog = new Counter('reqs_catalog');
const fails_catalog = new Counter('fails_catalog');
const reqs_adoption = new Counter('reqs_adoption');
const fails_adoption = new Counter('fails_adoption');
const reqs_notifications = new Counter('reqs_notifications');
const fails_notifications = new Counter('fails_notifications');
const reqs_favorites = new Counter('reqs_favorites');
const fails_favorites = new Counter('fails_favorites');

function buildScenario(execName, loadTargets, stressTargets) {
    if (SCENARIO === 'smoke') return { 
        adoptionFlow: { executor: 'shared-iterations', vus: 2, iterations: 10, exec: 'adoptionFlow' },
        authFlow: { executor: 'shared-iterations', vus: 2, iterations: 10, exec: 'authFlow' },
        catalogFlow: { executor: 'shared-iterations', vus: 2, iterations: 10, exec: 'catalogFlow' },
        favoritesFlow: { executor: 'shared-iterations', vus: 2, iterations: 10, exec: 'favoritesFlow' },
        notificationsFlow: { executor: 'shared-iterations', vus: 2, iterations: 10, exec: 'notificationsFlow' },
    }[execName];
    if (SCENARIO === 'load') return { executor: 'ramping-vus', startVUs: 0, stages: loadTargets, exec: execName };
    return { executor: 'ramping-vus', startVUs: 0, stages: stressTargets, exec: execName };
}

export const options = {
    scenarios: {
        auth: buildScenario('authFlow', [{ duration: '30s', target: 10 }, { duration: '1m', target: 10 }, { duration: '30s', target: 0 }], [{ duration: '30s', target: 60 }, { duration: '1m', target: 60 }, { duration: '30s', target: 0 }]),
        catalog: buildScenario('catalogFlow', [{ duration: '30s', target: 20 }, { duration: '1m', target: 20 }, { duration: '30s', target: 0 }], [{ duration: '30s', target: 100 }, { duration: '1m', target: 100 }, { duration: '30s', target: 0 }]),
        adoption: buildScenario('adoptionFlow', [{ duration: '30s', target: 10 }, { duration: '1m', target: 10 }, { duration: '30s', target: 0 }], [{ duration: '30s', target: 80 }, { duration: '1m', target: 80 }, { duration: '30s', target: 0 }]),
        notifications: buildScenario('notificationsFlow', [{ duration: '30s', target: 10 }, { duration: '1m', target: 10 }, { duration: '30s', target: 0 }], [{ duration: '30s', target: 50 }, { duration: '1m', target: 50 }, { duration: '30s', target: 0 }]),
        favorites: buildScenario('favoritesFlow', [{ duration: '30s', target: 20 }, { duration: '1m', target: 20 }, { duration: '30s', target: 0 }], [{ duration: '30s', target: 90 }, { duration: '1m', target: 90 }, { duration: '30s', target: 0 }]),
    },
    thresholds: {
        'http_req_duration': ['p(95)<2000'], 
        'http_req_duration{modulo:auth}': ['p(95)<1500'],
        'http_req_duration{modulo:catalog}': ['p(95)<800'],
        'http_req_duration{modulo:adoption}': ['p(95)<1200'],
        'http_req_duration{modulo:notifications}': ['p(95)<1000'],
        'http_req_duration{modulo:favorites}': ['p(95)<1000'],
        'http_req_failed': ['rate<0.01'],    
    },
};

// ================= SETUP =================
// Se ejecuta una sola vez al inicio para crear un usuario de prueba fresco
export function setup() {
    const r = Math.floor(Math.random() * 1000000);
    const email = `test_k6_${r}@example.com`;
    const password = 'Password123!';
    
    // Register
    const regPayload = JSON.stringify({ 
        email, 
        password, 
        first_name: 'Test', 
        last_name: 'User', 
        phone_number: '0912345678', 
        requested_role: 'adopter' 
    });
    http.post(`${BASE_URL}/auth/register`, regPayload, { headers: { 'Content-Type': 'application/json' } });

    // Login
    const loginPayload = JSON.stringify({ email, password });
    const res = http.post(`${BASE_URL}/auth/login`, loginPayload, { headers: { 'Content-Type': 'application/json' } });
    
    return { token: res.json('access_token'), email, password };
}

// ================= FLUJOS =================

export function authFlow(data) {
    const payload = JSON.stringify({ email: data.email, password: data.password });
    const params = { headers: { 'Content-Type': 'application/json' }, tags: { modulo: 'auth', expected_response: 'true' }, timeout: '3s' };
    const res = http.post(`${BASE_URL}/auth/login`, payload, params);
    
    customDuracion.add(res.timings.duration);
    customFallos.add(res.status !== 200 ? 1 : 0);
    reqs_auth.add(1);
    fails_auth.add(res.status !== 200 ? 1 : 0);
    check(res, { 'Auth: login exitoso (200)': (r) => r.status === 200 });
    sleep(1);
}

export function catalogFlow(data) {
    const page = Math.floor(Math.random() * 5) + 1;
    const params = { headers: { Authorization: `Bearer ${data.token}` }, tags: { modulo: 'catalog', expected_response: 'true' }, timeout: '3s' };
    const res = http.get(`${BASE_URL}/pets/?page=${page}&limit=20`, params);

    customDuracion.add(res.timings.duration);
    customFallos.add(res.status !== 200 ? 1 : 0);
    reqs_catalog.add(1);
    fails_catalog.add(res.status !== 200 ? 1 : 0);
    check(res, { 'Catalog: listar mascotas (200)': (r) => r.status === 200 });
    sleep(1);
}

export function adoptionFlow(data) {
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
        motivation: "Me gustan mucho los animales y quiero adoptar."
    });
    const params = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.token}` }, tags: { modulo: 'adoption', expected_response: 'true' }, timeout: '5s' };
    const res = http.post(`${BASE_URL}/adoption-forms/submit`, payload, params);

    customDuracion.add(res.timings.duration);
    customFallos.add(![200, 201].includes(res.status) ? 1 : 0);
    reqs_adoption.add(1);
    fails_adoption.add(![200, 201].includes(res.status) ? 1 : 0);
    check(res, { 'Adoption: enviar form (200/201)': (r) => [200, 201].includes(r.status) });
    sleep(1);
}

export function notificationsFlow(data) {
    const params = { headers: { Authorization: `Bearer ${data.token}` }, tags: { modulo: 'notifications' }, timeout: '3s' };
    const res = http.get(`${BASE_URL}/notifications`, params);
    
    customDuracion.add(res.timings.duration);
    customFallos.add(res.status !== 200 ? 1 : 0);
    check(res, { 'Notifications: listar (200)': (r) => r.status === 200 });
    sleep(1);
}

export function favoritesFlow(data) {
    const petId = 'PR' + (Math.floor(Math.random() * 5) + 1);
    const params = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.token}` }, tags: { modulo: 'favorites' }, timeout: '3s' };
    
    const getRes = http.get(`${BASE_URL}/adopter/favorites/`, params);
    customDuracion.add(getRes.timings.duration);
    customFallos.add(getRes.status !== 200 ? 1 : 0);
    check(getRes, { 'Favorites: ver listado (200)': (r) => r.status === 200 });

    sleep(0.5);
    
    const addRes = http.post(`${BASE_URL}/adopter/favorites/${petId}`, "", params);
    customDuracion.add(addRes.timings.duration);
    customFallos.add(![200, 201, 204].includes(addRes.status) ? 1 : 0);
    reqs_favorites.add(1);
    fails_favorites.add(![200, 201, 204].includes(addRes.status) ? 1 : 0);
    check(addRes, { 'Favorites: agregar (200/201)': (r) => [200, 201, 204].includes(r.status) });
    check(addRes, { 'Favorites: agregar (200/201)': (r) => [200, 201, 204].includes(addRes.status) });

    sleep(0.5);
}

export function handleSummary(data) {
    return {
        stdout: buildAllEndpointsSummary(data),
    };
}
