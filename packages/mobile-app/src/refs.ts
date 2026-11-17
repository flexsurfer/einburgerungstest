import { createRef } from "react";
import { FlatList } from "react-native";
import type { Question } from "@ebtest/shared/uklad";

export const questionListRef = createRef<FlatList<Question>>();
