import type { ByAge, Sex } from "./who-reference.js";

export const HCFA_WHO_REFERENCE: Record<Sex, ByAge> = {
  M: {},
  F: {},
};

export const HCFA_REFERENCE_AVAILABLE =
  Object.keys(HCFA_WHO_REFERENCE.M).length > 0 &&
  Object.keys(HCFA_WHO_REFERENCE.F).length > 0;
