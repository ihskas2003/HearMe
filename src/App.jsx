import { calculateRisk } from "./utils/riskScoring";
import { analyzeEmergencyAudio } from "./azureAI";
import { storage } from "./firebase";
import { ref, uploadBytes } from "firebase/storage";
import RiskBadge from "./components/RiskBadge";



import { useState, useRef, useEffect } from "react";




function App() {
    
  const TRUSTED_CONTACT = "+918308058629"; // replace with real number
  

  function generateAlertMessage() {
  if (!location || !riskResult) return "";

  const mapsLink = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;

  return `
🚨 EMERGENCY ALERT 🚨

I may be in danger.

📍 Location: ${mapsLink}
🕒 Time: ${emergencyTime}
⚠️ Risk Level: ${riskResult.level}

Sent via AI-powered safety system.
  `;
}


function getEncodedMessage() {
  return encodeURIComponent(generateAlertMessage());
}


  // Load saved emergency state from localStorage on mount
  useEffect(() => {
  const savedData = localStorage.getItem("emergencyData");

  if (savedData) {
    const parsedData = JSON.parse(savedData);

    setIsEmergency(parsedData.isEmergency);
    setEmergencyTime(parsedData.time);
    setLocation(parsedData.location);
  }
}, []);

  const [isEmergency, setIsEmergency] = useState(false);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [emergencyTime, setEmergencyTime] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [riskResult, setRiskResult] = useState(null);




  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const aiResultRef = useRef(null);

  function handleEmergency() {
    setIsEmergency(true);

     // 🕒 Timestamp
     const currentTime = new Date().toLocaleString();
  setEmergencyTime(currentTime);

    // 📍 Location
   function getLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      });
    },
    () => {
      alert("Unable to retrieve location");
    }
  );
}
    getLocation();

    // 🎙️ Audio Recording
    //startRecording();   // disabled for Speech SDK testing
    // 💾 Store in localStorage
    const emergencyData = {
  isEmergency: true,
  time: currentTime,
  location: location
};

localStorage.setItem(
  "emergencyData",
  JSON.stringify(emergencyData)
);
  analyzeEmergencyAudio().then((result) => {
  setAiResult(result);

  const risk = calculateRisk(result);
  setRiskResult(risk);
});


  }

  function resolveEmergency() {
  setIsEmergency(false);
  setAiResult(null);
  setRiskResult(null);
  setIsRecording(false);

  localStorage.removeItem("emergencyData");
}


  async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = async () => {
  

  const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });

  const audioURL = URL.createObjectURL(audioBlob);
  setAudioURL(audioURL);

  

  try {
   const result = await analyzeEmergencyAudio();
      setAiResult(result);
      const risk = calculateRisk(result);
      console.log("RISK CALCULATED:", risk);
      setRiskResult(risk);


  } catch (err) {
    console.error("Azure Speech failed:", err.message);

    setAiResult({
      transcript: "Speech recognition failed (format issue)",
      sentiment: "pending",
      keyPhrases: []
    });
  }
  
};


    mediaRecorder.start();
    setIsRecording(true);

    // ⏱ Stop after 6 seconds
    setTimeout(() => {
      if (mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
        setIsRecording(false);
      }
    }, 6000);

  } catch (err) {
    setError("Microphone permission denied");
  }
};




     
  

  

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>HearMe</h1>

      <p>
        Status:{" "}
        <strong style={{ color: isEmergency ? "red" : "green" }}>
          {isEmergency ? "Emergency Active" : "Safe"}
        </strong>
        
      </p>

      <div>
         {emergencyTime && (
  <p>
    <strong>Emergency Time:</strong> {emergencyTime}
  </p>
)}
      </div>
      

     
      <button
        onClick={handleEmergency}
        style={{
          backgroundColor: "red",
          color: "white",
          padding: "20px",
          fontSize: "18px",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          marginTop: "20px"
        }}
      >
        EMERGENCY
      </button>

      {isRecording && (
        <p style={{ marginTop: "20px", color: "orange" }}>
          🎙️ Recording audio...
        </p>
      )}

      {location && (
  <div>
    <p><strong>Latitude:</strong> {location.latitude}</p>
    <p><strong>Longitude:</strong> {location.longitude}</p>
    <p><strong>Accuracy:</strong> {location.accuracy} meters</p>
  </div>
)}


      {audioURL && (
        <div style={{ marginTop: "20px" }}>
          <p><strong>Audio Evidence Recorded:</strong></p>
          <audio controls src={audioURL}></audio>
        </div>
      )}

      {error && (
        <p style={{ color: "red", marginTop: "20px" }}>
          {error}
        </p>
      )}
      
      {/* 🔍 DEBUG: show raw AI result */}

       



      {aiResult && (
  <div style={{ marginTop: "20px" }}>
    <h3>AI Analysis</h3>
    <p><strong>Transcript:</strong> {aiResult.transcript}</p>
    <p><strong>Sentiment:</strong> {aiResult.sentiment}</p>
    <p><strong>Key Phrases:</strong> {aiResult.keyPhrases.join(", ")}</p>
  </div>
)}

  {riskResult && (
  <div style={{ marginTop: "20px", padding: "15px", border: "1px solid #ccc" }}>
    <h3>Risk Assessment</h3>

    <RiskBadge level={riskResult.level} />

    <p><strong>Why this level?</strong></p>
    <ul>
      {riskResult.reasons.map((reason, index) => (
        <li key={index}>{reason}</li>
      ))}
    </ul>

    <p style={{ fontSize: "12px", color: "#666" }}>
  Risk level is computed using speech sentiment, key phrases, and emergency language.
</p>
<p style={{ marginTop: "10px" }}>
  If risk is MEDIUM/HIGH, the system is designed to notify trusted contacts and authorities.
</p>
   


  </div>

)}

{riskResult && riskResult.level !== "LOW" && (
  <div style={{ marginTop: "20px" }}>
    <a
      href={`https://wa.me/${TRUSTED_CONTACT}?text=${getEncodedMessage()}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        backgroundColor: "#25D366",
        color: "white",
        padding: "12px",
        borderRadius: "8px",
        textDecoration: "none",
        fontWeight: "bold",
        marginBottom: "10px",
        maxWidth: "200px",
        margin: "10px auto",
        textAlign: "center"
      }}
    >
      📲 Send Alert via WhatsApp
    </a>

    <a
  href={`sms:${TRUSTED_CONTACT}?body=${getEncodedMessage()}`}
  style={{
    display: "block",
    backgroundColor: "#1976d2",
    color: "white",
    padding: "12px",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "bold",
    maxWidth: "200px",
    margin: "10px auto",
    textAlign: "center"
    
  }}
>
  📩 Send Alert via SMS
</a>
  </div>
)}




{isEmergency && (
  <div>
    <div>
        <button
    onClick={resolveEmergency}
    style={{
      marginTop: "20px",
      backgroundColor: "#4caf50",
      color: "white",
      padding: "10px 20px",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer"
    }}
  >
    Mark as Safe
  </button>
    </div>
  
    
  </div>


)}


       
    </div>
    
  );
}

export default App;
