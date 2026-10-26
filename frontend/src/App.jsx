
import { useState } from "react";
import "./index.css";


const sampleJobs = [
  {
    title: "Frontend Developer",
    description: `We are looking for a Frontend Developer with skills in JavaScript, React, HTML, CSS, Git, and REST API integration. The candidate should build responsive web interfaces and work with backend teams.`,
  },
  {
    title: "Backend Developer",
    description: `We need a Backend Developer with Node.js, Express, MongoDB, SQL, REST API, Git, and testing skills. The candidate will build APIs, handle authentication, and work with databases.`,
  },
  {
    title: "Machine Learning Engineer",
    description: `We are hiring an ML Engineer with Python, machine learning, SQL, data structures, and model evaluation skills. Experience with data processing and deploying prediction APIs is useful.`,
  },
  {
    title: "Full Stack Developer",
    description: `We need a Full Stack Developer familiar with JavaScript, React, Node.js, Express, MongoDB, SQL, REST API, Git, and testing. The role involves building complete web applications.`,
  },
];


function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  async function handleUpload(event) {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!file) {
      setError("Please select a PDF resume first.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jobDescription);

      const response = await fetch(
        "http://localhost:5000/api/analyze-resume",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Analysis failed");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <nav className="navbar">
        <h2>SkillSync AI</h2>
        <span>Career Intelligence Platform</span>
      </nav>

      <main className="hero">
        <p className="tag">YOUR AI CAREER COMPANION</p>

        <h1>
          Understand your skills.
          <br />
          <span>Plan your future.</span>
        </h1>

        <p className="description">
          Upload your resume to discover your current skills
          and identify areas you can improve.
        </p>

        <form className="upload-card" onSubmit={handleUpload}>
          <label htmlFor="resume">Upload your resume (PDF, max 5 MB)</label>

          <input
            id="resume"
            type="file"
            accept=".pdf,application/pdf"
            onChange={(event) => {
              const selectedFile = event.target.files?.[0];

              setFile(null);
              setResult(null);
              setError("");

              if (!selectedFile) return;

              if (selectedFile.size > 5 * 1024 * 1024) {
                setError("File size must be 5 MB or less.");
                event.target.value = "";
                return;
              }

              if (
                selectedFile.type !== "application/pdf" ||
                !selectedFile.name.toLowerCase().endsWith(".pdf")
              ) {
                setError("Please select a PDF file.");
                event.target.value = "";
                return;
              }

              setFile(selectedFile);
            }}
          />

          
<div className="job-input">
  <label htmlFor="sampleJob">Choose a sample job (optional)</label>

  <select
    id="sampleJob"
    defaultValue=""
    onChange={(event) => {
      const selected = sampleJobs.find(
        (job) => job.title === event.target.value
      );

      if (selected) {
        setJobDescription(selected.description);
      }
    }}
  >
    <option value="">Select a sample job</option>
    {sampleJobs.map((job) => (
      <option key={job.title} value={job.title}>
        {job.title}
      </option>
    ))}
  </select>

  <label htmlFor="jobDescription">
    Or paste a job description
  </label>

  <textarea
    id="jobDescription"
    rows={7}
    maxLength={10000}
    placeholder="Paste the job description here..."
    value={jobDescription}
    onChange={(event) => setJobDescription(event.target.value)}
  />

  <p className="note">
    {jobDescription.length}/10000 characters
  </p>
</div>


          {file && <p className="file-name">{file.name}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {result && (
          <section className="results">
            <h2>Resume Analysis</h2>
            <p>{result.message}</p>
            

{result.mlPrediction && (
  <div className="score-card">
    <div>
      <span>ML Predicted Job Category</span>
      <h3>{result.mlPrediction.predicted_category}</h3>
      <p className="note">
        Experimental model prediction
      </p>
    </div>
    <div>
      <span>Model Confidence</span>
      <h3>
        {(
          result.mlPrediction.model_confidence * 100
        ).toFixed(1)}%
      </h3>
    </div>
  </div>
)}

{!result.mlPrediction && (
  <p className="error">
    ML service unavailable. Skills analysis is still available.
  </p>
)}


{result.jobMatch && (
  <section className="job-results">
    <h2>Job Match Analysis</h2>

    <div className="score-card">
      <div>
        <span>Estimated Match Score</span>
        <h3>{result.jobMatch.matchScore}%</h3>
      </div>

      <div>
        <span>Recognized Skill Coverage</span>
        <h3>{result.jobMatch.skillCoverage}%</h3>
      </div>
    </div>

    <p className="note">{result.jobMatch.message}</p>

    <h3>Matching Skills</h3>
    {result.jobMatch.matchedSkills.length > 0 ? (
      <div className="skill-list">
        {result.jobMatch.matchedSkills.map((skill) => (
          <span className="skill" key={skill}>
            {skill}
          </span>
        ))}
      </div>
    ) : (
      <p>No recognized skills matched.</p>
    )}

    <h3>Skills to Explore</h3>
    {result.jobMatch.missingSkills.length > 0 ? (
      <div className="skill-list">
        {result.jobMatch.missingSkills.map((skill) => (
          <span className="missing-skill" key={skill}>
            {skill}
          </span>
        ))}
      </div>
    ) : (
      <p>No missing recognized skills found.</p>
    )}
  </section>
)}


            <div className="score-card">
              <span>Skills found</span>
              <strong>{result.totalSkills}</strong>
            </div>

            <h3>Matched Skills</h3>
            {result.matchedSkills.length > 0 ? (
              <div className="skill-list">
                {result.matchedSkills.map((skill) => (
                  <span className="skill" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p>No recognized skills found in this resume.</p>
            )}

            <h3>Other Skills to Explore</h3>
            <div className="skill-list">
              {result.missingSkills.map((skill) => (
                <span className="missing-skill" key={skill}>
                  {skill}
                </span>
              ))}
            </div>

            <p className="note">
              Matched skills are identified using keyword matching.
  Job category is predicted using an experimental ML model
  trained on a small demonstration dataset. Predictions
  are not a measure of job eligibility.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
