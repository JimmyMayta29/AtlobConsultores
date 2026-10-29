/**
 * ====================================================================
 * DASHBOARD DEMO INTERACTIVO — Consultoría ATLOB
 * ====================================================================
 * Panel de visualización financiera para clientes corporativos.
 * Utiliza Chart.js para renderizado responsivo y sobrio con la paleta de marca.
 * 
 * TODO: Reemplazar los datasets ficticios con la conexión a API real,
 * endpoint de métricas o sistema de reportes Power BI / ERP.
 */

document.addEventListener("DOMContentLoaded", () => {
  const dashboardContainer = document.getElementById("dashboard-demo");
  if (!dashboardContainer) return;

  // Paleta oficial de colores ATLOB
  const BRAND = {
    azulPrincipal: '#0f3d66',
    azulOscuro: '#0a2a47',
    azulProfundo: '#061c30',
    azulMedio: '#1a5a8a',
    azulClaro: '#2980b9',
    azulSuave: '#5dade2',
    amarilloAcento: '#f2b705',
    amarilloHover: '#e6a800',
    naranjaCta: '#e67e22',
    verdeExito: '#27ae60',
    rojoAlerta: '#e74c3c',
    grisBorde: '#e2e8f0',
    grisTexto: '#4a5568',
    blanco: '#ffffff'
  };

  /* ------------------------------------------------------------------
   * DATASETS POR PERIODO (Datos Ficticios con propósito demostrativo)
   * TODO: Conectar con backend /api/dashboard/metrics
   * ------------------------------------------------------------------ */
  const dashboardData = {
    'trimestral': {
      periodLabel: 'Primer Trimestre 2026 (Ene - Mar)',
      kpis: {
        rentabilidad: { valor: '24.8%', cambio: '+3.4%', positivo: true, desc: 'vs. trimestre anterior' },
        gastos: { valor: 'S/ 84,200', cambio: '-2.1%', positivo: true, desc: 'ahorro operativo logrado' },
        ingresos: { valor: 'S/ 342,500', cambio: '+8.7%', positivo: true, desc: 'crecimiento sostenido' },
        flujo: { valor: 'S/ 98,300', cambio: '+12.5%', positivo: true, desc: 'liquidez disponible' }
      },
      lineChart: {
        labels: ['Enero', 'Febrero', 'Marzo'],
        ingresos: [108000, 114500, 120000],
        gastos: [29000, 27400, 27800]
      },
      barChart: {
        labels: ['Planillas', 'Operaciones', 'Tecnología', 'Marketing', 'Tributos', 'Terceros'],
        gastos: [38500, 18200, 9400, 7100, 6200, 4800]
      },
      proyeccion: {
        conservador: { ingresos: 'S/ 480,000', gastos: 'S/ 365,000', margen: '23.9%' },
        base: { ingresos: 'S/ 525,000', gastos: 'S/ 380,000', margen: '27.6%' },
        optimista: { ingresos: 'S/ 580,000', gastos: 'S/ 395,000', margen: '31.8%' }
      }
    },
    'semestral': {
      periodLabel: 'Primer Semestre 2026 (Ene - Jun)',
      kpis: {
        rentabilidad: { valor: '26.4%', cambio: '+4.8%', positivo: true, desc: 'vs. semestre anterior' },
        gastos: { valor: 'S/ 172,600', cambio: '-1.4%', positivo: true, desc: 'control presupuestal' },
        ingresos: { valor: 'S/ 695,400', cambio: '+11.2%', positivo: true, desc: 'expansión comercial' },
        flujo: { valor: 'S/ 204,800', cambio: '+15.3%', positivo: true, desc: 'solvencia de caja' }
      },
      lineChart: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        ingresos: [108000, 114500, 120000, 112000, 118900, 122000],
        gastos: [29000, 27400, 27800, 29200, 29800, 29400]
      },
      barChart: {
        labels: ['Planillas', 'Operaciones', 'Tecnología', 'Marketing', 'Tributos', 'Terceros'],
        gastos: [78000, 36500, 19200, 14600, 13100, 11200]
      },
      proyeccion: {
        conservador: { ingresos: 'S/ 720,000', gastos: 'S/ 540,000', margen: '25.0%' },
        base: { ingresos: 'S/ 785,000', gastos: 'S/ 560,000', margen: '28.6%' },
        optimista: { ingresos: 'S/ 860,000', gastos: 'S/ 585,000', margen: '31.9%' }
      }
    },
    'anual': {
      periodLabel: 'Ejercicio Fiscal Completo 2025/2026',
      kpis: {
        rentabilidad: { valor: '28.1%', cambio: '+5.9%', positivo: true, desc: 'ejercicio auditado' },
        gastos: { valor: 'S/ 348,000', cambio: '+2.8%', positivo: false, desc: 'inversión en expansión' },
        ingresos: { valor: 'S/ 1,420,000', cambio: '+14.6%', positivo: true, desc: 'cumplimiento de metas' },
        flujo: { valor: 'S/ 425,000', cambio: '+18.4%', positivo: true, desc: 'reserva estratégica' }
      },
      lineChart: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'],
        ingresos: [102000, 108000, 115000, 112000, 119000, 121000, 124000, 118000, 126000, 122000, 125000, 128000],
        gastos: [28000, 28500, 29000, 27800, 29400, 30100, 29800, 28900, 29200, 29000, 28800, 29500]
      },
      barChart: {
        labels: ['Planillas', 'Operaciones', 'Tecnología', 'Marketing', 'Tributos', 'Terceros'],
        gastos: [154000, 74000, 38500, 31000, 27500, 23000]
      },
      proyeccion: {
        conservador: { ingresos: 'S/ 1,510,000', gastos: 'S/ 1,120,000', margen: '25.8%' },
        base: { ingresos: 'S/ 1,650,000', gastos: 'S/ 1,160,000', margen: '29.6%' },
        optimista: { ingresos: 'S/ 1,820,000', gastos: 'S/ 1,210,000', margen: '33.5%' }
      }
    }
  };

  let currentPeriod = 'trimestral';
  let currentScenario = 'base';
  let lineChartInstance = null;
  let barChartInstance = null;

  /* ------------------------------------------------------------------
   * FORMATO MONEDA
   * ------------------------------------------------------------------ */
  const formatSoles = (value) => {
    return 'S/ ' + Number(value).toLocaleString('es-PE');
  };

  /* ------------------------------------------------------------------
   * INICIALIZAR GRÁFICO DE LÍNEAS (Ingresos vs. Gastos)
   * ------------------------------------------------------------------ */
  const initLineChart = (data) => {
    const ctx = document.getElementById("chart-ingresos-gastos");
    if (!ctx) return;

    if (lineChartInstance) {
      lineChartInstance.destroy();
    }

    lineChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.lineChart.labels,
        datasets: [
          {
            label: 'Ingresos Facturados',
            data: data.lineChart.ingresos,
            borderColor: BRAND.azulPrincipal,
            backgroundColor: 'rgba(15, 61, 102, 0.08)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.38,
            pointBackgroundColor: BRAND.azulPrincipal,
            pointBorderColor: BRAND.blanco,
            pointBorderWidth: 2,
            pointRadius: 4.5,
            pointHoverRadius: 6.5
          },
          {
            label: 'Gastos Operativos',
            data: data.lineChart.gastos,
            borderColor: BRAND.amarilloAcento,
            backgroundColor: 'rgba(242, 183, 5, 0.06)',
            borderWidth: 2.2,
            borderDash: [4, 4],
            fill: true,
            tension: 0.38,
            pointBackgroundColor: BRAND.amarilloAcento,
            pointBorderColor: BRAND.blanco,
            pointBorderWidth: 2,
            pointRadius: 4.5,
            pointHoverRadius: 6.5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 14,
              font: {
                family: 'Outfit, sans-serif',
                size: 12,
                weight: '600'
              },
              color: BRAND.azulPrincipal
            }
          },
          tooltip: {
            backgroundColor: BRAND.azulProfundo,
            titleFont: { family: 'Outfit, sans-serif', size: 13, weight: '700' },
            bodyFont: { family: 'Outfit, sans-serif', size: 12 },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const val = formatSoles(context.parsed.y);
                return ` ${label}: ${val}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(226, 232, 240, 0.6)'
            },
            ticks: {
              font: { family: 'Outfit, sans-serif', size: 11.5, weight: '500' },
              color: BRAND.grisTexto
            }
          },
          y: {
            grid: {
              color: 'rgba(226, 232, 240, 0.8)'
            },
            ticks: {
              font: { family: 'Outfit, sans-serif', size: 11 },
              color: BRAND.grisTexto,
              callback: (value) => 'S/ ' + (value / 1000) + 'k'
            }
          }
        }
      }
    });
  };

  /* ------------------------------------------------------------------
   * INICIALIZAR GRÁFICO DE BARRAS (Gastos por Categoría)
   * ------------------------------------------------------------------ */
  const initBarChart = (data) => {
    const ctx = document.getElementById("chart-gastos-categoria");
    if (!ctx) return;

    if (barChartInstance) {
      barChartInstance.destroy();
    }

    const palette = [
      BRAND.azulPrincipal,
      BRAND.azulMedio,
      BRAND.azulClaro,
      BRAND.amarilloAcento,
      BRAND.azulSuave,
      BRAND.naranjaCta
    ];

    barChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.barChart.labels,
        datasets: [{
          label: 'Monto en Soles',
          data: data.barChart.gastos,
          backgroundColor: palette,
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: BRAND.azulProfundo,
            titleFont: { family: 'Outfit, sans-serif', size: 13, weight: '700' },
            bodyFont: { family: 'Outfit, sans-serif', size: 12 },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                return ` Monto: ${formatSoles(context.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { family: 'Outfit, sans-serif', size: 10.5, weight: '500' },
              color: BRAND.grisTexto
            }
          },
          y: {
            grid: {
              color: 'rgba(226, 232, 240, 0.8)'
            },
            ticks: {
              font: { family: 'Outfit, sans-serif', size: 11 },
              color: BRAND.grisTexto,
              callback: (value) => 'S/ ' + (value / 1000) + 'k'
            }
          }
        }
      }
    });
  };

  /* ------------------------------------------------------------------
   * ACTUALIZAR KPIS Y PROYECCIONES
   * ------------------------------------------------------------------ */
  const updateUI = () => {
    const data = dashboardData[currentPeriod];
    if (!data) return;

    // Actualizar texto del periodo activo
    const periodDisplay = document.getElementById("current-period-display");
    if (periodDisplay) {
      periodDisplay.textContent = data.periodLabel;
    }

    // Actualizar KPI 1: Rentabilidad
    const kpiRent = document.getElementById("kpi-rentabilidad-val");
    const kpiRentBadge = document.getElementById("kpi-rentabilidad-badge");
    const kpiRentDesc = document.getElementById("kpi-rentabilidad-desc");
    if (kpiRent) kpiRent.textContent = data.kpis.rentabilidad.valor;
    if (kpiRentBadge) {
      kpiRentBadge.innerHTML = `<i class="fas fa-arrow-up"></i> ${data.kpis.rentabilidad.cambio}`;
      kpiRentBadge.className = `kpi-badge ${data.kpis.rentabilidad.positivo ? 'kpi-badge--positive' : 'kpi-badge--negative'}`;
    }
    if (kpiRentDesc) kpiRentDesc.textContent = data.kpis.rentabilidad.desc;

    // Actualizar KPI 2: Gastos
    const kpiGast = document.getElementById("kpi-gastos-val");
    const kpiGastBadge = document.getElementById("kpi-gastos-badge");
    const kpiGastDesc = document.getElementById("kpi-gastos-desc");
    if (kpiGast) kpiGast.textContent = data.kpis.gastos.valor;
    if (kpiGastBadge) {
      kpiGastBadge.innerHTML = `<i class="fas ${data.kpis.gastos.positivo ? 'fa-arrow-down' : 'fa-arrow-up'}"></i> ${data.kpis.gastos.cambio}`;
      kpiGastBadge.className = `kpi-badge ${data.kpis.gastos.positivo ? 'kpi-badge--positive' : 'kpi-badge--negative'}`;
    }
    if (kpiGastDesc) kpiGastDesc.textContent = data.kpis.gastos.desc;

    // Actualizar KPI 3: Ingresos
    const kpiIng = document.getElementById("kpi-ingresos-val");
    const kpiIngBadge = document.getElementById("kpi-ingresos-badge");
    const kpiIngDesc = document.getElementById("kpi-ingresos-desc");
    if (kpiIng) kpiIng.textContent = data.kpis.ingresos.valor;
    if (kpiIngBadge) {
      kpiIngBadge.innerHTML = `<i class="fas fa-arrow-up"></i> ${data.kpis.ingresos.cambio}`;
      kpiIngBadge.className = `kpi-badge ${data.kpis.ingresos.positivo ? 'kpi-badge--positive' : 'kpi-badge--negative'}`;
    }
    if (kpiIngDesc) kpiIngDesc.textContent = data.kpis.ingresos.desc;

    // Actualizar KPI 4: Flujo de Caja
    const kpiFlujo = document.getElementById("kpi-flujo-val");
    const kpiFlujoBadge = document.getElementById("kpi-flujo-badge");
    const kpiFlujoDesc = document.getElementById("kpi-flujo-desc");
    if (kpiFlujo) kpiFlujo.textContent = data.kpis.flujo.valor;
    if (kpiFlujoBadge) {
      kpiFlujoBadge.innerHTML = `<i class="fas fa-arrow-up"></i> ${data.kpis.flujo.cambio}`;
      kpiFlujoBadge.className = `kpi-badge ${data.kpis.flujo.positivo ? 'kpi-badge--positive' : 'kpi-badge--negative'}`;
    }
    if (kpiFlujoDesc) kpiFlujoDesc.textContent = data.kpis.flujo.desc;

    // Actualizar Proyecciones según escenario actual
    const projData = data.proyeccion[currentScenario];
    if (projData) {
      const projIng = document.getElementById("proj-ingresos");
      const projGast = document.getElementById("proj-gastos");
      const projMarg = document.getElementById("proj-margen");
      if (projIng) projIng.textContent = projData.ingresos;
      if (projGast) projGast.textContent = projData.gastos;
      if (projMarg) projMarg.textContent = projData.margen;
    }

    // Actualizar Gráficos
    initLineChart(data);
    initBarChart(data);
  };

  /* ------------------------------------------------------------------
   * EVENT LISTENERS PARA FILTRO DE PERIODOS
   * ------------------------------------------------------------------ */
  const periodButtons = document.querySelectorAll(".period-filter-btn");
  periodButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      periodButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentPeriod = btn.getAttribute("data-period");
      updateUI();
    });
  });

  /* ------------------------------------------------------------------
   * EVENT LISTENERS PARA ESCENARIOS DE PROYECCIÓN
   * ------------------------------------------------------------------ */
  const scenarioButtons = document.querySelectorAll(".scenario-btn");
  scenarioButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      scenarioButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentScenario = btn.getAttribute("data-scenario");
      const data = dashboardData[currentPeriod];
      const projData = data.proyeccion[currentScenario];
      if (projData) {
        const projIng = document.getElementById("proj-ingresos");
        const projGast = document.getElementById("proj-gastos");
        const projMarg = document.getElementById("proj-margen");
        if (projIng) projIng.textContent = projData.ingresos;
        if (projGast) projGast.textContent = projData.gastos;
        if (projMarg) projMarg.textContent = projData.margen;
      }
    });
  });

  // Render inicial al cargar
  updateUI();
});
