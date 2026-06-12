const { User, Category, Tag } = require('../../models');
const env = require('../../config/env.config');
const logger = require('../../utils/logger');

/**
 * Initial seeder — creates admin user and base categories
 * Only runs if no admin user exists (idempotent)
 */
const runSeeder = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    if (adminExists) {
      logger.debug('Seeder: Admin ya existe, omitiendo.');
      return;
    }

    logger.info('🌱 Ejecutando seeder inicial...');

    // Create admin user
    await User.create({
      name: env.ADMIN_NAME,
      email: env.ADMIN_EMAIL,
      password: env.ADMIN_PASSWORD,
      role: 'admin',
      isActive: true,
      bio: 'Administrador del sistema de Consultoría ATLOB.',
    });
    logger.info(`✅ Admin creado: ${env.ADMIN_EMAIL}`);

    // Create base categories
    const categories = [
      {
        name: 'Tributario',
        slug: 'tributario',
        description: 'Normativa tributaria, SUNAT, IGV, Renta y planificación fiscal.',
        color: '#2563eb',
        icon: 'fas fa-balance-scale',
        order: 1,
      },
      {
        name: 'Contabilidad',
        slug: 'contabilidad',
        description: 'Asientos contables, casos prácticos, PCGE y estados financieros.',
        color: '#059669',
        icon: 'fas fa-calculator',
        order: 2,
      },
      {
        name: 'Auditoría',
        slug: 'auditoria',
        description: 'Auditoría financiera, NIIF, control interno y normas internacionales.',
        color: '#d97706',
        icon: 'fas fa-search-dollar',
        order: 3,
      },
      {
        name: 'Laboral',
        slug: 'laboral',
        description: 'Gestión de planillas, beneficios sociales, PLAME y normativa laboral.',
        color: '#dc2626',
        icon: 'fas fa-users',
        order: 4,
      },
    ];

    for (const cat of categories) {
      await Category.findOrCreate({
        where: { slug: cat.slug },
        defaults: cat,
      });
    }
    logger.info('✅ Categorías base creadas');

    // Create initial tags
    const tags = [
      { name: 'SUNAT', slug: 'sunat' },
      { name: 'IGV', slug: 'igv' },
      { name: 'Renta', slug: 'renta' },
      { name: 'NIIF', slug: 'niif' },
      { name: 'PCGE', slug: 'pcge' },
      { name: 'Planillas', slug: 'planillas' },
      { name: 'PLAME', slug: 'plame' },
      { name: 'Excel', slug: 'excel' },
      { name: 'Casos Prácticos', slug: 'casos-practicos' },
      { name: 'Multas', slug: 'multas' },
    ];

    for (const tag of tags) {
      await Tag.findOrCreate({
        where: { slug: tag.slug },
        defaults: tag,
      });
    }
    logger.info('✅ Tags iniciales creados');

    logger.info('🌱 Seeder completado exitosamente');
  } catch (error) {
    logger.error('Error en seeder:', error.message);
  }
};

module.exports = { runSeeder };
