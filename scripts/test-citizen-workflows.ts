import { NextRequest } from "next/server";
import { POST as quizSubmitPOST } from "../app/api/quiz/submit/route";
import { POST as simStartPOST } from "../app/api/sim/start/route";
import { POST as simCompletePOST } from "../app/api/sim/complete/route";
import { GET as simStatsGET } from "../app/api/sim/stats/route";
import { POST as simPlayPOST } from "../app/api/simulation/play/route";
import { POST as certCreatePOST } from "../app/api/certificates/create/route";
import { GET as certGetGET } from "../app/api/certificates/get/route";
import { POST as pledgeSubmitPOST } from "../app/api/parents-pledge/submit/route";
import { GET as pledgePngGET } from "../app/api/parents-pledge/generate-png/route";
import { POST as hazardReportPOST } from "../app/api/hazards/report/route";
import { POST as actionCreatePOST } from "../app/api/actions/create/route";
import { POST as clubJoinPOST } from "../app/api/club/join/route";

async function runTests() {
  console.log("=== CITIZEN WORKFLOW & ACTION AUDIT TEST SUITE ===");
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

  // 1. Quiz Submission Tests
  console.log("\n--- Testing Quiz Submission Flow ---");
  try {
    // 1a. Merit score (15/15)
    const meritReq = new NextRequest("http://localhost:3000/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-real-ip": "127.0.0.1" },
      body: JSON.stringify({
        fullName: "Rahul Sharma",
        institution: "Delhi Public School, Hyderabad",
        answers: [1, 0, 1, 1, 2, 2, 1, 1, 3, 1, 1, 0, 1, 1, 1], // All 15 correct
      }),
    });
    const meritRes = await quizSubmitPOST(meritReq);
    const meritData = await meritRes.json();
    assert(meritRes.status === 200 && meritData.passed === true && meritData.score === 15 && meritData.certificateType === "QUIZ", "Quiz Merit score calculation & certificateType QUIZ");

    // 1b. Participant score (3/15)
    const parReq = new NextRequest("http://localhost:3000/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-real-ip": "127.0.0.2" },
      body: JSON.stringify({
        fullName: "Ananya Rao",
        institution: "St. Ann's College",
        answers: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // mostly incorrect
      }),
    });
    const parRes = await quizSubmitPOST(parReq);
    const parData = await parRes.json();
    assert(parRes.status === 200 && parData.passed === false && parData.certificateType === "PAR", "Quiz Participant score calculation & certificateType PAR");
  } catch (e: any) {
    assert(false, "Quiz Submission threw exception", e?.message);
  }

  // 2. Simulation Stats & Events Tests
  console.log("\n--- Testing Simulation Workflows ---");
  try {
    // 2a. Sim start
    const simStartReq = new NextRequest("http://localhost:3000/api/sim/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sceneId: "bike_helmet_01" }),
    });
    const simStartRes = await simStartPOST(simStartReq);
    const simStartData = await simStartRes.json();
    assert(simStartRes.status === 200 && simStartData.ok === true, "Sim start logging succeeds");

    // 2b. Sim completion
    const simCompReq = new NextRequest("http://localhost:3000/api/sim/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sceneId: "bike_helmet_01",
        success: true,
        attempts: 1,
        seconds: 45,
      }),
    });
    const simCompRes = await simCompletePOST(simCompReq);
    const simCompData = await simCompRes.json();
    assert(simCompRes.status === 200 && simCompData.ok === true && typeof simCompData.referenceId === "string", "Sim completion returns referenceId");

    // 2c. Sim stats GET
    const simStatsReq = new NextRequest("http://localhost:3000/api/sim/stats", { method: "GET" });
    const simStatsRes = await simStatsGET(simStatsReq);
    const simStatsData = await simStatsRes.json();
    assert(simStatsRes.status === 200 && typeof simStatsData.totalSessions === "number", "Sim stats returns valid aggregated data");

    // 2d. Simulation play tracker
    const simPlayReq = new NextRequest("http://localhost:3000/api/simulation/play", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "bike" }),
    });
    const simPlayRes = await simPlayPOST(simPlayReq);
    const simPlayData = await simPlayRes.json();
    assert(simPlayRes.status === 200 && simPlayData.ok === true, "Simulation play analytics tracking succeeds");
  } catch (e: any) {
    assert(false, "Simulation routes threw exception", e?.message);
  }

  // 3. Certificate Creation & Retrieval Tests
  console.log("\n--- Testing Certificate Workflows ---");
  try {
    const certReq = new NextRequest("http://localhost:3000/api/certificates/create", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-real-ip": "127.0.0.10" },
      body: JSON.stringify({
        type: "PARTICIPANT",
        fullName: "K. Venkatesh",
        institution: "Kakatiya University, Warangal",
        score: 12,
        total: 15,
        activityType: "quiz",
        district: "Warangal",
        userEmail: "venkatesh@example.com",
      }),
    });
    const certRes = await certCreatePOST(certReq);
    const certData = await certRes.json();
    assert(
      (certRes.status === 200 || certRes.status === 201) &&
      typeof certData.certificateId === "string" &&
      typeof certData.downloadUrl === "string",
      "Certificate creation succeeds with resilient certificateId & downloadUrl",
      certData
    );

    if (certData.certificateId) {
      const getCertReq = new NextRequest(`http://localhost:3000/api/certificates/get?certId=${encodeURIComponent(certData.certificateId)}`);
      const getCertRes = await certGetGET(getCertReq);
      const getCertData = await getCertRes.json();
      assert(
        getCertRes.status === 200 &&
        getCertData.certificate?.institution === "Kakatiya University, Warangal" &&
        getCertData.certificate?.fullName === "K. Venkatesh",
        "Certificate get retrieves saved institution name correctly",
        getCertData
      );
    }
  } catch (e: any) {
    assert(false, "Certificate workflow threw exception", e?.message);
  }

  // 4. Parents Pledge Tests
  console.log("\n--- Testing Parents Pledge Workflow ---");
  try {
    const pledgeReq = new NextRequest("http://localhost:3000/api/parents-pledge/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-real-ip": "127.0.0.20" },
      body: JSON.stringify({
        childName: "Aditya Kumar",
        institutionName: "Hyderabad Public School",
        parentName: "Srinivas Kumar",
        district: "Hyderabad",
      }),
    });
    const pledgeRes = await pledgeSubmitPOST(pledgeReq);
    const pledgeData = await pledgeRes.json();
    assert(pledgeRes.status === 200 && typeof pledgeData.pledgeId === "string", "Parents pledge submission succeeds with pledgeId");

    if (pledgeData.pledgeId) {
      const pngReq = new NextRequest(`http://localhost:3000/api/parents-pledge/generate-png?pledgeId=${encodeURIComponent(pledgeData.pledgeId)}`);
      const pngRes = await pledgePngGET(pngReq);
      const pngData = await pngRes.json();
      assert(
        pngRes.status === 200 &&
        typeof pngData.html === "string" &&
        pngData.pledge?.institutionName === "Hyderabad Public School",
        "Parents pledge PNG generation returns HTML and accurate institution data"
      );
    }
  } catch (e: any) {
    assert(false, "Parents pledge workflow threw exception", e?.message);
  }

  // 5. Citizen Hazard Reporting Tests
  console.log("\n--- Testing Citizen Hazard Reporting ---");
  try {
    const hazardReq = new NextRequest("http://localhost:3000/api/hazards/report", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-real-ip": "127.0.0.30" },
      body: JSON.stringify({
        title: "Deep crater near Collectorate circle",
        description: "Large waterlogged pothole causing traffic slowdown and safety risk",
        category: "pothole",
        severity: "high",
        district: "Karimnagar",
        location: "Opposite Collectorate Circle, Main Road",
        latitude: 18.4386,
        longitude: 79.1288,
        reportedBy: "G. Mahesh",
        reporterContact: "9876543210",
        photos: ["https://example.com/pothole1.jpg"],
      }),
    });
    const hazardRes = await hazardReportPOST(hazardReq as any);
    const hazardData = await hazardRes.json();
    assert(
      (hazardRes.status === 200 && typeof hazardData.hazardId === "string") ||
      (hazardRes.status === 503 && typeof hazardData.error === "string"),
      "Hazard reporting validates GPS/photo and handles DB gracefully without 500",
      hazardData
    );

    // Test invalid GPS coordinates validation
    const badGpsReq = new NextRequest("http://localhost:3000/api/hazards/report", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-real-ip": "127.0.0.31" },
      body: JSON.stringify({
        title: "Broken signal",
        description: "Signal not working",
        category: "broken_signal",
        district: "Hyderabad",
        location: "Junction",
        latitude: 999, // Invalid latitude
        reportedBy: "Tester",
      }),
    });
    const badGpsRes = await hazardReportPOST(badGpsReq as any);
    assert(badGpsRes.status === 400, "Hazard reporting rejects invalid GPS latitude (> 90)");
  } catch (e: any) {
    assert(false, "Hazard report workflow threw exception", e?.message);
  }

  // 6. Safety Action Submission Tests
  console.log("\n--- Testing Safety Action Submission ---");
  try {
    const actionReq = new NextRequest("http://localhost:3000/api/actions/create", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-real-ip": "127.0.0.40" },
      body: JSON.stringify({
        title: "Helmet Awareness Distribution at City Square",
        description: "Volunteers distributing safety pamphlets and demonstrating ISI helmet straps",
        fourECategory: "education",
        actionType: "individual",
        priority: "high",
        submittedBy: "Sunil Varma",
        district: "Karimnagar",
        targetDate: "2027-02-15",
        estimatedBeneficiaries: 50,
      }),
    });
    const actionRes = await actionCreatePOST(actionReq as any);
    const actionData = await actionRes.json();
    assert(
      (actionRes.status === 200 && typeof actionData.actionId === "string") ||
      (actionRes.status === 503 && typeof actionData.error === "string"),
      "Action creation handles submission and DB errors gracefully without 500",
      actionData
    );
  } catch (e: any) {
    assert(false, "Safety Action submission threw exception", e?.message);
  }

  // 7. Club Join Tests
  console.log("\n--- Testing Club Join Flow ---");
  try {
    const clubReq = new NextRequest("http://localhost:3000/api/club/join", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-real-ip": "127.0.0.50" },
      body: JSON.stringify({
        institutionName: "Govt High School",
        district: "Karimnagar",
        pointOfContact: "Headmaster",
        organizerId: "NON-EXISTENT-ORG-99999",
      }),
    });
    const clubRes = await clubJoinPOST(clubReq);
    const clubData = await clubRes.json();
    assert(
      (clubRes.status === 404 && clubData.error.includes("not found")) ||
      (clubRes.status === 503 && typeof clubData.error === "string"),
      "Club join returns descriptive status (404/503) without unhandled 500 crash",
      clubData
    );
  } catch (e: any) {
    assert(false, "Club join flow threw exception", e?.message);
  }

  console.log("\n==================================================");
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==================================================");

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
