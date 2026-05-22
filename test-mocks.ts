import { server } from './mocks/node';

async function run() {
  server.listen({ onUnhandledRequest: 'bypass' });

  try {
    // Test 1: Evaluator
    const evalRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      body: JSON.stringify({ contents: [{ parts: [{ text: 'Please evaluate my submission.' }] }] })
    });
    const evalData = await evalRes.json();
    console.log('Evaluator response:', evalData.candidates[0].content.parts[0].text);

    // Test 2: Proactive
    const proRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      body: JSON.stringify({ contents: [{ parts: [{ text: 'Give me a proactive suggestion.' }] }] })
    });
    const proData = await proRes.json();
    console.log('Proactive response:', proData.candidates[0].content.parts[0].text);

    // Test 3: Chatbot (General)
    const chatRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      body: JSON.stringify({ contents: [{ parts: [{ text: 'Hello study buddy' }] }] })
    });
    const chatData = await chatRes.json();
    console.log('Chatbot response:', chatData.candidates[0].content.parts[0].text.substring(0, 100) + '...');

    // Test 4: Assessment Generate (No specific keywords)
    const assessRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      body: JSON.stringify({ contents: [{ parts: [{ text: 'Generate an assessment for React' }] }] })
    });
    const assessData = await assessRes.json();
    console.log('Assessment response:', assessData.candidates[0].content.parts[0].text.substring(0, 100) + '...');

  } finally {
    server.close();
  }
}

run().catch(console.error);
