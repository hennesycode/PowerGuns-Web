export type AdminUserRole = "administrador" | "finanzas" | "editor" | "cliente" | "instructor";
export type AdminIdentificationType = "cedula" | "pasaporte" | "cedula_extranjeria";

export interface AdminUserItem {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  identificationType: AdminIdentificationType;
  identificationNumber: string;
  role: AdminUserRole;
  isActive: boolean;
  avatarUrl: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}
