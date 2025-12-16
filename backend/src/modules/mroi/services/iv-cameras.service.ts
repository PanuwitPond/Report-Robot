// back/src/modules/mroi/services/iv-cameras.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as ffmpeg from 'fluent-ffmpeg';
import { PassThrough } from 'stream';
import { NodeSSH } from 'node-ssh';
import * as mqtt from 'mqtt';
import { Response } from 'express';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class IvCamerasService {
  private readonly logger = new Logger(IvCamerasService.name);

  constructor(
    @InjectDataSource('mroi_db_conn') 
    private dataSource: DataSource // จะเชื่อมต่อกับ ivs_service อัตโนมัติ
  ) {}

//   constructor(private dataSource: DataSource) {}

  // ================= REPOSITORY LOGIC =================

  async getSchemasName() {
    // คำสั่ง SQL จะรันบน DB 192.168.100.83 ทันที
    const results = await this.dataSource.query(
      `SELECT schemaname FROM pg_catalog.pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema') GROUP BY schemaname ORDER BY schemaname ASC`
    );
    return results.map((r) => r.schemaname);
  }

  async getAllCamerasFromAllSchemas() {
    try {
      const schemas = await this.getSchemasName();
      let allCameras = [];

      for (const schema of schemas) {
        try {
          const tableCheckQuery = `
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = '${schema}' AND table_name = 'iv_cameras'
            );
          `;
          const [tableExistsResult] = await this.dataSource.query(tableCheckQuery);
          
          // TypeORM query returns array, check existence
          if (!tableExistsResult || !tableExistsResult.exists) {
            continue;
          }

          const camerasInSchema = await this.getCamerasData(schema);
          const camerasWithSchema = camerasInSchema.map((cam) => ({
            ...cam,
            workspace: schema,
          }));
          allCameras = allCameras.concat(camerasWithSchema);
        } catch (innerError) {
          this.logger.warn(`Could not fetch cameras from schema "${schema}": ${innerError.message}`);
        }
      }
      return allCameras;
    } catch (error) {
      this.logger.error('Error in getAllCamerasFromAllSchemas', error);
      throw error;
    }
  }

  async getRoiData(schema: string, key: string) {
    try {
      // Use fully qualified name to avoid SET search_path issues in connection pool
      const query = `
        SELECT "metthier_ai_config" 
        FROM "${schema}"."iv_cameras" 
        WHERE "iv_camera_uuid" = $1
      `;
      const [result] = await this.dataSource.query(query, [key]);
      return result ? result.metthier_ai_config : null;
    } catch (error) {
      this.logger.error('Error in getRoiData', error);
      throw error;
    }
  }

  async getCamerasData(schemaName: string) {
    const safeSchemaName = String(schemaName).replace(/[^a-zA-Z0-9_]/g, '');
    try {
      const query = `
        SELECT "iv_camera_uuid", "camera_name", "camera_name_display", "camera_site",
               "rtsp", "metthier_ai_config", "device_id", "camera_type"
        FROM "${safeSchemaName}"."iv_cameras"
        ORDER BY "camera_site" ASC
      `;
      const results = await this.dataSource.query(query);
      return results;
    } catch (error) {
      this.logger.error(`Error in getCamerasData for schema "${schemaName}"`, error);
      return [];
    }
  }

  async updateMetthierAiConfig(schemaName: string, cameraId: string, newConfig: any) {
    const safeSchemaName = String(schemaName).replace(/[^a-zA-Z0-9_]/g, '');
    
    // 1. Fetch existing config
    const findQuery = `SELECT "metthier_ai_config" FROM "${safeSchemaName}"."iv_cameras" WHERE "iv_camera_uuid" = $1`;
    const [camera] = await this.dataSource.query(findQuery, [cameraId]);

    if (!camera) return 0;

    const existingConfig = camera.metthier_ai_config || {};
    let finalConfig;

    // Logic: Merge or Overwrite
    if (
      existingConfig &&
      Array.isArray(existingConfig.rule) &&
      existingConfig.rule.length === 0 &&
      Object.keys(existingConfig).length === 1
    ) {
      finalConfig = newConfig;
    } else {
      finalConfig = { ...existingConfig, ...newConfig };
    }

    // 2. Update
    const updateQuery = `UPDATE "${safeSchemaName}"."iv_cameras" SET "metthier_ai_config" = $1 WHERE "iv_camera_uuid" = $2`;
    // TypeORM raw query doesn't return affected rows directly like Sequelize in standard format easily, 
    // but we can check the result. For postgres, query returns [[], number].
    const [, affectedRows] = await this.dataSource.query(updateQuery, [JSON.stringify(finalConfig), cameraId]);
    
    return affectedRows;
  }

  // ================= SSH & MQTT LOGIC =================

  async executeSshCommand(connectionDetails: any, command: string) {
    const ssh = new NodeSSH();
    const connectionConfig = {
      host: connectionDetails.host,
      port: connectionDetails.port,
      username: connectionDetails.username,
      password: connectionDetails.password,
      timeout: 10000,
    };

    try {
      await ssh.connect(connectionConfig);
      const result = await ssh.execCommand(command);
      this.logger.log('SSH STDOUT: ' + result.stdout);
      if (result.stderr && result.code !== 0) {
        throw new Error(result.stderr);
      }
      ssh.dispose();
      return { success: true, stdout: result.stdout };
    } catch (error) {
      this.logger.error('SSH Execution Error', error);
      if (ssh.isConnected()) ssh.dispose();
      throw error;
    }
  }

  async sendMqttRestart() {
    return new Promise((resolve, reject) => {
      const client = mqtt.connect('mqtt://mqtt-open.metthier.ai:61883');
      client.on('connect', () => {
        const topic = '/intrusion/motion_out';
        const message = JSON.stringify({ command: 'restart' });
        client.publish(topic, message, (err) => {
          client.end();
          if (err) reject(err);
          else resolve('MQTT sent successfully');
        });
      });
      client.on('error', (err) => {
        client.end();
        reject(err);
      });
    });
  }

  // ================= SNAPSHOT LOGIC =================

  captureSnapshot(rtsp: string, res: Response) {
    try {
      const stream = new PassThrough();
      res.type('image/jpeg');

      // Default resolution 1080p
      const resolution = [1920, 1080];
      const filters = [
        'fps=1',
        'eq=contrast=1.2:brightness=0.05:saturation=1.3',
        `scale=${resolution[0]}:${resolution[1]}`,
      ];

      ffmpeg(rtsp)
        .inputOptions([
          '-rtsp_transport tcp',
          '-timeout 5000000',
          '-analyzeduration 10000000',
        ])
        .outputOptions([
          `-vf ${filters.join(',')}`,
          '-frames:v 1',
          '-ss 00:00:01',
          '-q:v 2',
          '-f image2',
        ])
        .on('error', (err) => {
          this.logger.error(`FFmpeg error: ${err.message}`);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Snapshot failed', details: err.message });
          }
        })
        .pipe(stream, { end: true });

      stream.pipe(res);
    } catch (err) {
      this.logger.error('Snapshot unexpected error', err);
      if (!res.headersSent) res.status(500).send('Internal Error');
    }
  }
}