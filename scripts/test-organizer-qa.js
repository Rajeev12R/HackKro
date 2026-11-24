const http = require("http");

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on("error", reject);
    if (body) req.write(typeof body === "string" ? body : JSON.stringify(body));
    req.end();
  });
}

async function runQA() {
  console.log("==================================================");
  console.log("🚀 STARTING DAY 1 - DAY 7 QA & ROLE ISOLATION TEST");
  console.log("==================================================");

  // TEST 1: Login Verified Organizer
  console.log("\n[TEST 1] Logging in as Verified Organizer (organizer@hackkro.com)...");
  const login1 = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/organizer/auth/login",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    { email: "organizer@hackkro.com", password: "organizer123" }
  );

  if (login1.status !== 200 || !login1.data.success) {
    console.error("❌ TEST 1 FAILED:", login1);
    process.exit(1);
  }
  const token1 = login1.data.token;
  const cookie1 = (login1.headers["set-cookie"] || [])[0];
  console.log("✅ TEST 1 PASSED: Logged in successfully. Token generated.");

  // TEST 2: Check Session
  console.log("\n[TEST 2] Checking session /me with Authorization header...");
  const meRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/organizer/auth/me",
    method: "GET",
    headers: { Authorization: `Bearer ${token1}` },
  });
  if (meRes.status !== 200 || meRes.data.organizer.email !== "organizer@hackkro.com") {
    console.error("❌ TEST 2 FAILED:", meRes);
    process.exit(1);
  }
  console.log("✅ TEST 2 PASSED: Organizer verified status:", meRes.data.organizer.verificationStatus);

  // TEST 3: Dashboard Stats
  console.log("\n[TEST 3] Fetching Dashboard Metrics...");
  const statsRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/organizer/dashboard/stats",
    method: "GET",
    headers: { Authorization: `Bearer ${token1}` },
  });
  if (statsRes.status !== 200 || !statsRes.data.success) {
    console.error("❌ TEST 3 FAILED:", statsRes);
    process.exit(1);
  }
  console.log("✅ TEST 3 PASSED: Real-time DB stats received:", statsRes.data.stats);

  // TEST 4: List Opportunities
  console.log("\n[TEST 4] Fetching Organizer's Opportunities list...");
  const oppsRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/api/organizer/opportunities",
    method: "GET",
    headers: { Authorization: `Bearer ${token1}` },
  });
  if (oppsRes.status !== 200 || oppsRes.data.opportunities.length === 0) {
    console.error("❌ TEST 4 FAILED:", oppsRes);
    process.exit(1);
  }
  const opp = oppsRes.data.opportunities[0];
  console.log(`✅ TEST 4 PASSED: Found ${oppsRes.data.opportunities.length} opportunities. First: "${opp.title}" (Reg: ${opp.registeredCount}, Subs: ${opp.submissionCount})`);

  // TEST 5: Registration Roster & Details
  console.log(`\n[TEST 5] Fetching Registration Roster for Opportunity ${opp._id}...`);
  const rosterRes = await request({
    hostname: "localhost",
    port: 3000,
    path: `/api/organizer/opportunities/${opp._id}/registrations`,
    method: "GET",
    headers: { Authorization: `Bearer ${token1}` },
  });
  if (rosterRes.status !== 200 || rosterRes.data.registrations.length === 0) {
    console.error("❌ TEST 5 FAILED:", rosterRes);
    process.exit(1);
  }
  console.log(`✅ TEST 5 PASSED: Loaded ${rosterRes.data.registrations.length} registrations. Stats:`, rosterRes.data.stats);

  // TEST 6: Submissions & Audit Trail Review
  console.log(`\n[TEST 6] Fetching Submissions for Opportunity ${opp._id}...`);
  const subsRes = await request({
    hostname: "localhost",
    port: 3000,
    path: `/api/organizer/opportunities/${opp._id}/submissions`,
    method: "GET",
    headers: { Authorization: `Bearer ${token1}` },
  });
  if (subsRes.status !== 200 || subsRes.data.submissions.length === 0) {
    console.error("❌ TEST 6 FAILED:", subsRes);
    process.exit(1);
  }
  const subToReview = subsRes.data.submissions.find((s) => s.status === "pending") || subsRes.data.submissions[0];
  console.log(`Evaluating Submission "${subToReview.title}" (Current status: ${subToReview.status})...`);

  const reviewRes = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: `/api/organizer/submissions/${subToReview._id}/review`,
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token1}`,
      },
    },
    {
      status: "shortlisted",
      score: 95,
      feedback: "Evaluated during automated QA: Excellent execution and clear architecture.",
    }
  );
  if (reviewRes.status !== 200 || reviewRes.data.submission.status !== "shortlisted") {
    console.error("❌ TEST 6 FAILED:", reviewRes);
    process.exit(1);
  }
  console.log("✅ TEST 6 PASSED: Review saved with audit history record count:", reviewRes.data.submission.auditHistory.length);

  // TEST 7: STRICT ROLE ISOLATION TEST
  console.log("\n==================================================");
  console.log("🔒 TEST 7: ROLE ISOLATION & ACCESS CONTROL");
  console.log("==================================================");
  console.log("Logging in as Pending Organizer (pending@campus.edu)...");
  const login2 = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/organizer/auth/login",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    { email: "pending@campus.edu", password: "campus123" }
  );
  const token2 = login2.data.token;

  console.log("Attempting to access Verified Organizer's private opportunity roster with Pending Organizer's token...");
  const unauthorizedRoster = await request({
    hostname: "localhost",
    port: 3000,
    path: `/api/organizer/opportunities/${opp._id}/registrations`,
    method: "GET",
    headers: { Authorization: `Bearer ${token2}` },
  });

  if (unauthorizedRoster.status === 404 || unauthorizedRoster.status === 403) {
    console.log(`✅ TEST 7 PASSED: Access correctly BLOCKED (HTTP ${unauthorizedRoster.status}: "${unauthorizedRoster.data.message}")`);
  } else {
    console.error("❌ SECURITY LEAK! Unauthorized access was granted:", unauthorizedRoster);
    process.exit(1);
  }

  console.log("Attempting to evaluate Verified Organizer's submission with Pending Organizer's token...");
  const unauthorizedReview = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: `/api/organizer/submissions/${subToReview._id}/review`,
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token2}`,
      },
    },
    { status: "rejected", score: 0 }
  );

  if (unauthorizedReview.status === 403 || unauthorizedReview.status === 404) {
    console.log(`✅ TEST 7 PASSED: Modification correctly BLOCKED (HTTP ${unauthorizedReview.status}: "${unauthorizedReview.data.message}")`);
  } else {
    console.error("❌ SECURITY LEAK! Unauthorized modification was permitted:", unauthorizedReview);
    process.exit(1);
  }

  console.log("\n==================================================");
  console.log("🎉 ALL TESTS PASSED! DAYS 1 - 7 SUCCESSFULLY VERIFIED!");
  console.log("==================================================");
}

runQA().catch((err) => {
  console.error("QA error:", err);
  process.exit(1);
});

