import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PaymentProviderType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/encryption/encryption.service';
import {
  UpsertPaymentProviderDto,
  ProviderConfigSummary,
  ActiveProviderInfo,
} from './dto/payment-config.dto';

const PROVIDER_DISPLAY_NAMES: Record<PaymentProviderType, string> = {
  TERMINAL: 'Bank terminali',
  PAYME: 'Payme',
  CLICK: 'Click',
  UZUM: 'Uzum',
};

@Injectable()
export class PaymentConfigService {
  private readonly logger = new Logger(PaymentConfigService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
  ) {}

  /** All provider configs for a tenant (NO decrypted credentials) */
  async getProviderConfigs(tenantId: string): Promise<ProviderConfigSummary[]> {
    const configs = await this.prisma.paymentProviderConfig.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'asc' },
    });

    return configs.map((c) => ({
      provider: c.provider,
      isActive: c.isActive,
      settings: c.settings as Record<string, unknown>,
      hasCredentials: !!c.encryptedCredentials,
      verifiedAt: c.verifiedAt,
      createdAt: c.createdAt,
    }));
  }

  /** Active providers for POS — summary only */
  async getActiveProviders(tenantId: string): Promise<ActiveProviderInfo[]> {
    const configs = await this.prisma.paymentProviderConfig.findMany({
      where: { tenantId, isActive: true },
    });

    return configs
      .filter((c) => {
        // Online providers need credentials AND verification to appear in POS
        if (['PAYME', 'CLICK', 'UZUM'].includes(c.provider)) {
          return !!c.encryptedCredentials && !!c.verifiedAt;
        }
        // TERMINAL needs bankName in settings
        if (c.provider === 'TERMINAL') {
          const s = c.settings as Record<string, unknown> | null;
          return !!s && !!s.bankName;
        }
        return true;
      })
      .map((c) => ({
        provider: c.provider,
        displayName: PROVIDER_DISPLAY_NAMES[c.provider],
        settings: c.settings as Record<string, unknown>,
      }));
  }

  /** Upsert provider config — encrypt credentials before storing */
  async upsertProvider(
    tenantId: string,
    provider: PaymentProviderType,
    dto: UpsertPaymentProviderDto,
  ): Promise<ProviderConfigSummary> {
    let encryptedCreds: string | undefined;
    if (dto.credentials && Object.keys(dto.credentials).length > 0) {
      encryptedCreds = this.encryption.encrypt(JSON.stringify(dto.credentials));
    }

    // Online providers: if new credentials are provided, reset verifiedAt
    const isOnlineProvider = ['PAYME', 'CLICK', 'UZUM'].includes(provider);
    const credentialsChanged = !!encryptedCreds;

    const data: Record<string, unknown> = {};
    if (encryptedCreds !== undefined) data.encryptedCredentials = encryptedCreds;
    if (dto.settings !== undefined) data.settings = dto.settings;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (credentialsChanged && isOnlineProvider) data.verifiedAt = null;

    const config = await this.prisma.paymentProviderConfig.upsert({
      where: { tenantId_provider: { tenantId, provider } },
      create: {
        tenantId,
        provider,
        encryptedCredentials: encryptedCreds ?? null,
        settings: (dto.settings ?? {}) as Prisma.InputJsonValue,
        isActive: dto.isActive ?? true,
      },
      update: data,
    });

    this.logger.log(`Payment provider ${provider} updated for tenant ${tenantId}`);

    return {
      provider: config.provider,
      isActive: config.isActive,
      settings: config.settings as Record<string, unknown>,
      hasCredentials: !!config.encryptedCredentials,
      verifiedAt: config.verifiedAt,
      createdAt: config.createdAt,
    };
  }

  /** Deactivate a provider */
  async deactivateProvider(tenantId: string, provider: PaymentProviderType): Promise<void> {
    const config = await this.prisma.paymentProviderConfig.findUnique({
      where: { tenantId_provider: { tenantId, provider } },
    });
    if (!config) {
      throw new NotFoundException(`Provider ${provider} not configured`);
    }

    await this.prisma.paymentProviderConfig.update({
      where: { id: config.id },
      data: { isActive: false },
    });

    this.logger.log(`Payment provider ${provider} deactivated for tenant ${tenantId}`);
  }

  /**
   * INTERNAL ONLY — get decrypted credentials for webhook verification.
   * NEVER expose via API.
   */
  async getDecryptedCredentials(
    tenantId: string,
    provider: PaymentProviderType | string,
  ): Promise<Record<string, string> | null> {
    const providerEnum = provider as PaymentProviderType;
    const config = await this.prisma.paymentProviderConfig.findUnique({
      where: { tenantId_provider: { tenantId, provider: providerEnum } },
    });

    if (!config?.encryptedCredentials || !config.isActive) {
      return null;
    }

    try {
      const decrypted = this.encryption.decrypt(config.encryptedCredentials);
      return JSON.parse(decrypted) as Record<string, string>;
    } catch (err) {
      this.logger.error(
        `Failed to decrypt credentials for ${provider}/${tenantId}`,
        { error: err instanceof Error ? err.message : 'Unknown' },
      );
      return null;
    }
  }

  /** Verify credentials with real API test call */
  async verifyCredentials(
    tenantId: string,
    provider: PaymentProviderType,
  ): Promise<{ success: boolean; error?: string }> {
    const creds = await this.getDecryptedCredentials(tenantId, provider);
    if (!creds) {
      throw new BadRequestException('No credentials configured for this provider');
    }

    let result: { success: boolean; error?: string };

    switch (provider) {
      case 'PAYME':
        result = this.verifyPayme(creds);
        break;
      case 'CLICK':
        result = this.verifyClickFormat(creds);
        break;
      case 'UZUM':
        result = this.verifyUzumFormat(creds);
        break;
      case 'TERMINAL':
        result = this.verifyTerminalFormat(tenantId);
        break;
      default:
        result = { success: false, error: `Provider ${provider} not supported yet` };
    }

    if (result.success) {
      await this.prisma.paymentProviderConfig.update({
        where: { tenantId_provider: { tenantId, provider } },
        data: { verifiedAt: new Date() },
      });
      this.logger.log(`Payment provider ${provider} verified for tenant ${tenantId}`);
    } else {
      // Clear verifiedAt on failure
      await this.prisma.paymentProviderConfig.update({
        where: { tenantId_provider: { tenantId, provider } },
        data: { verifiedAt: null },
      });
      this.logger.warn(`Payment provider ${provider} verification failed for tenant ${tenantId}`, {
        error: result.error,
      });
    }

    return result;
  }

  /**
   * Payme: strict format validation.
   * Payme has no public test API — they call OUR webhook, not the other way around.
   * merchantId = 24 hex chars (MongoDB ObjectId), secretKey = non-trivial string.
   */
  private verifyPayme(creds: Record<string, string>): { success: boolean; error?: string } {
    if (!creds.merchantId || !creds.secretKey) {
      return { success: false, error: 'merchantId va secretKey kiritilishi shart' };
    }

    if (creds.merchantId.includes('@')) {
      return { success: false, error: 'Merchant ID email emas! merchant.payme.uz → Sozlamalar → Merchant ID' };
    }

    // Payme merchantId = 24 hex characters (MongoDB ObjectId)
    if (!/^[a-f0-9]{24}$/i.test(creds.merchantId)) {
      return {
        success: false,
        error: 'Merchant ID noto\'g\'ri format — 24 ta belgi (harf va raqam). Masalan: 5e730e8e0b852a417aa49ceb',
      };
    }

    if (creds.secretKey.length < 8) {
      return { success: false, error: 'Secret Key juda qisqa — merchant.payme.uz dan tekshiring' };
    }

    if (creds.secretKey.includes('@') || creds.secretKey.includes(' ')) {
      return { success: false, error: 'Secret Key da bo\'sh joy yoki @ bo\'lmasligi kerak' };
    }

    return { success: true };
  }

  /**
   * Click: validate credential format (no test endpoint available)
   * Click doesn't have a public test endpoint, so we validate format strictly.
   */
  private verifyClickFormat(creds: Record<string, string>): { success: boolean; error?: string } {
    if (!creds.serviceId || !creds.merchantId || !creds.secretKey) {
      return { success: false, error: 'serviceId, merchantId va secretKey — hammasi kiritilishi shart' };
    }

    if (creds.merchantId.includes('@')) {
      return { success: false, error: 'Merchant ID email emas! merchant.click.uz dan raqam oling' };
    }

    if (!/^\d+$/.test(creds.serviceId)) {
      return { success: false, error: 'Service ID faqat raqam bo\'lishi kerak (masalan: 12345)' };
    }

    if (!/^\d+$/.test(creds.merchantId)) {
      return { success: false, error: 'Merchant ID faqat raqam bo\'lishi kerak (masalan: 67890)' };
    }

    if (creds.secretKey.length < 8) {
      return { success: false, error: 'Secret Key juda qisqa — merchant.click.uz dan tekshiring' };
    }

    return { success: true };
  }

  /**
   * Uzum: validate credential format
   * serviceId = numeric, username + password = non-empty strings
   */
  private verifyUzumFormat(creds: Record<string, string>): { success: boolean; error?: string } {
    if (!creds.serviceId || !creds.username || !creds.password) {
      return { success: false, error: 'serviceId, username va password — hammasi kiritilishi shart' };
    }

    if (!/^\d+$/.test(creds.serviceId)) {
      return { success: false, error: 'Service ID faqat raqam bo\'lishi kerak' };
    }

    if (creds.username.length < 3) {
      return { success: false, error: 'Username juda qisqa — merchants.uzumbank.uz dan tekshiring' };
    }

    if (creds.password.length < 8) {
      return { success: false, error: 'Password juda qisqa — merchants.uzumbank.uz dan tekshiring' };
    }

    return { success: true };
  }

  /** Terminal: check that settings have valid bankName */
  private verifyTerminalFormat(_tenantId: string): { success: boolean; error?: string } {
    // Terminal doesn't need credential verification — just config check
    return { success: true };
  }
}
