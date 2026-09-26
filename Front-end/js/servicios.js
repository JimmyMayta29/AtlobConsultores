/* ═══════════════════════════════════════════════
   SERVICIOS & DIAGNÓSTICOS JS — Consultoría ATLOB
   ═══════════════════════════════════════════════ */

const servicesData = {
  // ─── SERVICIOS PRINCIPALES ───
  "outsourcing-contable": {
    title: "Outsourcing Contable y Tributario",
    description: "Gestionamos integralmente la contabilidad y obligaciones fiscales de tu empresa con automatización de comprobantes, reportes en tiempo real y cumplimiento normativo estricto.",
    list: [
      "Registro contable mensual automatizado",
      "Declaraciones tributarias mensuales (PDT 621, SIRE) y Anuales",
      "Control financiero, balance general y estado de resultados",
      "Asesoría estratégica personalizada y prevención de contingencias"
    ]
  },
  "outsourcing-laboral": {
    title: "Gestión de Planillas y Outsourcing Laboral",
    description: "Administramos de forma integral tus planillas y obligaciones laborales con precisión algorítmica, previniendo sanciones ante SUNAFIL y optimizando sobrecostos laborales.",
    list: [
      "Gestión de planillas electrónicas (PLAME y T-Registro)",
      "Cálculo exacto de CTS, gratificaciones, vacaciones y liquidaciones",
      "Elaboración y registro de contratos laborales según régimen",
      "Asesoría ante fiscalizaciones y cartas inductivas de SUNAFIL"
    ]
  },
  "constitucion": {
    title: "Constitución de Empresas y Estructuración Legal",
    description: "Te acompañamos paso a paso en la formalización empresarial, asegurando una estructura legal y tributaria óptima desde el primer día.",
    list: [
      "Búsqueda, reserva de nombre y minuta notarial",
      "Inscripción en Registros Públicos (SUNARP) y obtención de RUC",
      "Elección del régimen tributario más eficiente (MYPE, Especial, General)",
      "Estructuración de estatutos y protección patrimonial de socios"
    ]
  },
  "legal": {
    title: "Asesoría Legal Corporativa",
    description: "Soporte legal estratégico para proteger y fortalecer tu empresa ante cualquier escenario contractual, societario o administrativo.",
    list: [
      "Elaboración y revisión de contratos comerciales y laborales",
      "Defensa legal ante procedimientos tributarios y contenciosos",
      "Gobierno corporativo, actas de asamblea y poderes",
      "Resolución estratégica de controversias empresariales"
    ]
  },
  "asesoria-contable": {
    title: "Asesoría Contable Permanente",
    description: "Optimizamos tu gestión financiera y contable para mejorar tu rentabilidad, flujo de caja y control interno con soporte continuo.",
    list: [
      "Análisis financiero integral y ratios de gestión",
      "Planeación contable estratégica para toma de decisiones",
      "Auditoría y estandarización de procesos internos",
      "Monitoreo mensual de rentabilidad por línea de negocio"
    ]
  },
  "asesoria-tributaria": {
    title: "Planificación y Asesoría Tributaria",
    description: "Planificación fiscal inteligente que optimiza legalmente tu carga impositiva y te blinda frente a fiscalizaciones de SUNAT.",
    list: [
      "Diseño de planeamiento tributario a medida",
      "Validación de crédito fiscal y deducción de gastos causales",
      "Acompañamiento en fiscalizaciones y requerimientos de SUNAT",
      "Auditoría preventiva de declaraciones e inconsistencias"
    ]
  },
  "auditoria": {
    title: "Auditoría Financiera Independiente",
    description: "Evaluamos rigurosamente sus procesos contables y estados financieros bajo normas NIIF para garantizar transparencia y cumplimiento.",
    list: [
      "Dictamen de estados financieros con validez bancaria e institucional",
      "Evaluación del sistema de control interno y riesgos operativos",
      "Revisión y prevención pre-fiscalización tributaria masiva",
      "Informes de recomendaciones de mejora para la alta dirección"
    ]
  },
  "reportes": {
    title: "Data Interactiva y Dashboards Power BI",
    description: "Convertimos los números de su contabilidad en tableros visuales interactivos para decisiones directivas más rápidas e informadas.",
    list: [
      "KPIs financieros personalizados (Margen, EBITDA, Liquidez)",
      "Análisis comparativo de ingresos vs gastos en tiempo real",
      "Dashboards ejecutivos accesibles desde PC o móvil 24/7",
      "Alertas automáticas de desviaciones presupuestales"
    ]
  },

  // ─── DIAGNÓSTICOS ESPECIALIZADOS ATLOB 2.0 ───
  "diag-tributario": {
    title: "Diagnóstico Tributario & Cumplimiento SUNAT (Tech-Audit)",
    description: "Evaluación exhaustiva de 15 puntos críticos mediante cruce algorítmico de comprobantes electrónicos, propuesta SIRE y declaraciones juradas para eliminar riesgos de multas y reparos.",
    list: [
      "01. Cruce automatizado PDT 621 vs Compras, Ventas, IGV y Renta",
      "02. Validación estricta SIRE (RVIE y RCE) vs archivos XML emitidos",
      "03. Revisión de la correcta utilización del Crédito Fiscal IGV",
      "04. Verificación de coeficiente de Pagos a Cuenta e Impuesto a la Renta",
      "05. Auditoría de operaciones bancarizadas y control de ITF",
      "06. Identificación de deudas tributarias y valores pendientes con SUNAT",
      "07. Detección de multas, intereses y sanciones acumulables",
      "08. Revisión de buzón electrónico, órdenes de pago y resoluciones",
      "09. Validación de cumplimiento de cuotas de fraccionamientos vigentes",
      "10. Auditoría de procesos de fiscalización y requerimientos en curso",
      "11. Detección de omisiones de declaraciones mensuales y anuales",
      "12. Identificación de inconsistencias cruzadas entre libros y facturación",
      "13. Validación del cumplimiento de libros y registros electrónicos obligatorios",
      "14. Revisión de gastos deducibles y principio de causalidad para Renta",
      "15. Matriz de Contingencias y cuantificación económica del riesgo fiscal"
    ]
  },
  "diag-laboral": {
    title: "Diagnóstico Laboral & Blindaje SUNAFIL (Payroll Check)",
    description: "Auditoría integral de 15 checkpoints para blindar la relación laboral, verificar formalidad en PLAME/T-Registro y erradicar contingencias por locadores desnaturalizados.",
    list: [
      "01. Auditoría PLAME: sueldos, aportes AFP/ONP, regímenes y asignaciones",
      "02. Verificación de acreditación y vigencia en REMYPE Laboral",
      "03. Conciliación de altas, modificaciones y bajas en T-Registro",
      "04. Validación de planillas previsionales en AFP Net y declaraciones al día",
      "05. Revisión de contratos laborales temporales y causas objetivas",
      "06. Control de activación de cobertura médica en EsSalud",
      "07. Correcta calificación formal de Personal de Dirección y Confianza",
      "08. Evaluación de riesgo por Locadores de Servicios (Recibos por Honorarios)",
      "09. Plan de regularización contractual para evitar desnaturalizaciones",
      "10. Monitoreo y auditoría de la Casilla Electrónica SUNAFIL",
      "11. Detección de deudas laborales y beneficios sociales no liquidados",
      "12. Verificación de convenios y fraccionamientos laborales",
      "13. Elaboración de estrategia de respuesta ante cartas inductivas",
      "14. Validación de existencia de RIT, MOF y Libro de Reclamaciones",
      "15. Registro obligatorio de Seguro Vida Ley en el Portal MINTRA"
    ]
  },
  "diag-societario": {
    title: "Diagnóstico Societario & Gobierno Corporativo",
    description: "Evaluación de 10 aspectos clave de la estructura societaria y patrimonial para prevenir pérdidas de beneficios tributarios y blindar el patrimonio de los socios.",
    list: [
      "01. Composición societaria y porcentajes de participación actualizados",
      "02. Mapeo de socios en común con otras empresas del sector",
      "03. Evaluación de supuestos de Vinculación Económica (Art. 24 LIR)",
      "04. Detección de indicios de Grupo Económico y topes de ingresos MYPE",
      "05. Verificación de vigencia de poderes de gerentes y apoderados en SUNARP",
      "06. Revisión de transferencias de participaciones y aumentos de capital",
      "07. Estructura empresarial relacionada y préstamos socio-sociedad",
      "08. Detección de alertas legales frente a regímenes tributarios especiales",
      "09. Clasificación cuantitativa del nivel de riesgo societario",
      "10. Hoja de ruta y recomendaciones legales corporativas preventivas"
    ]
  },
  "diag-360": {
    title: "Diagnóstico ATLOB 360° (Full Enterprise Tech-Audit)",
    description: "La suite definitiva para directores y gerentes generales: consolida la auditoría Tributaria, Laboral, Societaria y un diagnóstico de Salud Financiera con Dashboard en Power BI.",
    list: [
      "01. Todos los 15 puntos del Diagnóstico Tributario & SUNAT",
      "02. Todos los 15 puntos del Diagnóstico Laboral & SUNAFIL",
      "03. Todos los 10 puntos del Diagnóstico Societario & Corporativo",
      "04. Análisis de Salud Financiera: Liquidez, Solvencia y Capital de Trabajo",
      "05. Detección de fuga de márgenes y optimización de estructura de costos",
      "06. Dashboard Ejecutivo Interactivo en Power BI con semáforos de riesgo",
      "07. Plan Maestro de Blindaje Empresarial priorizado por impacto económico",
      "08. Sesión privada 1 a 1 de entrega de resultados con directores de ATLOB"
    ]
  }
};

document.addEventListener("DOMContentLoaded", () => {

  /* ================================================
     1. MODAL DE DETALLES DE SERVICIOS Y DIAGNÓSTICOS
     ================================================ */
  const modal = document.getElementById("serviceModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalDescription = document.getElementById("modalDescription");
  const modalList = document.getElementById("modalList");
  const modalBtn = document.querySelector(".modal-btn");
  const closeBtn = document.querySelector(".close-modal");

  const openServiceModal = (key) => {
    const service = servicesData[key];
    if (!service || !modal || !modalTitle || !modalDescription || !modalList) return;

    modalTitle.textContent = service.title;
    modalDescription.textContent = service.description;
    modalList.innerHTML = service.list.map(item => `<li><i class="fas fa-check-circle" style="color: var(--azul-apple); margin-right: 8px;"></i> ${item}</li>`).join("");

    if (modalBtn) {
      modalBtn.href = `https://wa.me/51940781298?text=Hola,%20deseo%20solicitar%20el%20servicio%20de%20*${encodeURIComponent(service.title)}*%20en%20Consultor%C3%ADa%20ATLOB.`;
      modalBtn.target = "_blank";
      modalBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Solicitar Asesoría por WhatsApp';
      modalBtn.className = "btn-apple-primary modal-btn";
    }

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
    closeBtn?.focus();
  };

  // Click on service cards or buttons with data-service
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-service]");
    if (!trigger) return;
    const key = trigger.getAttribute("data-service");
    if (key && servicesData[key]) {
      e.preventDefault();
      openServiceModal(key);
    }
  });

  // Close modal
  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove("active");
    document.body.style.overflow = "";
  };

  closeBtn?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal?.classList.contains("active")) {
      closeModal();
    }
  });

  /* ================================================
     2. SEGMENTED TABS CONTROLLER (DIAGNÓSTICOS)
     ================================================ */
  const tabButtons = document.querySelectorAll(".diag-tab-btn");
  const tabPanels = document.querySelectorAll(".diag-panel");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");
      if (!targetTab) return;

      tabButtons.forEach(b => b.classList.remove("active"));
      tabPanels.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const activePanel = document.getElementById(`diag-panel-${targetTab}`);
      if (activePanel) {
        activePanel.classList.add("active");
      }
    });
  });

  /* ================================================
     3. TEST DE AUTODIAGNÓSTICO EXPRESS INTERACTIVO
     ================================================ */
  const autoDiagForm = document.getElementById("autodiag-form");
  if (autoDiagForm) {
    const switches = autoDiagForm.querySelectorAll('input[type="radio"], input[type="checkbox"]');
    const scoreVal = document.getElementById("autodiag-score-val");
    const statusVal = document.getElementById("autodiag-status-val");
    const descVal = document.getElementById("autodiag-desc-val");
    const btnWhatsApp = document.getElementById("autodiag-btn-wa");
    const gaugeBar = document.getElementById("autodiag-gauge-bar");

    const calculateRisk = () => {
      let riskPoints = 0;
      let issuesFound = [];

      // Q1: SIRE / Declaraciones
      const q1 = autoDiagForm.querySelector('input[name="q_sire"]:checked')?.value;
      if (q1 === "no") {
        riskPoints += 30;
        issuesFound.push("Sin validación cruzada SIRE vs Comprobantes");
      } else if (q1 === "duda") {
        riskPoints += 15;
        issuesFound.push("Inconsistencias potenciales en SIRE / PDT 621");
      }

      // Q2: Locadores / Planillas
      const q2 = autoDiagForm.querySelector('input[name="q_locadores"]:checked')?.value;
      if (q2 === "si") {
        riskPoints += 30;
        issuesFound.push("Riesgo crítico de desnaturalización de locadores (RPH)");
      } else if (q2 === "duda") {
        riskPoints += 15;
        issuesFound.push("Contratos de locación sin evaluación preventiva");
      }

      // Q3: Socios en común / Vinculación
      const q3 = autoDiagForm.querySelector('input[name="q_socios"]:checked')?.value;
      if (q3 === "si") {
        riskPoints += 25;
        issuesFound.push("Riesgo de vinculación económica y pérdida de régimen MYPE");
      } else if (q3 === "duda") {
        riskPoints += 10;
        issuesFound.push("Estructura societaria no auditada");
      }

      // Q4: Bancarización / Gastos
      const q4 = autoDiagForm.querySelector('input[name="q_bancarizacion"]:checked')?.value;
      if (q4 === "si") {
        riskPoints += 25;
        issuesFound.push("Pagos en efectivo > S/2,000 o gastos sin causalidad");
      } else if (q4 === "duda") {
        riskPoints += 10;
        issuesFound.push("Dudas en bancarización y deducción de gastos");
      }

      // Max 100
      riskPoints = Math.min(riskPoints, 100);

      // Update UI
      if (scoreVal) scoreVal.textContent = `${riskPoints}%`;
      if (gaugeBar) gaugeBar.style.width = `${riskPoints}%`;

      let statusText = "Riesgo Bajo";
      let statusColor = "#27ae60";
      let descText = "Tu empresa mantiene un buen estándar preventivo. Recomendamos una auditoría de rutina anual.";

      if (riskPoints >= 60) {
        statusText = "Riesgo Crítico / Urgente";
        statusColor = "#e74c3c";
        descText = "Exposición alta a multas de SUNAT / SUNAFIL y reparos fiscales. Se recomienda un Diagnóstico Integral urgente.";
      } else if (riskPoints >= 30) {
        statusText = "Riesgo Moderado";
        statusColor = "#f39c12";
        descText = "Existen inconsistencias operativas que pueden derivar en sanciones. Te recomendamos un Diagnóstico Tributario o Laboral.";
      }

      if (statusVal) {
        statusVal.textContent = statusText;
        statusVal.style.color = statusColor;
      }
      if (gaugeBar) {
        gaugeBar.style.background = statusColor;
      }
      if (descVal) {
        descVal.textContent = descText;
      }

      if (btnWhatsApp) {
        const issuesSummary = issuesFound.length > 0 
          ? issuesFound.join(", ") 
          : "Control preventivo general";
        const message = `Hola Consultoría ATLOB, realicé el Test de Autodiagnóstico en su web y obtuve un ${riskPoints}% de nivel de riesgo (${statusText}). Alertas identificadas: ${issuesSummary}. Deseo agendar un Diagnóstico Especializado para mi empresa.`;
        btnWhatsApp.href = `https://wa.me/51940781298?text=${encodeURIComponent(message)}`;
      }
    };

    switches.forEach(sw => {
      sw.addEventListener("change", calculateRisk);
    });

    // Run initial calculation
    calculateRisk();
  }

});