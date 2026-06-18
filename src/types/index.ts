export interface Service {
  id: number;
  name: string;
  description: string;
  icon: string;
  orderNum: number;
}

export interface Package {
  id: number;
  name: string;
  tier: string;
  tierLevel: number;
  description: string;
  price: number;
  unit: string;
  features: string[];
  duration: string | null;
  isPopular: boolean;
  orderNum: number;
}

export interface AvailabilitySlot {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  slots: number;
}

export interface BookingFormData {
  name: string;
  phone: string;
  email: string;
  serviceId: number;
  packageId: number;
  date: string;
  timeSlot: string;
  persons: number;
  notes: string;
  acceptedTerms: boolean;
}

export interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  message: string;
}

export type BookingStatus =
  | "PENDING_VALIDATION"
  | "APPROVED"
  | "REJECTED"
  | "CONFIRMED"
  | "CANCELLED";
