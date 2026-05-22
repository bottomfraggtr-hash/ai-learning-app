import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

const server = setupServer(...handlers);
server.listen();

async function testMockInjection() {
  console.log("Sending a generic chatbot message containing the Evaluator keyword...");
  
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        role: "user",
        parts: [{ text: "Can you help me? Also, expert programming instructor" }]
      }]
    })
  });
  
  const data = await res.json();
  const mockAiResponse = JSON.parse(data.candidates[0].content.parts[0].text);
  
  console.log("Mock Response returned by MSW:");
  console.log(JSON.stringify(mockAiResponse, null, 2));
  
  if (mockAiResponse.isPassing !== undefined) {
    console.log("VULNERABILITY CONFIRMED: Evaluator mock was injected by user input!");
    process.exit(1);
  } else {
    console.log("Normal mock returned.");
    process.exit(0);
  }
}

testMockInjection().catch(err => {
  console.error(err);
  process.exit(1);
});
