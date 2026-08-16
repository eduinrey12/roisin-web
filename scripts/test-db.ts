import 'dotenv/config';
import mariadb from 'mariadb';

async function testConnection() {
  const dbUrl = process.env.DATABASE_URL;
  console.log('\n--- Probando Conexión a Base de Datos MySQL/MariaDB ---');

  if (!dbUrl) {
    console.error('❌ ERROR: DATABASE_URL no está definido en el archivo .env\n');
    process.exit(1);
  }

  let host = '127.0.0.1';
  let port = 3306;
  let user = 'root';
  let password = '';
  let database = 'roisin_db';

  try {
    const parsed = new URL(dbUrl);
    host = parsed.hostname || host;
    port = parsed.port ? parseInt(parsed.port, 10) : port;
    user = decodeURIComponent(parsed.username || user);
    password = decodeURIComponent(parsed.password || password);
    database = parsed.pathname.replace(/^\//, '') || database;
  } catch (err: any) {
    console.warn('⚠️ No se pudo parsear como URL estándar, usando string directo:', err.message);
  }

  console.log(`📡 Intentando conectar a:`);
  console.log(`   Host:     ${host}`);
  console.log(`   Puerto:   ${port}`);
  console.log(`   Usuario:  ${user}`);
  console.log(`   Password: ${password ? '******** (' + password.length + ' caracteres)' : '(sin password)'}`);
  console.log(`   Base:     ${database}\n`);

  try {
    const conn = await mariadb.createConnection({
      host,
      port,
      user,
      password,
      allowPublicKeyRetrieval: true,
      connectTimeout: 5000,
    });

    console.log('✅ ¡Conexión exitosa al servidor MySQL!');

    const dbs: any[] = await conn.query('SHOW DATABASES');
    const dbNames = dbs.map((d: any) => Object.values(d)[0]);
    console.log('📂 Bases de datos disponibles en el servidor:', dbNames.join(', '));

    if (!dbNames.includes(database)) {
      console.log(`\n⚠️ La base de datos "${database}" no existe aún.`);
      console.log(`💡 Intentando crear la base de datos "${database}"...`);
      await conn.query(
        `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
      );
      console.log(`✅ Base de datos "${database}" creada exitosamente.`);
    } else {
      console.log(`✅ La base de datos "${database}" ya existe.`);
    }

    await conn.end();

    console.log('\n🚀 Puedes proceder a ejecutar:');
    console.log('   npx prisma db push');
    console.log('   npx tsx prisma/seed.ts\n');
  } catch (err: any) {
    console.error('\n❌ ERROR AL CONECTAR CON MYSQL:');
    console.error(`   Código:  ${err.code || err.errno || 'DESCONOCIDO'}`);
    console.error(`   Mensaje: ${err.message}`);

    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n🔑 CAUSA: Usuario o contraseña incorrectos.');
      console.error('👉 Abre tu archivo .env y corrige la contraseña de tu usuario MySQL.');
    } else if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      console.error('\n🔌 CAUSA: El servidor MySQL no está encendido o el puerto/host es incorrecto.');
      console.error('👉 Asegúrate de que MySQL (XAMPP / Laragon / Servicio de Windows) esté iniciado.');
    }
    process.exit(1);
  }
}

testConnection();
