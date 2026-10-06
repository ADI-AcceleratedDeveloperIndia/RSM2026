import { getDistrictByName, getDistrictByCode } from "./districts";

export interface RegionalAuthority {
  code: string;
  district: string;
  officerName: string;
  officerTitle: string;
  photo: string;
  description: string;
}

export const REGIONAL_AUTHORITIES: Record<string, RegionalAuthority> = {
  karimnagar: {
    code: "karimnagar",
    district: "Karimnagar",
    officerName: "District Road Transport Authority Head",
    officerTitle: "District Transport Officer (DTO) / RTA Head, Karimnagar",
    photo: "/assets/leadership/district-rta-head-placeholder.svg",
    description:
      "Leads district-wide transport administration, enforcement, and road safety compliance.",
  },
  hyderabad: {
    code: "hyderabad",
    district: "Hyderabad",
    officerName: "District Road Transport Authority Head",
    officerTitle: "District Transport Officer (DTO) / RTA Head, Hyderabad",
    photo: "/assets/leadership/district-rta-head-placeholder.svg",
    description: "Capital district transport administration and urban road safety coordination.",
  },
  warangal: {
    code: "warangal",
    district: "Warangal",
    officerName: "District Road Transport Authority Head",
    officerTitle: "District Transport Officer (DTO) / RTA Head, Warangal",
    photo: "/assets/leadership/district-rta-head-placeholder.svg",
    description: "Regional transport administration and highway corridor enforcement.",
  },
};

export const getRegionalAuthority = (code: string | null | undefined): RegionalAuthority | undefined => {
  if (!code) return undefined;
  const key = code.toLowerCase().trim();
  if (REGIONAL_AUTHORITIES[key]) return REGIONAL_AUTHORITIES[key];

  // Try finding by district name or code
  const districtInfo = getDistrictByName(code) || getDistrictByCode(code.toUpperCase());
  if (districtInfo) {
    const dKey = districtInfo.name.toLowerCase();
    if (REGIONAL_AUTHORITIES[dKey]) return REGIONAL_AUTHORITIES[dKey];
    // Return standard regional authority metadata for the district
    return {
      code: districtInfo.code.toLowerCase(),
      district: districtInfo.name,
      officerName: `District Road Transport Authority Head`,
      officerTitle: `District Transport Officer (DTO) / RTA Head, ${districtInfo.name}`,
      photo: "/assets/leadership/district-rta-head-placeholder.svg",
      description: `Oversees transport administration, safety initiatives, and compliance in ${districtInfo.name} District.`,
    };
  }

  return undefined;
};
