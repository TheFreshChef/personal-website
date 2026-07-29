// ── Site content ──────────────────────────────────────────────────────────────
// All portfolio copy lives here so the components stay purely presentational.

export const profile = {
  name: "Edric Irimpan",
  role: "AI Engineer & Full-Stack Developer",
  tagline:
    "CS senior at UC Santa Barbara building RAG pipelines, ML systems, and games people actually play.",
  email: "lifehaxdecks@gmail.com",
  github: "https://github.com/TheFreshChef",
  linkedin: "https://www.linkedin.com/in/edric-irimpan-491254293",
  location: "Santa Barbara, CA",
};

export const education = {
  school: "University of California, Santa Barbara",
  degree: "B.S. in Computer Science",
  graduation: "December 2026",
  gpa: "3.62",
  honors: ["Regents Scholar", "Dean's Honors"],
  coursework: [
    "Data Structures & Algorithms",
    "Generative AI",
    "Artificial Intelligence",
    "Machine Learning",
    "ML for Networking",
    "Relational Database Systems",
    "Computer Architecture",
    "Computational Science",
    "Object-Oriented Design",
  ],
};

export type Experience = {
  company: string;
  role: string;
  location: string;
  period: string;
  highlights: string[];
  tech: string[];
};

export const experience: Experience[] = [
  {
    company: "QSource Group Inc.",
    role: "AI Engineer Intern",
    location: "Remote",
    period: "May 2026 — Present",
    highlights: [
      "Built an end-to-end RAG pipeline with Azure Document Intelligence OCR, Azure AI Search, and Azure OpenAI, plus an automated LLM-as-judge scoring harness measuring 75–93% extraction accuracy across 34 lease fields.",
      "Developed a full-stack document-extraction platform with real-time SSE-streamed results, dual OCR paths, and DeepEval scoring across leases and ACORD 25 certificates.",
    ],
    tech: ["Azure OpenAI", "FastAPI", "SQLAlchemy", "React", "TypeScript"],
  },
  {
    company: "SLAC National Accelerator Laboratory",
    role: "Machine Learning Intern",
    location: "Menlo Park, CA",
    period: "Jul 2025 — Sep 2025",
    highlights: [
      "Enhanced the Resonet crystallography model used by hundreds of scientists in real-time pipelines — engineered ice-detection and anisotropy features while processing 100,000+ diffraction datasets into optimized formats.",
      "Implemented an unsupervised ML pipeline using K-means, DBSCAN, and agglomerative clustering with PCA visualization, advancing automated analysis in high-throughput workflows.",
    ],
    tech: ["PyTorch", "Python", "scikit-learn", "NumPy"],
  },
  {
    company: "Aventis Games",
    role: "Software Engineer Intern",
    location: "Remote",
    period: "Jun 2024 — Sep 2024",
    highlights: [
      "Built and refined a machine learning model to classify images under specific conditions, achieving a 25% improvement in classification accuracy over prior benchmarks.",
      "Integrated Google Sign-In with Google Cloud and Firebase for secure authentication and scalable backend services.",
    ],
    tech: ["TensorFlow", "Google Cloud", "Firebase"],
  },
];

export type Project = {
  name: string;
  role: string;
  period: string;
  blurb: string;
  highlights: string[];
  tech: string[];
  links: { label: string; url: string }[];
  accent: string; // per-card accent hue
  award?: string;
};

export const projects: Project[] = [
  {
    name: "ZER0 SH0T",
    role: "Game Developer",
    period: "Published 2026",
    blurb:
      "A lightning-fast cyberpunk FPS platformer built in Unity. Play a street-rat hacker infiltrating corporate data vaults — run, jump, and shoot past robotic security and laser grids before the system locks you down.",
    highlights: [
      "Full 3D FPS platformer shipped on Windows and macOS through Red Athena Studios (UCSB Gaucho Game Lab).",
      "Speed-focused movement mechanics, score-driven data collectibles, and level-based heist progression.",
    ],
    tech: ["Unity", "C#", "3D", "Game Design"],
    links: [{ label: "Play on itch.io", url: "https://redathena.itch.io/zer0-sh0t" }],
    accent: "cyan",
  },
  {
    name: "Acuity.ai",
    role: "Lead ML Engineer",
    period: "Feb 2026 — Jun 2026",
    blurb:
      "A RAG-backed clinical chatbot that assesses patient readmission risk with an XGBoost classifier tuned for recall — flagging high-risk patients before they bounce back.",
    highlights: [
      "Healthcare Impact Finalist at Data4Good 2026.",
      "Ingestion pipeline indexing clinical knowledge bases with TF-IDF + FAISS vector retrieval for evidence-based recommendations.",
      "Extracted structured vitals from 20,000+ patient records to predict 72-hour revisit rates with low false negatives.",
    ],
    tech: ["FastAPI", "XGBoost", "FAISS", "RAG", "NLP"],
    links: [{ label: "GitHub", url: "https://github.com/ofeng1/datathon" }],
    accent: "teal",
    award: "Data4Good 2026 Finalist",
  },
  {
    name: "LoreWeaveAI",
    role: "Lead Engineer",
    period: "May 2025 — Aug 2025",
    blurb:
      "A generative system that produces lore-consistent dialogue for any video game — grounded in each game's actual canon through retrieval.",
    highlights: [
      "200% increase in dialogue relevance and consistency scores via a RAG system with a FAISS-based lore index.",
      "Cut hallucination rate by 80%; new character personas plug in through a modular FastAPI server and prompt design.",
    ],
    tech: ["RAG", "FAISS", "FastAPI", "LLMs"],
    links: [{ label: "GitHub", url: "https://github.com/TheFreshChef/Generative-NPC-Dialogue" }],
    accent: "violet",
  },
  {
    name: "Canvas Clash",
    role: "Lead Engineer",
    period: "Jan 2025 — Jun 2025",
    blurb:
      "A multiplayer drawing game with live AI-powered sketch recognition — draw fast, get scored instantly, beat the room.",
    highlights: [
      "TensorFlow.js sketch recognition exceeding 85% accuracy for real-time feedback and scoring.",
      "Low-latency Node.js + Socket.io backend syncing scoreboards for 100+ concurrent players.",
      "3rd place in UCSB ACM's annual web development competition.",
    ],
    tech: ["TensorFlow.js", "React", "Node.js", "Socket.io"],
    links: [
      { label: "Live Demo", url: "https://canvas-clash.vercel.app" },
      { label: "GitHub", url: "https://github.com/AkulS1008/CanvasClash" },
    ],
    accent: "amber",
    award: "3rd Place — UCSB ACM WebDev",
  },
];

export type MiniRepo = {
  name: string;
  blurb: string;
  tech: string[];
  url: string;
  badge?: string;
};

// Smaller repos worth showing — owned and collaborations.
export const moreWork: MiniRepo[] = [
  {
    name: "YOLOv1 from Scratch",
    blurb:
      "Full PyTorch implementation of the YOLOv1 object-detection paper — custom multi-part loss, Pascal VOC loader, and non-max suppression, written from the ground up.",
    tech: ["PyTorch", "Computer Vision"],
    url: "https://github.com/TheFreshChef/Yolov1",
  },
  {
    name: "QoS Prediction Model",
    blurb:
      "Predicts download/upload speed and latency from just the first packets of a speed test — packet capture, feature engineering, neural nets, and decision-tree explainability with Trustee.",
    tech: ["PyTorch", "scikit-learn", "pyshark"],
    url: "https://github.com/TheFreshChef/QoS_Prediction_Model",
  },
  {
    name: "LLM Fine-tuning Study",
    blurb:
      "Compared full fine-tuning against parameter-efficient LoRA and a baseline, with a written report on the trade-offs.",
    tech: ["LoRA", "Python"],
    url: "https://github.com/TheFreshChef/LLM-finetuning",
  },
  {
    name: "aniceo",
    blurb:
      "Research collaboration on anisotropic scattering and ice detection for crystallography pipelines — clustering, maximum-component analysis, and graphing utilities.",
    tech: ["Python", "Research"],
    url: "https://github.com/dermen/aniceo",
    badge: "Collaboration · SLAC",
  },
];

export const skills = {
  Languages: ["Python", "Java", "C++", "C#", "TypeScript", "JavaScript", "SQL", "CSS"],
  "ML & AI": ["PyTorch", "TensorFlow", "RAG / FAISS", "XGBoost", "NumPy", "Pandas", "Azure AI Foundry"],
  "Frameworks & Tools": [
    "React",
    "Next.js",
    "React Native",
    "FastAPI",
    "Node.js",
    "Express",
    "Socket.io",
    "PostgreSQL",
    "Docker",
    "Unity",
  ],
};

export const interests = [
  "Machine Learning",
  "Game Development",
  "Pixel-art Animation",
  "Photography",
  "Barbecuing",
  "Lakers Basketball",
];
