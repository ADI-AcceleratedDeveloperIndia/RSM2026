export interface DistrictInfo {
  code: string;        // 4-letter code matching DISTRICT_CODE_MAP in reference.ts
  name: string;        // Full name
  state: string;       // "Telangana"
  stateCode: string;   // "TG"
}

export const STATE_DISTRICTS: DistrictInfo[] = [
  { name: "Adilabad", code: "ADLB", state: "State Government", stateCode: "SG" },
  { name: "Bhadradri Kothagudem", code: "BHDK", state: "State Government", stateCode: "SG" },
  { name: "Hanumakonda", code: "HNKD", state: "State Government", stateCode: "SG" },
  { name: "Hyderabad", code: "HYDR", state: "State Government", stateCode: "SG" },
  { name: "Jagtial", code: "JAGT", state: "State Government", stateCode: "SG" },
  { name: "Jangaon", code: "JNGO", state: "State Government", stateCode: "SG" },
  { name: "Jayashankar Bhupalpally", code: "JSBP", state: "State Government", stateCode: "SG" },
  { name: "Jogulamba Gadwal", code: "JGLG", state: "State Government", stateCode: "SG" },
  { name: "Kamareddy", code: "KMRD", state: "State Government", stateCode: "SG" },
  { name: "Karimnagar", code: "KRMR", state: "State Government", stateCode: "SG" },
  { name: "Khammam", code: "KHMM", state: "State Government", stateCode: "SG" },
  { name: "Kumuram Bheem Asifabad", code: "KMBA", state: "State Government", stateCode: "SG" },
  { name: "Mahabubabad", code: "MHBB", state: "State Government", stateCode: "SG" },
  { name: "Mahabubnagar", code: "MHBN", state: "State Government", stateCode: "SG" },
  { name: "Mancherial", code: "MNCH", state: "State Government", stateCode: "SG" },
  { name: "Medak", code: "MEDK", state: "State Government", stateCode: "SG" },
  { name: "Medchal-Malkajgiri", code: "MDML", state: "State Government", stateCode: "SG" },
  { name: "Mulugu", code: "MLGU", state: "State Government", stateCode: "SG" },
  { name: "Nagarkurnool", code: "NGKN", state: "State Government", stateCode: "SG" },
  { name: "Nalgonda", code: "NLGD", state: "State Government", stateCode: "SG" },
  { name: "Narayanpet", code: "NRYP", state: "State Government", stateCode: "SG" },
  { name: "Nirmal", code: "NRML", state: "State Government", stateCode: "SG" },
  { name: "Nizamabad", code: "NZBD", state: "State Government", stateCode: "SG" },
  { name: "Peddapalli", code: "PDDL", state: "State Government", stateCode: "SG" },
  { name: "Rajanna Sircilla", code: "RJSR", state: "State Government", stateCode: "SG" },
  { name: "Ranga Reddy", code: "RNGR", state: "State Government", stateCode: "SG" },
  { name: "Sangareddy", code: "SNGR", state: "State Government", stateCode: "SG" },
  { name: "Siddipet", code: "SDDP", state: "State Government", stateCode: "SG" },
  { name: "Suryapet", code: "SRYP", state: "State Government", stateCode: "SG" },
  { name: "Vikarabad", code: "VKBD", state: "State Government", stateCode: "SG" },
  { name: "Wanaparthy", code: "WNPR", state: "State Government", stateCode: "SG" },
  { name: "Warangal", code: "WRGL", state: "State Government", stateCode: "SG" },
  { name: "Yadadri Bhuvanagiri", code: "YDBG", state: "State Government", stateCode: "SG" }
];

export const TELANGANA_DISTRICTS = STATE_DISTRICTS;

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
