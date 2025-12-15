const { Client } = require('pg');

const client = new Client({
  host: '192.168.100.125',
  port: 5432,
  user: 'kdadmin',
  password: 'P@ssw0rdData',
  database: 'know_db',
});

async function checkDatabase() {
  try {
    await client.connect();
    console.log('✅ เชื่อมต่อ know_db สำเร็จ\n');

    // เช็คว่ามี MROI tables หรือเปล่า
    console.log('📋 ตรวจสอบ MROI Tables:');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name LIKE 'iv_%' 
      ORDER BY table_name;
    `);

    if (result.rows.length === 0) {
      console.log('❌ ไม่พบ MROI tables - ต้องสร้างใหม่');
      console.log('   Tables ที่ต้องสร้าง:');
      console.log('   - iv_cameras');
      console.log('   - iv_camera_rois');
      console.log('   - iv_camera_schedules');
      console.log('   - iv_camera_snapshots\n');
    } else {
      console.log('✅ พบ MROI tables:');
      result.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
      console.log();

      // ลองดึงข้อมูลจากแต่ละ table
      console.log('📊 ตรวจสอบข้อมูลใน tables:\n');

      for (const row of result.rows) {
        const tableName = row.table_name;
        const countResult = await client.query(`SELECT COUNT(*) as count FROM ${tableName};`);
        const count = countResult.rows[0].count;
        console.log(`📌 ${tableName}: ${count} records`);

        if (count > 0 && count <= 3) {
          // ถ้ามีข้อมูลน้อย ลองดึงดู
          const sampleResult = await client.query(`SELECT * FROM ${tableName} LIMIT 3;`);
          console.log(`   Sample data:`, JSON.stringify(sampleResult.rows[0], null, 2));
        }
      }
    }

    // เช็คว่ามี tables ทั่วไปของ Report-Robot หรือเปล่า
    console.log('\n📋 ตรวจสอบ Report-Robot Tables:');
    const rtResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const allTables = rtResult.rows.map(r => r.table_name);
    console.log(`📊 Total tables in know_db: ${allTables.length}`);
    console.log('Tables list:', allTables.join(', '));

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n⚠️  ไม่สามารถเชื่อมต่อ PostgreSQL ได้');
      console.log('   ตรวจสอบว่า:');
      console.log('   1. PostgreSQL server กำลังทำงานที่ 192.168.100.125:5432');
      console.log('   2. Username/Password ถูกต้อง');
      console.log('   3. Database know_db มีอยู่จริง');
    }
  } finally {
    await client.end();
  }
}

checkDatabase();
