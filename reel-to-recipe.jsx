import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════
   ReelRecipe — Instagram Reels → Interactive Recipes
   MVP: Paste a Reel URL, get a beautiful recipe card
   ═══════════════════════════════════════════════════════════ */

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap');`;

const CSS = `
${FONTS}
:root {
  --bg: #FAF7F2;
  --bg-card: #FFFFFF;
  --terracotta: #C0613A;
  --terracotta-light: #E8845A;
  --terracotta-dark: #9A4E2F;
  --sage: #7A8B6F;
  --sage-light: #A3B396;
  --cream: #F5EDE3;
  --cream-dark: #E8DDD0;
  --ink: #2C2420;
  --ink-light: #5C534D;
  --ink-muted: #8A817A;
  --border: #E2D9CF;
  --error-bg: #FEF2F2;
  --error: #B91C1C;
  --shadow: 0 2px 24px rgba(44,36,32,0.06);
  --shadow-lg: 0 8px 48px rgba(44,36,32,0.10);
  --radius: 12px;
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: 'Source Sans 3', 'Segoe UI', sans-serif;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body, #root { font-family: var(--font-body); background: var(--bg); color: var(--ink); min-height: 100vh; }
.grain::before {
  content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 256px;
}
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
.fade-up { animation: fadeUp 0.6s ease-out both; }
.fade-in { animation: fadeIn 0.5s ease-out both; }
.scale-in { animation: scaleIn 0.4s ease-out both; }
`;

const LOADING_MSGS = [
  "Finding the reel...",
  "Reading the caption & comments...",
  "Identifying ingredients...",
  "Measuring quantities...",
  "Writing out the steps...",
  "Plating your recipe...",
];

const Icon = {
  clock: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  users: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  chef: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" y1="17" x2="18" y2="17"/></svg>,
  minus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  arrow: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  link: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  reset: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>,
};

function formatAmount(num) {
  if (!num || num === 0) return "";
  const fracs = [[0.125,"⅛"],[0.25,"¼"],[0.333,"⅓"],[0.5,"½"],[0.667,"⅔"],[0.75,"¾"]];
  const whole = Math.floor(num);
  const dec = num - whole;
  if (dec < 0.06) return whole === 0 ? "" : String(whole);
  for (const [val, sym] of fracs) {
    if (Math.abs(dec - val) < 0.06) return whole > 0 ? `${whole} ${sym}` : sym;
  }
  return num % 1 === 0 ? String(num) : num.toFixed(1).replace(/\.0$/, "");
}

async function extractRecipe(url) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{
        role: "user",
        content: `You are a recipe extraction expert. I'm going to give you an Instagram Reel URL. Use web search to find the content of this reel (caption, comments, any available info). Then extract a complete cooking recipe from whatever you find.

IMPORTANT: Respond with ONLY a valid JSON object, no markdown, no backticks, no explanation. If you cannot find a recipe, return {"error": "reason"}.

JSON schema:
{
  "title": "Recipe name",
  "description": "1-2 sentence description",
  "prepTime": "e.g. 15 min",
  "cookTime": "e.g. 30 min",
  "baseServings": 4,
  "ingredients": [{"name": "ingredient name", "amount": 1.5, "unit": "cups"}],
  "steps": [{"number": 1, "instruction": "Step text here", "duration": "optional time"}],
  "source": {"creatorName": "Name if found", "handle": "@handle if found", "url": "${url}"},
  "tags": ["tag1", "tag2"]
}

Rules:
- amounts must be numbers (use decimals: 0.5 not "1/2")
- unit should be: cups, tbsp, tsp, oz, lb, g, kg, ml, L, cloves, pieces, slices, or "" for countable items
- steps should be clear, actionable, and numbered
- If the caption is vague, use your cooking knowledge to fill in reasonable details
- Include ALL ingredients mentioned or implied
- ONLY output JSON, nothing else

URL: ${url}`,
      }],
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message || "API request failed");
  const textContent = data.content?.filter(b => b.type === "text").map(b => b.text).join("").trim();
  if (!textContent) throw new Error("No response received from AI");
  const cleaned = textContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  let recipe;
  try { recipe = JSON.parse(cleaned); }
  catch { const match = cleaned.match(/\{[\s\S]*\}/); if (match) recipe = JSON.parse(match[0]); else throw new Error("Could not parse recipe from AI response"); }
  if (recipe.error) throw new Error(recipe.error);
  return recipe;
}

// ── Components ──

function AppHeader() {
  return (
    <header style={{ textAlign: "center", padding: "48px 24px 16px", position: "relative", zIndex: 1 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--terracotta)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>{Icon.chef}</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em" }}>ReelRecipe</h1>
      </div>
      <p style={{ fontFamily: "var(--font-display)", fontSize: 15, fontStyle: "italic", color: "var(--ink-muted)", fontWeight: 400 }}>
        Turn Instagram cooking reels into step-by-step recipes
      </p>
    </header>
  );
}

function URLInput({ onSubmit, loading }) {
  const [url, setUrl] = useState("");
  const isValid = url.trim().length > 0;
  const handleSubmit = () => { if (isValid && !loading) onSubmit(url.trim()); };

  return (
    <div className="fade-up" style={{ maxWidth: 560, margin: "0 auto", padding: "24px 20px", position: "relative", zIndex: 1 }}>
      <div style={{ display: "flex", gap: 0, background: "var(--bg-card)", borderRadius: "var(--radius)", boxShadow: "var(--shadow)", border: "1px solid var(--border)", overflow: "hidden" }}>
        <input
          type="url" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder="Paste Instagram Reel URL..." disabled={loading}
          style={{ flex: 1, padding: "16px 20px", border: "none", outline: "none", fontFamily: "var(--font-body)", fontSize: 15, color: "var(--ink)", background: "transparent", minWidth: 0 }}
        />
        <button onClick={handleSubmit} disabled={!isValid || loading}
          style={{
            padding: "16px 24px", background: isValid && !loading ? "var(--terracotta)" : "var(--cream-dark)",
            color: isValid && !loading ? "white" : "var(--ink-muted)", border: "none",
            fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600,
            cursor: isValid && !loading ? "pointer" : "default",
            display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s", whiteSpace: "nowrap",
          }}
        >
          Extract Recipe {Icon.arrow}
        </button>
      </div>
      <p style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: "var(--ink-muted)" }}>
        Works with public Instagram Reels and Posts
      </p>
    </div>
  );
}

function LoadingState({ step }) {
  return (
    <div className="scale-in" style={{ maxWidth: 480, margin: "32px auto", padding: "0 20px", textAlign: "center", position: "relative", zIndex: 1 }}>
      <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius)", boxShadow: "var(--shadow)", border: "1px solid var(--border)", padding: "48px 32px" }}>
        <div style={{ width: 48, height: 48, margin: "0 auto 24px", border: "3px solid var(--cream-dark)", borderTopColor: "var(--terracotta)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "left" }}>
          {LOADING_MSGS.slice(0, step + 1).map((msg, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, animation: `fadeIn 0.3s ease-out ${i * 0.05}s both` }}>
              <div style={{
                width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: i < step ? "var(--sage)" : i === step ? "var(--terracotta)" : "var(--cream-dark)",
                color: "white", transition: "background 0.3s",
              }}>
                {i < step ? Icon.check : <div style={{ width: 6, height: 6, borderRadius: "50%", background: "white", animation: i === step ? "pulse 1s ease-in-out infinite" : "none" }} />}
              </div>
              <span style={{ fontSize: 14, color: i <= step ? "var(--ink)" : "var(--ink-muted)", fontWeight: i === step ? 500 : 400 }}>{msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="scale-in" style={{ maxWidth: 480, margin: "32px auto", padding: "0 20px", position: "relative", zIndex: 1 }}>
      <div style={{ background: "var(--error-bg)", borderRadius: "var(--radius)", border: "1px solid #FECACA", padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>😔</div>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: "var(--error)", marginBottom: 8 }}>Couldn't extract recipe</h3>
        <p style={{ fontSize: 14, color: "var(--ink-light)", lineHeight: 1.5, marginBottom: 20 }}>{message}</p>
        <button onClick={onRetry} style={{ padding: "10px 24px", background: "var(--terracotta)", color: "white", border: "none", borderRadius: 8, fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Try Again</button>
      </div>
    </div>
  );
}

function ServingsControl({ servings, baseServings, onChange }) {
  const btnStyle = {
    width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border)",
    background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", color: "var(--ink)", transition: "all 0.15s",
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <button onClick={() => onChange(Math.max(1, servings - 1))} style={btnStyle}>{Icon.minus}</button>
      <span style={{ minWidth: 32, textAlign: "center", fontSize: 16, fontWeight: 600, color: servings !== baseServings ? "var(--terracotta)" : "var(--ink)", transition: "color 0.2s" }}>{servings}</span>
      <button onClick={() => onChange(servings + 1)} style={btnStyle}>{Icon.plus}</button>
      {servings !== baseServings && (
        <button onClick={() => onChange(baseServings)} title="Reset" className="fade-in"
          style={{ width: 28, height: 28, borderRadius: 6, border: "none", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink-muted)", marginLeft: 4 }}
        >{Icon.reset}</button>
      )}
    </div>
  );
}

function RecipeCard({ recipe, onNewRecipe }) {
  const [servings, setServings] = useState(recipe.baseServings || 4);
  const [checkedSteps, setCheckedSteps] = useState(new Set());
  const [checkedIngs, setCheckedIngs] = useState(new Set());
  const ratio = servings / (recipe.baseServings || 4);

  const toggleStep = n => setCheckedSteps(prev => { const s = new Set(prev); s.has(n) ? s.delete(n) : s.add(n); return s; });
  const toggleIng = i => setCheckedIngs(prev => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; });

  const sectionTitle = (text) => (
    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: "var(--ink)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ display: "inline-block", width: 24, height: 2, background: "var(--terracotta)", borderRadius: 1 }} />{text}
    </h3>
  );

  return (
    <div className="fade-up" style={{ maxWidth: 600, margin: "24px auto 40px", padding: "0 16px", position: "relative", zIndex: 1 }}>
      <div style={{ background: "var(--bg-card)", borderRadius: 16, boxShadow: "var(--shadow-lg)", border: "1px solid var(--border)", overflow: "hidden" }}>

        {/* Header band */}
        <div style={{ background: "linear-gradient(135deg, var(--terracotta) 0%, var(--terracotta-dark) 100%)", padding: "32px 28px 28px", color: "white" }}>
          {recipe.tags?.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {recipe.tags.slice(0, 4).map((tag, i) => (
                <span key={i} style={{ fontSize: 11, fontWeight: 500, padding: "3px 10px", background: "rgba(255,255,255,0.18)", borderRadius: 20, letterSpacing: "0.02em", textTransform: "uppercase" }}>{tag}</span>
              ))}
            </div>
          )}
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, lineHeight: 1.2, marginBottom: 8 }}>{recipe.title}</h2>
          {recipe.description && <p style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.5, fontWeight: 300 }}>{recipe.description}</p>}
          <div style={{ display: "flex", gap: 20, marginTop: 16, flexWrap: "wrap", fontSize: 13, fontWeight: 500 }}>
            {recipe.prepTime && <span style={{ display: "flex", alignItems: "center", gap: 6, opacity: 0.9 }}>{Icon.clock} Prep: {recipe.prepTime}</span>}
            {recipe.cookTime && <span style={{ display: "flex", alignItems: "center", gap: 6, opacity: 0.9 }}>{Icon.clock} Cook: {recipe.cookTime}</span>}
            <span style={{ display: "flex", alignItems: "center", gap: 6, opacity: 0.9 }}>{Icon.users} {servings} serving{servings !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 28 }}>
          {/* Servings */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: "var(--cream)", borderRadius: 10, marginBottom: 28 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-light)" }}>Adjust servings</span>
            <ServingsControl servings={servings} baseServings={recipe.baseServings || 4} onChange={setServings} />
          </div>

          {/* Ingredients */}
          {sectionTitle("Ingredients")}
          <div style={{ display: "grid", gap: 2, marginBottom: 32 }}>
            {recipe.ingredients?.map((ing, i) => {
              const checked = checkedIngs.has(i);
              return (
                <div key={i} onClick={() => toggleIng(i)} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 8,
                  cursor: "pointer", background: i % 2 === 0 ? "var(--bg)" : "transparent",
                  transition: "all 0.15s", opacity: checked ? 0.45 : 1,
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                    border: checked ? "none" : "1.5px solid var(--border)",
                    background: checked ? "var(--sage)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "white", transition: "all 0.15s",
                  }}>{checked && Icon.check}</div>
                  <span style={{ fontSize: 15, textDecoration: checked ? "line-through" : "none" }}>
                    <strong style={{ fontWeight: 600, color: "var(--terracotta-dark)" }}>
                      {formatAmount(ing.amount * ratio)}{ing.unit ? ` ${ing.unit}` : ""}
                    </strong>{" "}{ing.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Steps */}
          {sectionTitle("Instructions")}
          <div style={{ display: "grid", gap: 6 }}>
            {recipe.steps?.map((step, i) => {
              const checked = checkedSteps.has(step.number);
              return (
                <div key={i} onClick={() => toggleStep(step.number)} style={{
                  display: "flex", gap: 14, padding: "14px 16px", borderRadius: 10, cursor: "pointer",
                  border: "1px solid transparent", background: checked ? "var(--cream)" : "transparent",
                  borderColor: checked ? "var(--cream-dark)" : "transparent",
                  transition: "all 0.2s", opacity: checked ? 0.55 : 1,
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                    border: checked ? "none" : "2px solid var(--border)",
                    background: checked ? "var(--sage)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: checked ? "white" : "var(--ink-muted)",
                    fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600,
                    transition: "all 0.15s", marginTop: 1,
                  }}>{checked ? Icon.check : step.number}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, lineHeight: 1.6, textDecoration: checked ? "line-through" : "none" }}>{step.instruction}</p>
                    {step.duration && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--ink-muted)", marginTop: 4 }}>{Icon.clock} {step.duration}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Source */}
          {recipe.source && (
            <div style={{ marginTop: 32, padding: "16px 18px", background: "var(--cream)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--ink-muted)", fontWeight: 500, marginBottom: 2 }}>Original source</p>
                <p style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>
                  {recipe.source.creatorName || recipe.source.handle || "Instagram Reel"}
                  {recipe.source.handle && recipe.source.creatorName && <span style={{ color: "var(--ink-muted)", fontWeight: 400 }}> {recipe.source.handle}</span>}
                </p>
              </div>
              <a href={recipe.source.url} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "var(--terracotta)", textDecoration: "none" }}>
                View Reel {Icon.link}
              </a>
            </div>
          )}
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 24 }}>
        <button onClick={onNewRecipe}
          style={{ padding: "12px 28px", background: "transparent", color: "var(--ink-muted)", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}>
          Extract Another Recipe
        </button>
      </div>
    </div>
  );
}

// ── Main App ──
export default function App() {
  const [state, setState] = useState("idle");
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const intervalRef = useRef(null);

  const startLoading = () => {
    setLoadingStep(0);
    let step = 0;
    intervalRef.current = setInterval(() => {
      step++;
      if (step < LOADING_MSGS.length) setLoadingStep(step);
      else clearInterval(intervalRef.current);
    }, 2200);
  };
  const stopLoading = () => { if (intervalRef.current) clearInterval(intervalRef.current); };

  const handleSubmit = async (url) => {
    setState("loading");
    setError("");
    startLoading();
    try {
      const result = await extractRecipe(url);
      stopLoading();
      setRecipe(result);
      setState("done");
    } catch (err) {
      stopLoading();
      setError(err.message || "Something went wrong. Please try again.");
      setState("error");
    }
  };

  const handleReset = () => { stopLoading(); setState("idle"); setRecipe(null); setError(""); };

  useEffect(() => () => stopLoading(), []);

  return (
    <div className="grain" style={{ minHeight: "100vh", paddingBottom: 40 }}>
      <style>{CSS}</style>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, var(--terracotta), var(--sage), var(--terracotta-light))", zIndex: 2 }} />
      <AppHeader />
      {(state === "idle" || state === "loading") && <URLInput onSubmit={handleSubmit} loading={state === "loading"} />}
      {state === "loading" && <LoadingState step={loadingStep} />}
      {state === "error" && <ErrorState message={error} onRetry={handleReset} />}
      {state === "done" && recipe && <RecipeCard recipe={recipe} onNewRecipe={handleReset} />}
      {state === "done" && <URLInput onSubmit={handleSubmit} loading={false} />}
    </div>
  );
}
