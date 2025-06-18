import { useMemo } from 'react'
import '../styles/Statistics.css'

export function Statistics({ questions, userAnswers, filteredQuestions, onClearAnswers }) {
    const stats = useMemo(() => {
        // Only count questions that the user has answered and are currently visible
        const answeredQuestions = filteredQuestions.filter(q =>
            userAnswers[q.globalIndex] !== undefined
        )

        const correctAnswers = answeredQuestions.filter(q =>
            userAnswers[q.globalIndex] === q.correct
        ).length

        const incorrectAnswers = answeredQuestions.length - correctAnswers
        const totalAnswered = answeredQuestions.length
        const totalVisible = filteredQuestions.length

        return {
            correct: correctAnswers,
            incorrect: incorrectAnswers,
            totalAnswered,
            totalVisible
        }
    }, [filteredQuestions, userAnswers])

    // Don't show statistics if no questions are answered
    if (stats.totalAnswered === 0) {
        return null
    }

    const accuracy = stats.totalAnswered > 0 ? (stats.correct / stats.totalAnswered * 100).toFixed(1) : 0

    return (
        <div className="statistics-container">
            <div className="statistics-card">
                <div className="statistics-content">
                    <div className="stat-item correct">
                        <div className="stat-icon">✓</div>
                        <span className="stat-number">{stats.correct}</span>
                    </div>
                    <div className="stat-item incorrect">
                        <div className="stat-icon">✗</div>
                        <span className="stat-number">{stats.incorrect}</span>
                    </div>
                    <div className="stat-item accuracy">
                        <div className="stat-icon">%</div>
                        <span className="stat-number">{accuracy}%</span>
                    </div>
                    <button className="clear-button" onClick={onClearAnswers} title="Clear all answers">
                        Clear All
                    </button>
                </div>
                <div className="statistics-footer">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${(stats.totalAnswered / stats.totalVisible) * 100}%` }}
                        ></div>
                    </div>
                    <span className="progress-text">
                        {stats.totalAnswered}/{stats.totalVisible}
                    </span>

                </div>
            </div>
        </div>
    )
} 