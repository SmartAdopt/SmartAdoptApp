export function buildSummary(testName, data) {
  const currentScenario = __ENV.SCENARIO || 'smoke';
  const nl = '\n';
  let out = nl + nl;

  const info = getScenarioInfo(currentScenario, data);
  out += fmtIndividual(currentScenario, info, testName);
  out += nl;

  out += endpointSection(data);

  return out;
}

function getScenarioInfo(sc, data) {
  const reqMetric = data.metrics[`reqs_${sc}`];
  const failMetric = data.metrics[`fails_${sc}`];

  const reqs = (reqMetric && reqMetric.values && reqMetric.values.count) || 0;
  const fails = (failMetric && failMetric.values && failMetric.values.count) || 0;
  const ok = reqs - fails;
  const okPct = reqs > 0 ? ((ok / reqs) * 100).toFixed(1) : '0.0';
  const failPct = reqs > 0 ? ((fails / reqs) * 100).toFixed(1) : '0.0';

  const vusMaxMetric = data.metrics.vus_max;
  const vusMax = (vusMaxMetric && vusMaxMetric.values && vusMaxMetric.values.value) || 0;

  return { total: reqs, fail: fails, ok, okPct, failPct, vusMax };
}

function fmtIndividual(sc, info, testName) {
  const nl = '\n';
  const label = sc.charAt(0).toUpperCase() + sc.slice(1);
  let out = '';
  out += '+--------------------------------------------------+' + nl;
  out += '| ' + (label + ' - ' + testName).padEnd(48) + ' |' + nl;
  out += '+--------------------------------------------------+' + nl;
  out += '| VUs (max.)         : ' + String(info.vusMax).padStart(28) + ' |' + nl;
  out += '| Peticiones Totales : ' + info.total.toLocaleString().padStart(28) + ' |' + nl;
  out += '| Exitosas           : ' + (info.ok.toLocaleString() + ' (' + info.okPct + '%)').padStart(28) + ' |' + nl;
  out += '| Fallidas           : ' + (info.fail.toLocaleString() + ' (' + info.failPct + '%)').padStart(28) + ' |' + nl;
  out += '+--------------------------------------------------+' + nl;
  return out;
}

function fmtConsolidated(scenarios, data, testName) {
  const nl = '\n';
  const vals = scenarios.map(sc => getScenarioInfo(sc, data));

  let out = '';
  out += '+----------------------------------------------------------+' + nl;
  out += '| CONSOLIDADO - ' + testName.padEnd(44) + ' |' + nl;
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

  out += '+----------------------+------------+------------+------------+' + nl + nl;
  return out;
}

function endpointSection(data) {
  const nl = '\n';
  const checkKeys = Object.keys(data.metrics || {}).filter(k => k.startsWith('checks{check:'));

  if (checkKeys.length === 0) return '';

  const failedTotal = {};
  const passedTotal = {};

  for (const ck of checkKeys) {
    const match = ck.match(/check:([^}]+)/);
    const name = match ? match[1].trim() : ck;
    const m = data.metrics[ck] && data.metrics[ck].values;
    if (m) {
      const fails = m.fails || 0;
      const passes = m.passes || 0;
      if (fails > 0) {
        failedTotal[name] = (failedTotal[name] || 0) + fails;
        if (!passedTotal[name]) passedTotal[name] = 0;
        passedTotal[name] += passes;
      } else {
        passedTotal[name] = (passedTotal[name] || 0) + passes;
      }
    }
  }

  let out = '';
  const failedNames = Object.keys(failedTotal);
  if (failedNames.length > 0) {
    out += '>>> Endpoints con fallos:' + nl;
    for (const name of failedNames.sort()) {
      const total = failedTotal[name] + (passedTotal[name] || 0);
      const pct = total > 0 ? ((failedTotal[name] / total) * 100).toFixed(1) : '0.0';
      out += '    ' + name + ' -> ' + failedTotal[name] + ' fallos (' + pct + '%)' + nl;
    }
  }

  const stableNames = Object.keys(passedTotal).filter(n => !failedTotal[n]);
  if (stableNames.length > 0) {
    out += '>>> Endpoints estables (100% exito):' + nl;
    for (const name of stableNames.sort()) {
      out += '    ' + name + nl;
    }
  }

  return out;
}

export function buildAllEndpointsSummary(data) {
  const nl = '\n';
  const flows = [
    { name: 'Auth Login', tag: 'auth', vus: 50 },
    { name: 'Catalogo', tag: 'catalog', vus: 100 },
    { name: 'Adopcion', tag: 'adoption', vus: 50 },
    { name: 'Notificaciones', tag: 'notifications', vus: 40 },
    { name: 'Favoritos', tag: 'favorites', vus: 80 },
  ];

  const flowData = flows.map(f => {
    let reqs = 0;
    let fails = 0;
    
    // Auth has 'auth', Catalog has 'catalog', Adopcion has 'adoption', etc.
    const internalName = f.tag.toLowerCase(); // 'auth', 'catalog', 'adoption', 'notifications', 'favorites'
    
    const reqMetric = data.metrics[`reqs_${internalName}`];
    const failMetric = data.metrics[`fails_${internalName}`];
    
    if (reqMetric) reqs = reqMetric.values ? reqMetric.values.count : reqMetric.count || 0;
    if (failMetric) fails = failMetric.values ? failMetric.values.count : failMetric.count || 0;

    const vus = f.vus || 0;
    
    const ok = reqs - fails;
    const okPct = reqs > 0 ? ((ok / reqs) * 100).toFixed(1) : '0.0';
    const failPct = reqs > 0 ? ((fails / reqs) * 100).toFixed(1) : '0.0';
    return { ...f, reqs, fails, ok, okPct, failPct };
  });

  const totalReqs = flowData.reduce((s, f) => s + f.reqs, 0);
  const totalFails = flowData.reduce((s, f) => s + f.fails, 0);
  const totalOk = totalReqs - totalFails;
  const totalOkPct = totalReqs > 0 ? ((totalOk / totalReqs) * 100).toFixed(1) : '0.0';
  const totalFailPct = totalReqs > 0 ? ((totalFails / totalReqs) * 100).toFixed(1) : '0.0';
  const totalVus = flowData.reduce((s, f) => s + f.vus, 0);

  let out = nl + nl;
  out += '+-------------------------------------------------------------+' + nl;
  out += '| TEST COMPLETO (TODOS LOS ENDPOINTS) - DESGLOSE POR FLUJO    |' + nl;
  out += '+-------------------------------------------------------------+' + nl + nl;

  out += '+--------------------+------+--------+------------------+------------------+--------+' + nl;
  out += '| Flujo              | VUs  | Total  | Exitosas         | Fallidas         | Estado |' + nl;
  out += '+--------------------+------+--------+------------------+------------------+--------+' + nl;

  for (const f of flowData) {
    const flag = f.fails === 0 ? 'OK' : (f.failPct > 10 ? 'CRITICO' : 'FALLOS');
    out += '| ' + f.name.padEnd(18) + ' | ' + String(f.vus).padStart(4) + ' | ' + String(f.reqs).padStart(6) + ' | ' + (f.ok + ' (' + f.okPct + '%)').padStart(16) + ' | ' + (f.fails + ' (' + f.failPct + '%)').padStart(16) + ' | ' + flag.padStart(6) + ' |' + nl;
  }

  out += '+--------------------+------+--------+------------------+------------------+--------+' + nl;
  out += '| TOTAL              | ' + String(totalVus).padStart(4) + ' | ' + String(totalReqs).padStart(6) + ' | ' + (totalOk + ' (' + totalOkPct + '%)').padStart(16) + ' | ' + (totalFails + ' (' + totalFailPct + '%)').padStart(16) + ' | ' + ' '.repeat(6) + ' |' + nl;
  out += '+--------------------+------+--------+------------------+------------------+--------+' + nl + nl;

  const failedFlows = flowData.filter(f => f.fails > 0);
  if (failedFlows.length > 0) {
    out += '>>> Endpoints con fallos:' + nl;
    for (const f of failedFlows) {
      out += '    ' + f.name.padEnd(18) + ' -> ' + f.fails + ' fallos (' + f.failPct + '%)' + nl;
    }
    out += nl;
  }

  const stableFlows = flowData.filter(f => f.fails === 0);
  if (stableFlows.length > 0) {
    out += '>>> Endpoints estables (100% exito):' + nl;
    for (const f of stableFlows) {
      out += '    ' + f.name + nl;
    }
  } else if (failedFlows.length > 0) {
    out += '>>> Endpoints estables: Ninguno - todos presentaron fallos' + nl;
  }

  return out;
}