import React, { useState, useEffect, useRef } from "react";
import Wrapper from "../../components/wrapper/wrapper";

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [hasSentFirstMessage, setHasSentFirstMessage] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

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
    setError(null);

    try {
      const response = await fetch("https://dashboard-ai-3dd20e22d0c6.herokuapp.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage.text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `API error: ${response.status} ${response.statusText} - ${
            errorData.error || "Unknown error"
          }`
        );
      }

      const result = await response.json();

      if (result.text) {
        const aiResponseText = result.answer;
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "model", text: aiResponseText },
        ]);
      } else {
        setError("Received an empty or malformed response from the AI.");
      }
    } catch (err) {
      console.error("Error fetching AI response:", err);
      setError(`Failed to get response: ${err.message}`);
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
          fontFamily: "Inter, sans-serif" /* Using Inter font */,
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
            borderRadius: "1.25rem" /* More rounded corners for the main box */,
            boxShadow:
              "0 8px 30px rgba(0, 0, 0, 0.08)" /* Softer, larger shadow */,
            overflow: "hidden",
          }}
        >
          {/* Messages Display Area */}
          <div
            style={{
              flexGrow: 1,
              padding: "1.5rem" /* Consistent padding */,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "0.8rem" /* Slightly larger gap between messages */,
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
                Start a conversation with your AI assistant!
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
                    maxWidth:
                      "70%" /* Slightly less wide for better line length */,
                    padding: "0.9rem 1.2rem",
                    borderRadius: "1.2rem" /* More rounded message bubbles */,
                    backgroundColor:
                      msg.role === "user"
                        ? "#bbdefb"
                        : "#f0f4f7" /* Softer blues */,
                    color: "#212121" /* Darker text for both */,
                    borderBottomRightRadius:
                      msg.role === "user"
                        ? "0.4rem"
                        : "1.2rem" /* Asymmetrical corners */,
                    borderBottomLeftRadius:
                      msg.role === "user"
                        ? "1.2rem"
                        : "0.4rem" /* Asymmetrical corners */,
                    fontSize: "0.95rem",
                    wordBreak: "break-word",
                    whiteSpace: "pre-wrap",
                    boxShadow:
                      "0 1px 3px rgba(0, 0, 0, 0.05)" /* Very subtle shadow */,
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
                    maxWidth: "30%" /* Adjust width for visual appeal */,
                    padding: "0.9rem 1.2rem",
                    borderRadius: "1.2rem",
                    backgroundColor: "#f0f4f7",
                    animation:
                      "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                    height: "1rem",
                    borderBottomLeftRadius: "0.4rem",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                  }}
                ></div>
              </div>
            )}
            {error && (
              <div
                style={{
                  color: "#d32f2f" /* More subtle error red */,
                  textAlign: "center",
                  padding: "0.8rem",
                  borderRadius: "0.6rem",
                  backgroundColor: "#ffebee" /* Very light error background */,
                  border: "1px solid #ef9a9a",
                  fontSize: "0.9rem",
                }}
              >
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area with Integrated Send Button */}
          <div
            style={{
              padding: "1rem 1.5rem" /* Consistent padding */,
              backgroundColor: "#ffffff",
              borderTop: "none" /* No border on top, rely on shadow */,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position:
                "relative" /* Needed for absolute positioning of the button */,
              boxShadow:
                "0 -8px 30px rgba(0, 0, 0, 0.05)" /* Shadow for the input area itself */,
              borderRadius: "0 0 1.25rem 1.25rem" /* Rounded bottom corners */,
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
                padding:
                  "0.8rem 4.5rem 0.8rem 1.2rem" /* Padding adjusted for send button */,
                border: "1px solid #ddd" /* No border */,
                backgroundColor: "#fff" /* Light gray background for input */,
                borderRadius: "2rem" /* Fully rounded pill shape */,
                outline: "none",
                boxShadow:
                  "inset 0 1px 3px rgba(0,0,0,0.08)" /* Inner shadow for depth */,
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
              } /* Light blue focus ring */
              onBlur={(e) =>
                (e.target.style.boxShadow = "inset 0 1px 3px rgba(0,0,0,0.08)")
              }
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              style={{
                position: "absolute",
                right: "2rem" /* Position relative to input area padding */,
                padding: "0.6rem" /* Adjusted padding for a balanced look */,
                paddingRight: "0.8rem",
                background:
                  "linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)" /* Blue gradient */,
                color: "#ffffff",
                borderRadius: "2rem" /* Matches input field rounding */,
                cursor: "pointer",
                outline: "none",
                border: "none",
                boxShadow:
                  "0 2px 8px rgba(0, 0, 0, 0.15)" /* More prominent shadow */,
                transition:
                  "background 0.3s ease, transform 0.2s ease, opacity 0.2s ease",
                fontWeight: "500",
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1 /* Ensure button is above input field */,
                opacity:
                  isLoading || !inputMessage.trim()
                    ? "0.4"
                    : "1" /* Smoother disabled state */,
                pointerEvents:
                  isLoading || !inputMessage.trim() ? "none" : "auto",
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
