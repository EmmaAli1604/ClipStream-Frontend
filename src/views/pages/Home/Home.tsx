import React, { useEffect, useState } from "react";
import "./Home.css";

interface Cortometraje {
  id?: number;
  cortometrajeId?: number;
  nombre: string;
  sinopsis?: string;
  foto?: string;     // URL de la imagen
  video?: string;    // URL del video
  generoId?: number | string;
  generoNombre?: string; // este campo lo rellenaremos desde el mapa de géneros
  numVistas?: number;
  calificacion?: number;
  fecha?: string;
  director?: string;
  usuarioId?: number;
}

interface Genero {
  generoId: number;
  nombreGenero: string;
}

type ApiResponse = any;

const API_BASE = "http://localhost:8080/api/cortometrajes";
const GENRES_BASE = "http://localhost:8080/api/generos";

/** helper que intenta extraer un array de cortometrajes de distintas formas de respuesta */
function extraerLista(resp: ApiResponse): Cortometraje[] {
  if (!resp) return [];
  if (Array.isArray(resp)) return resp;
  // caso tu CortometrajeResponse: { success, message, data } o { success, data: [...] }
  if (Array.isArray(resp.data)) return resp.data;
  if (Array.isArray(resp.cortometrajes)) return resp.cortometrajes;
  if (Array.isArray(resp.result)) return resp.result;
  if (resp.cortometraje) {
    if (Array.isArray(resp.cortometraje)) return resp.cortometraje;
    return [resp.cortometraje];
  }
  // buscar cualquier propiedad que sea array
  const keys = Object.keys(resp);
  for (const k of keys) {
    if (Array.isArray(resp[k])) return resp[k];
  }
  return [];
}

export default function Home(): JSX.Element {
  const [populares, setPopulares] = useState<Cortometraje[]>([]);
  const [mejorCalificados, setMejorCalificados] = useState<Cortometraje[]>([]);
  const [recientes, setRecientes] = useState<Cortometraje[]>([]);
  const [hero, setHero] = useState<Cortometraje | null>(null);

  const [generos, setGeneros] = useState<Genero[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingGeneros, setLoadingGeneros] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reproductor
  const [showPlayer, setShowPlayer] = useState(false);
  const [playerUrl, setPlayerUrl] = useState<string | undefined>(undefined);
  const [playerTitle, setPlayerTitle] = useState<string>("");

  // Obtener nombre del género por ID (similar a tu Buscar)
  const getGeneroNombre = (generoId?: number | string): string | undefined => {
    if (generoId === undefined || generoId === null) return undefined;
    const idNum = typeof generoId === "string" ? Number(generoId) : generoId;
    if (Number.isNaN(idNum)) return undefined;
    const g = generos.find((gen) => gen.generoId === idNum);
    return g ? g.nombreGenero : undefined;
  };

  // Aplica generoNombre a una lista sin mutar objetos originales
  const aplicarNombreGenero = (list: Cortometraje[]): Cortometraje[] =>
    list.map((c) => ({
      ...c,
      generoNombre: c.generoNombre ?? getGeneroNombre(c.generoId),
    }));

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchAll() {
      try {
        // 1) Cargar géneros primero
        const gResp = await fetch(GENRES_BASE);
        if (!gResp.ok) throw new Error("Error al cargar géneros");
        const gJson: Genero[] = await gResp.json();
        if (cancelled) return;
        setGeneros(gJson || []);
        setLoadingGeneros(false);

        // 2) Cargar cortometrajes
        const [rPop, rMej, rRec] = await Promise.all([
          fetch(`${API_BASE}/populares`).then((r) => r.json()),
          fetch(`${API_BASE}/mejor-calificados`).then((r) => r.json()),
          fetch(`${API_BASE}/recientes`).then((r) => r.json()),
        ]);

        if (cancelled) return;

        const listPop = aplicarNombreGenero(extraerLista(rPop));
        const listMej = aplicarNombreGenero(extraerLista(rMej));
        const listRec = aplicarNombreGenero(extraerLista(rRec));

        setPopulares(listPop);
        setMejorCalificados(listMej);
        setRecientes(listRec);

        // Hero: priorizamos populares > recientes > mejor calificados
        const pick = (listPop[0] || listRec[0] || listMej[0]) ?? null;
        setHero(pick);

        setLoading(false);
      } catch (e: any) {
        console.error(e);
        if (!cancelled) {
          setError("No se pudieron cargar los datos. Revisa el backend.");
          setLoading(false);
          setLoadingGeneros(false);
        }
      }
    }

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, []);

  // Si los géneros cambian (ej. fetched after cortos), reaplicar nombres
  useEffect(() => {
    if (generos.length === 0) return;
    setPopulares((prev) => aplicarNombreGenero(prev));
    setMejorCalificados((prev) => aplicarNombreGenero(prev));
    setRecientes((prev) => aplicarNombreGenero(prev));
    setHero((prev) => (prev ? { ...prev, generoNombre: prev.generoNombre ?? getGeneroNombre(prev.generoId) } : prev));
  }, [generos]);

  function openPlayer(c: Cortometraje) {
    if (!c.video) {
      alert("No hay video disponible para este cortometraje.");
      return;
    }
    setPlayerUrl(c.video);
    setPlayerTitle(c.nombre);
    setShowPlayer(true);

    const id = c.id ?? c.cortometrajeId;
    if (id) {
      fetch(`${API_BASE}/${id}/vistas`, { method: "PATCH" }).catch((err) => console.warn("No se pudo incrementar vistas:", err));
    }
  }

  function closePlayer() {
    setShowPlayer(false);
    setPlayerUrl(undefined);
    setPlayerTitle("");
  }

  const ItemCard: React.FC<{ c: Cortometraje; onPlay?: (c: Cortometraje) => void }> = ({ c, onPlay }) => {
    return (
      <div className="hs-card">
        <div
          className="hs-thumb"
          style={{
            backgroundImage: `url(${c.foto || "/placeholder-poster.png"})`,
          }}
        >
          <button className="play-btn-small" onClick={() => onPlay && onPlay(c)} aria-label={`Reproducir ${c.nombre}`}>
            ▶
          </button>
        </div>
        <div className="hs-meta">
          <div className="hs-title">{c.nombre}</div>
          <div className="hs-sub">{c.generoNombre ?? `Género ${c.generoId ?? "-"}`}</div>
        </div>
      </div>
    );
  };

  // render
  return (
    <div className="home-root">
      {loading && <div className="home-loading">Cargando cortometrajes...</div>}
      {error && <div className="home-error">{error}</div>}

      {!loading && !error && (
        <>
          {hero && (
            <section
              className="hero"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.2)), url(${hero.foto ||
                  "/placeholder-hero.jpg"})`,
              }}
            >
              <div className="hero-content">
                <h1 className="hero-title">{hero.nombre}</h1>
                <p className="hero-sinopsis">{hero.sinopsis}</p>
                <div className="hero-meta">
                  <span className="hero-genre">{hero.generoNombre ?? `Género ${hero.generoId ?? ""}`}</span>
                  <span className="hero-dot">•</span>
                  <span className="hero-year">{hero.fecha ? new Date(hero.fecha).getFullYear() : ""}</span>
                </div>
                <div className="hero-actions">
                  <button className="play-btn" onClick={() => openPlayer(hero)}>
                    ▶ Reproducir
                  </button>
                </div>
              </div>
            </section>
          )}

          <section className="section">
            <h2 className="section-title">Populares</h2>
            <div className="hs-row">
              {populares.length === 0 && <div className="empty-row">No hay populares</div>}
              {populares.map((c, i) => (
                <ItemCard key={c.id ?? c.cortometrajeId ?? i} c={c} onPlay={openPlayer} />
              ))}
            </div>
          </section>

          <section className="section">
            <h2 className="section-title">Más vistos</h2>
            <div className="hs-row">
              {mejorCalificados.length === 0 && <div className="empty-row">No hay datos</div>}
              {mejorCalificados.map((c, i) => (
                <ItemCard key={c.id ?? c.cortometrajeId ?? i} c={c} onPlay={openPlayer} />
              ))}
            </div>
          </section>

          <section className="section">
            <h2 className="section-title">Recién agregados</h2>
            <div className="hs-row">
              {recientes.length === 0 && <div className="empty-row">No hay recientes</div>}
              {recientes.map((c, i) => (
                <ItemCard key={c.id ?? c.cortometrajeId ?? i} c={c} onPlay={openPlayer} />
              ))}
            </div>
          </section>
        </>
      )}

      {showPlayer && playerUrl && (
        <div className="player-overlay" role="dialog" aria-modal="true">
          <div className="player-box">
            <button className="player-close" onClick={closePlayer} aria-label="Cerrar reproductor">
              ✕
            </button>
            <h3 className="player-title">{playerTitle}</h3>
            <div className="player-video-container">
              <video controls autoPlay src={playerUrl} className="player-video">
                Tu navegador no soporta video HTML5.
              </video>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
