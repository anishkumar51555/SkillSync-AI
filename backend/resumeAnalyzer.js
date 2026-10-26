
const skillsList = [
  "JavaScript",
  "React",
  "Node.js",
  "Express",
  "MongoDB",
  "SQL",
  "Python",
  "Java",
  "Machine Learning",
  "Data Structures",
  "HTML",
  "CSS",
  "Git",
  "REST API",
  "AWS",
  "Docker",
];

function analyzeResume(text) {
  const normalizedText = text.toLowerCase();

  const matchedSkills = skillsList.filter((skill) =>
    normalizedText.includes(skill.toLowerCase())
  );

  return {
    totalSkills: matchedSkills.length,
    matchedSkills,
    missingSkills: skillsList.filter(
      (skill) => !matchedSkills.includes(skill)
    ),
  };
}

module.exports = { analyzeResume };
