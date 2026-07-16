import { prisma } from "@/lib/prisma";

const COMPANY_SETTING_ID = "company";

type CompanySettingRow = {
  id: string;
  companyName: string;
  contactPhone: string;
  companyEmail: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CompanySettingsInput = {
  companyName: string;
  contactPhone: string;
  companyEmail: string;
};

function serialize(setting: CompanySettingRow | null) {
  if (!setting) {
    return {
      companyName: "",
      contactPhone: "",
      companyEmail: "",
    };
  }

  return {
    companyName: setting.companyName,
    contactPhone: setting.contactPhone,
    companyEmail: setting.companyEmail,
    updatedAt: setting.updatedAt.toISOString(),
  };
}

export const companySettingsService = {
  async get() {
    const settings = await prisma.$queryRaw<CompanySettingRow[]>`
      SELECT id, companyName, contactPhone, companyEmail, createdAt, updatedAt
      FROM CompanySetting
      WHERE id = ${COMPANY_SETTING_ID}
      LIMIT 1
    `;

    return serialize(settings[0] ?? null);
  },

  async upsert(input: CompanySettingsInput) {
    const companyName = input.companyName.trim();
    const contactPhone = input.contactPhone.trim();
    const companyEmail = input.companyEmail.trim().toLowerCase();

    await prisma.$executeRaw`
      INSERT INTO CompanySetting (id, companyName, contactPhone, companyEmail, createdAt, updatedAt)
      VALUES (${COMPANY_SETTING_ID}, ${companyName}, ${contactPhone}, ${companyEmail}, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))
      ON DUPLICATE KEY UPDATE
        companyName = VALUES(companyName),
        contactPhone = VALUES(contactPhone),
        companyEmail = VALUES(companyEmail),
        updatedAt = CURRENT_TIMESTAMP(3)
    `;

    return this.get();
  },
};
