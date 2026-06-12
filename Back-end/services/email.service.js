const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;
const env = require('../config/env.config');
const logger = require('../utils/logger');

/**
 * Create a reusable transporter
 * Returns null if SMTP not configured
 */
const createTransporter = () => {
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    logger.warn('⚠️ SMTP no configurado — emails deshabilitados');
    return null;
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
};

let transporter = null;

/**
 * Get or create the transporter singleton
 */
const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

/**
 * Send an email
 * @param {Object} options - { to, subject, html, text }
 * @returns {Promise<boolean>}
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const transport = getTransporter();
  if (!transport) {
    logger.warn(`Email no enviado (SMTP no configurado): ${subject}`);
    return false;
  }

  try {
    await transport.sendMail({
      from: env.SMTP_FROM,
      to,
      subject,
      html,
      text: text || '',
    });

    logger.info(`Email enviado a ${to}: ${subject}`);
    return true;
  } catch (error) {
    logger.error(`Error enviando email a ${to}:`, error.message);
    return false;
  }
};

/**
 * Send newsletter with latest articles
 * @param {Array} subscribers - Array of email strings
 * @param {Array} articles - Latest articles
 */
const sendNewsletter = async (subscribers, articles) => {
  // Load newsletter template
  const templatePath = path.join(__dirname, '..', 'templates', 'newsletter.template.html');

  let template;
  try {
    template = await fs.readFile(templatePath, 'utf-8');
  } catch {
    logger.error('Newsletter template not found');
    return;
  }

  // Build articles HTML
  const articlesHtml = articles.map(a => `
    <tr>
      <td style="padding: 20px 0; border-bottom: 1px solid #eee;">
        <h3 style="margin: 0 0 8px; color: #0a2a47; font-size: 18px;">
          <a href="https://atlob.com/revista/${a.slug}" style="color: #0a2a47; text-decoration: none;">${a.title}</a>
        </h3>
        <p style="margin: 0; color: #666; font-size: 14px;">${a.excerpt || ''}</p>
      </td>
    </tr>
  `).join('');

  const html = template.replace('{{ARTICLES}}', articlesHtml);

  for (const email of subscribers) {
    await sendEmail({
      to: email,
      subject: '📰 Nueva edición — Revista ATLOB',
      html,
    });
  }
};

module.exports = { sendEmail, sendNewsletter, getTransporter };
