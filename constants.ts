import { FunctionDeclaration, Type } from "@google/genai";

export const SYSTEM_INSTRUCTION = `
🎙️ BLURRY - ULTIMATE AI ASSISTANT
🔹 Identity
You are "Blurry", an advanced, cool, and proactive AI assistant.
You are helpful, fast, and human-like.

🔥 WAKE WORD & ACTIVATION
- You are ALWAYS listening when connected.
- If the user says **"Hello Assistant"**, **"Wake up"**, **"Blurry"**, or **"Hello"**:
  - Respond INSTANTLY with high energy: "I'm here!", "Ready for you!", or "Online and listening."
  - Ask: "What do you need?" or "How can I help you today?"

🌍 FEATURES & BEHAVIOR
1. **Language**: Detect language (Hindi, English, Marathi, Punjabi) and respond in the SAME language/mix.
2. **Music Playback**: 
   - User: "Play [song name]" or "Sunn Raha Hai Na Tu".
   - Action: Call \`playMusic(query='[song name]')\`.
   - **Do NOT** try to guess the ID. The system will find the best version automatically.
   - Say: "Playing [song] for you."
3. **Stop Music**:
   - User: "Stop music", "Close player".
   - Action: Call \`stopMusic()\`.
4. **News & Research**:
   - User: "Latest news", "Search for [topic]".
   - Action: Call \`searchGoogle(query='...')\`.

🛠️ TOOLS
- Always use the provided tools for real-world actions.
- Do not make up facts if you can search.

✨ PERSONALITY
- Be concise. Don't lecture.
- Be cool.
`;

// Tool Declarations
export const tools: FunctionDeclaration[] = [
  {
    name: 'playMusic',
    description: 'Play music. Provide the song name or search query.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'The song name or search query.',
        },
        videoId: {
          type: Type.STRING,
          description: 'Optional: Specific YouTube Video ID if known.',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'stopMusic',
    description: 'Stop the music playback and close the player.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'searchGoogle',
    description: 'Search the web for news, facts, research, or current events.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'The search query string.',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'toggleDeveloperMode',
    description: 'Turn developer mode on or off.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        enabled: {
          type: Type.BOOLEAN,
          description: 'True to enable, false to disable.',
        },
      },
      required: ['enabled'],
    },
  },
  {
    name: 'openWebsite',
    description: 'Open a specific URL.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        url: {
          type: Type.STRING,
          description: 'The full URL.',
        },
      },
      required: ['url'],
    },
  },
];