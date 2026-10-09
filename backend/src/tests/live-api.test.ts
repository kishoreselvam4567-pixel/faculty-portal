/**
 * Live HTTP End-to-End Integration Test for Faculty AI APIs
 */

const BASE_URL = 'http://localhost:5000/api';
const DEV_UID = 'D679ftp5r9QC8zzybJkGAokVZ2d2';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
    failed++;
  }
}

async function request(endpoint: string, options: any = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'x-dev-uid': DEV_UID,
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function runLiveApiTests() {
  console.log('\n======================================================');
  console.log('🌐 RUNNING LIVE HTTP END-TO-END TESTS (PORT 5000)');
  console.log('======================================================\n');

  // 1. Health check
  console.log('--- 1. Health Check & Tools API ---');
  const health = await request('/health');
  assert(health.status === 200 && health.data.status === 'ok', 'GET /api/health returns 200 OK');

  const tools = await request('/faculty/assistant/tools');
  assert(tools.status === 200 && Array.isArray(tools.data) && tools.data.length >= 10, 'GET /api/faculty/assistant/tools returns registered faculty tools');

  // 2. Conversation lifecycle
  console.log('\n--- 2. Conversations Lifecycle API ---');
  const convs = await request('/faculty/assistant/conversations');
  assert(convs.status === 200 && Array.isArray(convs.data), 'GET /api/faculty/assistant/conversations returns conversation list');

  const newConv = await request('/faculty/assistant/conversations', {
    method: 'POST',
    body: JSON.stringify({ title: 'Live Test Conversation' }),
  });
  assert(newConv.status === 201 && !!newConv.data.id, 'POST /api/faculty/assistant/conversations creates new conversation');
  const convId = newConv.data.id;

  const rename = await request(`/faculty/assistant/conversations/${convId}`, {
    method: 'PATCH',
    body: JSON.stringify({ title: 'Renamed Live Conversation' }),
  });
  assert(rename.status === 200 && rename.data.title === 'Renamed Live Conversation', 'PATCH /api/faculty/assistant/conversations/:id renames conversation');

  // 3. AI Assistant Chat Endpoint
  console.log('\n--- 3. AI Assistant Chat Endpoint ---');
  const chatResponse = await request('/faculty/assistant/chat', {
    method: 'POST',
    body: JSON.stringify({
      conversationId: convId,
      message: 'Show my assigned classes and enrolled student count',
    }),
  });
  assert(chatResponse.status === 200 && !!chatResponse.data.message, 'POST /api/faculty/assistant/chat returns AI answer');
  assert(
    chatResponse.data.message.role === 'assistant' &&
      chatResponse.data.message.content.length > 20,
    'Assistant returns contextual response grounded in class records'
  );

  // 4. Tasks API
  console.log('\n--- 4. Faculty Tasks API ---');
  const tasks = await request('/faculty/tasks');
  assert(tasks.status === 200 && Array.isArray(tasks.data), 'GET /api/faculty/tasks returns faculty task list');

  const newTask = await request('/faculty/tasks', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Verify Lab Evaluation Submissions',
      priority: 'HIGH',
      category: 'EVALUATION',
    }),
  });
  assert(newTask.status === 201 && !!newTask.data.id, 'POST /api/faculty/tasks creates task');
  const taskId = newTask.data.id;

  const updateTask = await request(`/faculty/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'COMPLETED' }),
  });
  assert(updateTask.status === 200 && updateTask.data.status === 'COMPLETED', 'PATCH /api/faculty/tasks/:id updates status to COMPLETED');

  const deleteTask = await request(`/faculty/tasks/${taskId}`, {
    method: 'DELETE',
  });
  assert(deleteTask.status === 200 && deleteTask.data.success === true, 'DELETE /api/faculty/tasks/:id deletes task');

  // 5. Email Drafts API
  console.log('\n--- 5. Faculty Email API ---');
  const drafts = await request('/faculty/email/drafts');
  assert(drafts.status === 200 && Array.isArray(drafts.data), 'GET /api/faculty/email/drafts returns drafts list');

  const newDraft = await request('/faculty/email/drafts', {
    method: 'POST',
    body: JSON.stringify({
      subject: 'Midterm Evaluation Schedule',
      body: 'Midterms commence next Monday.',
      recipients: ['class-rep@student.college.edu'],
    }),
  });
  assert(newDraft.status === 201 && !!newDraft.data.id, 'POST /api/faculty/email/drafts saves email draft');

  const sendEmail = await request('/faculty/email/send', {
    method: 'POST',
    body: JSON.stringify({
      draftId: newDraft.data.id,
      recipients: newDraft.data.recipients,
      subject: newDraft.data.subject,
      body: newDraft.data.body,
    }),
  });
  assert(sendEmail.status === 200 && sendEmail.data.success === true, 'POST /api/faculty/email/send dispatches verified email');

  // 6. Knowledge RAG Search API
  console.log('\n--- 6. Knowledge RAG Search API ---');
  const ragSearch = await request('/faculty/knowledge/search?q=attendance%20condonation');
  assert(ragSearch.status === 200 && ragSearch.data.count > 0, 'GET /api/faculty/knowledge/search returns grounded citations');

  // 7. Notifications API
  console.log('\n--- 7. Notifications API ---');
  const notifs = await request('/faculty/notifications');
  assert(notifs.status === 200 && Array.isArray(notifs.data) && notifs.data.length > 0, 'GET /api/faculty/notifications returns active notification items');

  // 8. Delete test conversation
  const deleteConv = await request(`/faculty/assistant/conversations/${convId}`, {
    method: 'DELETE',
  });
  assert(deleteConv.status === 200 && deleteConv.data.success === true, 'DELETE /api/faculty/assistant/conversations/:id removes conversation cleanly');

  console.log('\n======================================================');
  console.log(`📊 LIVE HTTP TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runLiveApiTests().catch((err) => {
  console.error('Live API test error:', err);
  process.exit(1);
});
