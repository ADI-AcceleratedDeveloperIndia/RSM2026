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
};

export const getRegionalAuthority = (code: string | null | undefined) =>
  code ? REGIONAL_AUTHORITIES[code.toLowerCase()] : undefined;

