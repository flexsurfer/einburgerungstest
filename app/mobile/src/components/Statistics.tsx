import { useCallback, memo } from 'react'
import { useSubscription, dispatch } from '@flexsurfer/reflex'
import { EVENT_IDS } from 'shared/event-ids'
import { SUB_IDS } from 'shared/sub-ids'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useColors, type Colors } from '../theme'

export const Statistics = memo(() => {
    const stats = useSubscription([SUB_IDS.STATISTICS]) as {correct: number, incorrect: number, accuracy: number, passed: boolean, totalAnswered: number, totalVisible: number}
    const showAnswers = useSubscription([SUB_IDS.SHOW_ANSWERS]) as boolean
    const handleClearAnswers = useCallback(() => { dispatch([EVENT_IDS.REQUEST_CLEAR_ANSWERS]) }, [])
    const handleToggleShowAnswers = useCallback(() => { dispatch([EVENT_IDS.TOGGLE_SHOW_ANSWERS]) }, [])
    const colors = useColors()

    return (
        <View style={styles(colors).statisticsContainer}>
                <View style={styles(colors).statisticsContent}>
                    <View style={styles(colors).statItem}>
                        <View style={styles(colors).statIconCorrect}>
                            <Text style={styles(colors).statIconText}>✓</Text>
                        </View>
                        <Text style={styles(colors).statNumber}>{stats.correct}</Text>
                    </View>
                    <View style={styles(colors).statItem}>
                        <View style={styles(colors).statIconIncorrect}>
                            <Text style={styles(colors).statIconText}>✗</Text>
                        </View>
                        <Text style={styles(colors).statNumber}>{stats.incorrect}</Text>
                    </View>
                    <View style={styles(colors).statItem}>
                        <View style={styles(colors).statIconAccuracy}>
                            <Text style={styles(colors).statIconAccuracyText}>{stats.passed ? '👍' : '😔'}</Text>
                        </View>
                        <Text style={[styles(colors).statNumber, stats.passed ? {color: colors.successColor} : {color: colors.errorColor}]}>{stats.accuracy}%</Text>
                    </View>
                    <View style={styles(colors).buttonsGroup}>
                        <TouchableOpacity
                            style={[styles(colors).toggleButton, showAnswers ? styles(colors).toggleButtonActive : null]}
                            onPress={handleToggleShowAnswers}
                        >
                            <Text style={[styles(colors).buttonText, showAnswers ? {color: colors.bgColor} : null]}>{showAnswers ? '🙈' : '👁️'} Answers</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles(colors).clearButton}
                            onPress={handleClearAnswers}
                        >
                            <Text style={styles(colors).buttonText}>Clear</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles(colors).statisticsFooter}>
                    <View style={styles(colors).progressBar}>
                        <View
                            style={[styles(colors).progressFill, { width: `${(stats.totalAnswered / (stats.totalVisible || 1)) * 100}%` }]}
                        />
                    </View>
                    <Text style={styles(colors).progressText}>
                        {stats.totalAnswered}/{stats.totalVisible}
                    </Text>
            </View>
        </View>
    )
})

const styles = (colors: Colors) => StyleSheet.create({
    statisticsContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderColor: colors.borderColor,
        backgroundColor: colors.bgColor,
    },
    statisticsContent: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: 2,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 1,
        padding: 1,
        borderRadius: 6,
    },
    statIconCorrect: {
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.successColor,
    },
    statIconIncorrect: {
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.errorColor,
    },
    statIconAccuracy: {
        width: 22,
        height: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    statIconText: {
        fontWeight: 'bold',
        fontSize: 11,
        color: 'white',
    },
    statIconAccuracyText: {
        fontSize: 16,
        color: colors.textColor,
    },
    statNumber: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textColor,
    },
    statisticsFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    progressBar: {
        height: 4,
        backgroundColor: colors.borderColor,
        borderRadius: 2,
        overflow: 'hidden',
        flex: 1,
    },
    progressFill: {
        height: 4,
        backgroundColor: colors.accentColor,
        borderRadius: 2,
    },
    progressText: {
        fontSize: 11,
        color: colors.textColor,
        opacity: 0.8,
    },
    buttonsGroup: {
        flexDirection: 'row',
        gap: 8,
        marginLeft: 'auto',
    },
    toggleButton: {
        padding: 8,
        borderWidth: 1,
        borderColor: colors.borderColor,
        borderRadius: 4,
        backgroundColor: colors.bgColor,
    },
    toggleButtonActive: {
        backgroundColor: colors.successColor,
        borderColor: colors.successColor,
    },
    clearButton: {
        padding: 8,
        borderWidth: 1,
        borderColor: colors.borderColor,
        borderRadius: 4,
        backgroundColor: colors.bgColor,
    },
    buttonText: {
        fontSize: 14,
        color: colors.textColor,
    },
}) 