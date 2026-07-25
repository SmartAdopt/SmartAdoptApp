import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import ws from 'k6/ws';
import { Trend, Rate, Counter } from 'k6/metrics';
import { check, sleep } from 'k6';
import exec from 'k6/execution';
import { buildSummary } from './summary-utils.js';

const WS_BASE_URL = __ENV.WS_BASE_URL || 'ws://localhost:8000';
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
            { duration: '30s', target: 50 },
            { duration: '1m', target: 50 },
            { duration: '30s', target: 0 },
        ],
    },
};

export const options = {
    scenarios: {
        [SCENARIO]: allScenarios[SCENARIO] || allScenarios.smoke,
    },
};

export function handleSummary(data) {
    return {
        stdout: buildSummary('WebSocket', data),
    };
}

export default function () {
    const scName = exec.scenario.name;
    const startTime = new Date();

    const url = `${WS_BASE_URL}/socket.io/?EIO=4&transport=websocket`;

    const res = ws.connect(url, null, function (socket) {
        socket.on('open', () => {
            socket.setInterval(function timeout() {
                socket.ping();
            }, 5000);
        });

        socket.on('ping', () => {
        });

        socket.on('close', () => {
        });

        socket.on('error', (e) => {
            if (e.error() != 'websocket: close sent') {
                console.log('Error de websocket: ', e.error());
            }
        });

        socket.setTimeout(function () {
            socket.close();
        }, 2000);
    });

    const duration = new Date() - startTime;
    scenarioReqs[scName].add(1);
    scenarioDur[scName].add(duration);
    const ok = res && res.status === 101;
    if (!ok) scenarioFails[scName].add(1);

    check(res, { 'status is 101 (Switching Protocols)': (r) => r && r.status === 101 });

    sleep(1);
}
