import React, { useState, useEffect } from 'react';
import './App.css';

const API_KEY = '97acce83c6fb39132142d61b983f8392'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';

function App() {
  const [type, setType] = useState(localStorage.getItem('vault_type') || 'movie'); 
  const [selectedItem, setSelectedItem] = useState(JSON.parse(localStorage.getItem('vault_selected')) || null);
  const [season, setSeason] = useState(Number(localStorage.getItem('vault_season')) || 1);
  const [episode, setEpisode] = useState(Number(localStorage.getItem('vault_episode')) || 1);
  
  const [content, setContent] = useState([]);
  const [details, setDetails] = useState(null);
  const [episodes, setEpisodes] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [server, setServer] = useState('vidsrc');

  useEffect(() => {
    localStorage.setItem('vault_type', type);
    localStorage.setItem('vault_selected', JSON.stringify(selectedItem));
    localStorage.setItem('vault_season', season);
    localStorage.setItem('vault_episode', episode);
  }, [type, selectedItem, season, episode]);

  useEffect(() => {
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
    }
  }, [selectedItem, type]);

  useEffect(() => {
    if (selectedItem && (type === 'tv' || type === 'anime')) {
      fetch(`${BASE_URL}/tv/${selectedItem.id}/season/${season}?api_key=${API_KEY}`)
        .then(res => res.json())
        .then(data => setEpisodes(data.episodes || []));
    }
  }, [selectedItem, season, type]);

  const fetchData = (url) => {
    fetch(url).then(res => res.json()).then(data => {
      if (data.results) setContent(data.results);
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchType = type === 'anime' ? 'tv' : type;
    const endpoint = `${BASE_URL}/search/${searchType}?api_key=${API_KEY}&query=${searchTerm}`;
    fetchData(endpoint);
  };

  const closePlayer = () => {
    setSelectedItem(null);
    setDetails(null);
    setEpisodes([]);
  };

  return (
    <div className="app-container">
      <header className="navbar">
        <h1 onClick={() => window.location.reload()} style={{cursor:'pointer'}}>
          MOVIE<span>VAULT</span>
        </h1>
        
        <div className="type-toggle">
          <button className={type === 'movie' ? 'active' : ''} onClick={() => {setType('movie'); closePlayer();}}>Movies</button>
          <button className={type === 'tv' ? 'active' : ''} onClick={() => {setType('tv'); closePlayer();}}>Series</button>
          <button className={type === 'anime' ? 'active' : ''} onClick={() => {setType('anime'); closePlayer();}}>Anime</button>
        </div>

        <div className="nav-controls">
          <form onSubmit={handleSearch}>
            <input 
              type="text" placeholder="Search..." 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
        </div>
      </header>

      <main className="movie-grid">
        {content.map((item) => (
          <div key={item.id} className="movie-card" onClick={() => {setSelectedItem(item); setSeason(1); setEpisode(1); window.scrollTo(0,0);}}>
            <img src={item.poster_path ? IMG_PATH + item.poster_path : 'https://via.placeholder.com/500x750'} alt={item.title || item.name} />
            <div className="movie-info">
              <h3>{item.title || item.name}</h3>
              <span>⭐ {item.vote_average?.toFixed(1)}</span>
            </div>
          </div>
        ))}
      </main>

      {selectedItem && (
        <div className="player-overlay">
          <div className="player-content">
            <div className={`player-header ${type !== 'movie' ? 'tv-header-spacing' : ''}`}>
              <div className="title-group">
                <h3>{selectedItem.title || selectedItem.name}</h3>
                {type !== 'movie' && <span className="current-pos">S{season} : E{episode}</span>}
              </div>
              <div className="header-btns">
                <select className="server-sel" value={server} onChange={(e) => setServer(e.target.value)}>
                  <option value="vidsrc">Server 1</option>
                  <option value="2embed">Server 2</option>
                </select>
                <button className="close-btn" onClick={closePlayer}>CLOSE ✕</button>
              </div>
            </div>

            <iframe
              src={type === 'movie' 
                ? (server === 'vidsrc' ? `https://vidsrc.xyz/embed/movie/${selectedItem.id}` : `https://www.2embed.cc/embed/${selectedItem.id}`)
                : (server === 'vidsrc' ? `https://vidsrc.xyz/embed/tv/${selectedItem.id}/${season}/${episode}` : `https://www.2embed.cc/embedtv/${selectedItem.id}&s=${season}&e=${episode}`)
              }
              frameBorder="0" allowFullScreen title="Player"
            ></iframe>

            {(type === 'tv' || type === 'anime') && details && (
              <div className="episode-browser">
                <div className="browser-header">
                  <h4>Select Episode</h4>
                  <select className="season-select" value={season} onChange={(e) => {setSeason(e.target.value); setEpisode(1);}}>
                    {[...Array(details.number_of_seasons).keys()].map(n => (
                      <option key={n+1} value={n+1}>Season {n+1}</option>
                    ))}
                  </select>
                </div>
                <div className="episode-list">
                  {episodes.map((ep) => (
                    <div 
                      key={ep.id} 
                      className={`episode-item ${episode === ep.episode_number ? 'active' : ''}`}
                      onClick={() => {setEpisode(ep.episode_number); window.scrollTo(0,0);}}
                    >
                      <div className="ep-img">
                        <img src={ep.still_path ? IMG_PATH + ep.still_path : 'https://via.placeholder.com/300x170'} alt={ep.name} />
                      </div>
                      <div className="ep-text">
                        <p className="ep-num">EP {ep.episode_number}</p>
                        <p className="ep-title">{ep.name}</p>
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