const fs = require('fs');
const path = require('path');

const scriptName = process.argv[2];
if (!scriptName) {
  console.error("Falta el nombre del script");
  process.exit(1);
}

const scenarios = ['smoke', 'load', 'stress'];
const nl = '\n';

function extractData(sc) {
  const file = path.join(__dirname, 'logs', `${scriptName}-${sc}-summary.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function getScenarioInfo(sc, data) {
  if (!data) return { total: 0, fail: 0, ok: 0, okPct: '0.0', failPct: '0.0', vusMax: 0 };
  
  const reqMetric = data.metrics[`reqs_${sc}`];
  const failMetric = data.metrics[`fails_${sc}`];

  const reqs = (reqMetric && reqMetric.count) || 0;
  const fails = (failMetric && failMetric.count) || (failMetric && failMetric.fails) || 0;
  const ok = reqs - fails;
  const okPct = reqs > 0 ? ((ok / reqs) * 100).toFixed(1) : '0.0';
  const failPct = reqs > 0 ? ((fails / reqs) * 100).toFixed(1) : '0.0';

  const vusMaxMetric = data.metrics.vus_max;
  const vusMax = (vusMaxMetric && vusMaxMetric.value) || 0;

  return { total: reqs, fail: fails, ok, okPct, failPct, vusMax };
}

function generateTable() {
  const vals = scenarios.map(sc => {
    const data = extractData(sc);
    return getScenarioInfo(sc, data);
  });

  let out = '';
  out += '+----------------------------------------------------------+' + nl;
  out += '| CONSOLIDADO FINAL - ' + scriptName.padEnd(38) + ' |' + nl;
  out += '+----------------------+------------+------------+------------+' + nl;
  out += '| Metrica              | Smoke      | Load       | Stress     |' + nl;
  out += '+----------------------+------------+------------+------------+' + nl;

  const rows = [
    ['VUs (max.)', ...vals.map(v => String(v.vusMax))],
    ['Peticiones Totales', ...vals.map(v => String(v.total))],
    ['Exitosas', ...vals.map(v => v.ok + ' (' + v.okPct + '%)')],
    ['Fallidas', ...vals.map(v => v.fail + ' (' + v.failPct + '%)')],
  ];

  for (const r of rows) {
    out += '| ' + r[0].padEnd(20) + ' | ' + r[1].padEnd(10) + ' | ' + r[2].padEnd(10) + ' | ' + r[3].padEnd(10) + ' |' + nl;
  }

  out += '+----------------------+------------+------------+------------+' + nl;
  return out;
}

const table = generateTable();
console.log(nl + table + nl);

// Guardar en un archivo consolidado final
fs.writeFileSync(path.join(__dirname, 'logs', `${scriptName}-CONSOLIDADO.txt`), table);
