import { useState } from 'react'
import articlesData from '../../data/articles.json'
import './Articles.css'

const CATEGORIES = ['all', 'anxiety', 'depression', 'sleep', 'mindfulness', 'resilience', 'cbt']

export default function Articles() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedArticle, setSelectedArticle] = useState(null)

  const filteredArticles = articlesData.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          article.summary.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (selectedArticle) {
    return (
      <div className="page-container articles-page">
        <button className="btn btn-ghost" onClick={() => setSelectedArticle(null)}>
          ← Back to Library
        </button>
        <div className="article-full card">
          <h1>{selectedArticle.title}</h1>
          <div className="article-meta">
            <span className="article-category">{selectedArticle.category}</span>
            <span className="article-read-time">{selectedArticle.readTime} min read</span>
          </div>
          <div className="article-content">
            <p>{selectedArticle.content}</p>
            <p className="text-muted">Full article content would be displayed here...</p>
          </div>
          <div className="article-actions">
            <button className="btn btn-primary">Save to Bookmarks</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container articles-page">
      <h1 className="page-title">Article Library</h1>
      <p className="page-subtitle">Evidence-based mental health articles and resources</p>

      {/* Search and Filter */}
      <div className="articles-controls">
        <input
          type="text"
          className="input search-input"
          placeholder="Search articles..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <div className="category-filters">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="articles-grid">
        {filteredArticles.map(article => (
          <div key={article.id} className="article-card card" onClick={() => setSelectedArticle(article)}>
            <h3>{article.title}</h3>
            <p className="article-summary">{article.summary}</p>
            <div className="article-footer">
              <span className={`article-category ${article.category}`}>{article.category}</span>
              <span className="article-read-time">{article.readTime} min read</span>
            </div>
          </div>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="no-results card">
          <p>No articles found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}