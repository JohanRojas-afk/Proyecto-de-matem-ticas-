// ---------- Menú móvil ----------
const navToggle = document.getElementById("navToggle");
const siteNav = document.getElementById("siteNav");

navToggle.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", isOpen);
});

siteNav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    siteNav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// ---------- Calculadora interactiva de la parábola ----------
const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

const sliderA = document.getElementById("sliderA");
const sliderB = document.getElementById("sliderB");
const sliderC = document.getElementById("sliderC");
const valA = document.getElementById("valA");
const valB = document.getElementById("valB");
const valC = document.getElementById("valC");

const equationDisplay = document.getElementById("equationDisplay");
const infoVertice = document.getElementById("infoVertice");
const infoEje = document.getElementById("infoEje");
const infoConcavidad = document.getElementById("infoConcavidad");
const infoCorteY = document.getElementById("infoCorteY");
const infoDiscriminante = document.getElementById("infoDiscriminante");
const infoRaices = document.getElementById("infoRaices");

function fmt(n) {
  return Math.round(n * 100) / 100;
}

function formatEquation(a, b, c) {
  let eq = "y = ";
  eq += (a === 1 ? "" : a === -1 ? "-" : fmt(a)) + "x²";
  if (b !== 0) {
    eq += b > 0 ? " + " : " - ";
    eq += (Math.abs(b) === 1 ? "" : fmt(Math.abs(b))) + "x";
  }
  if (c !== 0) {
    eq += c > 0 ? " + " : " - ";
    eq += fmt(Math.abs(c));
  }
  return eq;
}

function niceStep(range, targetTicks) {
  const rough = range / targetTicks;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / mag;
  let step;
  if (norm < 1.5) step = 1;
  else if (norm < 3) step = 2;
  else if (norm < 7) step = 5;
  else step = 10;
  return step * mag;
}

function draw(a, b, c) {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const xMin = -10, xMax = 10;
  const samples = 200;

  let yMin = Infinity, yMax = -Infinity;
  for (let i = 0; i <= samples; i++) {
    const x = xMin + (xMax - xMin) * (i / samples);
    const y = a * x * x + b * x + c;
    if (y < yMin) yMin = y;
    if (y > yMax) yMax = y;
  }
  if (yMin === yMax) {
    yMin -= 5;
    yMax += 5;
  }
  const pad = (yMax - yMin) * 0.15 || 5;
  yMin -= pad;
  yMax += pad;

  function toPx(x, y) {
    return {
      x: (x - xMin) / (xMax - xMin) * w,
      y: h - (y - yMin) / (yMax - yMin) * h
    };
  }

  // Grilla
  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 1;
  for (let x = Math.ceil(xMin); x <= xMax; x += 1) {
    const p1 = toPx(x, yMin);
    const p2 = toPx(x, yMax);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  const yStep = niceStep(yMax - yMin, 8);
  for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
    const p1 = toPx(xMin, y);
    const p2 = toPx(xMax, y);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  // Ejes principales
  ctx.strokeStyle = "#00205B";
  ctx.lineWidth = 2;
  if (yMin < 0 && yMax > 0) {
    const p1 = toPx(xMin, 0);
    const p2 = toPx(xMax, 0);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }
  {
    const p1 = toPx(0, yMin);
    const p2 = toPx(0, yMax);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  // Parábola
  ctx.strokeStyle = "#00A3E0";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  for (let i = 0; i <= samples; i++) {
    const x = xMin + (xMax - xMin) * (i / samples);
    const y = a * x * x + b * x + c;
    const p = toPx(x, y);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();

  if (a !== 0) {
    const hVert = -b / (2 * a);
    const kVert = a * hVert * hVert + b * hVert + c;

    // Eje de simetría
    ctx.strokeStyle = "#475569";
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    const pe1 = toPx(hVert, yMin);
    const pe2 = toPx(hVert, yMax);
    ctx.beginPath();
    ctx.moveTo(pe1.x, pe1.y);
    ctx.lineTo(pe2.x, pe2.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Vértice
    const pv = toPx(hVert, kVert);
    ctx.fillStyle = "#FFC72C";
    ctx.strokeStyle = "#00205B";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pv.x, pv.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Raíces
    const disc = b * b - 4 * a * c;
    if (disc >= 0) {
      const r1 = (-b + Math.sqrt(disc)) / (2 * a);
      const r2 = (-b - Math.sqrt(disc)) / (2 * a);
      ctx.fillStyle = "#00205B";
      [r1, r2].forEach(r => {
        const pr = toPx(r, 0);
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, 5, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  // Corte con eje Y
  const py = toPx(0, c);
  ctx.fillStyle = "#00A3E0";
  ctx.beginPath();
  ctx.arc(py.x, py.y, 5, 0, Math.PI * 2);
  ctx.fill();
}

function render() {
  const a = parseFloat(sliderA.value);
  const b = parseFloat(sliderB.value);
  const c = parseFloat(sliderC.value);

  valA.textContent = fmt(a);
  valB.textContent = fmt(b);
  valC.textContent = fmt(c);

  equationDisplay.textContent = formatEquation(a, b, c);

  if (a === 0) {
    infoVertice.textContent = "No aplica (a = 0)";
    infoEje.textContent = "No aplica";
    infoConcavidad.textContent = "Línea recta (no cuadrática)";
    infoDiscriminante.textContent = "No aplica";
    infoRaices.textContent = b !== 0 ? "x = " + fmt(-c / b) : "No aplica";
  } else {
    const hVert = fmt(-b / (2 * a));
    const kVert = fmt(a * hVert * hVert + b * hVert + c);
    infoVertice.textContent = "(" + hVert + ", " + kVert + ")";
    infoEje.textContent = "x = " + hVert;
    infoConcavidad.textContent = a > 0 ? "Hacia arriba (Mínimo)" : "Hacia abajo (Máximo)";

    const disc = fmt(b * b - 4 * a * c);
    infoDiscriminante.textContent = disc;

    if (disc > 0) {
      const r1 = fmt((-b + Math.sqrt(disc)) / (2 * a));
      const r2 = fmt((-b - Math.sqrt(disc)) / (2 * a));
      infoRaices.textContent = "x₁ = " + r1 + " | x₂ = " + r2;
    } else if (disc === 0) {
      const r = fmt(-b / (2 * a));
      infoRaices.textContent = "x = " + r + " (Raíz única)";
    } else {
      infoRaices.textContent = "Sin raíces reales (Δ < 0)";
    }
  }

  infoCorteY.textContent = "(0, " + fmt(c) + ")";
  draw(a, b, c);
}

[sliderA, sliderB, sliderC].forEach(slider => {
  slider.addEventListener("input", render);
});

render();
