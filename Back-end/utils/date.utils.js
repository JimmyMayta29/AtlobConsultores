const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/**
 * Format a date in Peruvian style: "20 Abril, 2026"
 * @param {Date|string} date
 * @returns {string}
 */
const formatDatePeru = (date) => {
  const d = new Date(date);
  const day = d.getDate();
  const month = MONTHS_ES[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month}, ${year}`;
};

/**
 * Get current date/time in Peru timezone (UTC-5)
 * @returns {Date}
 */
const nowPeru = () => {
  const now = new Date();
  const peruOffset = -5 * 60; // minutes
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + peruOffset * 60000);
};

/**
 * Format a date as ISO string for DB storage
 * @param {Date} date
 * @returns {string}
 */
const toISOPeru = (date) => {
  return new Date(date).toISOString();
};

/**
 * Get relative time string: "hace 2 horas", "hace 3 días"
 * @param {Date|string} date
 * @returns {string}
 */
const timeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 30) return formatDatePeru(date);
  if (diffDays > 1) return `hace ${diffDays} días`;
  if (diffDays === 1) return 'ayer';
  if (diffHours > 1) return `hace ${diffHours} horas`;
  if (diffHours === 1) return 'hace 1 hora';
  if (diffMins > 1) return `hace ${diffMins} minutos`;
  return 'hace un momento';
};

module.exports = { formatDatePeru, nowPeru, toISOPeru, timeAgo, MONTHS_ES };
