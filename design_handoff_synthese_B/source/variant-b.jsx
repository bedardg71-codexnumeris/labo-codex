// variant-b.jsx — Direction B : « Tableau de bord critères »
// Plus visuel, approche data-viz. Une rangée par critère avec jauge IDME.
// Grille structurée pour tampons. Sparkline de codes d'erreurs.

const B = {
  ink:    "#141414",
  paper:  "#ffffff",
  card:   "#f5f4f1",
  line:   "#e3e0d8",
  muted:  "#767169",
  // Couleurs IDME graduées (lightness oklch, même chroma)
  c0: "oklch(0.55 0.14 28)",    // brique - non recevable
  cI: "oklch(0.62 0.12 42)",    // orange sombre
  cD: "oklch(0.70 0.09 75)",    // ocre
  cM: "oklch(0.55 0.08 160)",   // vert forêt
  cE: "oklch(0.42 0.10 230)",   // bleu profond
  mono: "'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace",
  sans: "'Inter', -apple-system, system-ui, sans-serif",
};

// Couleurs IDME : on lit directement depuis FEEDBACK.scale (couleurs réelles de l'app)
const CODE_COLOR = window.FEEDBACK.scale.reduce((acc, s) => { acc[s.code] = s.color; return acc; }, {});

function VariantB() {
  const f = window.FEEDBACK;
  return (
    <div style={{
      width: "8.5in", height: "11in", background: B.paper, color: B.ink,
      fontFamily: B.sans, padding: "0.45in 0.5in", boxSizing: "border-box",
      display: "flex", flexDirection: "column", fontSize: 10, lineHeight: 1.4,
    }}>
      {/* En-tête compact */}
      <header style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "end", gap: 12, marginBottom: 10 }}>
        <div>
          <div style={{ fontFamily: B.mono, fontSize: 8.5, letterSpacing: 0.5, color: B.muted, textTransform: "uppercase" }}>
            {f.course.code} / {f.course.session.toLowerCase()} / artefact {f.artefact.number} of {f.artefact.total}
          </div>
          <h1 style={{ fontSize: 20, margin: "2px 0", fontWeight: 700, letterSpacing: -0.4 }}>
            {f.artefact.title}
          </h1>
          <div style={{ fontFamily: B.mono, fontSize: 9, color: B.muted }}>
            <b style={{ color: B.ink, fontWeight: 600 }}>{f.student.firstName} {f.student.lastName}</b>
            {" · "}DA {f.student.da}{" · "}Gr. {f.student.group}{" · "}corrigé {f.artefact.corrected}
          </div>
        </div>
        <TrimestreBarB />
      </header>

      {/* Objectif / tâche en ruban */}
      <div style={{
        background: B.card, padding: "8px 10px", marginBottom: 10, borderRadius: 3,
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, fontSize: 9.5,
      }}>
        {[["OBJ", f.artefact.objective], ["TÂCHE", f.artefact.task], ["CONTEXTE", f.artefact.context]].map(([h, t]) => (
          <div key={h}>
            <div style={{ fontFamily: B.mono, fontSize: 7.5, letterSpacing: 0.5, color: B.muted, marginBottom: 2 }}>{h}</div>
            <div>{t}</div>
          </div>
        ))}
      </div>

      {/* Critères — tableau de bord */}
      <section style={{ marginBottom: 10 }}>
        <HeaderB title="Rétroaction générale" right={<LegendB />} />
        <div style={{ border: `1px solid ${B.line}`, borderRadius: 3, overflow: "hidden" }}>
          {f.criteria.map((c, i) => <CriterionB key={c.key} c={c} last={i === f.criteria.length - 1} />)}
        </div>
        {/* Niveau global — hors tableau */}
        <div style={{
          display: "grid", gridTemplateColumns: "auto 1fr", gap: 14,
          marginTop: 10, padding: "10px 12px", background: CODE_COLOR[f.overall],
          color: B.paper, borderRadius: 3, alignItems: "center",
        }}>
          <div style={{ fontSize: 44, fontWeight: 800, lineHeight: 0.85, letterSpacing: -2 }}>{f.overall}</div>
          <div>
            <div style={{ fontFamily: B.mono, fontSize: 8, letterSpacing: 0.8, opacity: 0.85, textTransform: "uppercase" }}>
              Niveau général · {f.scale.find(s => s.code === f.overall).label}
            </div>
            <div style={{ fontSize: 10.5, marginTop: 2 }}>{f.overallNote}</div>
          </div>
        </div>
      </section>

      {/* Tampons + erreurs côte à côte */}
      <section style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 14, marginBottom: 10, flex: 0 }}>
        <div>
          <HeaderB title="Commentaires ciblés (tampons)" right={
            <span style={{ fontFamily: B.mono, fontSize: 8, color: B.muted }}>N° sur ta copie</span>
          } />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
            {Object.keys(f.stamps).map(fam => <StampColumnB key={fam} fam={fam} items={f.stamps[fam]} />)}
          </div>
        </div>
        <div>
          <HeaderB title="Français écrit · top 3" right={
            <span style={{ fontFamily: B.mono, fontSize: 8, color: B.muted }}>/ {f.errorsTotal} erreurs</span>
          } />
          <ErrorsB />
        </div>
      </section>

      {/* Bilan — bande pleine largeur */}
      <footer style={{ marginTop: "auto" }}>
        <HeaderB title="Bilan &amp; pistes pour l'artefact 7" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.15fr", gap: 8 }}>
          <BilanCardB title="FORCES" items={f.bilan.forces} color={CODE_COLOR["M"]} />
          <BilanCardB title="DÉFIS" items={f.bilan.defis} color={CODE_COLOR["I"]} />
          <BilanCardB title="GESTES À POSER" items={f.bilan.pistes} color={CODE_COLOR["E"]} emphasized />
        </div>
      </footer>
    </div>
  );
}

function HeaderB({ title, right }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 5 }}>
      <h2 style={{
        fontFamily: B.mono, fontSize: 9, letterSpacing: 0.8, textTransform: "uppercase",
        fontWeight: 700, margin: 0,
      }}>{title}</h2>
      {right}
    </div>
  );
}

function LegendB() {
  const f = window.FEEDBACK;
  return (
    <div style={{ display: "flex", gap: 8, fontFamily: B.mono, fontSize: 8 }}>
      {f.scale.map(s => (
        <div key={s.code} style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <div style={{ width: 8, height: 8, background: CODE_COLOR[s.code], borderRadius: 1 }} />
          <span style={{ color: B.muted }}><b style={{ color: B.ink }}>{s.code}</b> {s.label}</span>
        </div>
      ))}
    </div>
  );
}

function TrimestreBarB() {
  const f = window.FEEDBACK;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
      <div style={{ fontFamily: B.mono, fontSize: 7.5, color: B.muted, letterSpacing: 0.3 }}>
        PROGRESSION · TRIMESTRE · 4 MEILLEURES + 2 OBLIGATOIRES
      </div>
      <div style={{ display: "flex", gap: 2 }}>
        {f.trimestre.map(t => {
          const active = t.status === "current";
          const done = t.status === "done";
          const todo = t.status === "todo";
          return (
            <div key={t.n} style={{
              width: 26, display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
            }}>
              <div style={{ height: 7, fontSize: 8, lineHeight: 1, color: B.ink }}>
                {t.obligatoire ? "●" : ""}
              </div>
              <div style={{
                width: 22, height: 22, borderRadius: 2,
                background: active ? B.ink : done ? CODE_COLOR[t.code] : "transparent",
                color: active || done ? B.paper : B.muted,
                border: active || done ? "none" : `1px dashed ${B.line}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: B.mono, fontWeight: 700, fontSize: 10,
              }}>{active || done ? t.code : t.n}</div>
              <div style={{ fontFamily: B.mono, fontSize: 6.5, color: active ? B.ink : B.muted, fontWeight: active ? 700 : 400 }}>{t.n}</div>
              {todo && t.due && (
                <div style={{ fontFamily: B.mono, fontSize: 6, color: B.muted, letterSpacing: 0.2, lineHeight: 1 }}>
                  {new Date(t.due).toLocaleDateString("fr-CA", { day: "numeric", month: "short" }).replace(".", "")}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CriterionB({ c, last }) {
  const f = window.FEEDBACK;
  const idx = f.scale.findIndex(s => s.code === c.code);
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "130px 135px 1fr", gap: 10, alignItems: "center",
      padding: "8px 10px", borderBottom: last ? "none" : `1px solid ${B.line}`,
    }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700 }}>{c.name}</div>
        <div style={{ fontFamily: B.mono, fontSize: 7.5, color: B.muted, letterSpacing: 0.3 }}>
          {c.weight}% · {c.sub}
        </div>
      </div>
      {/* Jauge */}
      <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
        {f.scale.map((s, i) => (
          <div key={s.code} style={{
            flex: 1, height: 18, borderRadius: 2,
            background: i <= idx ? CODE_COLOR[c.code] : B.card,
            color: i === idx ? B.paper : B.muted,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: B.mono, fontSize: 9, fontWeight: i === idx ? 800 : 500,
            border: i === idx ? `1px solid ${B.ink}` : `1px solid ${B.line}`,
          }}>{s.code}</div>
        ))}
      </div>
      <div style={{ fontSize: 10, lineHeight: 1.35 }}>{c.comment}</div>
    </div>
  );
}

function StampColumnB({ fam, items }) {
  const meta = window.FAMILY_META[fam] || { color: B.ink };
  const color = meta.color;
  return (
    <div style={{ border: `1px solid ${B.line}`, borderRadius: 3, padding: "6px 7px", background: B.paper }}>
      <div style={{
        fontFamily: B.mono, fontSize: 7.5, letterSpacing: 0.6, textTransform: "uppercase",
        color: color, fontWeight: 700, marginBottom: 5, paddingBottom: 3, borderBottom: `1px solid ${B.line}`,
      }}>{fam} <span style={{ color: B.muted, fontWeight: 500 }}>· {items.length}</span></div>
      {items.map(it => (
        <div key={it.n} style={{ display: "grid", gridTemplateColumns: "18px 1fr", gap: 5, marginBottom: 4, fontSize: 9 }}>
          <div style={{
            width: 16, height: 16, borderRadius: 2, background: color, color: B.paper,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: B.mono, fontWeight: 700, fontSize: 9,
          }}>{it.n}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 8.5 }}>{it.stamp}</div>
            <div style={{ fontSize: 9, lineHeight: 1.3 }}>{it.comment}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorsB() {
  const f = window.FEEDBACK;
  const max = Math.max(...f.errors.map(e => e.count));
  return (
    <div style={{ border: `1px solid ${B.line}`, borderRadius: 3, padding: "6px 10px" }}>
      {f.errors.map((e, i) => (
        <div key={e.code} style={{
          display: "grid", gridTemplateColumns: "20px 1fr 24px", gap: 6, alignItems: "center",
          padding: "5px 0", borderTop: i === 0 ? "none" : `1px dashed ${B.line}`,
        }}>
          <div style={{
            width: 18, height: 18, borderRadius: "50%", background: B.ink, color: B.paper,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: B.mono, fontSize: 9, fontWeight: 700,
          }}>{e.code}</div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 600 }}>{e.name}</div>
            <div style={{ height: 4, background: B.card, marginTop: 2, borderRadius: 1 }}>
              <div style={{ height: "100%", width: `${(e.count/max)*100}%`, background: CODE_COLOR["I"], borderRadius: 1 }} />
            </div>
          </div>
          <div style={{ fontFamily: B.mono, fontSize: 11, fontWeight: 700, textAlign: "right" }}>{e.count}</div>
        </div>
      ))}
    </div>
  );
}

function BilanCardB({ title, items, color, emphasized }) {
  return (
    <div style={{
      border: `1px solid ${B.line}`, borderRadius: 3,
      padding: "8px 10px",
      background: emphasized ? B.ink : B.paper,
      color: emphasized ? B.paper : B.ink,
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{
        fontFamily: B.mono, fontSize: 8, letterSpacing: 0.8, fontWeight: 700,
        color: emphasized ? color : color, marginBottom: 4,
      }}>{title}</div>
      <ul style={{ margin: 0, paddingLeft: 14, fontSize: 9.5, lineHeight: 1.4 }}>
        {items.map((t, i) => <li key={i} style={{ marginBottom: 3 }}>{t}</li>)}
      </ul>
    </div>
  );
}

Object.assign(window, { VariantB });
