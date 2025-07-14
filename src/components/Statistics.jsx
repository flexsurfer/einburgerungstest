import { useCallback, memo } from 'react'
import { useSubscription, dispatch } from '@flexsurfer/reflex'
import { EVENT_IDS } from '../event-ids.js'
import { SUB_IDS } from '../sub-ids.js'
import '../styles/Statistics.css'

export const Statistics = memo(() => {

    const stats = useSubscription([SUB_IDS.STATISTICS])

    const handleClearAnswers = useCallback(() => { dispatch([EVENT_IDS.CLEAR_ANSWERS]) }, [])

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
                    <div className="stat-item accuracy" title="Точность ответов">
                        <div className="stat-icon">{stats.accuracy > 51.5 ? '👍' : '😔'}</div>
                        <span className={`stat-number ${stats.accuracy > 51.5 ? 'stat-number-green' : 'stat-number-red'}`}>{stats.accuracy}%</span>
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
})