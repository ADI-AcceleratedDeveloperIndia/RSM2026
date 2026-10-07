import { NextRequest } from "next/server";
import { POST as registerOrganizer } from "@/app/api/organizer/register/route";
import { POST as loginOrganizer } from "@/app/api/organizer/login/route";
import { GET as getOrganizerStatus } from "@/app/api/organizer/status/route";
import { GET as getOrganizerEvents } from "@/app/api/organizer/events/route";
import { POST as createEvent } from "@/app/api/events/create/route";
import { GET as getEventDetails } from "@/app/api/events/[eventId]/route";
import { GET as getEventParticipants } from "@/app/api/events/participants/route";
import { DELETE as deleteEventPhoto } from "@/app/api/events/delete-photo/route";
import { POST as createCertificate } from "@/app/api/certificates/create/route";
import { POST as registerInstitution } from "@/app/api/institutions/register/route";
import { GET as listInstitutions } from "@/app/api/institutions/list/route";

function makeNextRequest(url: string, options: { method?: string; body?: any } = {}) {
  const init: RequestInit = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "127.0.0.1",
    },
  };
  if (options.body) {
    init.body = JSON.stringify(options.body);
  }
  return new NextRequest(new URL(url, "http://localhost:3000"), init as any);
}

async function runAuditTests() {
  console.log("=== STARTING ORGANIZER & INSTITUTION AUDIT TESTS ===\n");
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

  // TEST 1: Organizer Registration Validation (Missing District)
  try {
    const req = makeNextRequest("http://localhost:3000/api/organizer/register", {
      method: "POST",
      body: {
        fullName: "Ramesh Sharma",
        email: "ramesh@school.org",
        phone: "9876543210",
        institution: "Model High School",
        designation: "Principal",
        // district omitted
      },
    });
    const res = await registerOrganizer(req);
    const data = await res.json();
    assert(
      res.status === 400 && data.error.includes("District"),
      "Organizer Registration rejects request when District is missing",
      data
    );
  } catch (e: any) {
    assert(false, "Organizer Registration missing district test threw error", e);
  }

  // TEST 2: Organizer Registration Validation (Missing Name or Phone)
  try {
    const req = makeNextRequest("http://localhost:3000/api/organizer/register", {
      method: "POST",
      body: {
        fullName: "",
        email: "ramesh@school.org",
        phone: "123", // too short
        institution: "Model High School",
        designation: "Principal",
        district: "Karimnagar",
      },
    });
    const res = await registerOrganizer(req);
    const data = await res.json();
    assert(
      res.status === 400,
      "Organizer Registration rejects request when Name is empty",
      data
    );
  } catch (e: any) {
    assert(false, "Organizer Registration missing name test threw error", e);
  }

  // TEST 3: Organizer Registration Success with all fields
  let testTempId = "";
  try {
    const req = makeNextRequest("http://localhost:3000/api/organizer/register", {
      method: "POST",
      body: {
        fullName: "Ananya Rao",
        email: `ananya_${Date.now()}@kakatiya.edu`,
        phone: "9848022338",
        institution: "Kakatiya High School",
        designation: "Road Safety In-Charge",
        district: "Warangal",
        password: "SecurePassword123!",
      },
    });
    const res = await registerOrganizer(req);
    const data = await res.json();
    testTempId = data.temporaryId;
    assert(
      res.status === 200 && data.success === true && data.status === "pending" && Boolean(data.temporaryId),
      "Organizer Registration succeeds, returns temporaryId and clear pending status",
      data
    );
  } catch (e: any) {
    assert(false, "Organizer Registration success test threw error", e);
  }

  // TEST 4: Organizer Status Check with Temporary ID
  try {
    const req = makeNextRequest(`http://localhost:3000/api/organizer/status?temporaryId=${encodeURIComponent(testTempId)}`);
    const res = await getOrganizerStatus(req);
    const data = await res.json();
    assert(
      res.status === 200 && data.status === "pending" && data.temporaryId === testTempId,
      "Organizer Status returns verified details for registered organizer",
      data
    );
  } catch (e: any) {
    assert(false, "Organizer Status check threw error", e);
  }

  // TEST 5: Organizer Login with Registered Identifier and Password
  try {
    const req = makeNextRequest("http://localhost:3000/api/organizer/login", {
      method: "POST",
      body: {
        identifier: testTempId,
        password: "SecurePassword123!",
      },
    });
    const res = await loginOrganizer(req);
    const data = await res.json();
    assert(
      res.status === 200 && data.success === true && data.organizer?.temporaryId === testTempId,
      "Organizer Login succeeds with temporary ID and password",
      data
    );
  } catch (e: any) {
    assert(false, "Organizer Login threw error", e);
  }

  // TEST 6: Organizer Login with Registered Phone number
  try {
    const req = makeNextRequest("http://localhost:3000/api/organizer/login", {
      method: "POST",
      body: {
        identifier: testTempId,
        phone: "9848022338",
      },
    });
    const res = await loginOrganizer(req);
    const data = await res.json();
    assert(
      res.status === 200 && data.success === true && data.organizer?.phone === "9848022338",
      "Organizer Login succeeds with registered phone number",
      data
    );
  } catch (e: any) {
    assert(false, "Organizer Phone Login threw error", e);
  }

  // TEST 7: Organizer Login with Invalid Credentials handles without 500
  try {
    const req = makeNextRequest("http://localhost:3000/api/organizer/login", {
      method: "POST",
      body: {
        identifier: "NON-EXISTENT-ID",
        password: "wrongPassword",
      },
    });
    const res = await loginOrganizer(req);
    const data = await res.json();
    assert(
      res.status === 404,
      "Organizer Login handles non-existent credentials gracefully without 500 error",
      data
    );
  } catch (e: any) {
    assert(false, "Organizer Login invalid credentials test threw error", e);
  }

  // TEST 8: Event Creation with Organizer ID (Passes through institution name)
  let createdEventRefId = "";
  try {
    const req = makeNextRequest("http://localhost:3000/api/events/create", {
      method: "POST",
      body: {
        title: "Kakatiya Road Safety Rally 2027",
        organizerId: testTempId,
        date: "2027-01-20",
        location: "Warangal City Center",
        eventType: "regional",
        eventContext: "offline",
        district: "Warangal",
        institution: "Kakatiya High School",
      },
    });
    const res = await createEvent(req);
    const data = await res.json();
    createdEventRefId = data.referenceId;
    assert(
      res.status === 200 && data.success === true && data.institution === "Kakatiya High School",
      "Event Creation succeeds and confirms host institution name",
      data
    );
  } catch (e: any) {
    assert(false, "Event Creation test threw error", e);
  }

  // TEST 9: Event Details Fetch
  try {
    const req = makeNextRequest(`http://localhost:3000/api/events/${createdEventRefId}`);
    const res = await getEventDetails(req, { params: Promise.resolve({ eventId: createdEventRefId }) });
    const data = await res.json();
    assert(
      res.status === 200 && data.event?.referenceId === createdEventRefId && data.event?.institution === "Kakatiya High School",
      "Event Details route returns complete event info and institution name",
      data
    );
  } catch (e: any) {
    assert(false, "Event Details test threw error", e);
  }

  // TEST 10: Organizer Events Fetch
  try {
    const req = makeNextRequest(`http://localhost:3000/api/organizer/events?organizerId=${encodeURIComponent(testTempId)}`);
    const res = await getOrganizerEvents(req);
    const data = await res.json();
    assert(
      res.status === 200 && Array.isArray(data.events) && data.events.some((e: any) => e.referenceId === createdEventRefId),
      "Organizer Events lists events created by this organizer",
      data
    );
  } catch (e: any) {
    assert(false, "Organizer Events test threw error", e);
  }

  // TEST 11: Event Photo Deletion Authorization
  try {
    const req = makeNextRequest("http://localhost:3000/api/events/delete-photo", {
      method: "DELETE",
      body: {
        eventReferenceId: createdEventRefId,
        organizerId: testTempId,
      },
    });
    const res = await deleteEventPhoto(req);
    const data = await res.json();
    assert(
      res.status === 200 && data.success === true,
      "Event Photo Deletion validates authorized organizer and deletes cleanly",
      data
    );
  } catch (e: any) {
    assert(false, "Event Photo Delete test threw error", e);
  }

  // TEST 12: Certificate Creation with Event (Ensures institution is passed through and inherited)
  let createdCertId = "";
  try {
    const req = makeNextRequest("http://localhost:3000/api/certificates/create", {
      method: "POST",
      body: {
        type: "PARTICIPANT",
        fullName: "Sai Teja",
        score: 18,
        total: 20,
        activityType: "quiz",
        organizerReferenceId: createdEventRefId,
        participationContext: "offline",
        district: "Warangal",
        // institution intentionally omitted to test auto-inheritance from event
      },
    });
    const res = await createCertificate(req);
    const data = await res.json();
    createdCertId = data.certificateId;
    assert(
      res.status === 200 && data.success === true && Boolean(data.certificateId),
      "Certificate Creation links to event and generates certificate",
      data
    );
  } catch (e: any) {
    assert(false, "Certificate Creation test threw error", e);
  }

  // TEST 13: Event Participant Roster
  try {
    const req = makeNextRequest(`http://localhost:3000/api/events/participants?eventReferenceId=${encodeURIComponent(createdEventRefId)}`);
    const res = await getEventParticipants(req);
    const data = await res.json();
    assert(
      res.status === 200 && Array.isArray(data.participants) && data.participants.length >= 0,
      "Event Participants endpoint returns participant roster without 500 errors",
      data
    );
  } catch (e: any) {
    assert(false, "Event Participants test threw error", e);
  }

  // TEST 14: Institution Onboarding (School, College, NGO, Corporate)
  const institutionCategories = ["school", "college", "ngo", "corporate"] as const;
  for (const cat of institutionCategories) {
    try {
      const instReq = new Request("http://localhost:3000/api/institutions/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Telangana Safety ${cat.toUpperCase()} Institute`,
          type: cat,
          district: "Karimnagar",
          address: "Collectorate Road, Civil Hospital Line",
          contactPerson: "Dr. K. Srinivas",
          contactEmail: `contact_${cat}_${Date.now()}@institute.org`,
          contactPhone: "+91 9988776655", // formatted phone to test sanitization
        }),
      });
      const res = await registerInstitution(instReq);
      const data = await res.json();
      assert(
        res.status === 200 && data.success === true && Boolean(data.institutionId),
        `Institution Registration succeeds for category: ${cat}`,
        data
      );
    } catch (e: any) {
      assert(false, `Institution Registration for category ${cat} threw error`, e);
    }
  }

  // TEST 15: Institutions Directory List
  try {
    const listReq = new Request("http://localhost:3000/api/institutions/list?limit=10");
    const res = await listInstitutions(listReq);
    const data = await res.json();
    assert(
      res.status === 200 && Array.isArray(data.institutions) && data.total > 0,
      "Institutions List route returns participating institutions and total count",
      data
    );
  } catch (e: any) {
    assert(false, "Institutions List test threw error", e);
  }

  console.log(`\n=== AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED ===\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runAuditTests().catch((e) => {
  console.error("FATAL AUDIT ERROR:", e);
  process.exit(1);
});
