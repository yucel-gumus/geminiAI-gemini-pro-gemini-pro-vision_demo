import React, { useState } from "react";
import axios from "axios";

const FileUpload = () => {
  const [inlineData, setInlineData] = useState();
  const [inputText, setInputText] = useState("");
  const [responseText, setResponseText] = useState("");

  function fileToGenerativePart(file, mimeType) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64Data = reader.result.split(",")[1];
        resolve({
          inlineData: {
            data: base64Data,
            mimeType,
          },
        });
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  }

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    try {
      const generativeParts = await Promise.all(
        files.map((file) => fileToGenerativePart(file, "image/png"))
      );
      setInlineData(generativeParts);
    } catch (error) {
      console.error("Dosya işleme hatası:", error);
    }
  };

  const handleSendMessage = async () => {
    try {
      const response = await axios.post("http://localhost:5000/generateImage", {
        prompt: inputText,
        imageParts: inlineData[0],
      });

      const text = response.data.text;
      setResponseText(text);
    } catch (error) {
      console.error("Mesaj gönderme hatası:", error);
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  return (
    <div>
      <div>
        <input type="file" multiple onChange={handleFileChange} />
        <button onClick={handleSendMessage}>Dosyaları Yükle</button>
      </div>
      <div style={{ position: "relative" }}>
        <textarea
          id="prompt-textarea"
          placeholder="Mesajınızı buraya yazın"
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
        {responseText && (
          <div>
            <h2>Gemini Ai</h2>
            <p>{responseText}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
