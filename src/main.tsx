import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { loadSections, Rule, Section } from "./content";
import "./styles.css";

const icons: Record<string, string> = { rp:"✦", flood:"☾", extra:"✧", abilities:"✺", roll:"⚔", boost:"↗" };

function mark(text: string, q: string) {
  if (!q.trim()) return text;
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
  return text.split(re).map((x,i) => i % 2 ? <mark key={i}>{x}</mark> : <React.Fragment key={i}>{x}</React.Fragment>);
}

function RuleCard({ rule, open, toggle, query }: { rule: Rule; open: boolean; toggle: () => void; query: string }) {
  const copy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${location.origin}${location.pathname}#${rule.id}`;
    try { await navigator.clipboard.writeText(url); } catch {}
    history.replaceState(null, "", `#${rule.id}`);
  };
  return <article id={rule.id} className={`rule ${open ? "is-open" : ""}`}>
    <button className="rule-head" onClick={toggle} aria-expanded={open}>
      <span className="rule-number">{rule.num}</span>
      <span className="rule-title">{mark(rule.title, query)}</span>
      <span className="rule-chevron">{open ? "−" : "+"}</span>
    </button>
    <div className={`rule-body ${open ? "is-open" : ""}`}>
      <div className="rule-body-inner">
        <p>{mark(rule.body || rule.summary, query)}</p>
        <button className="copy-link" onClick={copy}>↗ Скопировать ссылку</button>
      </div>
    </div>
  </article>;
}

function App() {
  const [query, setQuery] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let active = true;
    loadSections()
      .then(data => {
        if (!active) return;
        setSections(data);
      })
      .catch(() => {
        if (active) setSections([]);
      });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!sections.length) return;
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    setOpen(v => ({...v, [id]: true}));
    setTimeout(() => document.getElementById(id)?.scrollIntoView({behavior:"smooth", block:"center"}), 80);
  }, [sections]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    return sections.map(s => ({
      ...s,
      rules: s.rules.filter(r => `${r.title} ${r.summary} ${r.body}`.toLowerCase().includes(q))
    })).filter(s => s.rules.length);
  }, [query, sections]);

  const all = (id: string, value: boolean) => {
    const section = sections.find(s => s.id === id);
    if (!section) return;
    setOpen(v => {
      const n = {...v};
      section.rules.forEach(r => n[r.id] = value);
      return n;
    });
  };

  return <div className="site">
    <header className="hero">
      <div className="stars"/><div className="orb orb-a"/><div className="orb orb-b"/>
      <div className="hero-inner">
        <div className="eyebrow">✦ ПРАВИЛА ✦</div>
        <h1>Свод правил ролевой</h1>
        <p>Нажмите на любое правило, чтобы раскрыть его. Можно скопировать ссылку и поделиться конкретным пунктом. Раздел про <span>аклобсы</span> оставлен в авторской редакции.</p>
        <label className="search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Поиск по правилам..." /></label>
        <nav className="section-nav">{sections.map(s=><a key={s.id} href={`#${s.id}`}><span>{icons[s.id]}</span>{s.label}</a>)}</nav>
      </div>
    </header>

    <main className="content">
      {!filtered.length && <div className="empty">Ничего не найдено. Попробуйте другой запрос.</div>}
      {filtered.map(section => {
        const isAll = section.rules.length > 0 && section.rules.every(r => open[r.id]);
        return <section key={section.id} id={section.id} className="section">
          <div className="section-heading">
            <div className="section-name"><div className="section-icon">{icons[section.id]}</div><div><h2>{section.label}</h2><p>{section.intro}</p></div></div>
            <button className="expand-all" onClick={()=>all(section.id,!isAll)}>{isAll ? "Свернуть все" : "Развернуть все"}</button>
          </div>
          {section.verbatim && <div className="notice">✎ Авторская редакция — текст сохранён как в оригинале</div>}
          <div className="rules">{section.rules.map(rule=><RuleCard key={rule.id} rule={rule} open={!!open[rule.id]} toggle={()=>setOpen(v=>({...v,[rule.id]:!v[rule.id]}))} query={query}/>)}</div>
          {section.id === "abilities" && <div className="creator"><div className="creator-small">✦ MADE WITH LOVE ✦</div><div className="creator-name">CREATED BY <a href="https://t.me/lorisif" target="_blank" rel="noreferrer">@lorisif</a></div><div className="creator-mark">╰──────⋆⋅☆⋅⋆──────╯</div></div>}
        </section>;
      })}
      <aside className="bottom-note"><span>ⓘ</span><p>Не бойтесь писать в бот, если у вас остались вопросы. Правила созданы, чтобы всем было комфортно — и они могут уточняться со временем.</p></aside>
    </main>
  </div>;
}

createRoot(document.getElementById("root")!).render(<App />);
