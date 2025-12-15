const { Client } = require('pg');

const client = new Client({
  host: '192.168.100.125',
  port: 5432,
  user: 'kdadmin',
  password: 'P@ssw0rdData',
  database: 'know_db',
});

async function checkMroiData() {
  try {
    await client.connect();
    console.log('✅ เชื่อมต่อ know_db สำเร็จ\n');

    const tables = ['mroi_devices', 'mroi_rois', 'mroi_schedules'];

    console.log('📊 ตรวจสอบข้อมูลใน MROI Tables:');
    console.log('=' .repeat(70));

    for (const tableName of tables) {
      const countResult = await client.query(`SELECT COUNT(*) as count FROM ${tableName};`);
      const count = countResult.rows[0].count;

      console.log(`\n📌 ${tableName}:`);
      console.log(`   Total records: ${count}`);

      if (count === 0) {
        console.log(`   ⚠️  ยังไม่มีข้อมูล - ต้องเพิ่มข้อมูลใหม่`);
      } else {
        console.log(`   ✅ มีข้อมูลอยู่ ${count} records`);

        // ถ้ามีข้อมูล ให้ดึง sample
        const sampleResult = await client.query(`
          SELECT * FROM ${tableName} 
          ORDER BY "createdAt" DESC 
          LIMIT 3;
        `);

        console.log(`   \n   Sample Data (ล่าสุด 3 records):`);
        sampleResult.rows.forEach((row, idx) => {
          console.log(`   [${idx + 1}] ID: ${row.id}`);
          console.log(`       Name: ${row.name}`);
          console.log(`       Domain: ${row.domain}`);
          console.log(`       Created: ${row.createdAt}`);
        });
      }
    }

    // เช็คด้วยว่า domain อะไร
    console.log('\n' + '=' .repeat(70));
    console.log('📋 Domains ที่มีใน mroi_devices:');
    const domainsResult = await client.query(`
      SELECT DISTINCT domain, COUNT(*) as count 
      FROM mroi_devices 
      GROUP BY domain;
    `);

    if (domainsResult.rows.length === 0) {
      console.log('   (ยังไม่มีข้อมูล)');
    } else {
      domainsResult.rows.forEach(row => {
        console.log(`   • ${row.domain}: ${row.count} devices`);
      });
    }

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  } finally {
    await client.end();
  }
}

checkMroiData();
