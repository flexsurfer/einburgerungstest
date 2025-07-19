import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import '../styles/Welcome.css'

export function Welcome({ onStart }) {
  const [readmeContent, setReadmeContent] = useState('')

  useEffect(() => {
    const fetchReadme = async () => {
      try {
        //TODO just move to text, don't use md
        const response = await fetch('welcome.md')
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