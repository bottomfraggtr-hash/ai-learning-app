import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('https://generativelanguage.googleapis.com/*', async ({ request }) => {
    const text = await request.text();
    const isEvaluator = text.toLowerCase().includes('expert programming instructor');
    const isProactive = text.toLowerCase().includes('proactive study buddy');
    
    let mockAiResponse: any;

    if (isEvaluator) {
      mockAiResponse = {
        isPassing: true,
        confidenceScore: 85,
        feedback: "Great job! Your answer meets the criteria."
      };
    } else if (isProactive) {
      mockAiResponse = {
        type: "encouragement",
        message: "Take a break and review the previous topic.",
        actionLabel: "Review Topic",
        actionUrl: "/review"
      };
    } else {
      mockAiResponse = {
        questions: [
          { id: "q1", prompt: "Mock prompt 1?", focus: "React", expectedLength: "short" },
          { id: "q2", prompt: "Mock prompt 2?", focus: "Node", expectedLength: "short" },
          { id: "q3", prompt: "Mock prompt 3?", focus: "CSS", expectedLength: "short" },
          { id: "q4", prompt: "Mock prompt 4?", focus: "HTML", expectedLength: "short" },
          { id: "q5", prompt: "Mock prompt 5?", focus: "JS", expectedLength: "short" }
        ],
        readinessScore: 80,
        confidenceScore: 80,
        paceScore: 80,
        supportNeedScore: 20,
        profileSummary: "A great mock profile summary that is at least twenty characters long.",
        focusScore: 85,
        nextAction: "Mock next action string",
        roadmap: {
          title: "Mock Roadmap Title",
          goal: "Mock roadmap goal that is sufficiently long.",
          summary: "Mock roadmap summary that is also long enough to pass validation.",
          steps: [
            { title: "Step 1", description: "Mock description 1", week: 1, estimatedHours: 5 },
            { title: "Step 2", description: "Mock description 2", week: 2, estimatedHours: 5 },
            { title: "Step 3", description: "Mock description 3", week: 3, estimatedHours: 5 },
            { title: "Step 4", description: "Mock description 4", week: 4, estimatedHours: 5 }
          ]
        },
        recommendations: [
          { slug: "mock-course-1", reason: "Mock reason 1 that is long enough." },
          { slug: "mock-course-2", reason: "Mock reason 2 that is long enough." },
          { slug: "mock-course-3", reason: "Mock reason 3 that is long enough." }
        ],
        careers: [
          { role: "Mock Role 1", fitScore: 90, summary: "Mock career summary that is long enough.", growthSignal: "Mock growth signal that is long enough.", nextSkills: ["Skill 1", "Skill 2"] },
          { role: "Mock Role 2", fitScore: 80, summary: "Mock career summary that is long enough.", growthSignal: "Mock growth signal that is long enough.", nextSkills: ["Skill 1", "Skill 2"] }
        ]
      };
    }

    return HttpResponse.json({
      candidates: [
        {
          content: {
            parts: [{ text: JSON.stringify(mockAiResponse) }],
            role: 'model'
          },
          finishReason: 'STOP',
          index: 0
        }
      ],
      usageMetadata: {
        promptTokenCount: 1,
        candidatesTokenCount: 1,
        totalTokenCount: 2
      }
    });
  }),
];
