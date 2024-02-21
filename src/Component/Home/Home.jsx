// App.js
import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    const savedPlaylist = JSON.parse(localStorage.getItem('playlist')) || [];
    setPlaylist(savedPlaylist);
    const lastPlayedIndex = parseInt(localStorage.getItem('lastPlayedIndex')) || 0;
    setCurrentTrackIndex(lastPlayedIndex);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;

    const handleTrackChange = () => {
      if (playlist.length > 0) {
        audio.src = playlist[currentTrackIndex].url;
        audio.load();
        if (isPlaying) audio.play().catch(error => console.error(error));
      }
    };

    handleTrackChange();

    const handleTrackEnd = () => {
      setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % playlist.length);
    };

    audio.addEventListener('ended', handleTrackEnd);

    return () => {
      audio.removeEventListener('ended', handleTrackEnd);
    };
  }, [playlist, currentTrackIndex, isPlaying]);

  useEffect(() => {
    const handleWindowUnload = () => {
      localStorage.setItem('lastPlayedIndex', currentTrackIndex);
    };

    window.addEventListener('beforeunload', handleWindowUnload);

    return () => {
      window.removeEventListener('beforeunload', handleWindowUnload);
    };
  }, [currentTrackIndex]);

  const handleFileChange = (event) => {
    const files = event.target.files;
    const newPlaylist = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newPlaylist.push({ name: file.name, url: URL.createObjectURL(file) });
    }
    setPlaylist([...playlist, ...newPlaylist]);
    localStorage.setItem('playlist', JSON.stringify([...playlist, ...newPlaylist]));
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const playNextTrack = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % playlist.length);
  };

  const playPreviousTrack = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex - 1 + playlist.length) % playlist.length);
  };

  const handleTrackClick = (index) => {
    setCurrentTrackIndex(index);
  };

  return (
    <div className="App">
      <h1>React Audio Player</h1>
      <input type="file" accept="audio/*" onChange={handleFileChange} multiple />
      <div className="playlist">
        <h2>Playlist</h2>
        <ul>
          {playlist.map((track, index) => (
            <li key={index} onClick={() => handleTrackClick(index)} className={index === currentTrackIndex ? 'current' : ''}>
              {track.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="now-playing">
        <h2>Now Playing</h2>
        <p>{playlist[currentTrackIndex]?.name}</p>
      </div>
      <div className="controls">
        <button onClick={playPreviousTrack}>Previous</button>
        <button onClick={handlePlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>
        <button onClick={playNextTrack}>Next</button>
      </div>
      <audio ref={audioRef} />
    </div>
  );
}

export default App;
