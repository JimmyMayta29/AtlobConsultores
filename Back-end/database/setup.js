/**
 * ATLOB CMS — Database Setup Script
 * 
 * Run this once to create the database and initial data:
 *   node database/setup.js
 * 
 * Make sure DB_PASS is set correctly in .env first!
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Sequelize } = require('sequelize');
const env = require('../config/env.config');

async function setup() {
  console.log('🔧 ATLOB Database Setup');
  console.log('========================\n');

  // Step 1: Connect without database to create it
  console.log('1️⃣  Conectando a MySQL...');
  const rootSequelize = new Sequelize('', env.DB_USER, env.DB_PASS, {
    host: env.DB_HOST,
    port: env.DB_PORT,
    dialect: 'mysql',
    logging: false,
  });

  try {
    await rootSequelize.authenticate();
    console.log('   ✅ Conexión MySQL exitosa');
  } catch (error) {
    console.error('   ❌ No se pudo conectar a MySQL:', error.message);
    console.log('\n   💡 Verifica DB_PASS en el archivo .env');
    process.exit(1);
  }

  // Step 2: Create database
  console.log(`\n2️⃣  Creando base de datos "${env.DB_NAME}"...`);
  try {
    await rootSequelize.query(
      `CREATE DATABASE IF NOT EXISTS \`${env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log('   ✅ Base de datos creada/verificada');
  } catch (error) {
    console.error('   ❌ Error creando base de datos:', error.message);
    process.exit(1);
  }

  await rootSequelize.close();

  // Step 3: Connect to the new database and sync models
  console.log('\n3️⃣  Sincronizando modelos...');
  const { connectDB } = require('../config/db.config');
  require('../models'); // Load all models and associations
  await connectDB();
  console.log('   ✅ Tablas creadas');

  // Step 4: Run seeder
  console.log('\n4️⃣  Ejecutando seeders...');
  const { runSeeder } = require('./seeders/initial.seeder');
  await runSeeder();

  console.log('\n========================');
  console.log('✅ Setup completado!');
  console.log(`\n📌 Database: ${env.DB_NAME}`);
  console.log(`📌 Admin: ${env.ADMIN_EMAIL} / ${env.ADMIN_PASSWORD}`);
  console.log(`\n🚀 Ahora ejecuta: npm run dev`);

  process.exit(0);
}

setup().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
