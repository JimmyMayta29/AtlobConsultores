/**
 * Calculadora Laboral Empresarial — Consultoría ATLOB
 * Fórmulas adaptadas a la legislación laboral peruana (DL 728 y Ley MYPE 30056)
 */

document.addEventListener('DOMContentLoaded', () => {
    const calcContainer = document.getElementById('calculadora-laboral');
    if (!calcContainer) return;

    const sueldoInput = document.getElementById('calc-sueldo');
    const regimenSelect = document.getElementById('calc-regimen');
    const asigFamCheckbox = document.getElementById('calc-asig-fam');
    const btnConsultar = document.getElementById('calc-btn-whatsapp');

    // RMV 2026 en Perú: S/ 1,025.00 -> Asignación familiar 10% = S/ 102.50
    const RMV = 1025.00;
    const ASIG_FAMILIAR_VAL = 102.50;

    const formatCurrency = (val) => {
        return 'S/ ' + Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const calcularCostos = () => {
        let sueldoBase = parseFloat(sueldoInput.value) || 0;
        if (sueldoBase < 0) sueldoBase = 0;

        const regimen = regimenSelect.value; // 'general', 'pequena', 'micro'
        const tieneAsigFam = asigFamCheckbox.checked;

        const asigFam = tieneAsigFam ? ASIG_FAMILIAR_VAL : 0;
        const remuneracionComputable = sueldoBase + asigFam;

        let gratiMensual = 0;
        let bonifExtraMensual = 0;
        let ctsMensual = 0;
        let vacacMensual = 0;
        let essaludMensual = 0;
        let vidaLeyMensual = remuneracionComputable * 0.007; // ~0.7% promedio

        if (regimen === 'general') {
            // Régimen General (Ley 728)
            // Grati = 2 sueldos al año -> mensual = Rem / 6
            gratiMensual = (remuneracionComputable * 2) / 12;
            bonifExtraMensual = gratiMensual * 0.09; // 9% Ley 29351 / 30334
            
            // CTS = 1 sueldo + 1/6 Grati al año -> mensual = (Rem + Rem/6) / 12
            const baseCTS = remuneracionComputable + (remuneracionComputable / 6);
            ctsMensual = baseCTS / 12;

            // Vacaciones = 30 días = 1 sueldo anual -> Rem / 12
            vacacMensual = remuneracionComputable / 12;

            // EsSalud = 9% de la remuneración mensual
            essaludMensual = remuneracionComputable * 0.09;

        } else if (regimen === 'pequena') {
            // Pequeña Empresa (Ley MYPE)
            // Grati = 50% (1/2 sueldo en Julio + 1/2 en Dic = 1 sueldo anual) -> Rem / 12
            gratiMensual = remuneracionComputable / 12;
            bonifExtraMensual = gratiMensual * 0.09;

            // CTS = 15 días por año (máximo 90 días) -> 0.5 sueldo anual -> (Rem * 0.5) / 12
            ctsMensual = (remuneracionComputable * 0.5) / 12;

            // Vacaciones = 15 días anuales -> (Rem * 0.5) / 12
            vacacMensual = (remuneracionComputable * 0.5) / 12;

            // EsSalud = 9%
            essaludMensual = remuneracionComputable * 0.09;

        } else if (regimen === 'micro') {
            // Microempresa (Ley MYPE)
            // No tiene derecho a Grati ni CTS
            gratiMensual = 0;
            bonifExtraMensual = 0;
            ctsMensual = 0;

            // Vacaciones = 15 días -> (Rem * 0.5) / 12
            vacacMensual = (remuneracionComputable * 0.5) / 12;

            // EsSalud = 9% (o SIS)
            essaludMensual = remuneracionComputable * 0.09;
            vidaLeyMensual = 0;
        }

        const totalBeneficiosMensual = gratiMensual + bonifExtraMensual + ctsMensual + vacacMensual;
        const totalAportesEmpleador = essaludMensual + vidaLeyMensual;
        const costoTotalMensual = remuneracionComputable + totalBeneficiosMensual + totalAportesEmpleador;
        const sobrecostoPorcentaje = remuneracionComputable > 0 ? ((costoTotalMensual - remuneracionComputable) / remuneracionComputable) * 100 : 0;

        // Update DOM
        document.getElementById('res-rem-bruta').textContent = formatCurrency(remuneracionComputable);
        document.getElementById('res-grati').textContent = formatCurrency(gratiMensual * 6); // Grati semestral
        document.getElementById('res-cts').textContent = formatCurrency(ctsMensual * 6); // CTS semestral
        document.getElementById('res-vacaciones').textContent = formatCurrency(vacacMensual * 12); // Vacaciones anuales
        document.getElementById('res-essalud').textContent = formatCurrency(essaludMensual);
        document.getElementById('res-costo-total').textContent = formatCurrency(costoTotalMensual);
        document.getElementById('res-costo-anual').textContent = formatCurrency(costoTotalMensual * 12);
        document.getElementById('res-sobrecosto').textContent = `+${sobrecostoPorcentaje.toFixed(1)}%`;

        // Update WhatsApp CTA text with summary
        if (btnConsultar) {
            const regName = regimen === 'general' ? 'Régimen General' : (regimen === 'pequena' ? 'Pequeña Empresa MYPE' : 'Microempresa MYPE');
            const msg = `👋 *Hola Consultoría ATLOB*, coticé en su simulador laboral:\n` +
                        `💼 *Régimen:* ${regName}\n` +
                        `💵 *Sueldo Base:* S/ ${sueldoBase.toFixed(2)}\n` +
                        `👨‍👩‍👧 *Asig. Familiar:* ${tieneAsigFam ? 'Sí' : 'No'}\n` +
                        `📊 *Costo Empresa Mensual Estimado:* ${formatCurrency(costoTotalMensual)}\n\n` +
                        `Deseo asesoría para la gestión y optimización de mi planilla.`;
            btnConsultar.href = `https://wa.me/51940781298?text=${encodeURIComponent(msg)}`;
        }
    };

    // Event listeners
    sueldoInput.addEventListener('input', calcularCostos);
    regimenSelect.addEventListener('change', calcularCostos);
    asigFamCheckbox.addEventListener('change', calcularCostos);

    // Initial calculation
    calcularCostos();
});
