import React, { useState, useEffect, useRef } from "react";
import questions from "../../../../questions.json"; // Ensure this path is correct
import Wrapper from "../../components/wrapper/wrapper"; // Ensure this path is correct

const getRandomQuestions = () => {
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
};

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [hasSentFirstMessage, setHasSentFirstMessage] = useState(false);
  const [sampleQuestions, setSampleQuestions] = useState(getRandomQuestions());

  const [isLoading, setIsLoading] = useState(false);
  // No need for 'error' state if we're sending bot messages instead of displaying an error component
  // const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  console.log("Sample Questions:", sampleQuestions);

  // Effect to scroll to the bottom of the chat window whenever messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { role: "user", text: inputMessage };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputMessage("");
    if (!hasSentFirstMessage) setHasSentFirstMessage(true);

    setIsLoading(true);
    // setError(null); // No longer setting error state

    try {
      const response = await fetch(
        "https://dashboard-ai-3dd20e22d0c6.herokuapp.com/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: userMessage.text }),
        }
      );

      if (!response.ok) {
        // Handle HTTP errors (e.g., 400, 500 status codes)
        // const errorData = await response.json(); // You might still log this for debugging
        // console.error("API response error data:", errorData);
        throw new Error(
          `Failed to fetch response. Status: ${response.status}`
        );
      }

      const result = await response.json();

      if (result.answer) {
        const aiResponseText = result.answer;
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "model", text: aiResponseText },
        ]);
      } else {
        // Handle cases where the API call was successful but the 'answer' field is missing or empty
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            role: "model",
            text: "Looks like I can't answer that right now. I'm still learning! You can try asking something else.",
          },
        ]);
      }
    } catch (err) {
      console.error("Error fetching AI response:", err);
      // Send a user-friendly message to the chat instead of setting an error state
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "model",
          text: "Oops! I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Wrapper>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "81vh",
          fontFamily: "Inter, sans-serif",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            margin: "0 auto",
            width: "100%",
            backgroundColor: "#ffffff",
            borderRadius: "1.25rem",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
            overflow: "hidden",
          }}
        >
          {/* Messages Display Area */}
          <div
            style={{
              flexGrow: 1,
              padding: "1.5rem",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "0.8rem",
              backgroundColor: "#ffffff",
            }}
          >
            {messages.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  color: "#757575",
                  paddingTop: "3rem",
                  paddingBottom: "3rem",
                  fontSize: "1.05rem",
                }}
              >
                <p>Start a conversation with your AI assistant!</p>
                <div style={{ marginTop: "1rem", fontSize: "0.95rem" }}>
                  <strong>You can ask things like:</strong>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      gap: "0.5rem",
                      marginTop: "1rem",
                    }}
                  >
                    {sampleQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInputMessage(q.question);
                          handleSendMessage(); // Trigger send immediately after setting input
                        }}
                        style={{
                          padding: "0.6rem 1rem",
                          borderRadius: "1.5rem",
                          border: "1px solid #90caf9",
                          backgroundColor: "#e3f2fd",
                          color: "#1976d2",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          transition: "all 0.2s ease-in-out",
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#bbdefb";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#e3f2fd";
                        }}
                      >
                        {q.question}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "70%",
                    padding: "0.9rem 1.2rem",
                    borderRadius: "1.2rem",
                    backgroundColor:
                      msg.role === "user" ? "#bbdefb" : "#f0f4f7",
                    color: "#212121",
                    borderBottomRightRadius:
                      msg.role === "user" ? "0.4rem" : "1.2rem",
                    borderBottomLeftRadius:
                      msg.role === "user" ? "1.2rem" : "0.4rem",
                    fontSize: "0.95rem",
                    wordBreak: "break-word",
                    whiteSpace: "pre-wrap",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    maxWidth: "30%",
                    padding: "0.9rem 1.2rem",
                    borderRadius: "1.2rem",
                    backgroundColor: "#f0f4f7",
                    animation:
                      "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                    borderBottomLeftRadius: "0.4rem",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  Gathering Information
                </div>
              </div>
            )}
            {/* Removed the error display div here */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area with Integrated Send Button */}
          <div
            style={{
              padding: "1rem 1.5rem",
              backgroundColor: "#ffffff",
              borderTop: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              boxShadow: "0 -8px 30px rgba(0, 0, 0, 0.05)",
              borderRadius: "0 0 1.25rem 1.25rem",
            }}
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && !isLoading && handleSendMessage()
              }
              placeholder="Message AI Assistant..."
              style={{
                flexGrow: 1,
                padding: "0.8rem 4.5rem 0.8rem 1.2rem",
                border: "1px solid #ddd",
                backgroundColor: "#fff",
                borderRadius: "2rem",
                outline: "none",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.08)",
                transition:
                  "box-shadow 0.2s ease-in-out, background-color 0.2s ease-in-out",
                color: "#212121",
                fontSize: "1rem",
                width: "100%",
                boxSizing: "border-box",
              }}
              onFocus={(e) =>
                (e.target.style.boxShadow =
                  "inset 0 1px 3px rgba(0,0,0,0.1), 0 0 0 2px #90caf9")
              }
              onBlur={(e) =>
                (e.target.style.boxShadow = "inset 0 1px 3px rgba(0,0,0,0.08)")
              }
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              style={{
                position: "absolute",
                right: "2rem",
                padding: "0.6rem",
                paddingRight: "0.8rem",
                background:
                  "linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)",
                color: "#ffffff",
                borderRadius: "2rem",
                cursor: "pointer",
                outline: "none",
                border: "none",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                transition:
                  "background 0.3s ease, transform 0.2s ease, opacity 0.2s ease",
                fontWeight: "500",
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1,
                opacity: isLoading || !inputMessage.trim() ? "0.4" : "1",
                pointerEvents: isLoading || !inputMessage.trim() ? "none" : "auto",
              }}
              onMouseEnter={(e) => {
                if (!(isLoading || !inputMessage.trim())) {
                  e.currentTarget.style.transform = "scale(1.03)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0, 0, 0, 0.2)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(0, 0, 0, 0.15)";
              }}
              onFocus={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 0 0 2px #90caf9, 0 4px 12px rgba(0, 0, 0, 0.2)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(0, 0, 0, 0.15)")
              }
              disabled={isLoading || !inputMessage.trim()}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
        {/* Define CSS keyframe animation for the pulse effect */}
        <style>
          {`
            @keyframes pulse {
                0%, 100% {
                    opacity: 1;
                }
                50% {
                    opacity: .5;
                }
            }
            `}
        </style>
      </div>
    </Wrapper>
  );
}

export default App;