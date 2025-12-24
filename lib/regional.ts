// Karimnagar-only configuration
export const DISTRICT_NAME = "Karimnagar";
export const OFFICER_NAME = "Sri Padala Rahul Garu";
export const OFFICER_TITLE = "Regional Transport Authority Member, Karimnagar";
export const OFFICER_PHOTO = "/assets/leadership/Karimnagarrtamemberpadalarahul.webp";

// Single district - no need for multiple authorities
export const getRegionalAuthority = () => ({
  code: "karimnagar",
  district: DISTRICT_NAME,
  officerName: OFFICER_NAME,
  officerTitle: OFFICER_TITLE,
  photo: OFFICER_PHOTO,
  description: "Leads district-wide enforcement and awareness drives focusing on student community road safety pledges and compliance.",
});

