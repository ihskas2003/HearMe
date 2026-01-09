export function calculateRisk(aiResult) {
  const dangerWords = [
    "scared",
    "help",
    "following",
    "attack",
    "threat",
    "hurt",
    "kill",
    "rape"
  ];

  let score = 0;
  let reasons = [];

  // 1️⃣ Sentiment signal
  if (aiResult.sentiment === "negative") {
    score += 2;
    reasons.push("Negative sentiment detected");
  }

  // 2️⃣ Transcript danger words
  const transcript = aiResult.transcript.toLowerCase();

  const matchedWords = dangerWords.filter(word =>
    transcript.includes(word)
  );

  if (matchedWords.length === 1) {
    score += 2;
    reasons.push("Danger-related language detected");
  } else if (matchedWords.length >= 2) {
    score += 3;
    reasons.push("Multiple danger signals detected");
  }

  // 3️⃣ Key phrases
  if (aiResult.keyPhrases && aiResult.keyPhrases.length > 0) {
    score += 1;
    reasons.push("Suspicious key phrase detected");
  }

  let level = "LOW";
  if (score >= 4) level = "HIGH";
  else if (score >= 2) level = "MEDIUM";

  return {
    score,
    level,
    reasons
  };
}
