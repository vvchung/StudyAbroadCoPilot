import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const SYSTEM_INSTRUCTION = `你是一位專業的留學顧問 AI 學伴。你的目標是協助學生撰寫出色的 SOP (Statement of Purpose) 與 CV (Curriculum Vitae)。

### 💡 你的核心指導原則：
1. **SOP 不是中文自傳的翻譯**：強調「為什麼要申請」、「你的優勢」以及「未來目標」。
2. **SOP 樹狀架構**：
   - **引言 (Introduction)**：動機與主旨句 (Thesis Statement)。
   - **主體段落 (Body)**：學術背景、研究經驗、工作經驗、社團志工。
   - **結論 (Conclusion)**：交代職涯目標、說明為什麼選擇這所學校。
3. **STAR 寫作技巧**：在描述經驗時，引導學生使用 Situation (背景)、Task (任務)、Action (行動)、Result (結果)。
4. **Show, Don't Tell**：不要只說自己很努力，要用具體數據或事例證明。
5. **語氣與格式**：保持專業、客觀，避免過度情緒化或使用陳腔濫調。

### 📋 回答格式規範 (請嚴格遵守)：
為了提升閱讀體驗，你的回答必須遵循以下格式：
- **使用 Emoji**：在標題、重點項目或段落開頭使用相關 Emoji (例如：🚀, 🧠, 🛡️, 📝, ✨)。
- **結構化層次**：使用 Markdown 的標題 (###) 與粗體 (**文字**) 來區分資訊。
- **條列式呈現**：優先使用無序列表 (-) 來呈現多項建議或步驟。
- **視覺重點**：關鍵詞彙或行動建議請加粗顯示。
- **親切專業**：口吻應親切、專業且具鼓勵性。

### 🚀 你的功能：
- **架構規劃**：幫學生擬定 SOP 大綱。
- **經驗潤飾**：使用 STAR 法則優化學生的經歷描述。
- **草稿修改**：針對學生的草稿提供具體修改建議，檢查是否符合「主旨句」邏輯。
- **CV 指導**：協助學生將經歷轉化為專業的 CV 格式。`;

export async function generateSOPFeedback(content: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `請根據《如何撰寫留學讀書計畫》的原則，對以下 SOP 內容提供修改建議：\n\n${content}`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });
  return response.text;
}

export async function refineExperience(experience: { situation: string; task: string; action: string; result: string }) {
  const prompt = `請使用 STAR 法則將以下經歷潤飾成適合放進 SOP 或 CV 的專業段落：
背景 (Situation): ${experience.situation}
任務 (Task): ${experience.task}
行動 (Action): ${experience.action}
結果 (Result): ${experience.result}`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });
  return response.text;
}

export async function chatWithAI(
  messages: { role: "user" | "model"; parts: { text?: string; inlineData?: { mimeType: string; data: string } }[] }[]
) {
  const chat = ai.chats.create({
    model: "gemini-3.1-pro-preview",
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
    history: messages.slice(0, -1).map(m => ({
        role: m.role,
        parts: m.parts
    })),
  });

  const lastMessage = messages[messages.length - 1];
  const response = await chat.sendMessage({ 
    message: lastMessage.parts 
  });
  return response.text;
}
