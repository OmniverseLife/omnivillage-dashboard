import React, { useState, useEffect, useRef } from "react";
import questions from "../../../../questions.json"; // Ensure this path is correct
import Wrapper from "../../components/wrapper/wrapper"; // Ensure this path is correct

// Helper function to get random unique questions from the *remaining* pool
const getUniqueRandomQuestions = (
  allAvailableQuestions, // Pass the full list of questions
  currentUsedQuestionTexts // Pass the Set of all questions ever used/suggested
) => {
  const availablePool = allAvailableQuestions.filter(
    (q) => !currentUsedQuestionTexts.has(q.question)
  );

  const shuffledPool = [...availablePool].sort(() => 0.5 - Math.random());
  return shuffledPool.slice(0, 3);
};

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [hasSentFirstMessage, setHasSentFirstMessage] = useState(false);
  const [sampleQuestions, setSampleQuestions] = useState([]);

  // This Set will now hold ALL questions ever shown or asked in the session
  const [allUsedQuestionTexts, setAllUsedQuestionTexts] = useState(new Set());

  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // Initialize sample questions on mount and populate allUsedQuestionTexts
  useEffect(() => {
    const initialSamples = getUniqueRandomQuestions(
      questions,
      allUsedQuestionTexts
    );
    setSampleQuestions(initialSamples);

    // Add initial samples to the allUsedQuestionTexts set
    setAllUsedQuestionTexts((prev) => {
      const newSet = new Set(prev);
      initialSamples.forEach((q) => newSet.add(q.question));
      return newSet;
    });
  }, []); // Run only once on component mount

  // Effect to scroll to the bottom of the chat window whenever messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (questionToSend = inputMessage) => {
    if (!questionToSend.trim() || isLoading) return;

    const userMessage = { role: "user", text: questionToSend };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputMessage("");
    if (!hasSentFirstMessage) setHasSentFirstMessage(true);

    setIsLoading(true);

    // Add the question that the user just sent to the allUsedQuestionTexts set
    setAllUsedQuestionTexts((prev) => {
      const newSet = new Set(prev);
      newSet.add(questionToSend);
      return newSet;
    });

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
        throw new Error(`Failed to fetch response. Status: ${response.status}`);
      }

      const result = await response.json();

      if (result.answer) {
        const aiResponseText = result.answer;
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "model", text: aiResponseText },
        ]);
        // After receiving a successful response, generate NEW sample questions
        // ensuring they haven't been used yet.
        const newSamples = getUniqueRandomQuestions(
          questions,
          allUsedQuestionTexts
        );
        setSampleQuestions(newSamples);

        // Add these newly generated samples to the allUsedQuestionTexts set
        setAllUsedQuestionTexts((prev) => {
          const updatedSet = new Set(prev);
          newSamples.forEach((q) => updatedSet.add(q.question));
          return updatedSet;
        });
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            role: "model",
            text: "Looks like I can't answer that right now. I'm still learning! You can try asking something else.",
          },
        ]);
        // Still generate new sample questions even if AI response is missing,
        // to keep the flow going and provide new options.
        const newSamples = getUniqueRandomQuestions(
          questions,
          allUsedQuestionTexts
        );
        setSampleQuestions(newSamples);
        setAllUsedQuestionTexts((prev) => {
          const updatedSet = new Set(prev);
          newSamples.forEach((q) => updatedSet.add(q.question));
          return updatedSet;
        });
      }
    } catch (err) {
      console.error("Error fetching AI response:", err);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "model",
          text: "Oops! I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
      // On error, also refresh sample questions, so the user can try new ones
      const newSamples = getUniqueRandomQuestions(
        questions,
        allUsedQuestionTexts
      );
      setSampleQuestions(newSamples);
      setAllUsedQuestionTexts((prev) => {
        const updatedSet = new Set(prev);
        newSamples.forEach((q) => updatedSet.add(q.question));
        return updatedSet;
      });
    } finally {
      setIsLoading(false); // Always set loading to false
    }
  };

  const handleSampleQuestionClick = (question) => {
    handleSendMessage(question);
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
            <div ref={messagesEndRef} />
          </div>

          {/* Conditional rendering for sample questions */}
          {!isLoading && (
            <div
              style={{
                textAlign: "center",
                color: "#757575",
                paddingTop: "1rem",
                paddingBottom: "1rem",
                fontSize: "1.05rem",
                backgroundColor: "#ffffff",
              }}
            >
              <strong>You can ask things like:</strong>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: "0.5rem",
                  marginTop: "1rem",
                  padding: "0 1.5rem",
                }}
              >
                {sampleQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSampleQuestionClick(q.question)}
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
                    disabled={isLoading}
                  >
                    {q.question}
                  </button>
                ))}
              </div>
            </div>
          )}

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
              onClick={() => handleSendMessage()}
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