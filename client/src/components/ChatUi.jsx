import React, { useState, useRef, useEffect } from "react";
import "../index.css";



const TRANSLATE_ENDPOINT = "http://localhost:5000/translate"; 
const OLLAMA_ENDPOINT = "http://localhost:11434/api/generate";

const languages = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "bn", label: "Bengali" },
  // add more as needed
];

const chatScrollToBottom = (container) => {
  if (!container) return;
  container.scrollTop = container.scrollHeight;
};

const Chatbot = () => {
  const [messages, setMessages] = useState([]); 
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // UI language preferences
  const [userLang, setUserLang] = useState("en"); 
  const [botLang, setBotLang] = useState("en");

  const chatAreaRef = useRef(null);

  useEffect(() => {
    chatScrollToBottom(chatAreaRef.current);
  }, [messages, loading]);

  // helper: translate text using TRANSLATE_ENDPOINT
  const translateText = async (text, source, target) => {
    // If source === target, skip
    if (!text) return "";
    if (source === target) return text;

    try {
      const resp = await fetch(TRANSLATE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, source, target }),
      });
      if (!resp.ok) {
        console.warn("Translate API returned error, falling back to original text");
        return text;
      }
      const data = await resp.json();
      // assume { translatedText: "..." }
      return data.translatedText ?? text;
    } catch (err) {
      console.error("Translate error:", err);
      return text;
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input, lang: userLang };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
    
      const modelLang = "en"; 
      const promptForModel = await translateText(input, userLang, modelLang);

      // 2) call the model
      const modelResp = await fetch(OLLAMA_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3", // change if needed
          prompt: promptForModel,
          stream: false,
        }),
      });

      let modelData;
      try {
        modelData = await modelResp.json();
      } catch (err) {
        console.error("Error parsing model response JSON:", err);
        modelData = { response: "Sorry, I couldn't parse the model's response." };
      }
      const modelText = modelData.response ?? modelData.output ?? "";

    
      const translatedBotText = await translateText(modelText, modelLang, botLang);

      const botMessage = { sender: "bot", text: translatedBotText, lang: botLang };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Error connecting to servers.", lang: "en" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="title">Multilingual Chatbot</div>

        
      </div>

      <div className="chat-area" ref={chatAreaRef}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.sender === "user" ? "user" : "bot"}`}
            title={msg.lang}
          >
            {msg.text}
          </div>
        ))}

        {loading && <div className="loading">Bot is typing...</div>}
      </div>

      <div className="input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="chat-input"
          rows={2}
        ></textarea>
        <button onClick={sendMessage} className="send-btn" disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </div>

     
    </div>
  );
};

export default Chatbot;
