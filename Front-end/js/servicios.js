
const servicesData = {
  "outsourcing-contable": {
    title: "Outsourcing Contable y Tributario",
    description: "Gestionamos integralmente la contabilidad y obligaciones fiscales de tu empresa, permitiéndote enfocarte en el crecimiento de tu negocio.",
    list: [
      "Registro contable mensual",
      "Declaraciones tributarias mensuales y anuales",
      "Control financiero y reportes periódicos",
      "Asesoría estratégica personalizada"
    ]
  },
  "outsourcing-laboral": {
    title: "Outsourcing Laboral",
    description: "Administramos de forma integral tus planillas y obligaciones laborales con precisión y cumplimiento normativo.",
    list: [
      "Gestión de planillas y nóminas",
      "Cálculo de beneficios sociales",
      "Elaboración de contratos laborales",
      "Cumplimiento de obligaciones con MTPE y SUNAFIL"
    ]
  },
  "constitucion": {
    title: "Constitución de Empresas",
    description: "Te acompañamos paso a paso en la formalización empresarial, asegurando una estructura legal y tributaria óptima.",
    list: [
      "Inscripción registral y notarial",
      "Obtención de RUC y licencias",
      "Estructura tributaria adecuada",
      "Asesoría en régimen empresarial"
    ]
  },
  "legal": {
    title: "Asesoría Legal Corporativa",
    description: "Soporte legal estratégico para proteger y fortalecer tu empresa ante cualquier escenario.",
    list: [
      "Contratos empresariales y comerciales",
      "Defensa administrativa y tributaria",
      "Cumplimiento normativo integral",
      "Resolución de conflictos empresariales"
    ]
  },
  "asesoria-contable": {
    title: "Asesoría Contable",
    description: "Optimizamos tu gestión financiera y contable para mejorar tu rentabilidad y control interno.",
    list: [
      "Análisis financiero integral",
      "Planeación contable estratégica",
      "Control interno y auditoría de procesos",
      "Diagnóstico de situación financiera"
    ]
  },
  "asesoria-tributaria": {
    title: "Asesoría Tributaria",
    description: "Planificación fiscal inteligente que optimiza tu carga impositiva dentro del marco legal vigente.",
    list: [
      "Optimización y planeamiento fiscal",
      "Estrategia tributaria empresarial",
      "Cumplimiento ante SUNAT",
      "Fiscalizaciones y procedimientos tributarios"
    ]
  },
  "auditoria": {
    title: "Auditoría Financiera",
    description: "Evaluamos rigurosamente sus procesos contables y financieros para garantizar transparencia ante socios y cumplimiento normativo ante entidades fiscalizadoras.",
    list: [
      "Auditoría de estados financieros",
      "Control interno operativo",
      "Revisión y prevención pre-fiscalización SUNAT"
    ]
  },
  "reportes": {
    title: "Reportes Automatizados",
    description: "Generamos reportes financieros periódicos de forma automatizada, brindando visibilidad total sobre tu empresa.",
    list: [
      "KPIs financieros personalizados",
      "Análisis de rentabilidad por línea",
      "Información actualizada en tiempo real",
      "Dashboards ejecutivos con Power BI"
    ]
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("serviceModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalDescription = document.getElementById("modalDescription");
  const modalList = document.getElementById("modalList");
  const modalBtn = document.querySelector(".modal-btn");
  const closeBtn = document.querySelector(".close-modal");

  if (!modal || !modalTitle || !modalDescription || !modalList) return;

  // Open modal
  document.querySelectorAll(".supercluster-card[data-service], .btn-pill--service").forEach(card => {
    card.addEventListener("click", (e) => {
      e.stopPropagation();
      // If click was on the button, find the parent card
      const targetCard = e.currentTarget.closest('.supercluster-card') || e.currentTarget;
      const key = targetCard.getAttribute("data-service");
      const service = servicesData[key];
      if (!service) return;

      modalTitle.textContent = service.title;
      modalDescription.textContent = service.description;
      modalList.innerHTML = service.list.map(item => `<li>${item}</li>`).join("");
      
      // Pass the intent to the contact form via URL or directly to whatsapp API
      if(modalBtn) {
        modalBtn.href = `https://wa.me/51940781298?text=Hola,%20deseo%20conocer%20m%C3%A1s%20detalles%20sobre%20${encodeURIComponent(service.title)}`;
        modalBtn.target = "_blank";
        modalBtn.textContent = "Solicitar en WhatsApp";
        modalBtn.innerHTML = '<i class="fab fa-whatsapp"></i> ' + modalBtn.textContent;
        // Optionally restyle it
        modalBtn.style.background = "#25D366";
        modalBtn.style.color = "white";
        // To make it look like our normal button
      }

      modal.classList.add("active");
      document.body.style.overflow = "hidden";
      
      // Focus trap
      closeBtn?.focus();
    });
  });

  // Close modal
  const closeModal = () => {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  };

  closeBtn?.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });
});