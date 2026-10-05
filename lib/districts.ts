export interface DistrictInfo {
  code: string;        // 4-letter code matching DISTRICT_CODE_MAP in reference.ts
  name: string;        // Full name
  state: string;       // "Telangana"
  stateCode: string;   // "TG"
}

export const TELANGANA_DISTRICTS: DistrictInfo[] = [
  { name: "Adilabad", code: "ADLB", state: "Telangana", stateCode: "TG" },
  { name: "Bhadradri Kothagudem", code: "BHDK", state: "Telangana", stateCode: "TG" },
  { name: "Hanumakonda", code: "HNKD", state: "Telangana", stateCode: "TG" },
  { name: "Hyderabad", code: "HYDR", state: "Telangana", stateCode: "TG" },
  { name: "Jagtial", code: "JAGT", state: "Telangana", stateCode: "TG" },
  { name: "Jangaon", code: "JNGO", state: "Telangana", stateCode: "TG" },
  { name: "Jayashankar Bhupalpally", code: "JSBP", state: "Telangana", stateCode: "TG" },
  { name: "Jogulamba Gadwal", code: "JGLG", state: "Telangana", stateCode: "TG" },
  { name: "Kamareddy", code: "KMRD", state: "Telangana", stateCode: "TG" },
  { name: "Karimnagar", code: "KRMR", state: "Telangana", stateCode: "TG" },
  { name: "Khammam", code: "KHMM", state: "Telangana", stateCode: "TG" },
  { name: "Kumuram Bheem Asifabad", code: "KMBA", state: "Telangana", stateCode: "TG" },
  { name: "Mahabubabad", code: "MHBB", state: "Telangana", stateCode: "TG" },
  { name: "Mahabubnagar", code: "MHBN", state: "Telangana", stateCode: "TG" },
  { name: "Mancherial", code: "MNCH", state: "Telangana", stateCode: "TG" },
  { name: "Medak", code: "MEDK", state: "Telangana", stateCode: "TG" },
  { name: "Medchal-Malkajgiri", code: "MDML", state: "Telangana", stateCode: "TG" },
  { name: "Mulugu", code: "MLGU", state: "Telangana", stateCode: "TG" },
  { name: "Nagarkurnool", code: "NGKN", state: "Telangana", stateCode: "TG" },
  { name: "Nalgonda", code: "NLGD", state: "Telangana", stateCode: "TG" },
  { name: "Narayanpet", code: "NRYP", state: "Telangana", stateCode: "TG" },
  { name: "Nirmal", code: "NRML", state: "Telangana", stateCode: "TG" },
  { name: "Nizamabad", code: "NZBD", state: "Telangana", stateCode: "TG" },
  { name: "Peddapalli", code: "PDDL", state: "Telangana", stateCode: "TG" },
  { name: "Rajanna Sircilla", code: "RJSR", state: "Telangana", stateCode: "TG" },
  { name: "Ranga Reddy", code: "RNGR", state: "Telangana", stateCode: "TG" },
  { name: "Sangareddy", code: "SNGR", state: "Telangana", stateCode: "TG" },
  { name: "Siddipet", code: "SDDP", state: "Telangana", stateCode: "TG" },
  { name: "Suryapet", code: "SRYP", state: "Telangana", stateCode: "TG" },
  { name: "Vikarabad", code: "VKBD", state: "Telangana", stateCode: "TG" },
  { name: "Wanaparthy", code: "WNPR", state: "Telangana", stateCode: "TG" },
  { name: "Warangal", code: "WRGL", state: "Telangana", stateCode: "TG" },
  { name: "Yadadri Bhuvanagiri", code: "YDBG", state: "Telangana", stateCode: "TG" }
];

export const DISTRICT_MAP: Record<string, DistrictInfo> = TELANGANA_DISTRICTS.reduce((acc, curr) => {
  acc[curr.name] = curr;
  return acc;
}, {} as Record<string, DistrictInfo>);

export const DISTRICT_CODE_TO_NAME: Record<string, string> = TELANGANA_DISTRICTS.reduce((acc, curr) => {
  acc[curr.code] = curr.name;
  return acc;
}, {} as Record<string, string>);

export const DISTRICT_NAMES: string[] = TELANGANA_DISTRICTS.map(d => d.name).sort();

export function getDistrictByCode(code: string): DistrictInfo | undefined {
  return TELANGANA_DISTRICTS.find(d => d.code === code);
}

export function getDistrictByName(name: string): DistrictInfo | undefined {
  return DISTRICT_MAP[name];
}
