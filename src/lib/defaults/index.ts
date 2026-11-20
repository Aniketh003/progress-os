import { LearningMap, WorkoutPlan } from '@/types';
import { AI_ENGINEERING_DEFAULT_MAP } from './ai-engineering-map';
import { MBBS_DEFAULT_MAP } from './mbbs-map';
import { DEFAULT_WORKOUT_PLAN } from './default-workout';
import { SAMPLE_LEARNING_MAP } from './sample-learning-map';

export {
  AI_ENGINEERING_DEFAULT_MAP,
  MBBS_DEFAULT_MAP,
  DEFAULT_WORKOUT_PLAN,
  SAMPLE_LEARNING_MAP,
};

export const DEFAULT_LEARNING_MAPS: LearningMap[] = [
  AI_ENGINEERING_DEFAULT_MAP,
  MBBS_DEFAULT_MAP,
];
