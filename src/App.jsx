import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import clockGif from '../assets/coming-soon-clock.gif'

// Helper component to render Markdown with elegant bracket highlighting and styles
const MarkdownContent = ({ content }) => {
  const formatParagraphText = (text) => {
    if (typeof text !== 'string') return text
    const parts = text.split(/(【[^】]+】)/g)
    return parts.map((part, idx) => {
      if (part.startsWith('【') && part.endsWith('】')) {
        return (
          <span key={idx} className="highlight-bracket">
            {part}
          </span>
        )
      }
      return part
    })
  }

  const renderFormatted = (child) => {
    if (typeof child === 'string') {
      return formatParagraphText(child)
    }
    return child
  }

  const formatChildren = (children) => {
    return Array.isArray(children) ? children.map(renderFormatted) : renderFormatted(children)
  }

  const components = {
    p: ({ children }) => <p className="section-paragraph">{formatChildren(children)}</p>,
    li: ({ children }) => <li className="markdown-li">{formatChildren(children)}</li>,
    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className="markdown-link">
        {children}
      </a>
    ),
    h1: ({ children }) => <h1 className="markdown-h1">{formatChildren(children)}</h1>,
    h2: ({ children }) => <h2 className="markdown-h2">{formatChildren(children)}</h2>,
    h3: ({ children }) => <h3 className="markdown-h3">{formatChildren(children)}</h3>,
    img: ({ src, alt }) => {
      if (!src) return null
      
      const [cleanSrc, hash] = src.split('#')
      const styles = {
        maxWidth: '100%',
        height: 'auto',
        borderRadius: '8px',
        display: 'block',
        margin: '2rem 0',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 1px rgba(255, 255, 255, 0.1)',
      }

      if (hash) {
        // Support parameters like #width=300px or #width=50%
        const params = new URLSearchParams(hash)
        const width = params.get('width')
        const height = params.get('height')

        if (width) styles.width = width
        if (height) styles.height = height

        // Support shorthand like #300 (becomes 300px) or #50%
        if (!width && !height) {
          if (hash.endsWith('%') || hash.endsWith('px') || /^\d+$/.test(hash)) {
            styles.width = hash.endsWith('%') || hash.endsWith('px') ? hash : `${hash}px`
          }
        }
      }

      return <img src={cleanSrc} alt={alt} style={styles} />
    },
  }

  return <ReactMarkdown components={components}>{content}</ReactMarkdown>
}

// Eagerly import all markdown files from the page_config directory
const contentFiles = import.meta.glob('../page_config/**/*.md', { query: '?raw', eager: true })

// Parse files dynamically and group them by nav/section folder
const parsedContent = {}
for (const path in contentFiles) {
  // Matches: ../page_config/characters/content.md or ../page_config/characters/extra.md
  const match = path.match(/\.\.\/page_config\/([^/]+)\/([^/]+)\.md$/)
  if (match) {
    const section = match[1].toLowerCase() // e.g. 'characters'
    const fileName = match[2] // e.g. 'content' or 'extra'
    const textContent = contentFiles[path].default

    if (!parsedContent[section]) {
      parsedContent[section] = []
    }

    parsedContent[section].push({
      fileName,
      content: textContent
    })
  }
}

// Sort the files within each section to ensure the main 'content' is always first
for (const section in parsedContent) {
  parsedContent[section].sort((a, b) => {
    if (a.fileName === 'content') return -1
    if (b.fileName === 'content') return 1
    return a.fileName.localeCompare(b.fileName)
  })
}

function App() {
  const getInitialSection = () => {
    const hash = window.location.hash.replace('#', '').toLowerCase()
    const validSections = ['home', 'characters', 'tone', 'sample', 'events', 'contact']
    if (hash === '') return 'home'
    return validSections.includes(hash) ? hash : 'home'
  }

  const [activeSection, setActiveSection] = useState(getInitialSection)

  // Listen to hash changes (so browser back/forward and deep sharing links work perfectly)
  useEffect(() => {
    const handleHashChange = () => {
      const newSection = getInitialSection()
      setActiveSection(newSection)
      // Instant scroll to top ensures the user begins reading at the top of the new tab
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Navigation tab switcher updates hash, triggering hashchange listener
  const handleNavClick = (e, targetId) => {
    e.preventDefault()
    window.location.hash = targetId === 'home' ? '' : targetId
  }

  return (
    <>
      {/* Header Navigation Section */}
      <header className="site-header" id="SITE_HEADER">
        <div className="header-container">
          <a href="#" className="brand-title" id="BRAND_TITLE" onClick={(e) => handleNavClick(e, 'home')}>
            SFFMEER
          </a>
          <nav className="main-nav" id="MAIN_NAV">
            <ul className="nav-list" id="NAV_LIST">
              <li className="nav-item">
                <a
                  href="#"
                  className={`nav-link ${activeSection === 'home' ? 'active' : ''}`}
                  id="NAV_HOME"
                  onClick={(e) => handleNavClick(e, 'home')}
                >
                  HOME
                </a>
              </li>
              <li className="nav-item">
                <a
                  href="#characters"
                  className={`nav-link ${activeSection === 'characters' ? 'active' : ''}`}
                  id="NAV_CHARACTERS"
                  onClick={(e) => handleNavClick(e, 'characters')}
                >
                  CHARACTERS
                </a>
              </li>
              <li className="nav-item">
                <a
                  href="#tone"
                  className={`nav-link ${activeSection === 'tone' ? 'active' : ''}`}
                  id="NAV_TONE"
                  onClick={(e) => handleNavClick(e, 'tone')}
                >
                  TONE
                </a>
              </li>
              <li className="nav-item">
                <a
                  href="#sample"
                  className={`nav-link ${activeSection === 'sample' ? 'active' : ''}`}
                  id="NAV_SAMPLE"
                  onClick={(e) => handleNavClick(e, 'sample')}
                >
                  SAMPLE
                </a>
              </li>
              <li className="nav-item">
                <a
                  href="#events"
                  className={`nav-link ${activeSection === 'events' ? 'active' : ''}`}
                  id="NAV_EVENTS"
                  onClick={(e) => handleNavClick(e, 'events')}
                >
                  EVENTS
                </a>
              </li>
              <li className="nav-item">
                <a
                  href="#contact"
                  className={`nav-link ${activeSection === 'contact' ? 'active' : ''}`}
                  id="NAV_CONTACT"
                  onClick={(e) => handleNavClick(e, 'contact')}
                >
                  CONTACT
                </a>
              </li>
            </ul>
          </nav>
          <div className="social-bar" id="SOCIAL_BAR">
            <a href="https://www.plurk.com/sffmeer" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Plurk Social Link" id="PLURK_LINK">
              <svg className="social-icon-svg" data-bbox="0 0 200 200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <g>
                  <path fill="#ffffff" d="M200 10v180c0 5.523-4.477 10-10 10H10c-5.523 0-10-4.477-10-10V10C0 4.477 4.477 0 10 0h180c5.523 0 10 4.477 10 10" />
                  <path fill="#ff6154" d="M181.901 100c0 45.233-36.668 81.901-81.901 81.901S18.099 145.233 18.099 100 54.767 18.099 100 18.099 181.901 54.767 181.901 100" />
                  <path d="M110.92 59.05H71.335v81.901h16.38v-24.57h23.205c15.831 0 28.665-12.834 28.665-28.665s-12.834-28.665-28.665-28.665Zm0 40.95H87.715V75.43h23.205c6.785 0 12.285 5.5 12.285 12.285S117.705 100 110.92 100" fill="#ffffff" />
                </g>
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Showcase Area */}
      <div className="app-main-container" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Render HOME Showcase Section */}
        {activeSection === 'home' && (
          <main className="main-content" id="home">
            <div className="landing-grid">
              {/* Left side: Animated Clock GIF */}
              <div className="clock-column">
                <div className="clock-wrapper">
                  <img src={clockGif} alt="Coming Soon Clock" className="clock-image" id="CLOCK_IMAGE" />
                </div>
              </div>

              {/* Right side: Text details */}
              <div className="details-column" id="DETAILS_COLUMN">
                <h1 className="main-title" id="MAIN_TITLE">DAS MAL DIE</h1>
                <p className="subtitle" id="SUBTITLE">Coming Soon</p>
                <p className="release-date" id="RELEASE_DATE">2026.08</p>

                <h2 className="chinese-title" id="CHINESE_TITLE">宙 與 律</h2>

                <div className="tagline-container" id="TAGLINE_CONTAINER">
                  {parsedContent['home']?.[0]?.content
                    ? <MarkdownContent content={parsedContent['home'][0].content} />
                    : (
                      <>
                        <p className="tagline" id="TAGLINE_1">天才牌手與機率之神的雙人舞。</p>
                        <p className="tagline" id="TAGLINE_2">悲劇的終焉，只有命運的共犯。</p>
                      </>
                    )
                  }
                </div>

                <div className="hashtag-container" id="HASHTAG_CONTAINER">
                  <div className="hashtag-row" id="HASHTAG_ROW_1">
                    <span className="hashtag">#原創BL漫畫</span>
                  </div>
                  <div className="hashtag-row" id="HASHTAG_ROW_2">
                    <span className="hashtag">#德州撲克</span>
                    <span className="hashtag">#結構悲劇</span>
                    <span className="hashtag">#毀滅性浪漫</span>
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* Render Tabbed Text Sections */}
        {activeSection !== 'home' && (
          <div className="sections-container" style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* CHARACTERS Section */}
            {activeSection === 'characters' && (
              <section id="characters" className="page-section">
                <div className="section-card">
                  <div className="section-header">
                    <span className="section-tag">01 / Character Setup</span>
                    <h2 className="section-title">CHARACTERS</h2>
                  </div>
                  <div className="section-content-wrapper">
                    {parsedContent['characters']?.map((file, idx) => (
                      <div key={idx} className="content-block">
                        {file.fileName !== 'content' && (
                          <h3 className="content-block-subtitle">{file.fileName.toUpperCase()}</h3>
                        )}
                        <MarkdownContent content={file.content} />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* TONE Section */}
            {activeSection === 'tone' && (
              <section id="tone" className="page-section">
                <div className="section-card">
                  <div className="section-header">
                    <span className="section-tag">02 / Cinematic Vibe</span>
                    <h2 className="section-title">TONE</h2>
                  </div>
                  <div className="section-content-wrapper">
                    {parsedContent['tone']?.map((file, idx) => (
                      <div key={idx} className="content-block">
                        {file.fileName !== 'content' && (
                          <h3 className="content-block-subtitle">{file.fileName.toUpperCase()}</h3>
                        )}
                        <MarkdownContent content={file.content} />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* SAMPLE Section */}
            {activeSection === 'sample' && (
              <section id="sample" className="page-section">
                <div className="section-card">
                  <div className="section-header">
                    <span className="section-tag">03 / Preview Panels</span>
                    <h2 className="section-title">SAMPLE</h2>
                  </div>
                  <div className="section-content-wrapper">
                    {parsedContent['sample']?.map((file, idx) => (
                      <div key={idx} className="content-block">
                        {file.fileName !== 'content' && (
                          <h3 className="content-block-subtitle">{file.fileName.toUpperCase()}</h3>
                        )}
                        <MarkdownContent content={file.content} />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* EVENTS Section */}
            {activeSection === 'events' && (
              <section id="events" className="page-section">
                <div className="section-card">
                  <div className="section-header">
                    <span className="section-tag">04 / Release Timeline</span>
                    <h2 className="section-title">EVENTS</h2>
                  </div>
                  <div className="section-content-wrapper">
                    {parsedContent['events']?.map((file, idx) => (
                      <div key={idx} className="content-block">
                        {file.fileName !== 'content' && (
                          <h3 className="content-block-subtitle">{file.fileName.toUpperCase()}</h3>
                        )}
                        <MarkdownContent content={file.content} />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* CONTACT Section */}
            {activeSection === 'contact' && (
              <section id="contact" className="page-section">
                <div className="section-card">
                  <div className="section-header">
                    <span className="section-tag">05 / Get In Touch</span>
                    <h2 className="section-title">CONTACT</h2>
                  </div>
                  <div className="section-content-wrapper">
                    {parsedContent['contact']?.map((file, idx) => (
                      <div key={idx} className="content-block">
                        {file.fileName !== 'content' && (
                          <h3 className="content-block-subtitle">{file.fileName.toUpperCase()}</h3>
                        )}
                        <MarkdownContent content={file.content} />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        )}

      </div>

      {/* Footer Section */}
      <footer className="site-footer" id="SITE_FOOTER">
        <p className="copyright" id="COPYRIGHT_NOTICE">
          &copy; 2026 SFF. All rights reserved.
        </p>
      </footer>
    </>
  )
}

export default App
