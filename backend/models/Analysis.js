
const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    totalSkills: {
      type: Number,
      default: 0,
    },
    matchedSkills: {
      type: [String],
      default: [],
    },
    missingSkills: {
      type: [String],
      default: [],
    },
    predictedCategory: {
      type: String,
      default: null,
    },
    jobMatchScore: {
      type: Number,
      default: null,
    },
    skillCoverage: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Analysis", analysisSchema);
