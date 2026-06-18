import React, { useState, useRef } from "react";

// AUTOMATIC URL SWITCHING: Uses live backend URL in production, localhost in development
const BACKEND_URL = import.meta.env.PROD
  ? "https://viseo-gof2.onrender.com" // REPLACE THIS with your live Render/Railway URL later
  : "http://localhost:5000";

export default function App() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Track timestamps to block rapid button clicks / spamming
  const lastSubmitTime = useRef(0);

  const generateIdeas = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    // ANTI-SPAM PROTECTION: Blocks request if button is clicked within 1.5 seconds of the last click
    const currentTime = Date.now();
    if (currentTime - lastSubmitTime.current < 1500 || loading) {
      return;
    }
    lastSubmitTime.current = currentTime;

    setLoading(true);
    setError("");
    setResults(null);
    setCopiedIndex(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong");

      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-slate-200 flex flex-col justify-between p-5 font-sans">
      {/* Premium Minimal Header */}
      <header className="text-center my-8">
        <h1 className="text-2xl font-bold tracking-tight text-white uppercase">
          Builders Growth Engine
        </h1>
        <p className="text-xs text-slate-500 tracking-wide mt-1">
          4-Series Growth Strategies
        </p>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-sm mx-auto w-full space-y-6">
        {/* Input Form - Clean Utility Styling */}
        <form
          onSubmit={generateIdeas}
          className="space-y-4 bg-[#1a1a1a] p-5 rounded-xl border border-neutral-800"
        >
          <div>
            <label
              htmlFor="topic"
              className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2"
            >
              Content Pillar / Topic Idea
            </label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., AI tools for content creation"
              className="w-full bg-[#242424] border border-neutral-800 rounded-lg py-3 px-3.5 text-sm focus:outline-none focus:border-neutral-500 transition-colors text-white placeholder:text-neutral-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="w-full bg-white hover:bg-neutral-200 text-black font-semibold py-3 rounded-lg transition-colors active:scale-[0.99] disabled:opacity-30 disabled:pointer-events-none text-xs uppercase tracking-widest"
          >
            {loading ? "Processing Prompt..." : "Generate 4 Outlines"}
          </button>
        </form>

        {/* System Error Logs */}
        {error && (
          <div className="bg-red-950/40 border border-red-900/50 text-red-400 p-3 rounded-lg text-xs text-center">
            {error}
          </div>
        )}

        {/* Results Interface */}
        {results && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-500 pl-1">
              Outlines Produced
            </h2>

            <div className="space-y-4">
              {results.series?.map((item, index) => (
                <div
                  key={index}
                  className="bg-[#1a1a1a] border border-neutral-800 p-4 rounded-xl space-y-4"
                >
                  {/* Card Header Row */}
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <span className="text-xs font-mono tracking-wider text-neutral-400">
                      [0{index + 1}] CONCEPT
                    </span>
                    <button
                      onClick={() => copyToClipboard(item.hook, index)}
                      className="text-[11px] font-mono text-neutral-400 hover:text-white transition-colors"
                    >
                      {copiedIndex === index ? "✓ COPIED" : "[ COPY HOOK ]"}
                    </button>
                  </div>

                  {/* Hook Display */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-600 block">
                      Hook Variant
                    </span>
                    <p className="text-sm font-normal text-neutral-200 leading-relaxed">
                      {item.hook}
                    </p>
                  </div>

                  {/* Hashtags Display */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-600 block">
                      Target Indexes
                    </span>
                    <div className="flex flex-wrap gap-x-2 gap-y-1">
                      {item.hashtags?.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-xs font-mono text-neutral-400"
                        >
                          {tag.startsWith("#") ? tag : `#${tag}`}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Required Footer Details */}
      <footer className="text-center font-mono text-[10px] text-neutral-600 my-8 space-y-1">
        <div>built by Kelechi to builders</div>
      </footer>
    </div>
  );
}
