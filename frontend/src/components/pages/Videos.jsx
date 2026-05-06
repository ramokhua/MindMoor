import { useState } from 'react'
import videoData from '../../data/videos.json'
import './Videos.css'

export default function Videos() {
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [activePlaylist, setActivePlaylist] = useState(videoData.playlists[0])

  return (
    <div className="page-container videos-page">
      <h1 className="page-title">Video Resources</h1>
      <p className="page-subtitle">Curated videos for mental wellness, meditation, and education</p>

      {/* Playlist Tabs */}
      <div className="playlist-tabs">
        {videoData.playlists.map(playlist => (
          <button
            key={playlist.id}
            className={`playlist-tab ${activePlaylist.id === playlist.id ? 'active' : ''}`}
            onClick={() => setActivePlaylist(playlist)}
          >
            {playlist.title}
          </button>
        ))}
      </div>

      <div className="playlist-description card">
        <h2>{activePlaylist.title}</h2>
        <p>{activePlaylist.description}</p>
      </div>

      {selectedVideo ? (
        <div className="video-player card">
          <div className="video-header">
            <button className="btn btn-ghost" onClick={() => setSelectedVideo(null)}>
              ← Back to Library
            </button>
            <h2>{selectedVideo.title}</h2>
          </div>
          <div className="video-container">
            <iframe
              src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?rel=0&modestbranding=1`}
              title={selectedVideo.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <div className="video-info">
            <p className="text-muted">Duration: {selectedVideo.duration} • Level: {selectedVideo.difficulty}</p>
          </div>
        </div>
      ) : (
        <div className="video-grid">
          {activePlaylist.videos.map(video => (
            <div key={video.id} className="video-card card" onClick={() => setSelectedVideo(video)}>
              <div className="video-thumbnail">
                <img 
                  src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`} 
                  alt={video.title}
                  loading="lazy"
                />
                <span className="video-duration">{video.duration}</span>
              </div>
              <div className="video-card-info">
                <h3>{video.title}</h3>
                <span className={`difficulty-badge difficulty-${video.difficulty}`}>
                  {video.difficulty}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card video-disclaimer">
        <p className="text-muted">⚠️ These videos are for educational purposes only. If you're in crisis, please contact a mental health professional or emergency services.</p>
      </div>
    </div>
  )
}