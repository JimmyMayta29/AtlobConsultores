const { Subscriber } = require('../models');
const { sendEmail } = require('../services/email.service');
const logger = require('../utils/logger');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Subscribe a new email to the newsletter
 * POST /api/newsletter/subscribe
 */
const subscribe = async (req, res, next) => {
  try {
    const rawEmail = req.body.email;
    const source = req.body.source || 'footer_form';

    if (!rawEmail || typeof rawEmail !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Por favor, ingrese un correo electrónico válido.',
      });
    }

    const email = rawEmail.trim().toLowerCase();

    if (!emailRegex.test(email) || email.length > 254) {
      return res.status(400).json({
        success: false,
        message: 'El formato del correo electrónico no es válido.',
      });
    }

    // Check if already subscribed
    const existing = await Subscriber.findOne({ where: { email } });
    if (existing) {
      return res.status(200).json({
        success: true,
        alreadySubscribed: true,
        message: '¡Este correo ya se encuentra suscrito! Continuarás recibiendo nuestras actualizaciones sobre normativa tributaria y contabilidad.',
      });
    }

    // Save subscriber
    const newSubscriber = await Subscriber.create({
      email,
      status: 'active',
      source,
    });

    logger.info(`📧 Nuevo suscriptor al boletín: ${email}`);

    // Try sending welcome email asynchronously (non-blocking)
    sendEmail({
      to: email,
      subject: 'Bienvenido al Boletín Informativo — Consultoría ATLOB',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
          <div style="background: #0a2a47; padding: 25px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 0.5px;">Consultoría ATLOB</h1>
            <p style="color: #f2b705; margin: 5px 0 0 0; font-size: 14px;">Soluciones Contables Estratégicas</p>
          </div>
          <div style="padding: 30px 25px; color: #334155; line-height: 1.6;">
            <h2 style="color: #0a2a47; margin-top: 0;">¡Gracias por suscribirte a nuestro boletín!</h2>
            <p>A partir de ahora recibirás en tu correo información clave para tu empresa o práctica profesional:</p>
            <ul style="padding-left: 20px;">
              <li><strong>Cronogramas SUNAT:</strong> Fechas límites de IGV, Renta y libros electrónicos.</li>
              <li><strong>Casos Prácticos:</strong> Asientos contables y aplicación del PCGE y NIIF.</li>
              <li><strong>Actualizaciones Laborales:</strong> PLAME, T-Registro, gratificaciones y CTS.</li>
              <li><strong>Planificación Fiscal:</strong> Consejos para optimizar la carga impositiva.</li>
            </ul>
            <p style="margin-top: 25px;">Si tienes consultas contables o tributarias inmediatas, nuestro equipo está a tu disposición en Jauja y todo el Perú.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://wa.me/51940781298" style="background: #0a2a47; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 30px; font-weight: 600; display: inline-block;">Consultar con un Experto</a>
            </div>
          </div>
          <div style="background: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
            © 2026 Consultoría ATLOB — Jauja, Junín, Perú.<br>Recibes este correo porque te suscribiste desde nuestro sitio web oficial.
          </div>
        </div>
      `,
      text: '¡Gracias por suscribirte al boletín de Consultoría ATLOB! Recibirás nuestras novedades normativas, tributarias y contables.',
    }).catch(err => {
      logger.warn(`No se pudo enviar email de bienvenida: ${err.message}`);
    });

    return res.status(201).json({
      success: true,
      alreadySubscribed: false,
      message: '¡Gracias por suscribirte! Te enviaremos las últimas noticias tributarias, contables y normativas SUNAT.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all subscribers (Admin)
 * GET /api/newsletter/subscribers
 */
const getSubscribers = async (req, res, next) => {
  try {
    const list = await Subscriber.findAll();
    return res.json({
      success: true,
      data: list,
      count: list.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  subscribe,
  getSubscribers,
};
