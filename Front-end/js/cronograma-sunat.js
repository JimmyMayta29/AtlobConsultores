/**
 * Widget de Cronograma SUNAT 2026 — Consultoría ATLOB
 */

document.addEventListener('DOMContentLoaded', () => {
    const sunatWidget = document.getElementById('cronograma-sunat-widget');
    if (!sunatWidget) return;

    // Cronograma estimado oficial mensual referencial
    const CALENDARIO_SUNAT = {
        '0': { fecha: '15 de cada mes', periodo: 'Ene - Dic 2026', estado: 'Vence pronto', alerta: 'Cargar SIRE 48h antes' },
        '1': { fecha: '16 de cada mes', periodo: 'Ene - Dic 2026', estado: 'Vence pronto', alerta: 'Cargar SIRE 48h antes' },
        '2': { fecha: '17 de cada mes', periodo: 'Ene - Dic 2026', estado: 'Regular', alerta: 'Verificar comprobantes de compras' },
        '3': { fecha: '18 de cada mes', periodo: 'Ene - Dic 2026', estado: 'Regular', alerta: 'Verificar comprobantes de compras' },
        '4': { fecha: '19 de cada mes', periodo: 'Ene - Dic 2026', estado: 'Regular', alerta: 'Revisar inconsistencias en propuesta' },
        '5': { fecha: '20 de cada mes', periodo: 'Ene - Dic 2026', estado: 'Regular', alerta: 'Revisar inconsistencias en propuesta' },
        '6': { fecha: '21 de cada mes', periodo: 'Ene - Dic 2026', estado: 'Plazo amplio', alerta: 'Generar preliminar de Renta e IGV' },
        '7': { fecha: '22 de cada mes', periodo: 'Ene - Dic 2026', estado: 'Plazo amplio', alerta: 'Generar preliminar de Renta e IGV' },
        '8': { fecha: '23 de cada mes', periodo: 'Ene - Dic 2026', estado: 'Plazo amplio', alerta: 'Validar detracciones pagadas' },
        '9': { fecha: '24 de cada mes', periodo: 'Ene - Dic 2026', estado: 'Último grupo ordinario', alerta: 'Validar detracciones pagadas' },
        'buenos': { fecha: '26 de cada mes', periodo: 'Ene - Dic 2026', estado: 'Prórroga especial', alerta: 'Beneficio exclusivo para Buenos Contribuyentes' }
    };

    const buttons = sunatWidget.querySelectorAll('.digit-btn');
    const displayFecha = document.getElementById('sunat-res-fecha');
    const displayDigito = document.getElementById('sunat-res-digito');
    const displayAlerta = document.getElementById('sunat-res-alerta');
    const displayEstado = document.getElementById('sunat-res-estado');

    const updateDigit = (digit) => {
        buttons.forEach(btn => {
            if (btn.dataset.digit === digit) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        const data = CALENDARIO_SUNAT[digit] || CALENDARIO_SUNAT['0'];
        if (displayFecha) displayFecha.textContent = data.fecha;
        if (displayDigito) displayDigito.textContent = digit === 'buenos' ? 'Buenos Contribuyentes' : `Último dígito: ${digit}`;
        if (displayAlerta) displayAlerta.textContent = data.alerta;
        if (displayEstado) displayEstado.textContent = data.estado;
    };

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            updateDigit(btn.dataset.digit);
        });
    });

    // Default to digit 0
    updateDigit('0');
});
