const { Client } = require('pg');

const client = new Client({
  host: '192.168.100.125',
  port: 5432,
  user: 'kdadmin',
  password: 'P@ssw0rdData',
  database: 'know_db',
});

async function checkTableStructure() {
  try {
    await client.connect();
    console.log('✅ เชื่อมต่อ know_db สำเร็จ\n');

    const tables = ['mroi_devices', 'mroi_rois', 'mroi_schedules'];

    for (const tableName of tables) {
      console.log(`\n📋 ตรวจสอบ Table: ${tableName}`);
      console.log('=' .repeat(70));

      // ดึง column information
      const columnsResult = await client.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns
        WHERE table_name = $1 AND table_schema = 'public'
        ORDER BY ordinal_position;
      `, [tableName]);

      console.log(`📌 Columns (${columnsResult.rows.length}):`);
      columnsResult.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'nullable' : 'NOT NULL';
        const maxLen = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
        console.log(`   • ${col.column_name.padEnd(20)} : ${col.data_type.padEnd(20)} ${maxLen} ${nullable}`);
      });

      // ดึง constraints
      const constraintsResult = await client.query(`
        SELECT 
          constraint_name,
          constraint_type
        FROM information_schema.table_constraints
        WHERE table_name = $1 AND table_schema = 'public';
      `, [tableName]);

      if (constraintsResult.rows.length > 0) {
        console.log(`\n📌 Constraints:`);
        constraintsResult.rows.forEach(con => {
          console.log(`   • ${con.constraint_name} (${con.constraint_type})`);
        });
      }

      // ดึง Foreign Keys (ใช้วิธีอื่น)
      const fkResult = await client.query(`
        SELECT 
          kcu.column_name,
          ccu.table_name AS referenced_table,
          ccu.column_name AS referenced_column
        FROM information_schema.key_column_usage kcu
        JOIN information_schema.constraint_column_usage ccu 
          ON kcu.constraint_name = ccu.constraint_name
          AND kcu.table_schema = ccu.table_schema
        WHERE kcu.table_name = $1 
          AND kcu.table_schema = 'public'
          AND ccu.table_name IS NOT NULL;
      `, [tableName]);

      if (fkResult.rows.length > 0) {
        console.log(`\n📌 Foreign Keys:`);
        fkResult.rows.forEach(fk => {
          console.log(`   • ${fk.column_name} → ${fk.referenced_table}(${fk.referenced_column})`);
        });
      }

      // ดึง Indexes
      const indexResult = await client.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = $1;
      `, [tableName]);

      if (indexResult.rows.length > 0) {
        console.log(`\n📌 Indexes:`);
        indexResult.rows.forEach(idx => {
          console.log(`   • ${idx.indexname}`);
        });
      }

      // ดึง sample data
      const sampleResult = await client.query(`SELECT * FROM ${tableName} LIMIT 1;`);
      if (sampleResult.rows.length > 0) {
        console.log(`\n📌 Sample Data:`);
        console.log('   ' + JSON.stringify(sampleResult.rows[0], null, 2).split('\n').join('\n   '));
      } else {
        console.log(`\n📌 No data in this table yet`);
      }
    }

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  } finally {
    await client.end();
  }
}

checkTableStructure();
