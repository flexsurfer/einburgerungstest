import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import {
  appIds,
  useRuntime,
  useSubscription,
} from "@ebtest/shared/uklad";
import { useColors, type Colors } from "../theme";
import { FavoritesButton } from "./FavoritesButton";
import { Question } from "../types";

type Group = { title: string; items: [string, number][] };

export const Categories = () => {
  const runtime = useRuntime();
  const questions = useSubscription(
    [appIds.subscriptions.questionsItems],
    "Categories",
  ) as Question[];
  const categories = useSubscription(
    [appIds.subscriptions.questionsCategories],
    "Categories",
  ) as Group[];
  const selectedCount = useSubscription(
    [appIds.subscriptions.navigationSelectedCategoryCount],
    "Categories",
  );
  const selectedCategory = useSubscription(
    [appIds.subscriptions.navigationSelectedCategory],
    "Categories",
  );
  const favoriteCount = useSubscription(
    [appIds.subscriptions.practiceFavoriteCount],
    "Categories",
  );
  const wrongCount = useSubscription(
    [appIds.subscriptions.practiceWrongCount],
    "Categories",
  );

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const buttonRef = useRef(null);

  const handleCategoryClick = useCallback(
    (category) => {
      runtime.dispatch([appIds.events.navigationCategorySelected, category]);
      setIsPopupOpen(false);
    },
    [runtime],
  );

  const openPopup = () => {
    if (buttonRef.current) {
      buttonRef.current.measureInWindow(
        (x: number, y: number, width: number, height: number) => {
          setPopupPosition({ x, y, width, height });
          setIsPopupOpen(!isPopupOpen);
        },
      );
    } else {
      setIsPopupOpen(!isPopupOpen);
    }
  };

  const displayText =
    selectedCategory === null
      ? `All Questions (${questions?.length ?? 0})`
      : selectedCategory === "favorites"
        ? `Favorites (${favoriteCount})`
        : selectedCategory === "wrong"
          ? `Wrong answers (${wrongCount})`
          : selectedCategory === "test"
            ? `Test (30)`
            : `${selectedCategory} (${selectedCount})`;

  const colors = useColors();

  return (
    <View style={styles(colors).categoriesContainer}>
      <TouchableOpacity
        style={styles(colors).categorySelectButton}
        onPress={openPopup}
        ref={buttonRef}
      >
        <Text style={styles(colors).buttonText}>{displayText}</Text>
        <Text style={styles(colors).filterIcon}>▼</Text>
      </TouchableOpacity>
      {isPopupOpen && (
        <Modal
          visible={isPopupOpen}
          transparent={true}
          animationType="none"
          onRequestClose={() => setIsPopupOpen(false)}
        >
          <TouchableWithoutFeedback onPress={() => setIsPopupOpen(false)}>
            <View style={{ flex: 1 }}>
              <TouchableWithoutFeedback>
                <View
                  style={[
                    styles(colors).categoryPopup,
                    {
                      position: "absolute",
                      top: popupPosition.y + popupPosition.height,
                      left: popupPosition.x,
                      width: popupPosition.width,
                    },
                  ]}
                >
                  <ScrollView>
                    <TouchableOpacity
                      onPress={() => handleCategoryClick(null)}
                      style={[
                        styles(colors).categoryButton,
                        selectedCategory === null && styles(colors).active,
                      ]}
                    >
                      <Text
                        style={[
                          styles(colors).buttonText,
                          selectedCategory === null &&
                            styles(colors).activeText,
                        ]}
                      >
                        All Questions ({questions?.length ?? 0})
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      key="test"
                      onPress={() => handleCategoryClick("test")}
                      style={[
                        styles(colors).categoryButton,
                        selectedCategory === "test" && styles(colors).active,
                      ]}
                    >
                      <Text
                        style={[
                          styles(colors).buttonText,
                          selectedCategory === "test" &&
                            styles(colors).activeText,
                        ]}
                      >
                        Start Test (30)
                      </Text>
                    </TouchableOpacity>
                    <FavoritesButton
                      onPress={() => handleCategoryClick("favorites")}
                    />
                    <TouchableOpacity
                      key="wrong"
                      onPress={() => handleCategoryClick("wrong")}
                      style={[
                        styles(colors).categoryButton,
                        selectedCategory === "wrong" && styles(colors).active,
                      ]}
                    >
                      <Text
                        style={[
                          styles(colors).buttonText,
                          selectedCategory === "wrong" &&
                            styles(colors).activeText,
                        ]}
                      >
                        Wrong answers ({wrongCount})
                      </Text>
                    </TouchableOpacity>

                    {categories?.map((group, groupIndex) => (
                      <React.Fragment key={groupIndex}>
                        <Text style={styles(colors).groupTitle}>
                          {group.title}
                        </Text>
                        {group.items.map(([category, count]) => (
                          <TouchableOpacity
                            key={category}
                            onPress={() => handleCategoryClick(category)}
                            style={[
                              styles(colors).categoryButton,
                              selectedCategory === category &&
                                styles(colors).active,
                            ]}
                          >
                            <Text
                              style={[
                                styles(colors).buttonText,
                                selectedCategory === category &&
                                  styles(colors).activeText,
                              ]}
                            >
                              {category} ({count})
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </React.Fragment>
                    )) ?? null}
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </View>
  );
};

const styles = (colors: Colors) =>
  StyleSheet.create({
    categoriesContainer: {
      flex: 1,
    },
    categorySelectButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 6,
    },
    buttonText: {
      fontSize: 14,
      color: colors.textColor,
      fontWeight: "500",
    },
    filterIcon: {
      marginLeft: 4,
      fontSize: 14,
      color: colors.textColor,
    },
    categoryPopup: {
      position: "absolute",
      top: 40,
      left: 0,
      right: 0,
      backgroundColor: colors.bgColor,
      borderWidth: 1,
      borderColor: colors.borderColor,
      borderRadius: 6,
      elevation: 5,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      maxHeight: 400,
      zIndex: 100,
    },
    categoryButton: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
    },
    active: {
      backgroundColor: colors.accentMedium,
    },
    activeText: {
      color: colors.accentColor,
    },
    groupTitle: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      fontSize: 16,
      fontWeight: "bold",
      color: colors.textColor,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
    },
  });
