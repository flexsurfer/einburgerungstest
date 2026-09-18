export type Answer = string;

export type { Question } from "@ebtest/shared/uklad";

export interface UserAnswers {
  [questionIndex: number]: number;
}

export interface Favorites {
  [questionIndex: number]: boolean;
}
