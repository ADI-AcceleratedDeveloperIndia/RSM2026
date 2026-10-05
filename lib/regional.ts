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
    officerName: "Sri Padala Rahul Garu",
    officerTitle: "Regional Transport Authority Member, Karimnagar",
    photo: "/assets/leadership/Karimnagarrtamemberpadalarahul.webp",
    description:
      "Leads district-wide enforcement and awareness drives focusing on student community road safety pledges and compliance.",
  },
  hyderabad: {
    code: "hyderabad",
    district: "Hyderabad",
    officerName: "Regional Transport Officer",
    officerTitle: "Regional Transport Authority, Hyderabad",
    photo: "/assets/logo/Telangana-LOGO.png",
    description: "Capital district administration and urban road safety coordination.",
  },
  warangal: {
    code: "warangal",
    district: "Warangal",
    officerName: "Regional Transport Officer",
    officerTitle: "Regional Transport Authority, Warangal",
    photo: "/assets/logo/Telangana-LOGO.png",
    description: "Tri-cities regional transport authority and traffic enforcement.",
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
      officerName: `District Transport Officer, ${districtInfo.name}`,
      officerTitle: `Regional Transport Authority, ${districtInfo.name}`,
      photo: "/assets/logo/Telangana-LOGO.png",
      description: `Oversees road safety initiatives, institutional enforcement, and compliance in ${districtInfo.name} District.`,
    };
  }

  return undefined;
};
