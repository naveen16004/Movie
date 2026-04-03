import React, { useState, useEffect } from 'react';
import './App.css';

const API_KEY = '97acce83c6fb39132142d61b983f8392'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';

function App() {
  const [type, setType] = useState(localStorage.getItem('vault_type') || 'movie'); 
  const [selectedItem, setSelectedItem] = useState(null); 
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [content, setContent] = useState([]);
  const [details, setDetails] = useState(null);
  const [episodes, setEpisodes] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [server, setServer] = useState('vidlink');
  const [isSearchActive, setIsSearchActive] = useState(false);

  useEffect(() => {
    document.body.style.overflow = selectedItem ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [selectedItem]);

  useEffect(() => {
    localStorage.setItem('vault_type', type);
    let url = `${BASE_URL}/${type}/popular?api_key=${API_KEY}`;
    if (type === 'anime') {
      url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16&with_original_language=ja&sort_by=popularity.desc`;
    }
    fetchData(url);
  }, [type]);

  useEffect(() => {
    if (selectedItem && (type === 'tv' || type === 'anime')) {
      fetch(`${BASE_URL}/tv/${selectedItem.id}?api_key=${API_KEY}`)
        .then(res => res.json())
        .then(data => setDetails(data));
      
      fetch(`${BASE_URL}/tv/${selectedItem.id}/season/${season}?api_key=${API_KEY}`)
        .then(res => res.json())
        .then(data => setEpisodes(data.episodes || []));
    }
  }, [selectedItem, season, type]);

  const fetchData = (url) => {
    fetch(url).then(res => res.json()).then(data => { if (data.results) setContent(data.results); });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchType = type === 'anime' ? 'tv' : type;
    fetchData(`${BASE_URL}/search/${searchType}?api_key=${API_KEY}&query=${searchTerm}`);
  };

  const closePlayer = () => { setSelectedItem(null); setDetails(null); setEpisodes([]); };
  
  const getEmbedUrl = () => {
    const id = selectedItem.id;
    if (type === 'movie') {
      if (server === 'vidsrc') return `https://vidsrc.xyz/embed/movie/${id}`;
      if (server === '2embed') return `https://www.2embed.cc/embed/${id}`;
      return `https://vidlink.pro/movie/${id}`;
    }
    if (server === 'vidsrc') return `https://vidsrc.xyz/embed/tv/${id}/${season}/${episode}`;
    if (server === '2embed') return `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`;
    return `https://vidlink.pro/tv/${id}/${season}/${episode}`;
  };

  return (
    <div className="app-container">
      <header className="navbar">
        <div className="nav-left">
          <h1 className="logo" onClick={() => window.location.reload()}>MOVIE<span>VAULT</span></h1>
          <div className="nav-menu">
            <button className={type === 'movie' ? 'active' : ''} onClick={() => setType('movie')}>Movies</button>
            <button className={type === 'tv' ? 'active' : ''} onClick={() => setType('tv')}>TV Shows</button>
            <button className={type === 'anime' ? 'active' : ''} onClick={() => setType('anime')}>Anime</button>
          </div>
        </div>
        
        <div className="nav-right">
          <div className={`stunning-search ${isSearchActive ? 'active' : ''}`}>
            <button className="search-toggle" onClick={() => setIsSearchActive(!isSearchActive)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
            <form onSubmit={handleSearch}>
              <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onBlur={() => !searchTerm && setIsSearchActive(false)} autoFocus={isSearchActive} />
            </form>
          </div>
        </div>
      </header>

      <main className="content-grid">
        {content.map((item) => (
          <div key={item.id} className="movie-card" onClick={() => {setSelectedItem(item); setSeason(1); setEpisode(1);}}>
            <div className="hd-tag">HD</div>
            <img src={item.poster_path ? IMG_PATH + item.poster_path : 'https://via.placeholder.com/500x750'} alt="" />
            <div className="card-info">
              <h3>{item.title || item.name}</h3>
              <p>⭐ {item.vote_average?.toFixed(1)}</p>
            </div>
          </div>
        ))}
      </main>

      {selectedItem && (
        <div className="player-overlay">
          <div className="player-modal">
            <div className="player-header-bar">
              <button className="back-circle-btn" onClick={closePlayer}>✕</button>
              <div className="player-meta">
                <h2>{selectedItem.title || selectedItem.name}</h2>
                {type !== 'movie' && <span>Season {season} Episode {episode}</span>}
              </div>
              <div className="server-chips">
                {['vidlink', 'vidsrc', '2embed'].map(s => (
                  <button key={s} className={server === s ? 'active' : ''} onClick={() => setServer(s)}>
                    {s === 'vidlink' ? 'Server 1' : s === 'vidsrc' ? 'Server 2' : 'Server 3'}
                  </button>
                ))}
              </div>
            </div>

            <div className="video-viewport">
               <iframe 
                 key={selectedItem.id + episode + server} 
                 src={getEmbedUrl()} 
                 frameBorder="0" 
                 allowFullScreen 
                 title="Player"
                 referrerPolicy="origin"
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
               ></iframe>
            </div>

            {(type === 'tv' || type === 'anime') && details && (
              <div className="horizontal-selector">
                <div className="pills-header">
                  <h3>Episodes</h3>
                  <div className="season-pills">
                    {[...Array(details.number_of_seasons).keys()].map(n => (
                      <button key={n+1} className={season === n+1 ? 'active' : ''} onClick={() => {setSeason(n+1); setEpisode(1);}}>Season {n+1}</button>
                    ))}
                  </div>
                </div>
                <div className="episodes-scroller">
                  {episodes.map((ep) => (
                    <div key={ep.id} className={`ep-card-horizontal ${episode === ep.episode_number ? 'playing' : ''}`} onClick={() => setEpisode(ep.episode_number)}>
                      <div className="ep-poster-hold">
                        <img src={ep.still_path ? IMG_PATH + ep.still_path : 'https://via.placeholder.com/300x170'} alt="" />
                        {episode === ep.episode_number && <div className="now-playing-tag">PLAYING</div>}
                      </div>
                      <div className="ep-text">
                        <span className="ep-label">EP {ep.episode_number}</span>
                        <p>{ep.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default App;