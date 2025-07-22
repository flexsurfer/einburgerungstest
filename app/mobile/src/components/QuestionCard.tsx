import React, { memo, useEffect, useState } from 'react'
import { View, Text, Image, Dimensions, StyleSheet } from 'react-native'
import { useColors, type Colors } from '../theme'
import { StarButton } from './StarButton'
import { AnswerList } from './AnswerList'
import { Question } from '../types'
import images from '../assets/images'

interface QuestionCardProps {
  question: Question
}

const screenWidth = Dimensions.get('window').width - 80;

export const QuestionCard = memo<QuestionCardProps>(({ question }) => {
  
  const [height, setHeight] = useState(null);
  const uri = question.img?.url ?? undefined;

  useEffect(() => {
    if (!uri) { return; }
    const { width, height } = Image.resolveAssetSource(images[uri]);
    setHeight(screenWidth / (width / height));
  }, [uri]);

  const colors = useColors();

  return (
    <View style={styles(colors).questionCard}>
      <View style={styles(colors).questionBadge}>
        <Text style={styles(colors).questionBadgeText}>{question.globalIndex}</Text>
      </View>
      <View style={styles(colors).questionHeader}>
        <Text style={styles(colors).questionText}>{question.question}</Text>
        <StarButton globalIndex={question.globalIndex} />
      </View>

      {height && (
        <View style={styles(colors).questionImageContainer}>
          <Image
            source={images[uri]}
            style={{ width: screenWidth, height: height, borderRadius: 8 }}
            resizeMode="contain"
          />
          {question.img.text && (
            <Text style={styles(colors).questionImageText}>{question.img.text}</Text>
          )}
        </View>
      )}

      <AnswerList question={question} />

      <View style={styles(colors).questionFooter}>
        <Text style={styles(colors).questionCategory}>{question.category}</Text>
      </View>
    </View>
  )
})

const styles = (colors: Colors) => StyleSheet.create({
  questionCard: {
    backgroundColor: colors.bgColor,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderColor,
    shadowColor: colors.shadowColor,
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
    backgroundColor: colors.bgColor,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.accentColor,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  questionBadgeText: {
    color: colors.accentColor,
    fontSize: 12,
    fontWeight: '600',
  },
  questionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  questionText: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.textColor,
    lineHeight: 24,
    flex: 1,
  },
  questionImageContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  questionImageText: {
    fontSize: 14,
    color: colors.textColor,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  questionFooter: {
    marginTop: 16,
    paddingTop: 7,
    borderTopWidth: 1,
    borderTopColor: colors.borderColor,
  },
  questionCategory: {
    fontSize: 13,
    color: colors.textColor,
    opacity: 0.5,
    textAlign: 'right',
  },
}) 