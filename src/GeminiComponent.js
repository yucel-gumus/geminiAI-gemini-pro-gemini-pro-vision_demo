import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import "../src/index.css";

const ChatMessage = ({ role, content }) => (
  <div
    className={`card ${role}`}
    style={{
      borderRadius: "10px",
      padding: "10px",
      marginBottom: "10px",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        whiteSpace: "pre-wrap",
        fontSize: "100%",
        fontFamily: "'Trebuchet MS', Helvetica, sans-serif",
        backgroundColor: "skyblue",
        borderTopLeftRadius: "10px",
        borderTopRightRadius: "10px",
        padding: "10px",
        borderRadius: "10px",
      }}
    >
      {role}
    </div>
    <div
      style={{
        whiteSpace: "pre-wrap",
        fontSize: "100%",
        borderRadius: "10px",
        fontFamily: "'Trebuchet MS', Helvetica, sans-serif",
        backgroundColor: "#DCDCDC",
        borderBottomLeftRadius: "10px",
        borderBottomRightRadius: "10px",
        padding: "10px",
        marginTop: "5px",
      }}
    >
      {content}
    </div>
  </div>
);

const ChatHistory = ({ messages, chatHistoryRef }) => (
  <div
    className="custom-scrollbar"
    ref={chatHistoryRef}
    style={{
      overflowY: "auto",
      maxHeight: "600px",
      overflowX: "hidden",
      maxWidth: "750px",
      borderRadius: "10px",
    }}
  >
    {messages.map((message, index) => (
      <ChatMessage key={index} role={message.role} content={message.text} />
    ))}
  </div>
);

const GenerativeAIComponent = () => {
  const [inputText, setInputText] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatHistoryRef = useRef(null);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/generateContent", {
        prompt: inputText,
        past_messages: chatHistory.filter((msg) => msg.role === "assistant").map((msg) => msg.text),
      });

      const text = response.data.chatHistory[response.data.chatHistory.length - 1].text;
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { role: "user", text: inputText },
        { role: "assistant", text },
      ]);
      setInputText("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleEnterPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div
      className="container"
      style={{ marginLeft: "600px", marginTop: "50px", borderRadius: "10px" }}
    >
      <div className="row" style={{ marginTop: "10px" }}>
        <div>
          <div>
            <strong
              className="title"
              style={{
                marginLeft: "10px",
                marginTop: "10px",
                borderRadius: "10px",
              }}
            >
              Sohbet Geçmişi
            </strong>
          </div>

          <br></br>
          <ChatHistory messages={chatHistory} chatHistoryRef={chatHistoryRef} />
        </div>
      </div>

      <div
        className="footer"
        style={{
          height: "25%",
          position: "absolute",
          bottom: 0,
          padding: "10px",
          borderRadius: "10px",
        }}
      >
        <div style={{ position: "relative" }}>
          <textarea
            id="prompt-textarea"
            placeholder="Mesajınızı buraya yazın"
            onKeyDown={handleEnterPress}
            onChange={handleInputChange}
            style={{
              resize: "none",
              width: "750px",
              fontFamily: "'Trebuchet MS', Helvetica, sans-serif",
              height: "100px",
              marginBottom: "10px",
              borderRadius: "10px",
            }}
            value={inputText}
          />
          <FontAwesomeIcon
            icon={faArrowUp}
            onClick={handleSendMessage}
            style={{
              cursor: "pointer",
              fontSize: "24px",
              color: loading ? "#ccc" : "#87CEEB",
              pointerEvents: loading ? "none" : "auto",
              position: "absolute",
              bottom: "50%",
              right: "20px",
              transform: "translateY(50%)",
            }}
          />
          <Link to="/geminivision">Gemini Vision</Link>
        </div>
      </div>
    </div>
  );
};

export default GenerativeAIComponent;
