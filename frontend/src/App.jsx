import React, { useState } from "react";

export default function ContentGenerator() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [contentPack, setContentPack] = useState(null);
  const [error, setError] = useState("");

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError("");
    setContentPack(null);

    try {
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL || "https://viseo-gof2.onrender.com";

      const response = await fetch(`${backendUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ topic: topic.trim() }),
      });

      // 🛡️ JSON Safety Check: Stop the process early if the response returned raw HTML error pages
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textFallback = await response.text();
        console.error("HTML Intercepted:", textFallback);
        throw new Error(
          "Server returned an invalid HTML document layout instead of data. Verify your api routes.",
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Content generation failed.");
      }

      setContentPack(data.data);
    } catch (err) {
      setError(err.message || "An unexpected communication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, e) => {
    navigator.clipboard.writeText(text);
    const originalText = e.target.innerHTML;
    e.target.innerHTML = "Copied ✓";
    setTimeout(() => {
      e.target.innerHTML = originalText;
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 flex flex-col justify-between font-sans antialiased">
      {/* Main Structural Layout Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex flex-col items-center">
        {/* Responsive Typography Header Section */}
        <div className="text-center max-w-xl mb-10 sm:mb-14">
          <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200">
            Viseo Optimization Core
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950">
            Expand Your Content Strategy
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-zinc-600 leading-relaxed">
            Input a single niche or topic to instantly draft structured
            short-form script frameworks tailored for audience retention.
          </p>
        </div>

        {/* Responsive Dynamic Input Form Grid */}
        <form
          onSubmit={handleGenerate}
          className="w-full max-w-xl flex flex-col sm:flex-row gap-2.5 mb-12 sm:mb-16"
        >
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Personal finance tips, Real estate scaling..."
            className="w-full sm:flex-1 px-4 py-2.5 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-950 shadow-sm transition"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="w-full sm:w-auto px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:opacity-40 disabled:hover:bg-zinc-900 disabled:cursor-not-allowed transition shadow-sm whitespace-nowrap"
          >
            {loading ? "Processing..." : "Generate Scripts"}
          </button>
        </form>

        {/* Error Feedback Display Banner */}
        {error && (
          <div className="w-full max-w-xl p-3.5 mb-10 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex flex-col gap-1 shadow-sm">
            <span className="font-bold">System Feedback Notice:</span>
            <p className="text-red-700 font-mono break-all">{error}</p>
          </div>
        )}

        {/* Completely Responsive Flex-Grid Matrix for 3 content components */}
        {contentPack && (
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            {/* Angle 1: Controversial */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-zinc-300 transition duration-200">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Angle 01
                  </span>
                  <span className="text-[11px] font-medium bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded border border-zinc-200">
                    The Rule Breaker
                  </span>
                </div>
                <h3 className="mt-4 text-base sm:text-lg font-semibold text-zinc-950 leading-snug">
                  "{contentPack.controversial.hook}"
                </h3>
                <p className="mt-3 text-zinc-600 text-xs leading-relaxed">
                  {contentPack.controversial.body}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-100">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Visual Blueprint:
                </span>
                <p className="text-xs text-zinc-700 bg-zinc-50/50 p-3 rounded-lg border border-zinc-200/60 font-mono text-[11px] leading-normal">
                  {contentPack.controversial.visualDirection}
                </p>
                <button
                  onClick={(e) =>
                    copyToClipboard(
                      `HOOK: ${contentPack.controversial.hook}\n\nBODY: ${contentPack.controversial.body}`,
                      e,
                    )
                  }
                  className="mt-4 w-full py-2 bg-white hover:bg-zinc-50 text-zinc-800 font-medium text-xs rounded-lg transition border border-zinc-300 shadow-sm active:bg-zinc-100"
                >
                  Copy Text Blueprint
                </button>
              </div>
            </div>

            {/* Angle 2: Analogy */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-zinc-300 transition duration-200">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Angle 02
                  </span>
                  <span className="text-[11px] font-medium bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded border border-zinc-200">
                    The ELI5 Explainer
                  </span>
                </div>
                <h3 className="mt-4 text-base sm:text-lg font-semibold text-zinc-950 leading-snug">
                  "{contentPack.analogy.hook}"
                </h3>
                <p className="mt-3 text-zinc-600 text-xs leading-relaxed">
                  {contentPack.analogy.body}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-100">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Visual Blueprint:
                </span>
                <p className="text-xs text-zinc-700 bg-zinc-50/50 p-3 rounded-lg border border-zinc-200/60 font-mono text-[11px] leading-normal">
                  {contentPack.analogy.visualDirection}
                </p>
                <button
                  onClick={(e) =>
                    copyToClipboard(
                      `HOOK: ${contentPack.analogy.hook}\n\nBODY: ${contentPack.analogy.body}`,
                      e,
                    )
                  }
                  className="mt-4 w-full py-2 bg-white hover:bg-zinc-50 text-zinc-800 font-medium text-xs rounded-lg transition border border-zinc-300 shadow-sm active:bg-zinc-100"
                >
                  Copy Text Blueprint
                </button>
              </div>
            </div>

            {/* Angle 3: Case Study */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-zinc-300 transition duration-200">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Angle 03
                  </span>
                  <span className="text-[11px] font-medium bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded border border-zinc-200">
                    The Proof Hack
                  </span>
                </div>
                <h3 className="mt-4 text-base sm:text-lg font-semibold text-zinc-950 leading-snug">
                  "{contentPack.caseStudy.hook}"
                </h3>
                <p className="mt-3 text-zinc-600 text-xs leading-relaxed">
                  {contentPack.caseStudy.body}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-100">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Visual Blueprint:
                </span>
                <p className="text-xs text-zinc-700 bg-zinc-50/50 p-3 rounded-lg border border-zinc-200/60 font-mono text-[11px] leading-normal">
                  {contentPack.caseStudy.visualDirection}
                </p>
                <button
                  onClick={(e) =>
                    copyToClipboard(
                      `HOOK: ${contentPack.caseStudy.hook}\n\nBODY: ${contentPack.caseStudy.body}`,
                      e,
                    )
                  }
                  className="mt-4 w-full py-2 bg-white hover:bg-zinc-50 text-zinc-800 font-medium text-xs rounded-lg transition border border-zinc-300 shadow-sm active:bg-zinc-100"
                >
                  Copy Text Blueprint
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Production Minimalist Footer Component */}
      <footer className="w-full py-6 border-t border-zinc-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-zinc-400">
          <span>© 2024 Viseo Optimization Core. All rights reserved.</span>
          <span>Built with ❤️ by the Viseo Team.</span>
        </div>
      </footer>
    </div>
  );
}
