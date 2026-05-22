const email = `test_${Date.now()}@example.com`;

async function run() {
  const signupRes = await fetch('http://127.0.0.1:3000/api/auth/sign-up/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'Password123!', name: 'Test User' })
  });
  console.log('Signup status:', signupRes.status);
  console.log(await signupRes.text());
  
  const cookies = signupRes.headers.get('set-cookie');
  console.log('Cookies:', cookies);

  const roadmapRes = await fetch('http://127.0.0.1:3000/api/roadmap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookies || '' },
    body: JSON.stringify({ goal: '' })
  });
  console.log('Roadmap status:', roadmapRes.status);
  console.log(await roadmapRes.text());
}
run();
