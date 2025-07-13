import { useCallback } from 'react'
import { useSubscription, dispatch } from '@flexsurfer/reflex'
import '../styles/Statistics.css'

export const Statistics = () => {

    const stats = useSubscription(['statistics'])

    const handleClearAnswers = useCallback(() => { dispatch(['clearAnswers']) }, [])

    // Don't show statistics if no questions are answered
    if (stats.totalAnswered === 0) {
        return null
    }

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
                        <span className="stat-number">{stats.accuracy}%</span>
                    </div>
                    <button className="clear-button" onClick={handleClearAnswers} title="Clear all answers">
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