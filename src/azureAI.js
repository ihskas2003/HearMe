import axios from "axios";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

const SPEECH_KEY = import.meta.env.VITE_AZURE_SPEECH_KEY;
const SPEECH_REGION = "centralindia"; // change if needed

export async function analyzeEmergencyAudio() {
  return new Promise((resolve, reject) => {
    if (!SPEECH_KEY) {
      reject("Azure Speech key missing");
      return;
    }

    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
      SPEECH_KEY,
      SPEECH_REGION
    );
    speechConfig.speechRecognitionLanguage = "en-US";

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechSDK.SpeechRecognizer(
      speechConfig,
      audioConfig
    );

    let finalTranscript = "";

    // Fired when speech is recognized
    recognizer.recognized = (s, e) => {
      if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
        finalTranscript += e.result.text + " ";
      }
    };

    // Fired when recognition session stops
    recognizer.sessionStopped = async() => {
      recognizer.stopContinuousRecognitionAsync();
      recognizer.close();

      if (finalTranscript.trim().length === 0) {
        resolve({
          transcript: "Speech not recognized",
          sentiment: "pending",
          keyPhrases: []
        });
      } else {
         const analysis = await analyzeTextAnalytics(finalTranscript.trim());
          resolve({
          transcript: finalTranscript.trim(),
          sentiment: analysis.sentiment,
          keyPhrases: analysis.keyPhrases
});

      }
    };

    // Start listening
    recognizer.startContinuousRecognitionAsync();

    // ⏱ Stop after 6 seconds (you control this)
    setTimeout(() => {
      recognizer.stopContinuousRecognitionAsync();
    }, 6000);
  });
}

const TEXT_KEY = import.meta.env.VITE_AZURE_TEXT_KEY;
const TEXT_ENDPOINT = import.meta.env.VITE_AZURE_TEXT_ENDPOINT;

export async function analyzeTextAnalytics(text) {
  const sentimentUrl = `${TEXT_ENDPOINT}/text/analytics/v3.1/sentiment`;
  const keyPhraseUrl = `${TEXT_ENDPOINT}/text/analytics/v3.1/keyPhrases`;

  const headers = {
    "Ocp-Apim-Subscription-Key": TEXT_KEY,
    "Content-Type": "application/json"
  };

  const body = {
    documents: [
      {
        id: "1",
        language: "en",
        text: text
      }
    ]
  };

  // 1️⃣ Sentiment Analysis
  const sentimentResponse = await axios.post(sentimentUrl, body, { headers });
  const sentiment =
    sentimentResponse.data.documents[0].sentiment;

  // 2️⃣ Key Phrase Extraction
  const keyPhraseResponse = await axios.post(keyPhraseUrl, body, { headers });
  const keyPhrases =
    keyPhraseResponse.data.documents[0].keyPhrases;

  return {
    sentiment,
    keyPhrases
  };
}
