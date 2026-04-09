/**
 * =============================================================================
 * SCRIPT DE MIGRACIÓN: Supabase (PostgreSQL) → MongoDB
 * =============================================================================
 *
 * INSTRUCCIONES:
 * 1. Asegúrate de tener el archivo .env con MONGODB_URI correcta.
 * 2. Añade al .env las siguientes variables de Supabase:
 *      SUPABASE_URL=https://TU_PROYECTO.supabase.co
 *      SUPABASE_SERVICE_KEY=TU_SERVICE_ROLE_KEY  (NO la anon key)
 * 3. Ejecuta con: node scripts/migrate.js
 *
 * ORDEN DE MIGRACIÓN (respetando dependencias):
 *   1. units_of_measure
 *   2. raw_materials  (depende de units)
 *   3. products
 *   4. recipes        (depende de products, raw_materials, units)
 *   5. purchases      (depende de raw_materials)
 *   6. productions    (depende de products)
 *   7. sales          (depende de products)
 *   8. roles          (tabla: rol)
 *   9. users          (tabla: user)
 *   10. user_roles    (tabla: user_rol, depende de users y roles)
 * =============================================================================
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { createClient } = require('@supabase/supabase-js');

// ─── Modelos de Mongoose ──────────────────────────────────────────────────────
const Unit       = require('../src/models/Unit');
const RawMaterial  = require('../src/models/RawMaterial');
const Product    = require('../src/models/Product');
const Recipe     = require('../src/models/Recipe');
const Purchase   = require('../src/models/Purchase');
const Production = require('../src/models/Production');
const Sale       = require('../src/models/Sale');
const Role       = require('../src/models/Role');
const User       = require('../src/models/User');
const UserRole   = require('../src/models/UserRole');

// ─── Configuración ────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY; // Service Role Key
const MONGODB_URI  = process.env.MONGODB_URI;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Faltan SUPABASE_URL y/o SUPABASE_SERVICE_KEY en el .env');
  process.exit(1);
}
if (!MONGODB_URI) {
  console.error('❌ Falta MONGODB_URI en el .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Mapas de IDs viejos (int) → nuevos (ObjectId) ───────────────────────────
const unitMap        = new Map(); // supabase_id → mongo_id
const rawMaterialMap = new Map();
const productMap     = new Map();
const roleMap        = new Map();
const userMap        = new Map();

// ─── Helpers ─────────────────────────────────────────────────────────────────
function log(msg)   { console.log(`  ✅ ${msg}`); }
function warn(msg)  { console.warn(`  ⚠️  ${msg}`); }
function error(msg) { console.error(`  ❌ ${msg}`); }

async function fetchAll(table) {
  const { data, error: err } = await supabase.from(table).select('*');
  if (err) throw new Error(`Error leyendo tabla "${table}": ${err.message}`);
  return data || [];
}

// ─── Funciones de migración por colección ─────────────────────────────────────

async function migrateUnits() {
  console.log('\n📦 Migrando units_of_measure...');
  const rows = await fetchAll('units_of_measure');

  for (const row of rows) {
    const doc = await Unit.create({
      name: row.name,
      abbreviation: row.abbreviation || '',
      created_at: row.created_at,
    });
    unitMap.set(row.id, doc._id);
  }
  log(`${rows.length} unidades migradas.`);
}

async function migrateRawMaterials() {
  console.log('\n📦 Migrando raw_materials...');
  const rows = await fetchAll('raw_materials');

  for (const row of rows) {
    const unitMongoId = unitMap.get(row.unit_id);
    if (!unitMongoId) {
      warn(`RawMaterial id=${row.id} omitida: unit_id ${row.unit_id} no encontrada.`);
      continue;
    }
    const doc = await RawMaterial.create({
      name: row.name,
      unit_id: unitMongoId,
      created_at: row.created_at,
    });
    rawMaterialMap.set(row.id, doc._id);
  }
  log(`${rawMaterialMap.size} materias primas migradas.`);
}

async function migrateProducts() {
  console.log('\n📦 Migrando products...');
  const rows = await fetchAll('products');

  for (const row of rows) {
    const doc = await Product.create({
      name: row.name,
      description: row.description || '',
      created_at: row.created_at,
    });
    productMap.set(row.id, doc._id);
  }
  log(`${rows.length} productos migrados.`);
}

async function migrateRecipes() {
  console.log('\n📦 Migrando recipes...');
  const rows = await fetchAll('recipes');
  let ok = 0, skipped = 0;

  for (const row of rows) {
    const productId     = productMap.get(row.product_id);
    const rawMaterialId = rawMaterialMap.get(row.raw_material_id);
    const unitId        = unitMap.get(row.unit_id);

    if (!productId || !rawMaterialId || !unitId) {
      warn(`Recipe id=${row.id} omitida: referencia(s) faltantes.`);
      skipped++;
      continue;
    }

    await Recipe.create({
      product_id: productId,
      raw_material_id: rawMaterialId,
      required_quantity: row.required_quantity,
      unit_id: unitId,
      created_at: row.created_at,
    });
    ok++;
  }
  log(`${ok} recetas migradas. ${skipped} omitidas.`);
}

async function migratePurchases() {
  console.log('\n📦 Migrando purchases...');
  const rows = await fetchAll('purchases');
  let ok = 0, skipped = 0;

  for (const row of rows) {
    const rawMaterialId = rawMaterialMap.get(row.raw_material_id);
    if (!rawMaterialId) {
      warn(`Purchase id=${row.id} omitida: raw_material_id ${row.raw_material_id} no encontrada.`);
      skipped++;
      continue;
    }
    await Purchase.create({
      raw_material_id: rawMaterialId,
      quantity: row.quantity,
      total_cost: row.total_cost,
      purchase_date: row.purchase_date,
      created_at: row.created_at,
    });
    ok++;
  }
  log(`${ok} compras migradas. ${skipped} omitidas.`);
}

async function migrateProductions() {
  console.log('\n📦 Migrando productions...');
  const rows = await fetchAll('productions');
  let ok = 0, skipped = 0;

  for (const row of rows) {
    const productId = productMap.get(row.product_id);
    if (!productId) {
      warn(`Production id=${row.id} omitida: product_id ${row.product_id} no encontrada.`);
      skipped++;
      continue;
    }
    await Production.create({
      product_id: productId,
      quantity_produced: row.quantity_produced,
      unit_production_cost: row.unit_production_cost || 0,
      production_date: row.production_date,
      created_at: row.created_at,
    });
    ok++;
  }
  log(`${ok} producciones migradas. ${skipped} omitidas.`);
}

async function migrateSales() {
  console.log('\n📦 Migrando sales...');
  const rows = await fetchAll('sales');
  let ok = 0, skipped = 0;

  for (const row of rows) {
    const productId = productMap.get(row.product_id);
    if (!productId) {
      warn(`Sale id=${row.id} omitida: product_id ${row.product_id} no encontrada.`);
      skipped++;
      continue;
    }
    await Sale.create({
      product_id: productId,
      quantity_sold: row.quantity_sold,
      unit_sale_price: row.unit_sale_price,
      weighted_average_cost_at_sale: row.weighted_average_cost_at_sale || 0,
      sale_date: row.sale_date,
      created_at: row.created_at,
    });
    ok++;
  }
  log(`${ok} ventas migradas. ${skipped} omitidas.`);
}

async function migrateRoles() {
  console.log('\n📦 Migrando roles (tabla: rol)...');
  const rows = await fetchAll('rol');

  for (const row of rows) {
    const doc = await Role.create({
      rol_name: row.rol_name,
      rol_state: row.rol_state || 'active',
      created_at: row.created_at,
    });
    roleMap.set(row.rol_id, doc._id);
  }
  log(`${rows.length} roles migrados.`);
}

async function migrateUsers() {
  console.log('\n📦 Migrando users (tabla: user)...');
  const rows = await fetchAll('user');

  for (const row of rows) {
    const doc = await User.create({
      user_name: row.user_name,
      user_email: row.user_email,
      user_state: row.user_state || 'active',
      // appwrite_id se puede asignar manualmente luego
      created_at: row.created_at,
    });
    userMap.set(row.user_id, doc._id);
  }
  log(`${rows.length} usuarios migrados.`);
}

async function migrateUserRoles() {
  console.log('\n📦 Migrando user_roles (tabla: user_rol)...');
  const rows = await fetchAll('user_rol');
  let ok = 0, skipped = 0;

  for (const row of rows) {
    const userId = userMap.get(row.user_id);
    const roleId = roleMap.get(row.role_id);

    if (!userId || !roleId) {
      warn(`UserRole id=${row.userrol_id} omitida: referencia(s) faltantes.`);
      skipped++;
      continue;
    }
    await UserRole.create({
      user_id: userId,
      role_id: roleId,
      state: row.state || 'active',
      created_at: row.created_at,
    });
    ok++;
  }
  log(`${ok} asignaciones de rol migradas. ${skipped} omitidas.`);
}

// ─── Función principal ────────────────────────────────────────────────────────

async function migrate() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  🚀 INICIO DE MIGRACIÓN: Supabase → MongoDB');
  console.log('═══════════════════════════════════════════════════════');

  await mongoose.connect(MONGODB_URI);
  console.log('\n✅ Conectado a MongoDB');

  // ── Confirmación antes de borrar datos existentes ─────────────────────────
  console.log('\n⚠️  ADVERTENCIA: Este script borrará TODOS los datos');
  console.log('   existentes en MongoDB antes de migrar.');
  console.log('   Presiona Ctrl+C en los próximos 5 segundos para cancelar...\n');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // ── Limpiar colecciones en MongoDB ────────────────────────────────────────
  console.log('🗑️  Limpiando colecciones existentes...');
  await Promise.all([
    Unit.deleteMany({}),
    RawMaterial.deleteMany({}),
    Product.deleteMany({}),
    Recipe.deleteMany({}),
    Purchase.deleteMany({}),
    Production.deleteMany({}),
    Sale.deleteMany({}),
    Role.deleteMany({}),
    User.deleteMany({}),
    UserRole.deleteMany({}),
  ]);
  log('Colecciones limpiadas.');

  // ── Ejecutar migraciones en orden ─────────────────────────────────────────
  try {
    await migrateUnits();
    await migrateRawMaterials();
    await migrateProducts();
    await migrateRecipes();
    await migratePurchases();
    await migrateProductions();
    await migrateSales();
    await migrateRoles();
    await migrateUsers();
    await migrateUserRoles();
  } catch (err) {
    error(`Migración fallida: ${err.message}`);
    console.error(err);
    process.exit(1);
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  ✅ MIGRACIÓN COMPLETADA EXITOSAMENTE 🎉');
  console.log('═══════════════════════════════════════════════════════');

  await mongoose.disconnect();
  process.exit(0);
}

migrate();
