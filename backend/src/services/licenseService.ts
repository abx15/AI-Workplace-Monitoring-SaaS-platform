import { Database } from '../config/database';
import { License, LicenseTier, LicenseStatus } from '../types/license';

export class LicenseService {
  private db: Database;

  constructor() {
    this.db = new Database();
  }

  async createLicense(userId: string, tier: LicenseTier, duration: number): Promise<License> {
    const license: Omit<License, 'id' | 'createdAt' | 'updatedAt'> = {
      userId,
      tier,
      status: LicenseStatus.ACTIVE,
      startDate: new Date(),
      endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000), // duration in days
      maxCameras: this.getMaxCamerasForTier(tier),
      features: this.getFeaturesForTier(tier),
      apiKey: this.generateApiKey(),
      lastValidated: new Date(),
    };

    const result = await this.db.query(
      `INSERT INTO licenses (user_id, tier, status, start_date, end_date, max_cameras, features, api_key, last_validated)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        license.userId,
        license.tier,
        license.status,
        license.startDate,
        license.endDate,
        license.maxCameras,
        JSON.stringify(license.features),
        license.apiKey,
        license.lastValidated,
      ]
    );

    return this.mapRowToLicense(result.rows[0]);
  }

  async validateLicense(apiKey: string): Promise<License | null> {
    const result = await this.db.query(
      `SELECT * FROM licenses WHERE api_key = $1 AND status = 'ACTIVE'`,
      [apiKey]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const license = this.mapRowToLicense(result.rows[0]);

    // Check if license is expired
    if (license.endDate < new Date()) {
      await this.deactivateLicense(license.id);
      return null;
    }

    // Update last validated timestamp
    await this.updateLastValidated(license.id);
    return license;
  }

  async getLicenseByUserId(userId: string): Promise<License | null> {
    const result = await this.db.query(
      `SELECT * FROM licenses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    return result.rows.length > 0 ? this.mapRowToLicense(result.rows[0]) : null;
  }

  async upgradeLicense(licenseId: string, newTier: LicenseTier): Promise<License> {
    const result = await this.db.query(
      `UPDATE licenses 
       SET tier = $2, max_cameras = $3, features = $4, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [
        licenseId,
        newTier,
        this.getMaxCamerasForTier(newTier),
        JSON.stringify(this.getFeaturesForTier(newTier)),
      ]
    );

    return this.mapRowToLicense(result.rows[0]);
  }

  async deactivateLicense(licenseId: string): Promise<void> {
    await this.db.query(
      `UPDATE licenses SET status = 'INACTIVE', updated_at = NOW() WHERE id = $1`,
      [licenseId]
    );
  }

  async checkCameraLimit(userId: string, currentCameras: number): Promise<boolean> {
    const license = await this.getLicenseByUserId(userId);
    if (!license) return false;

    return currentCameras <= license.maxCameras;
  }

  async hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
    const license = await this.getLicenseByUserId(userId);
    if (!license) return false;

    return license.features.includes(feature);
  }

  private getMaxCamerasForTier(tier: LicenseTier): number {
    switch (tier) {
      case LicenseTier.STANDARD:
        return 5;
      case LicenseTier.PROFESSIONAL:
        return 20;
      case LicenseTier.ENTERPRISE:
        return 999;
      default:
        return 1;
    }
  }

  private getFeaturesForTier(tier: LicenseTier): string[] {
    switch (tier) {
      case LicenseTier.STANDARD:
        return ['basic_monitoring', 'email_support', 'person_detection'];
      case LicenseTier.PROFESSIONAL:
        return [
          'basic_monitoring',
          'email_support',
          'person_detection',
          'face_recognition',
          'emotion_analysis',
          'api_access',
          'priority_support',
        ];
      case LicenseTier.ENTERPRISE:
        return [
          'basic_monitoring',
          'email_support',
          'person_detection',
          'face_recognition',
          'emotion_analysis',
          'api_access',
          'priority_support',
          'custom_integrations',
          'advanced_analytics',
          'dedicated_support',
          'white_label',
        ];
      default:
        return [];
    }
  }

  private generateApiKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `awm_${result}`;
  }

  private async updateLastValidated(licenseId: string): Promise<void> {
    await this.db.query(
      `UPDATE licenses SET last_validated = NOW() WHERE id = $1`,
      [licenseId]
    );
  }

  private mapRowToLicense(row: any): License {
    return {
      id: row.id,
      userId: row.user_id,
      tier: row.tier as LicenseTier,
      status: row.status as LicenseStatus,
      startDate: new Date(row.start_date),
      endDate: new Date(row.end_date),
      maxCameras: row.max_cameras,
      features: Array.isArray(row.features) ? row.features : JSON.parse(row.features || '[]'),
      apiKey: row.api_key,
      lastValidated: new Date(row.last_validated),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
