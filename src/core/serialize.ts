import type {
  Children,
  Event,
  Growth,
  HcaStatus,
  HfaStatus,
  MuacStatus,
  User,
  Vaccine,
  WeightGainStatus,
  WfaStatus,
  WfhStatus,
} from "@prisma/client";
import { assessNutrition } from "../domain/growth-standards.js";

const pad = (value: number, length = 2): string =>
  String(value).padStart(length, "0");

export function toLegacyTimestamp(value: Date): string {
  const year = value.getUTCFullYear();
  const month = pad(value.getUTCMonth() + 1);
  const day = pad(value.getUTCDate());
  const hour = pad(value.getUTCHours());
  const minute = pad(value.getUTCMinutes());
  const second = pad(value.getUTCSeconds());
  const millis = pad(value.getUTCMilliseconds(), 3);

  return `${year}-${month}-${day} ${hour}:${minute}:${second}.${millis} Z`;
}

const LEGACY_DATE_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?)?\s*(Z|[+-]\d{2}:?\d{2})?$/;

export function parseLegacyDate(input: string): Date | null {
  const match = LEGACY_DATE_PATTERN.exec(input.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return parsed;
}

const WFA_LABEL: Record<WfaStatus, string> = {
  SEVERELY_UNDERWEIGHT: "Severely Underweight",
  UNDERWEIGHT: "Underweight",
  NORMAL: "Normal",
  OVERWEIGHT_OBESE: "Overweight and Obese",
  UNKNOWN: "Unknown",
};

const HFA_LABEL: Record<HfaStatus, string> = {
  SEVERELY_STUNTED: "Severely Stunted",
  STUNTED: "Stunted",
  NORMAL: "Normal",
  UNKNOWN: "Unknown",
};

const WFH_LABEL: Record<WfhStatus, string> = {
  SEVERELY_WASTING: "Severely Wasting",
  WASTING: "Wasting",
  NORMAL: "Normal",
  OVERWEIGHT_OBESE: "Overweight and Obese",
  UNKNOWN: "Unknown",
};

const MUAC_LABEL: Record<MuacStatus, string> = {
  SEVERE_ACUTE: "Gizi Buruk Akut",
  MODERATE_ACUTE: "Gizi Kurang Akut",
  NORMAL: "Normal",
  NOT_APPLICABLE: "Tidak Berlaku",
};

const HCA_LABEL: Record<HcaStatus, string> = {
  MICROCEPHALY: "Mikrosefali",
  NORMAL: "Normal",
  MACROCEPHALY: "Makrosefali",
  UNKNOWN: "Unknown",
};

const GAIN_LABEL: Record<WeightGainStatus, string> = {
  ADEQUATE: "N",
  INADEQUATE: "T",
  NOT_WEIGHED: "O",
  FIRST_WEIGHIN: "B",
};

export const wfaLabel = (status: WfaStatus): string => WFA_LABEL[status];
export const hfaLabel = (status: HfaStatus): string => HFA_LABEL[status];
export const wfhLabel = (status: WfhStatus): string => WFH_LABEL[status];
export const muacLabel = (status: MuacStatus): string => MUAC_LABEL[status];
export const hcaLabel = (status: HcaStatus): string => HCA_LABEL[status];
export const gainLabel = (status: WeightGainStatus): string =>
  GAIN_LABEL[status];

const orEmpty = (value: string | null): string => value ?? "";

export interface UserDto {
  id: string;
  email: string;
  full_name: string;
  gender: string;
  date_of_birth: string;
  phone_number: string;
  address: string;
  region: string;
  is_active: boolean;
  active_period: string;
  role: string;
}

export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    email: user.email,
    full_name: user.fullName,
    gender: user.gender,
    date_of_birth: toLegacyTimestamp(user.dateOfBirth),
    phone_number: user.phoneNumber,
    address: orEmpty(user.address),
    region: user.region,
    is_active: user.isActive,
    active_period: toLegacyTimestamp(user.activePeriod),
    role: user.role,
  };
}

export interface ChildDto {
  children_id: string;
  parents_id: string;
  full_name: string;
  gender: string;
  place_of_birth: string;
  date_of_birth: string;
  father: string;
  mother: string;
  order_of_child: number;
  region: string;
  birth_weight: number;
  wfa_status: string;
  birth_height: number;
  hfa_status: string;
  wfh_status: string;
  birth_head_circum: number;
  nik: string;
  status: string;
}

export function toChildDto(child: Children): ChildDto {
  const atBirth = assessNutrition({
    dateOfBirth: child.dateOfBirth,
    measuredAt: child.dateOfBirth,
    weight: child.birthWeight,
    height: child.birthHeight,
    sex: child.gender,
  });

  return {
    children_id: child.id,
    parents_id: child.parentId,
    full_name: child.fullName,
    gender: child.gender,
    place_of_birth: child.placeOfBirth,
    date_of_birth: toLegacyTimestamp(child.dateOfBirth),
    father: orEmpty(child.father),
    mother: orEmpty(child.mother),
    order_of_child: child.orderOfChild,
    region: child.region,
    birth_weight: child.birthWeight,
    wfa_status: wfaLabel(atBirth.wfaStatus),
    birth_height: child.birthHeight,
    hfa_status: hfaLabel(atBirth.hfaStatus),
    wfh_status: wfhLabel(atBirth.wfhStatus),
    birth_head_circum: child.birthHeadCircum,

    nik: child.nik ?? "",
    status: child.status,
  };
}

export interface GrowthDto {
  id: string;
  children_id: string;
  date: string;
  age: number;
  weight: number;
  wfa_status: string;
  height: number;
  hfa_status: string;
  wfh_status: string;
  head_circum: number;
  arm_circum: number;
  note: string;

  wfa_zscore: number | null;
  hfa_zscore: number | null;
  wfh_zscore: number | null;
  head_circum_zscore: number | null;
  muac_status: string;
  head_circum_status: string;
  weight_gain: number | null;
  gain_status: string;
  consecutive_no_gain: number;
  needs_referral: boolean;
  is_flagged: boolean;
  flag_reason: string;
}

export function toGrowthDto(growth: Growth): GrowthDto {
  return {
    id: growth.id,
    children_id: growth.childId,
    date: toLegacyTimestamp(growth.date),
    age: growth.ageInMonth,
    weight: growth.weight,
    wfa_status: wfaLabel(growth.wfaStatus),
    height: growth.height,
    hfa_status: hfaLabel(growth.hfaStatus),
    wfh_status: wfhLabel(growth.wfhStatus),
    head_circum: growth.headCircum,
    arm_circum: growth.armCircum,
    note: orEmpty(growth.note),

    wfa_zscore: growth.wfaZScore,
    hfa_zscore: growth.hfaZScore,
    wfh_zscore: growth.wfhZScore,
    head_circum_zscore: growth.headCircumZScore,
    muac_status: MUAC_LABEL[growth.muacStatus],
    head_circum_status: HCA_LABEL[growth.headCircumStatus],
    weight_gain: growth.weightGain,
    gain_status: GAIN_LABEL[growth.gainStatus],
    consecutive_no_gain: growth.consecutiveNoGain,
    needs_referral: growth.consecutiveNoGain >= 2,
    is_flagged: growth.isFlagged,
    flag_reason: orEmpty(growth.flagReason),
  };
}

export interface EventDto {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  place: string;
  description: string;
  region: string;
}

export function toEventDto(event: Event): EventDto {
  return {
    id: event.id,
    title: event.title,
    date: toLegacyTimestamp(event.date),
    start_time: event.startTime,
    end_time: event.endTime,
    place: event.place,
    description: event.description,
    region: event.region,
  };
}

export interface VaccineDto {
  id: string;
  children_id: string;
  date: string;
  vaccine_name: string;
  place: string;
}

export function toVaccineDto(vaccine: Vaccine): VaccineDto {
  return {
    id: vaccine.id,
    children_id: vaccine.childId,
    date: toLegacyTimestamp(vaccine.date),
    vaccine_name: vaccine.vaccineName,
    place: vaccine.place,
  };
}
