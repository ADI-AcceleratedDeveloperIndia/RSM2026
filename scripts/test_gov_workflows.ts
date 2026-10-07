import { NextRequest } from "next/server";
import { GET as getGovDashboard } from "@/app/api/gov/dashboard/route";
import { GET as getGovDistricts } from "@/app/api/gov/districts/route";
import { GET as get4ESummary } from "@/app/api/gov/4e/summary/route";
import { GET as getScorecardsList } from "@/app/api/scorecards/list/route";
import { GET as getDistrictScorecard } from "@/app/api/scorecards/[districtCode]/route";
import { GET as getHazardsList } from "@/app/api/hazards/list/route";
import { GET as getActionsList } from "@/app/api/actions/list/route";
import { GET as getInstitutionsList } from "@/app/api/institutions/list/route";
import { GET as getReportsList } from "@/app/api/reports/list/route";
import { POST as generateReport } from "@/app/api/reports/generate/route";
import { hasPermission, canAccessDistrict, getScopedDistrict, GovSession, GovRole } from "@/lib/govAuth";

function makeGetRequest(url: string, headers: Record<string, string> = {}) {
  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  } as any);
}

function makePostRequest(url: string, body: any, headers: Record<string, string> = {}) {
  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  } as any);
}

async function runGovWorkflowTests() {
  console.log("=== STARTING GOVERNMENT & ADMINISTRATIVE WORKFLOW AUDIT ===\n");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: any) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`, details || "");
      failed++;
    }
  }

  // 1. RBAC Hierarchy Verification
  console.log("\n--- Testing RBAC Roles & Hierarchy ---");
  const superadminSession: GovSession = {
    user: {
      id: "admin-1",
      email: "admin@rsm2027.gov.in",
      role: "superadmin",
    },
  };

  const stateAdminSession: GovSession = {
    user: {
      id: "admin-2",
      email: "commissioner.transport@stategov.in",
      role: "state_admin",
    },
  };

  const dtoHydSession: GovSession = {
    user: {
      id: "dto-hyd",
      email: "dto.hyderabad@rsm2027.gov.in",
      role: "district_admin",
      district: "Hyderabad",
    },
  };

  const verifierSession: GovSession = {
    user: {
      id: "ver-1",
      email: "verifier.karimnagar@rsm2027.gov.in",
      role: "verifier",
      district: "Karimnagar",
    },
  };

  assert(hasPermission(superadminSession.user.role, "verifier") === true, "Superadmin satisfies verifier requirement");
  assert(hasPermission(superadminSession.user.role, "district_admin") === true, "Superadmin satisfies district_admin requirement");
  assert(hasPermission(superadminSession.user.role, "state_admin") === true, "Superadmin satisfies state_admin requirement");
  assert(hasPermission(superadminSession.user.role, "superadmin") === true, "Superadmin satisfies superadmin requirement");

  assert(hasPermission(stateAdminSession.user.role, "district_admin") === true, "State Admin satisfies district_admin requirement");
  assert(hasPermission(stateAdminSession.user.role, "superadmin") === false, "State Admin cannot access superadmin-only actions");

  assert(hasPermission(dtoHydSession.user.role, "district_admin") === true, "DTO Hyderabad satisfies district_admin requirement");
  assert(hasPermission(dtoHydSession.user.role, "state_admin") === false, "DTO Hyderabad cannot access state_admin actions");

  assert(hasPermission(verifierSession.user.role, "verifier") === true, "Verifier satisfies verifier requirement");
  assert(hasPermission(verifierSession.user.role, "district_admin") === false, "Verifier cannot access district_admin actions");

  // 2. Jurisdiction & District Scoping
  console.log("\n--- Testing Jurisdiction Scoping ---");
  assert(canAccessDistrict(superadminSession.user.role, superadminSession.user.district, "Karimnagar") === true, "Superadmin can access Karimnagar");
  assert(canAccessDistrict(superadminSession.user.role, superadminSession.user.district, "Hyderabad") === true, "Superadmin can access Hyderabad");
  assert(canAccessDistrict(stateAdminSession.user.role, stateAdminSession.user.district, "Warangal") === true, "State Admin can access Warangal");

  assert(canAccessDistrict(dtoHydSession.user.role, dtoHydSession.user.district, "Hyderabad") === true, "DTO Hyderabad can access Hyderabad");
  assert(canAccessDistrict(dtoHydSession.user.role, dtoHydSession.user.district, "hyderabad") === true, "DTO Hyderabad can access case-insensitive hyderabad");
  assert(canAccessDistrict(dtoHydSession.user.role, dtoHydSession.user.district, "Karimnagar") === false, "DTO Hyderabad is blocked from Karimnagar");

  assert(getScopedDistrict(dtoHydSession, "Karimnagar") === "Hyderabad", "DTO requested district is strictly clamped to their own district");
  assert(getScopedDistrict(superadminSession, "Karimnagar") === "Karimnagar", "Superadmin requested district is respected");
  assert(getScopedDistrict(superadminSession, null) === null, "Superadmin with no requested district gets state-wide view");

  // 3. Mission Control Dashboard API
  console.log("\n--- Testing Government Dashboard Telemetry ---");
  try {
    const reqState = makeGetRequest("http://localhost:3000/api/gov/dashboard");
    const resState = await getGovDashboard(reqState);
    const dataState = await resState.json();
    assert(
      resState.status === 200 && dataState.kpis && typeof dataState.totals?.pledges === "number",
      "State-wide Dashboard returns valid KPIs and totals with 200 status",
      { status: resState.status, kpis: dataState.kpis, totals: dataState.totals }
    );
    assert(
      Array.isArray(dataState.topDistricts) && dataState.topDistricts.length > 0,
      "State-wide Dashboard includes top districts leaderboard",
      { count: dataState.topDistricts?.length }
    );
  } catch (e: any) {
    assert(false, "State-wide Dashboard test threw error", e);
  }

  // 4. District-Scoped Dashboard API
  try {
    const reqDist = makeGetRequest("http://localhost:3000/api/gov/dashboard?district=Karimnagar");
    const resDist = await getGovDashboard(reqDist);
    const dataDist = await resDist.json();
    assert(
      resDist.status === 200 && dataDist.kpis && dataDist.topDistricts?.[0]?.district === "Karimnagar",
      "District Dashboard returns district-specific telemetry",
      { topDistrict: dataDist.topDistricts?.[0], kpis: dataDist.kpis }
    );
  } catch (e: any) {
    assert(false, "District Dashboard test threw error", e);
  }

  // 5. 33 Districts Benchmarks API
  console.log("\n--- Testing 33 Districts Benchmarks ---");
  try {
    const resDistricts = await getGovDistricts();
    const dataDistricts = await resDistricts.json();
    assert(
      resDistricts.status === 200 && Array.isArray(dataDistricts.districts) && dataDistricts.districts.length === 33,
      "Districts API returns full 33 Telangana districts array with benchmarks",
      { count: dataDistricts.districts?.length }
    );
    const topDist = dataDistricts.districts[0];
    assert(
      Boolean(topDist.rank && topDist.score && topDist.grade),
      "District items have rank, score, and grade",
      topDist
    );
  } catch (e: any) {
    assert(false, "Districts API test threw error", e);
  }

  // 6. 4E Summary API
  console.log("\n--- Testing 4E Pillar Summary API ---");
  try {
    const res4E = await get4ESummary();
    const data4E = await res4E.json();
    assert(
      res4E.status === 200 && Array.isArray(data4E.pillars) && data4E.pillars.length === 4 && data4E.summary?.totalPillars === 4,
      "4E Summary API returns all 4 pillars with quantitative breakdown",
      { summary: data4E }
    );
  } catch (e: any) {
    assert(false, "4E Summary API test threw error", e);
  }

  // 7. Scorecards API
  console.log("\n--- Testing Scorecards API ---");
  try {
    const reqScorecards = makeGetRequest("http://localhost:3000/api/scorecards/list");
    const resScorecards = await getScorecardsList();
    const dataScorecards = await resScorecards.json();
    assert(
      resScorecards.status === 200 && Array.isArray(dataScorecards.scorecards) && dataScorecards.scorecards.length === 33,
      "Scorecards List API returns scorecards for all 33 districts",
      { count: dataScorecards.scorecards?.length }
    );

    const reqHydScorecard = makeGetRequest("http://localhost:3000/api/scorecards/HYD");
    const resHydScorecard = await getDistrictScorecard(reqHydScorecard, { params: Promise.resolve({ districtCode: "HYD" }) });
    const dataHydScorecard = await resHydScorecard.json();
    assert(
      resHydScorecard.status === 200 && dataHydScorecard.scorecard && dataHydScorecard.scorecard.districtName === "Hyderabad",
      "District Scorecard API returns scorecard details for Hyderabad",
      dataHydScorecard.scorecard
    );
  } catch (e: any) {
    assert(false, "Scorecards API test threw error", e);
  }

  // 8. Hazards Triage & Verification API
  console.log("\n--- Testing Hazards API ---");
  try {
    const reqHazards = makeGetRequest("http://localhost:3000/api/hazards/list");
    const resHazards = await getHazardsList(reqHazards);
    const dataHazards = await resHazards.json();
    assert(
      resHazards.status === 200 && Array.isArray(dataHazards.hazards),
      "Hazards List API returns hazard list without 500 error",
      { count: dataHazards.hazards?.length }
    );
  } catch (e: any) {
    assert(false, "Hazards List test threw error", e);
  }

  // 9. Actions Verification API
  console.log("\n--- Testing Actions Verification API ---");
  try {
    const reqActions = makeGetRequest("http://localhost:3000/api/actions/list");
    const resActions = await getActionsList(reqActions);
    const dataActions = await resActions.json();
    assert(
      resActions.status === 200 && Array.isArray(dataActions.actions),
      "Actions List API returns citizen action submissions without 500 error",
      { count: dataActions.actions?.length }
    );
  } catch (e: any) {
    assert(false, "Actions List test threw error", e);
  }

  // 10. Institutions Accreditation API
  console.log("\n--- Testing Institutions List API ---");
  try {
    const reqInst = makeGetRequest("http://localhost:3000/api/institutions/list");
    const resInst = await getInstitutionsList(reqInst);
    const dataInst = await resInst.json();
    assert(
      resInst.status === 200 && Array.isArray(dataInst.institutions),
      "Institutions List API returns institution roster without 500 error",
      { count: dataInst.institutions?.length }
    );
  } catch (e: any) {
    assert(false, "Institutions List test threw error", e);
  }

  // 11. Reports Generation & Listing API
  console.log("\n--- Testing Reports API ---");
  try {
    const reqReports = makeGetRequest("http://localhost:3000/api/reports/list");
    const resReports = await getReportsList(reqReports);
    const dataReports = await resReports.json();
    assert(
      resReports.status === 200 && Array.isArray(dataReports.reports),
      "Reports List API returns dossier catalog without 500 error",
      { count: dataReports.reports?.length }
    );

    const reqGenReport = makePostRequest("http://localhost:3000/api/reports/generate", {
      type: "monthly",
      district: "Karimnagar",
      title: "Karimnagar Road Safety Monthly Dossier",
    });
    const resGenReport = await generateReport(reqGenReport);
    const dataGenReport = await resGenReport.json();
    assert(
      resGenReport.status === 200 && dataGenReport.success && dataGenReport.report,
      "Reports Generate API creates a verified safety report without 500 error",
      dataGenReport.report
    );
  } catch (e: any) {
    assert(false, "Reports Generate test threw error", e);
  }

  console.log(`\n=== GOV WORKFLOW AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED ===\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runGovWorkflowTests().catch((e) => {
  console.error("FATAL GOV AUDIT ERROR:", e);
  process.exit(1);
});
