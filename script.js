
const $ = (selector) => document.querySelector(selector);

const STORAGE_KEY = "proofofskill_proofs";
const CHALLENGE_KEY = "proofofskill_challenges";

function readData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}


const sampleProofs = [
  {
    id: "demo-1",
    skill: "HTML",
    title: "Responsive Portfolio Website",
    description: "A sample project demonstrating HTML structure and responsive CSS design.",
    projectUrl: "",
    createdAt: new Date().toISOString()
  },
  {
    id: "demo-2",
    skill: "JavaScript",
    title: "Interactive Task Manager",
    description: "A sample project demonstrating interactive buttons and task management.",
    projectUrl: "",
    createdAt: new Date().toISOString()
  },
  {
    id: "demo-3",
    skill: "Excel",
    title: "Sales Data Analysis",
    description: "A sample project demonstrating sales analysis and data organization.",
    projectUrl: "",
    createdAt: new Date().toISOString()
  }
];

let proofs = readData(STORAGE_KEY, null);

if (proofs === null) {
  proofs = sampleProofs;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(proofs));
}

if (!Array.isArray(proofs)) {
  proofs = [];
}
let editingProofId = null;

const challenges = [
  { id: 1, title: "Build a responsive HTML page", level: "Beginner" },
  { id: 2, title: "Create a JavaScript form validator", level: "Beginner" },
  { id: 3, title: "Clean a sample Excel dataset", level: "Beginner" }
];

let completed = readData(CHALLENGE_KEY, []);

function notify(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => toast.classList.remove("show"), 2400);
}

function saveProofs() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(proofs));
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol)
      ? url.href
      : "";
  } catch {
    return "";
  }
}

function renderProofs() {
  const search = $("#searchInput").value.trim().toLowerCase();
  const filter = $("#filterSelect").value;

  const filtered = proofs.filter((proof) => {
    const matchesSearch =
      proof.title.toLowerCase().includes(search) ||
      proof.skill.toLowerCase().includes(search) ||
      proof.description.toLowerCase().includes(search);

    const matchesFilter =
      filter === "All" || proof.skill === filter;

    return matchesSearch && matchesFilter;
  });

  $("#proofGrid").replaceChildren();

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = proofs.length
      ? "No matching proofs found. Try another search."
      : "No proofs yet. Click Add Proof to showcase your first project.";
    $("#proofGrid").appendChild(empty);
  }

  filtered.forEach((proof) => {
    const card = document.createElement("article");
    card.className = "proof-card";

    const tag = document.createElement("span");
    tag.className = "skill-tag";
    tag.textContent = proof.skill;

    const title = document.createElement("h3");
    title.textContent = proof.title;

    const description = document.createElement("p");
    description.textContent = proof.description;

    card.append(tag, title, description);

    const url = safeUrl(proof.projectUrl || "");

    if (url) {
      const link = document.createElement("a");
      link.className = "proof-link";
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "View project ↗";
      card.appendChild(link);
    }

   
   
const edit = document.createElement("button");
edit.className = "edit-btn";
edit.textContent = "Edit proof";

edit.addEventListener("click", () => {
  openForm(proof);
});

card.appendChild(edit);


    const remove = document.createElement("button");
    remove.className = "delete-btn";
    remove.textContent = "Delete proof";
    remove.addEventListener("click", () => {
      if (!confirm("Delete this proof?")) return;

      proofs = proofs.filter((item) => item.id !== proof.id);
      saveProofs();
      renderAll();
      notify("Proof deleted.");
    });

    card.appendChild(remove);
    $("#proofGrid").appendChild(card);
  });
}

function renderChallenges() {
  $("#challengeList").replaceChildren();

  challenges.forEach((challenge) => {
    const row = document.createElement("label");
    row.className = "challenge-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = completed.includes(challenge.id);

    checkbox.addEventListener("change", () => {
      completed = checkbox.checked
        ? [...completed, challenge.id]
        : completed.filter((id) => id !== challenge.id);

      localStorage.setItem(CHALLENGE_KEY, JSON.stringify(completed));
      renderAll();
    });

    const title = document.createElement("span");
    title.textContent = challenge.title;

    const level = document.createElement("small");
    level.textContent = challenge.level;

    row.append(checkbox, title, level);
    $("#challengeList").appendChild(row);
  });
}

function renderAll() {
  const skills = new Set(proofs.map((proof) => proof.skill));

  $("#skillCount").textContent = skills.size;
  $("#proofCount").textContent = proofs.length;
  $("#challengeCount").textContent = completed.length;
  
  const progress = Math.min(
    Math.round((proofs.length / 5) * 100),
    100
  );

  $("#progressPercent").textContent = progress + "%";
  $("#progressFill").style.width = progress + "%";
  $("#progressTrack").setAttribute("aria-valuenow", progress);

  $("#progressMessage").textContent =
    progress >= 100
      ? "Great work! Your 5-proof target is complete."
      : `You have ${proofs.length} of 5 proofs. Keep building!`;


  renderProofs();
  renderChallenges();
}


function openForm(proof = null) {
  editingProofId = proof ? proof.id : null;

  $("#formHeading").textContent = proof
    ? "Edit Skill Proof"
    : "Add Skill Proof";

  $("#formSubtitle").textContent = proof
    ? "Update your project details."
    : "Showcase what you have built.";

  $("#saveButton").textContent = proof
    ? "Save Changes"
    : "Save Proof";

  $("#skill").value = proof ? proof.skill : "";
  $("#title").value = proof ? proof.title : "";
  $("#description").value = proof ? proof.description : "";
  $("#projectUrl").value = proof ? (proof.projectUrl || "") : "";

  $("#formModal").classList.remove("hidden");
  $("#skill").focus();
}

function closeForm() {
  $("#formModal").classList.add("hidden");
  $("#proofForm").reset();
  editingProofId = null;
}


$("#openForm").addEventListener("click", openForm);
$("#sectionAdd").addEventListener("click", openForm);
$("#heroButton").addEventListener("click", openForm);
$("#closeForm").addEventListener("click", closeForm);

$("#formModal").addEventListener("click", (event) => {
  if (event.target === $("#formModal")) closeForm();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeForm();
});

$("#searchInput").addEventListener("input", renderProofs);
$("#filterSelect").addEventListener("change", renderProofs);

$("#proofForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const skill = $("#skill").value;
  const title = $("#title").value.trim();
  const description = $("#description").value.trim();
  const rawUrl = $("#projectUrl").value.trim();

  if (!skill || !title || !description) {
    notify("Please fill in all required fields.");
    return;
  }

  if (rawUrl && !safeUrl(rawUrl)) {
    notify("Please enter a valid HTTP or HTTPS URL.");
    return;
  }

  proofs.unshift({
    id: crypto.randomUUID(),
    skill,
    title,
    description,
    projectUrl: rawUrl,
    createdAt: new Date().toISOString()
  });

  saveProofs();
  $("#proofForm").reset();
  closeForm();
  renderAll();
  notify("Your skill proof has been saved!");
});

$("#portfolioButton").addEventListener("click", () => {
  const skills = [...new Set(proofs.map((proof) => proof.skill))];

  const content = [
    "PROOFOFSKILL — MY PORTFOLIO",
    "",
    "Skills: " + (skills.join(", ") || "No skills added yet"),
    "",
    ...proofs.flatMap((proof) => [
      proof.title + " — " + proof.skill,
      proof.description,
      proof.projectUrl || "No project link provided",
      ""
    ])
  ].join("\n");

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "my-skill-portfolio.txt";
  link.click();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
  notify("Portfolio text file exported.");
});

renderAll();
