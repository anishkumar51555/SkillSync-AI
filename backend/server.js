require("dotenv").config();
const mongoose = require("mongoose");
const Analysis = require("./models/Analysis");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const { analyzeResume } = require("./resumeAnalyzer");
const { matchJob } = require("./jobMatcher");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  },
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "SkillSync AI backend is running!",
  });
});

app.post("/api/analyze-resume", (req, res, next) => {
  upload.single("resume")(req, res, (err) => {
    if (err) return next(err);
    next();
  });
}, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF resume",
      });
    }

    // Basic check that the file starts with the PDF signature
    if (req.file.buffer.subarray(0, 5).toString() !== "%PDF-") {
      return res.status(400).json({
        success: false,
        message: "Invalid PDF file",
      });
    }

    const pdfData = await pdfParse(req.file.buffer);
    const extractedText = pdfData.text.trim();

    if (!extractedText) {
      return res.status(422).json({
        success: false,
        message:
          "No readable text found. Please use a text-based PDF resume.",
      });
    }

    
const analysis = analyzeResume(extractedText);


const jobDescription = (
  req.body?.jobDescription || ""
).trim();

let jobMatch = null;

if (jobDescription) {
  if (jobDescription.length > 10000) {
    return res.status(400).json({
      success: false,
      message: "Job description must be 10000 characters or less.",
    });
  }

  jobMatch = matchJob(extractedText, jobDescription);
}


let mlPrediction = null;

try {
  const mlResponse = await fetch("http://127.0.0.1:8000/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: extractedText,
    }),
  });

  if (mlResponse.ok) {
    mlPrediction = await mlResponse.json();
  } else {
    console.error("ML service returned:", mlResponse.status);
  }
} catch (error) {
  console.error("ML service unavailable:", error.message);
}

let savedToHistory = false;

try {
  await Analysis.create({
    filename: req.file.originalname,
    totalSkills: analysis.totalSkills,
    matchedSkills: analysis.matchedSkills,
    missingSkills: analysis.missingSkills,
    predictedCategory:
      mlPrediction?.predicted_category || null,
    jobMatchScore: jobMatch?.matchScore ?? null,
    skillCoverage: jobMatch?.skillCoverage ?? null,
  });

  savedToHistory = true;
} catch (error) {
  console.error("Could not save analysis:", error.message);
}


res.json({
  success: true,
  message: "Resume analyzed successfully",
  ...analysis,
  mlPrediction,
  jobMatch,
  savedToHistory,
});

  } catch (error) {
    next(error);
  }
});


app.get("/api/analyses", async (req, res) => {
  try {
    const analyses = await Analysis.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select("-__v")
      .lean();

    res.json({
      success: true,
      count: analyses.length,
      analyses,
    });
  } catch (error) {
    console.error("History fetch failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not fetch analysis history",
    });
  }
});


app.use((err, req, res, next) => {
  console.error("Request failed:", err.message);

  if (res.headersSent) return next(err);

  res.status(400).json({
    success: false,
    message: "Could not process the resume. Please try another PDF.",
  });
});



async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from backend/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Backend running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();

