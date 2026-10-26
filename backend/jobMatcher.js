
const skillsList = [
  "javascript",
  "react",
  "node.js",
  "express",
  "mongodb",
  "sql",
  "python",
  "java",
  "machine learning",
  "data structures",
  "html",
  "css",
  "git",
  "rest api",
  "aws",
  "docker",
  "fastapi",
  "typescript",
  "testing",
  "communication",
];

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9.+#\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function cosineSimilarity(textA, textB) {
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);

  const countTokens = (tokens) => {
    const counts = {};
    for (const token of tokens) {
      counts[token] = (counts[token] || 0) + 1;
    }
    return counts;
  };

  const a = countTokens(tokensA);
  const b = countTokens(tokensB);
  const allTokens = new Set([...Object.keys(a), ...Object.keys(b)]);

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (const token of allTokens) {
    const x = a[token] || 0;
    const y = b[token] || 0;

    dotProduct += x * y;
    magnitudeA += x * x;
    magnitudeB += y * y;
  }

  if (!magnitudeA || !magnitudeB) return 0;

  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

function extractSkills(text) {
  const normalized = text.toLowerCase();

  return skillsList.filter((skill) => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`, "i");
    return pattern.test(normalized);
  });
}

function matchJob(resumeText, jobDescription) {
  const resumeSkills = extractSkills(resumeText);
  const requiredSkills = extractSkills(jobDescription);

  const matchedSkills = requiredSkills.filter((skill) =>
    resumeSkills.includes(skill)
  );

  const missingSkills = requiredSkills.filter(
    (skill) => !resumeSkills.includes(skill)
  );

  const skillCoverage = requiredSkills.length
    ? matchedSkills.length / requiredSkills.length
    : 0;

  const similarity = cosineSimilarity(resumeText, jobDescription);

  // A transparent heuristic, not a probability of getting hired.
  const matchScore = requiredSkills.length
    ? Math.round((0.6 * similarity + 0.4 * skillCoverage) * 100)
    : 0;

  return {
    matchScore,
    similarity: Math.round(similarity * 100),
    skillCoverage: Math.round(skillCoverage * 100),
    matchedSkills,
    missingSkills,
    requiredSkills,
    message: requiredSkills.length
      ? "Match score is an experimental text-similarity estimate."
      : "No recognized skills were found in the job description.",
  };
}

module.exports = { matchJob };
