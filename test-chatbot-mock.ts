import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

const server = setupServer(...handlers);
server.listen();

async function testChatbotMock() {
  console.log("Sending a Study Buddy request...");
  
  const systemPrompt = "You are a calm study buddy for a web-development learner.";
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        role: "user",
        parts: [{ text: "Hello study buddy!" }]
      }],
      systemInstruction: { parts: [{ text: systemPrompt }] }
    })
  });
  
  const data = await res.json();
  const mockAiResponse = data.candidates[0].content.parts[0].text;
  
  console.log("Mock Chatbot Response (Raw text):");
  console.log(mockAiResponse.substring(0, 200) + "...");
  
  try {
    const parsed = JSON.parse(mockAiResponse);
    if (parsed.roadmap) {
      console.log("TEST FLAW CONFIRMED: Chatbot mock returns Onboarding JSON instead of conversational text!");
    }
  } catch (e) {
    console.log("Chatbot returned plain text as expected.");
  }
  
  server.close();
}

testChatbotMock().catch(console.error);
