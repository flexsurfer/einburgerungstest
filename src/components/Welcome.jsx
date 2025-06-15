import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import './Welcome.css'

export function Welcome({ onStart }) {
  const [readmeContent, setReadmeContent] = useState('')

  useEffect(() => {
    const fetchReadme = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/flexsurfer/einburgerungstest/refs/heads/main/README.md')
        const text = await response.text()
        setReadmeContent(text)
      } catch (error) {
        console.error('Error loading README:', error)
        setReadmeContent('Welcome to Einbürgerungstest!')
      }
    }

    fetchReadme()
  }, [])

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <div className="readme-content">
          <ReactMarkdown>{readmeContent}</ReactMarkdown>
        </div>
        <button className="start-button" onClick={onStart}>
          Los geht's
        </button>
      </div>
    </div>
  )
} 