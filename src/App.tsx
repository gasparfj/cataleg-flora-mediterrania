import { useEffect, useMemo, useState } from "react";
import "./App.css";

type Imatge = {
  id?: string; vista?: string; nom_vista?: string;
  url?: string | null; principal?: boolean;
  credit?: string | null; llicencia?: string | null;
  text_alternatiu?: string | null;
};
type Planta = {
  id: string; nom_comu?: string | null; nom_cientific: string;
  sinonims?: string[]; habitat?: string; grup?: string;
  illes?: string[]; endemisme?: boolean | null;
  mida_adulta_m?: { alcada?: number[]; amplada?: number[] };
  floracio?: string[]; fructificacio?: string[];
  color_floracio?: string | null; tipus_fruit?: string | null;
  necessitats_hidriques?: string | null; insolacio?: string | null;
  tolerancia_salinitat?: string | null; port?: string | null;
  pol_linitzadors?: { nectar?: string | null; "pol·len"?: string | null; productora_melats?: boolean };
  atreu_papallones?: boolean; atreu_ocells?: boolean;
  resistent_herbivors?: boolean; apte_bardissa?: boolean;
  espinos?: boolean; aromatic?: boolean;
  parts_comestibles?: string[]; toxicitat?: boolean;
  infusio_condiment?: boolean; descripcio?: string | null;
  usos_jardineria?: string[]; imatges?: Imatge[];
  font?: { document?: string; pagina_impresa?: number | null; url?: string };
};
type Habitat = { id: string; nom: string; fitxer: string; imatge_portada?: string | null; descripcio?: string | null };
type Cataleg = { plantes: Planta[] };
type Ruta = { habitat?: string; planta?: string };
type Filters = Record<string, string>;

const EMPTY: Filters = {};
const BOOL_KEYS: { key: keyof Planta; label: string }[] = [
  { key: "endemisme", label: "Endèmica" },
  { key: "atreu_papallones", label: "Atreu papallones" },
  { key: "atreu_ocells", label: "Atreu ocells" },
  { key: "resistent_herbivors", label: "Resistent a herbívors" },
  { key: "apte_bardissa", label: "Per a bardisses" },
  { key: "espinos", label: "Espinosa" },
  { key: "aromatic", label: "Aromàtica" },
  { key: "toxicitat", label: "Tòxica" },
  { key: "infusio_condiment", label: "Infusió o condiment" },
];
const FILTERS: { key: string; label: string; multi?: boolean }[] = [
  { key: "port", label: "Port" },
  { key: "illes", label: "Illes", multi: true },
  { key: "floracio", label: "Floració", multi: true },
  { key: "fructificacio", label: "Fructificació", multi: true },
  { key: "color_floracio", label: "Color de flor" },
  { key: "necessitats_hidriques", label: "Necessitats hídriques" },
  { key: "insolacio", label: "Insolació" },
  { key: "tolerancia_salinitat", label: "Tolerància a la salinitat" },
  { key: "tipus_fruit", label: "Tipus de fruit" },
  { key: "pol_linitzadors.nectar", label: "Interès per nèctar" },
  { key: "pol_linitzadors.pol·len", label: "Interès per pol·len" },
  { key: "parts_comestibles", label: "Parts comestibles", multi: true },
];
const seasonOrder = ["primavera", "estiu", "tardor", "hivern"];
const label = (v: string) => v.replaceAll("_", " ").replace(/^./, c => c.toUpperCase());
const fmt = (v?: number[]) => Array.isArray(v) && v.length ? v.join("–").replaceAll(".", ",") + " m" : "—";
const list = (v?: string[]) => Array.isArray(v) && v.length ? v.map(label).join(", ") : "—";
const getValue = (p: Planta, key: string): unknown =>
  key.startsWith("pol_linitzadors.") ? p.pol_linitzadors?.[key.split(".")[1] as "nectar" | "pol·len"] : p[key as keyof Planta];
const matches = (p: Planta, key: string, value: string) => {
  const actual = getValue(p, key);
  if (value === "si" || value === "no") return actual === (value === "si");
  return Array.isArray(actual) ? actual.includes(value) : actual === value;
};
const picture = (p: Planta) =>
  p.imatges?.find(i => i.url && i.principal)?.url || p.imatges?.find(i => i.url)?.url || null;
const routeFromHash = (): Ruta => {
  const bits = decodeURIComponent(window.location.hash.slice(1)).split("/").filter(Boolean);
  return { habitat: bits[0] === "habitat" ? bits[1] : undefined, planta: bits[0] === "habitat" && bits[2] === "planta" ? bits[3] : undefined };
};
const go = (habitat?: string, planta?: string) => {
  window.location.hash = habitat ? `habitat/${encodeURIComponent(habitat)}${planta ? `/planta/${encodeURIComponent(planta)}` : ""}` : "";
  window.scrollTo({ top: 0, behavior: "smooth" });
};

function Photo({ src, alt, className = "" }: { src?: string | null; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) return <div className={`photo-placeholder ${className}`} role="img" aria-label={`Fotografia pendent: ${alt}`}><span className="placeholder-symbol">✳</span><span>Fotografia pendent</span></div>;
  return <img className={className} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}

function Field({ name, value }: { name: string; value?: string | null }) {
  return <div className="field"><dt>{name}</dt><dd>{value || "—"}</dd></div>;
}
function YesNo({ value }: { value?: boolean | null }) {
  return <span className={value ? "yes" : "muted"}>{value == null ? "No indicat" : value ? "Sí" : "No"}</span>;
}

export default function App() {
  const [habitats, setHabitats] = useState<Habitat[]>([]);
  const [catalogs, setCatalogs] = useState<Record<string, Planta[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState<Ruta>(routeFromHash);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    const onHash = () => setRoute(routeFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/data/habitats.json");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw = await res.json();
        if (!Array.isArray(raw.habitats)) throw new Error("Falta l'array «habitats»");
        if (alive) setHabitats(raw.habitats);
      } catch (e) {
        if (alive) setErrors(prev => ({ ...prev, index: `No s'ha pogut carregar /data/habitats.json: ${String(e)}` }));
      } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  // Load habitat JSONs on demand. A missing file does not break the home page.
  useEffect(() => {
    const h = habitats.find(x => x.id === route.habitat);
    if (!h || catalogs[h.id] || errors[h.id]) return;
    let alive = true;
    (async () => {
      try {
        const path = h.fitxer.startsWith("/") ? h.fitxer : `/data/${h.fitxer.replace(/^data\//, "")}`;
        const res = await fetch(path);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Cataleg = await res.json();
        if (!Array.isArray(data.plantes)) throw new Error("Falta l'array «plantes»");
        if (alive) setCatalogs(prev => ({ ...prev, [h.id]: data.plantes }));
      } catch (e) {
        if (alive) setErrors(prev => ({ ...prev, [h.id]: `No s'ha pogut carregar ${h.fitxer}: ${String(e)}` }));
      }
    })();
    return () => { alive = false; };
  }, [habitats, route.habitat, catalogs, errors]);

  useEffect(() => { setQuery(""); setFilters({}); setFiltersOpen(false); setActivePhoto(0); }, [route.habitat]);
  useEffect(() => { setActivePhoto(0); }, [route.planta]);

  const habitat = habitats.find(h => h.id === route.habitat);
  const plants = habitat ? catalogs[habitat.id] || [] : [];
  const plant = route.planta ? plants.find(p => p.id === route.planta) : undefined;

  const options = useMemo(() => {
    const result: Record<string, string[]> = {};
    for (const f of FILTERS) {
      const values = plants.flatMap(p => {
        const value = getValue(p, f.key);
        return Array.isArray(value) ? value.filter((x): x is string => typeof x === "string") : typeof value === "string" ? [value] : [];
      });
      const unique = [...new Set(values)];
      if (f.key === "floracio" || f.key === "fructificacio") unique.sort((a, b) => seasonOrder.indexOf(a) - seasonOrder.indexOf(b));
      else unique.sort((a, b) => a.localeCompare(b, "ca"));
      result[f.key] = unique;
    }
    return result;
  }, [plants]);

  const shown = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("ca");
    return plants.filter(p => {
      const text = [p.nom_comu, p.nom_cientific, ...(p.sinonims || [])].join(" ").toLocaleLowerCase("ca");
      return (!q || text.includes(q)) && Object.entries(filters).every(([k, v]) => !v || matches(p, k, v));
    }).sort((a, b) => (a.nom_comu || a.nom_cientific).localeCompare(b.nom_comu || b.nom_cientific, "ca"));
  }, [plants, query, filters]);

  const toggleFilter = (key: string, value: string) => setFilters(old => ({ ...old, [key]: old[key] === value ? "" : value }));
  const filterCount = Object.values(filters).filter(Boolean).length;
  const photos = plant?.imatges?.filter(i => !!i.url) || [];

  return <div className="site">
    <header className="site-header">
      <button className="brand" onClick={() => go()} aria-label="Torna a la portada"><span className="brand-mark">✳</span><span>Flora <em>mediterrània</em></span></button>
      <nav><button onClick={() => go()}>Hàbitats</button><span className="nav-sub">Catàleg botànic · Illes Balears</span></nav>
    </header>

    <main>
      {loading ? <div className="status">Carregant hàbitats…</div> : errors.index ? <div className="status error">{errors.index}</div> : !habitat ? <>
        <section className="hero">
          <div className="eyebrow"><span className="dot" /> Natura · Paisatge · Biodiversitat</div>
          <h1>Descobreix la flora<br /><i>del Mediterrani.</i></h1>
          <p>Un catàleg viu d'espècies autòctones de les Illes Balears, organitzat pels paisatges on creixen.</p>
          <a href="#habitats" className="hero-link" onClick={e => { e.preventDefault(); document.getElementById("habitats")?.scrollIntoView({ behavior: "smooth" }); }}>Explora els hàbitats <span>↗</span></a>
          <span className="hero-deco" aria-hidden="true">✳</span>
        </section>
        <section className="content-section" id="habitats">
          <div className="section-heading"><div><span className="eyebrow">01 / Explora</span><h2>Els nostres hàbitats</h2></div><span className="count">{habitats.length} hàbitats</span></div>
          <div className="habitat-grid">{habitats.map((h, i) => <button className="habitat-card" key={h.id} onClick={() => go(h.id)}>
            <div className="habitat-image"><Photo src={h.imatge_portada} alt={`Paisatge de ${h.nom}`} /><span className="card-index">{String(i + 1).padStart(2, "0")}</span></div>
            <div className="habitat-card-footer"><div><h3>{h.nom}</h3><span>Explora les espècies</span></div><span className="circle-arrow">↗</span></div>
          </button>)}</div>
          {!habitats.length && <p className="empty">Encara no hi ha hàbitats registrats a habitats.json.</p>}
        </section>
      </> : <>
        <div className="breadcrumbs"><button onClick={() => go()}>Hàbitats</button><span>/</span><button onClick={() => go(habitat.id)}>{habitat.nom}</button>{route.planta && <><span>/</span><span>{plant?.nom_comu || plant?.nom_cientific || "Espècie"}</span></>}</div>
        {errors[habitat.id] ? <div className="status error">{errors[habitat.id]} <button className="inline-link" onClick={() => { setErrors(old => { const next = { ...old }; delete next[habitat.id]; return next; }); }}>Torna-ho a provar</button></div> : !catalogs[habitat.id] ? <div className="status">Carregant espècies…</div> : route.planta ? plant ? <>
          <section className="detail-top"><div><span className="eyebrow">{habitat.nom} / Fitxa botànica</span><h1>{plant.nom_comu || plant.nom_cientific}</h1><p className="latin">{plant.nom_cientific}</p><div className="detail-chips">{plant.endemisme && <span>Endèmica</span>}{plant.port && <span>{label(plant.port)}</span>}{plant.illes?.length ? <span>{plant.illes.length} illes</span> : null}</div></div><button className="back-button" onClick={() => go(habitat.id)}>← Tornar a les espècies</button></section>
          <div className="detail-layout">
            <div className="gallery">
              <div className="main-photo"><Photo src={photos[activePhoto]?.url} alt={photos[activePhoto]?.text_alternatiu || `${plant.nom_cientific} · ${photos[activePhoto]?.nom_vista || "planta"}`} /></div>
              {photos.length > 0 && <><div className="thumbs">{photos.map((im, i) => <button key={im.id || i} className={`thumb ${activePhoto === i ? "selected" : ""}`} onClick={() => setActivePhoto(i)} aria-label={`Mostra ${im.nom_vista || im.vista || `imatge ${i+1}`}`}><Photo src={im.url} alt={im.nom_vista || "Fotografia"} /></button>)}</div><p className="photo-caption">{photos[activePhoto]?.nom_vista || "Fotografia"}{photos[activePhoto]?.credit ? ` · ${photos[activePhoto].credit}` : ""}{photos[activePhoto]?.llicencia ? ` · ${photos[activePhoto].llicencia}` : ""}</p></>}
              {!photos.length && <p className="photo-caption">Encara no hi ha fotografies d'aquesta espècie.</p>}
            </div>
            <div className="detail-data">
              {plant.descripcio && <p className="plant-description">{plant.descripcio}</p>}
              <h2>Característiques</h2>
              <dl className="field-grid">
                <Field name="Port" value={plant.port && label(plant.port)} />
                <Field name="Alçada adulta" value={fmt(plant.mida_adulta_m?.alcada)} />
                <Field name="Amplada adulta" value={fmt(plant.mida_adulta_m?.amplada)} />
                <Field name="Illes" value={list(plant.illes)} />
                <Field name="Floració" value={list(plant.floracio)} />
                <Field name="Color de flor" value={plant.color_floracio && label(plant.color_floracio)} />
                <Field name="Fructificació" value={list(plant.fructificacio)} />
                <Field name="Tipus de fruit" value={plant.tipus_fruit && label(plant.tipus_fruit)} />
                <Field name="Necessitats hídriques" value={plant.necessitats_hidriques && label(plant.necessitats_hidriques)} />
                <Field name="Insolació" value={plant.insolacio && label(plant.insolacio)} />
                <Field name="Tolerància a la salinitat" value={plant.tolerancia_salinitat && label(plant.tolerancia_salinitat)} />
                <Field name="Nèctar" value={plant.pol_linitzadors?.nectar && label(plant.pol_linitzadors.nectar)} />
                <Field name="Pol·len" value={plant.pol_linitzadors?.["pol·len"] && label(plant.pol_linitzadors["pol·len"])} />
              </dl>
              <h2>Ecologia i usos</h2>
              <div className="boolean-grid">{BOOL_KEYS.map(f => <div className="boolean-row" key={f.key}><span>{f.label}</span><YesNo value={plant[f.key] as boolean | null | undefined} /></div>)}</div>
              <dl className="field-grid extra-fields"><Field name="Parts comestibles" value={list(plant.parts_comestibles)} /><Field name="Usos de jardineria" value={list(plant.usos_jardineria)} /><Field name="Sinònims" value={list(plant.sinonims)} /></dl>
              {plant.font?.document && <div className="source"><span className="eyebrow">Font</span><p>{plant.font.document}{plant.font.pagina_impresa != null ? ` · Pàgina ${plant.font.pagina_impresa}` : ""}</p>{plant.font.url && <a href={plant.font.url} target="_blank" rel="noreferrer">Consultar document ↗</a>}</div>}
            </div>
          </div>
        </> : <div className="status">No s'ha trobat aquesta espècie. <button className="inline-link" onClick={() => go(habitat.id)}>Veure l'hàbitat</button></div> : <>
          <section className="habitat-heading"><span className="eyebrow">Hàbitat / Flora de les Illes Balears</span><h1>{habitat.nom}</h1>{habitat.descripcio && <p>{habitat.descripcio}</p>}<span className="habitat-count">{plants.length} espècies catalogades</span></section>
          <div className="catalog-toolbar"><label className="search-box"><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Cerca pel nom comú o científic…" /></label><button className={`filter-toggle ${filtersOpen ? "active" : ""}`} onClick={() => setFiltersOpen(!filtersOpen)}>Filtres {filterCount ? `(${filterCount})` : ""} <span>☷</span></button></div>
          {filtersOpen && <div className="filter-panel"><div className="filter-panel-heading"><h2>Filtra les espècies</h2><button onClick={() => setFilters({})}>Neteja els filtres</button></div><div className="filter-grid">
            {FILTERS.filter(f => options[f.key]?.length).map(f => <label className="filter-field" key={f.key}><span>{f.label}</span><select value={filters[f.key] || ""} onChange={e => setFilters(old => ({ ...old, [f.key]: e.target.value }))}><option value="">Totes les opcions</option>{options[f.key].map(v => <option key={v} value={v}>{label(v)}</option>)}</select></label>)}
          </div><div className="filter-boolean">{BOOL_KEYS.filter(f => plants.some(p => p[f.key] === true)).map(f => <button key={f.key} className={filters[f.key] === "si" ? "pill selected" : "pill"} onClick={() => toggleFilter(f.key, "si")}>{f.label}</button>)}</div></div>}
          <div className="results-bar"><span>{shown.length} {shown.length === 1 ? "espècie" : "espècies"}</span>{(filterCount > 0 || query) && <button onClick={() => { setFilters({}); setQuery(""); }}>Mostra-les totes ×</button>}</div>
          <div className="plant-grid">{shown.map(p => <button className="plant-card" key={p.id} onClick={() => go(habitat.id, p.id)}><div className="plant-card-image"><Photo src={picture(p)} alt={p.nom_comu || p.nom_cientific} />{p.endemisme && <span className="endemic-tag">Endèmica</span>}</div><div className="plant-card-info"><div><h3>{p.nom_comu || p.nom_cientific}</h3><p>{p.nom_cientific}</p></div><span className="plant-arrow">↗</span></div></button>)}</div>
          {!shown.length && <div className="empty">No hi ha espècies que coincideixin amb aquests filtres. <button className="inline-link" onClick={() => { setFilters({}); setQuery(""); }}>Neteja la cerca</button></div>}
        </>}
      </>}
    </main>
    <footer className="footer"><span>✳ Flora mediterrània</span><span>Un catàleg viu · Illes Balears</span><button onClick={() => go()}>Torna a l'inici ↑</button></footer>
  </div>;
}
