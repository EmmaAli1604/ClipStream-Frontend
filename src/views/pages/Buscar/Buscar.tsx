import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Buscar.css";
import { FaStar, FaSearch, FaFilter, FaEye } from "react-icons/fa";

interface Cortometraje {
  cortometrajeId: number;
  nombre: string;
  sinopsis: string;
  director: string;
  fecha: string;
  foto: string;
  video: string;
  numVistas: number;
  calificacion: number;
  generoId: number;
  usuarioId: number;
}

interface Genero {
  generoId: number;
  nombreGenero: string; // CORREGIDO: era "nombreGenenro"
}

// Interfaz para cortometraje con información completa del género
interface CortometrajeCompleto extends Cortometraje {
  generoNombre?: string;
}

export default function Buscar() {
  const navigate = useNavigate();
  const [cortometrajes, setCortometrajes] = useState<CortometrajeCompleto[]>([]);
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingGeneros, setLoadingGeneros] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenero, setSelectedGenero] = useState<number | null>(null);
  const [filteredCortometrajes, setFilteredCortometrajes] = useState<CortometrajeCompleto[]>([]);

  // Cargar todos los cortometrajes al inicio
  useEffect(() => {
    const fetchCortometrajes = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/cortometrajes');
        if (!response.ok) {
          throw new Error('Error al cargar los cortometrajes');
        }
        const data = await response.json();
        if (data.success) {
          setCortometrajes(data.data);
          setFilteredCortometrajes(data.data); // Inicialmente mostrar todos
        } else {
          setError(data.message);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Cargar géneros
    const fetchGeneros = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/generos');
        if (!response.ok) {
          throw new Error('Error al cargar los géneros');
        }
        const generosData = await response.json();
        setGeneros(generosData);
        console.log("Géneros cargados:", generosData); // Para debug
      } catch (err: any) {
        console.error("Error al cargar géneros:", err);
      } finally {
        setLoadingGeneros(false);
      }
    };

    fetchCortometrajes();
    fetchGeneros();
  }, []);

  // Cuando se cargan los géneros, actualizar los cortometrajes con los nombres de géneros
  useEffect(() => {
    if (generos.length > 0 && cortometrajes.length > 0) {
      console.log("Actualizando cortometrajes con nombres de géneros...");
      const cortometrajesConGeneros = cortometrajes.map(cortometraje => ({
        ...cortometraje,
        generoNombre: getGeneroNombre(cortometraje.generoId)
      }));
      
      setCortometrajes(cortometrajesConGeneros);
      setFilteredCortometrajes(cortometrajesConGeneros);
    }
  }, [generos, cortometrajes.length]);

  // Aplicar filtros cuando cambien los criterios de búsqueda
  useEffect(() => {
    let resultados = cortometrajes;

    // Filtrar por término de búsqueda (nombre, director o género)
    if (searchTerm) {
      const termino = searchTerm.toLowerCase();
      resultados = resultados.filter(corto => 
        corto.nombre.toLowerCase().includes(termino) ||
        corto.director.toLowerCase().includes(termino) ||
        (corto.generoNombre && corto.generoNombre.toLowerCase().includes(termino))
      );
    }

    // Filtrar por género seleccionado
    if (selectedGenero) {
      resultados = resultados.filter(corto => corto.generoId === selectedGenero);
    }

    setFilteredCortometrajes(resultados);
  }, [searchTerm, selectedGenero, cortometrajes]);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  const handleCardClick = (cortometrajeId: number) => {
    navigate(`/cortometraje/${cortometrajeId}`);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleGeneroChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const generoId = e.target.value ? parseInt(e.target.value) : null;
    setSelectedGenero(generoId);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedGenero(null);
  };

  // Función para generar una duración aleatoria (ya que no está en la BD)
  const generarDuracion = () => {
    const duraciones = ["5 min", "8 min", "12 min", "15 min", "20 min", "25 min"];
    return duraciones[Math.floor(Math.random() * duraciones.length)];
  };

  // Obtener nombre del género por ID - CORREGIDO
  const getGeneroNombre = (generoId: number): string => {
    const genero = generos.find(g => g.generoId === generoId);
    console.log(`Buscando género ID ${generoId}:`, genero); // Para debug
    return genero ? genero.nombreGenero : "Sin género"; // CORREGIDO: era "nombreGenenro"
  };

  // Verificar si hay datos de géneros
  const hasGeneros = generos.length > 0;

  if (loading) {
    return (
      <div className="search-page-container">
      
          <div className="loading">Cargando cortometrajes...</div>
        </div>
  
    );
  }

  if (error) {
    return (
      <div className="search-page-container">
          <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="search-page-container">
        {/* Barra de búsqueda y filtros */}
        
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar cortometrajes por nombre, director o género..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>

          <div className="filter-controls">
            <div className="filter-group">
              <FaFilter className="filter-icon" />
              <select
                value={selectedGenero || ""}
                onChange={handleGeneroChange}
                className="genero-select"
                disabled={!hasGeneros}
              >
                <option value="">Todos los géneros</option>
                {hasGeneros ? (
                  generos.map((genero) => (
                    <option key={genero.generoId} value={genero.generoId}>
                      {genero.nombreGenero} {/* CORREGIDO: era "nombreGenenro" */}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Cargando géneros...</option>
                )}
              </select>
            </div>

            {(searchTerm || selectedGenero) && (
              <button onClick={clearFilters} className="clear-filters-btn">
                Limpiar filtros
              </button>
            )}
          </div>

        {/* Información de resultados */}
        <div className="results-info">
          <p>
            Mostrando {filteredCortometrajes.length} de {cortometrajes.length} cortometrajes
            {searchTerm && ` para "${searchTerm}"`}
            {selectedGenero && ` en ${getGeneroNombre(selectedGenero)}`}
          </p>
        </div>

        {/* Grid de cortometrajes */}
        {filteredCortometrajes.length === 0 ? (
          <div className="no-results">
            <h3>No se encontraron cortometrajes</h3>
            <p>Intenta con otros términos de búsqueda o selecciona un género diferente.</p>
            <button onClick={clearFilters} className="clear-filters-btn large">
              Mostrar todos los cortometrajes
            </button>
          </div>
        ) : (
          <div className="cortometrajes-grid">
            {filteredCortometrajes.map((cortometraje) => (
              <div 
                key={cortometraje.cortometrajeId} 
                className="cortometraje-card"
                onClick={() => handleCardClick(cortometraje.cortometrajeId)}
              >
                <div className="card-image-container">
                  {cortometraje.foto ? (
                    <img 
                      src={cortometraje.foto} 
                      alt={cortometraje.nombre}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200/4A5568/FFFFFF?text=Sin+Imagen';
                      }}
                    />
                  ) : (
                    <div className="placeholder-image">
                      <span>{cortometraje.nombre}</span>
                    </div>
                  )}
                  <div className="image-overlay">
                    <div className="overlay-info">
                      <p className="overlay-date">
                        {new Date(cortometraje.fecha).toLocaleDateString()}
                      </p>
                      <p className="overlay-duration">
                        {generarDuracion()}
                      </p>
                    </div>
                    <div className="genero-badge">
                      {cortometraje.generoNombre || getGeneroNombre(cortometraje.generoId)}
                    </div>
                  </div>
                </div>
                
                <div className="card-content">
                  <h3 className="card-title">{cortometraje.nombre}</h3>
                  <p className="card-director">Director: {cortometraje.director}</p>
                  <div className="card-metadata">
                    <span className="card-genero">
                      {cortometraje.generoNombre || getGeneroNombre(cortometraje.generoId)}
                    </span>
                  </div>
                  <div className="card-stats">
                    <div className="card-rating">
                      <FaStar /> {cortometraje.calificacion ? cortometraje.calificacion.toFixed(1) : '0.0'}
                    </div>
                    <div className="card-views">
                      <FaEye /> {cortometraje.numVistas || 0} vistas
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}