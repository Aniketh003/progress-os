import { LearningMap, WorkoutPlan } from '@/types';
import { DEFAULT_LEARNING_MAPS, DEFAULT_WORKOUT_PLAN } from '@/lib/defaults';

/**
 * Returns default learning maps directly from code
 */
export async function getDefaultLearningMaps(): Promise<LearningMap[]> {
  return DEFAULT_LEARNING_MAPS;
}

/**
 * Returns default workout schedule plan directly from code
 */
export async function getDefaultWorkoutPlan(): Promise<WorkoutPlan | null> {
  return DEFAULT_WORKOUT_PLAN;
}
