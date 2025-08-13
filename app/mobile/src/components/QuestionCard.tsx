import React, { memo, useEffect, useState } from 'react'
import { View, Text, Image, Dimensions, StyleSheet } from 'react-native'
import { useColors, type Colors } from '../theme'
import { StarButton } from './StarButton'
import { AnswerList } from './AnswerList'
import { Question } from '../types'
import images from '../assets/images'

interface QuestionCardProps {
  question: Question
  isTablet?: boolean
  numColumns?: number
  screenWidth?: number
  gap?: number
}

export const QuestionCard = memo<QuestionCardProps>(({ 
  question, 
  isTablet = false, 
  numColumns = 1, 
  screenWidth: propScreenWidth,
  gap = 0
}) => {
  
  const [height, setHeight] = useState(null);
  const uri = question.img?.url ?? undefined;

  // Calculate card width based on screen size and number of columns
  const screenWidth = propScreenWidth || Dimensions.get('window').width;
  const horizontalPadding = isTablet ? 40 : 32;
  
  const cardWidth = isTablet 
    ? (screenWidth - horizontalPadding - (gap * (numColumns - 1))) / numColumns
    : screenWidth - horizontalPadding;
  
  const imageWidth = cardWidth - (isTablet ? 32 : 40); // Account for card padding

  useEffect(() => {
    if (!uri) { return; }
    const { width, height } = Image.resolveAssetSource(images[uri]);
    setHeight(imageWidth / (width / height));
  }, [uri, imageWidth, numColumns, screenWidth, gap]);

  const colors = useColors();

  return (
    <View style={[styles(colors, isTablet).questionCard, isTablet && { width: cardWidth }]}>
      <View style={styles(colors, isTablet).questionBadge}>
        <Text style={styles(colors, isTablet).questionBadgeText}>{question.globalIndex}</Text>
      </View>
      <View style={styles(colors, isTablet).questionHeader}>
        <Text style={styles(colors, isTablet).questionText}>{question.question}</Text>
        <StarButton globalIndex={question.globalIndex} />
      </View>

      {height && (
        <View style={styles(colors, isTablet).questionImageContainer}>
          <Image
            source={images[uri]}
            style={{ width: imageWidth, height: height, borderRadius: 8 }}
            resizeMode="contain"
          />
          {question.img.text && (
            <Text style={styles(colors, isTablet).questionImageText}>{question.img.text}</Text>
          )}
        </View>
      )}

      <AnswerList question={question} />

      <View style={styles(colors, isTablet).questionFooter}>
        <Text style={styles(colors, isTablet).questionCategory}>{question.category}</Text>
      </View>
    </View>
  )
})

const styles = (colors: Colors, isTablet = false) => StyleSheet.create({
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
    padding: isTablet ? 16 : 20,
    position: 'relative',
    flexDirection: 'column',
    minHeight: isTablet ? 240 : 200,
    marginVertical: isTablet ? 0 : 20,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: isTablet ? 16 : 20,
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
    fontSize: isTablet ? 15 : 17,
    fontWeight: '500',
    color: colors.textColor,
    lineHeight: isTablet ? 22 : 24,
    flex: 1,
  },
  questionImageContainer: {
    alignItems: 'center',
    marginBottom: isTablet ? 16 : 20
  },
  questionImageText: {
    fontSize: isTablet ? 13 : 14,
    color: colors.textColor,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: isTablet ? 18 : 20,
  },
  questionFooter: {
    marginTop: isTablet ? 12 : 16,
    paddingTop: 7,
    borderTopWidth: 1,
    borderTopColor: colors.borderColor,
  },
  questionCategory: {
    fontSize: isTablet ? 12 : 13,
    color: colors.textColor,
    opacity: 0.5,
    textAlign: 'right',
  },
}) 