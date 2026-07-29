const items = [
  "PyTorch",
  "TensorFlow",
  "RAG",
  "FAISS",
  "Azure OpenAI",
  "FastAPI",
  "React",
  "TypeScript",
  "Node.js",
  "PostgreSQL",
  "Docker",
  "Unity",
  "Python",
  "C++",
  "Java",
  "XGBoost",
];

export default function TechTicker() {
  const row = items.map((t) => (
    <span className="ticker-item" key={t}>
      {t}
      <span className="ticker-sep" aria-hidden="true">
        ◆
      </span>
    </span>
  ));

  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        {row}
        {items.map((t) => (
          <span className="ticker-item" key={`dup-${t}`}>
            {t}
            <span className="ticker-sep" aria-hidden="true">
              ◆
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
