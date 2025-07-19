import React, { memo } from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import { StarButton } from './StarButton'
import { AnswerList } from './AnswerList'
import { Question } from '../types'
import images from '../assets/images'

interface QuestionCardProps {
  question: Question
}

export const QuestionCard = memo<QuestionCardProps>(({ question }) => {
  return (
    <View style={styles.questionCard}>
      <View style={styles.questionBadge}>
        <Text style={styles.questionBadgeText}>{question.globalIndex}</Text>
      </View>
      <View style={styles.questionHeader}>
        <Text style={styles.questionText}>{question.question}</Text>
        <StarButton globalIndex={question.globalIndex} />
      </View>
      
      {question.img && (
        <View style={styles.questionImageContainer}>
          <Image
            source={images[question.img.url]}
            style={styles.questionImage}
            resizeMode="contain"
          />
          {question.img.text && (
            <Text style={styles.questionImageText}>{question.img.text}</Text>
          )}
        </View>
      )}
      
      <AnswerList question={question} />
      
      <View style={styles.questionFooter}>
        <Text style={styles.questionCategory}>{question.category}</Text>
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  questionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    padding: 20,
    position: 'relative',
    flexDirection: 'column',
    minHeight: 200,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  questionBadge: {
    position: 'absolute',
    top: -10,
    left: -10,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1C40F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  questionBadgeText: {
    color: '#F1C40F',
    fontSize: 14,
    fontWeight: '600',
  },
  questionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  questionText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#2C3E50',
    lineHeight: 24,
    flex: 1,
  },
  questionImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  questionImage: {
    width: '100%',
    height: 200
  },
  questionImageText: {
    fontSize: 14,
    color: '#2C3E50',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  questionFooter: {
    marginTop: 16,
    paddingTop: 7,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  questionCategory: {
    fontSize: 13,
    color: '#2C3E50',
    opacity: 0.5,
    textAlign: 'right',
  },
}) 