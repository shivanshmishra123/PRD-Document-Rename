import JSZip from "jszip";

// DOM Elements
const studentNameInput = document.getElementById("studentName");
const rollNumberInput = document.getElementById("rollNumber");
const courseCodeSelect = document.getElementById("courseCode");
const branchCodeSelect = document.getElementById("branchCode");
const downloadZipBtn = document.getElementById("downloadZipBtn");
const statusMessage = document.getElementById("statusMessage");

// Label Elements
const labels = {
  diploma: {
    pre: document.getElementById("label-DiplomaPreFinal"),
    final: document.getElementById("label-DiplomaFinal"),
  },
  graduation: {
    pre: document.getElementById("label-GraduationPreFinal"),
    final: document.getElementById("label-GraduationFinal"),
  },
  pg: {
    pre: document.getElementById("label-PGPreFinal"),
    final: document.getElementById("label-PGFinal"),
  },
};

// Config for Systems
const systemConfig = {
  diploma: {
    semester: {
      pre: "Semesters 1-5 (Single PDF)",
      final: "Semester 6",
      preCode: "DiplomaSem01to05",
      finalCode: "DiplomaSem06",
    },
    yearly: {
      pre: "Year 1-2 (Single PDF)",
      final: "Year 3",
      preCode: "DiplomaYear01to02",
      finalCode: "DiplomaYear03",
    },
  },
  graduation: {
    semester: {
      pre: "Semesters 1-7 (Single PDF)",
      final: "Semester 8",
      preCode: "GraduationSem01to07",
      finalCode: "GraduationSem08",
    },
    yearly: {
      pre: "Year 1-3 (Single PDF)",
      final: "Year 4",
      preCode: "GraduationYear01to03",
      finalCode: "GraduationYear04",
    },
  },
  pg: {
    semester: {
      pre: "Semesters 1-3 (Single PDF)",
      final: "Semester 4",
      preCode: "Post-GraduationSem01to03",
      finalCode: "Post-GraduationSem04",
    },
    yearly: {
      pre: "Year 1 (Single PDF)",
      final: "Year 2",
      preCode: "Post-GraduationYear01",
      finalCode: "Post-GraduationYear02",
    },
  },
};

// Global State for current system selection
const currentSystem = {
  diploma: "semester",
  graduation: "semester",
  pg: "semester",
};

// Make updateLabels available globally since it's called from HTML
window.updateLabels = (type) => {
  const radios = document.getElementsByName(`${type}System`);
  let selectedValue = "semester";
  for (const radio of radios) {
    if (radio.checked) {
      selectedValue = radio.value;
      break;
    }
  }
  currentSystem[type] = selectedValue;

  const config = systemConfig[type][selectedValue];
  if (labels[type].pre) labels[type].pre.textContent = config.pre;
  if (labels[type].final) labels[type].final.textContent = config.final;
};

// File Inputs Map
// Pattern A: [DocType]_[Roll]_[StudentName]_[Course]_[Branch].pdf
// Pattern B: [DocType]_[Roll]_[Course]_[Branch]_[StudentName].pdf
const fixedFileInputs = {
  Photograph: { id: "file-Photograph", pattern: "A" },
  "10th": { id: "file-10th", pattern: "A" },
  "12th": { id: "file-12th", pattern: "A" },
  AadhaarCard: { id: "file-AadhaarCard", pattern: "A" },
  PANCard: { id: "file-PANCard", pattern: "A" },
  APAAR_ID: { id: "file-APAAR_ID", pattern: "A" },
  PRDForm: { id: "file-PRDForm", pattern: "B" },
  CV01PageFormat: { id: "file-CV01PageFormat", pattern: "B" },
  CV02PagesFormat: { id: "file-CV02PagesFormat", pattern: "B" },
  JEEScoreCard: { id: "file-JEEScoreCard", pattern: "A" },
  "12thImprovement": { id: "file-12thImprovement", pattern: "A" },
  GAMEScoreCard: { id: "file-GAMEScoreCard", pattern: "A" },
};

// Dynamic Inputs (Diploma, Grad, PG)
const dynamicInputs = {
  diploma: { preId: "file-DiplomaPreFinal", finalId: "file-DiplomaFinal" },
  graduation: {
    preId: "file-GraduationPreFinal",
    finalId: "file-GraduationFinal",
  },
  pg: { preId: "file-PGPreFinal", finalId: "file-PGFinal" },
};

// Functions
const cleanName = (name) => {
  return name.trim().replace(/\s+/g, "_");
};

const getRenamedFilename = (docType, roll, name, course, branch, pattern) => {
  const cleanedName = cleanName(name);
  const ext = ".pdf";

  if (pattern === "A") {
    return `${docType}_${roll}_${cleanedName}_${course}_${branch}${ext}`;
  } else {
    return `${docType}_${roll}_${course}_${branch}_${cleanedName}${ext}`;
  }
};

const showStatus = (message, type = "info") => {
  statusMessage.textContent = message;
  statusMessage.className = `mt-4 p-4 rounded-md text-sm font-medium ${
    type === "error"
      ? "bg-red-50 text-red-700 border border-red-200"
      : type === "success"
      ? "bg-green-50 text-green-700 border border-green-200"
      : "bg-blue-50 text-blue-700 border border-blue-200"
  }`;
  statusMessage.classList.remove("hidden");
};

const validateInputs = () => {
  if (!studentNameInput.value.trim()) return "Student Name is required.";
  if (!rollNumberInput.value.trim()) return "Roll Number is required.";
  if (!courseCodeSelect.value) return "Course Code is required.";
  if (!branchCodeSelect.value) return "Branch Code is required.";
  return null;
};

// Event Handler
downloadZipBtn.addEventListener("click", async () => {
  const error = validateInputs();
  if (error) {
    showStatus(error, "error");
    return;
  }

  const name = studentNameInput.value;
  const roll = rollNumberInput.value.trim();
  const course = courseCodeSelect.value;
  const branch = branchCodeSelect.value;

  const zip = new JSZip();
  let filesAdded = 0;

  showStatus("Processing files...", "info");

  try {
    // 1. Process Fixed Files
    for (const [docType, config] of Object.entries(fixedFileInputs)) {
      const inputElement = document.getElementById(config.id);
      if (inputElement && inputElement.files.length > 0) {
        const file = inputElement.files[0];
        const newFilename = getRenamedFilename(
          docType,
          roll,
          name,
          course,
          branch,
          config.pattern
        );
        zip.file(newFilename, file);
        filesAdded++;
      }
    }

    // 2. Process Dynamic Files
    for (const [type, inputs] of Object.entries(dynamicInputs)) {
      const selectedSystem = currentSystem[type]; // 'semester' or 'yearly'
      const config = systemConfig[type][selectedSystem];

      // Pre-Final
      const preInput = document.getElementById(inputs.preId);
      if (preInput && preInput.files.length > 0) {
        const docType = config.preCode;
        const newFilename = getRenamedFilename(
          docType,
          roll,
          name,
          course,
          branch,
          "A"
        );
        zip.file(newFilename, preInput.files[0]);
        filesAdded++;
      }

      // Final
      const finalInput = document.getElementById(inputs.finalId);
      if (finalInput && finalInput.files.length > 0) {
        const docType = config.finalCode;
        const newFilename = getRenamedFilename(
          docType,
          roll,
          name,
          course,
          branch,
          "A"
        );
        zip.file(newFilename, finalInput.files[0]);
        filesAdded++;
      }
    }

    if (filesAdded === 0) {
      showStatus("Please upload at least one document to download.", "error");
      return;
    }

    // Generate ZIP
    const content = await zip.generateAsync({ type: "blob" });

    const zipFilename = `${roll}_${cleanName(name)}_PlacementDocs.zip`;

    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = zipFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showStatus(
      `Successfully downloaded ${filesAdded} document(s) as ZIP!`,
      "success"
    );
  } catch (err) {
    console.error(err);
    showStatus("An error occurred while creating the ZIP file.", "error");
  }
});
