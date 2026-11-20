import { WorkoutPlan } from '@/types';

export const DEFAULT_WORKOUT_PLAN: WorkoutPlan = {
  "id": "ppl-upper-lower-hypertrophy",
  "name": "PPL + Upper/Lower",
  "description": "A 5-day gym split covering chest, back, shoulders, arms, legs and core, with two recovery days.",
  "version": 1,
  "goal": "muscle_gain",
  "startDate": "2026-11-20",
  "schedule": [
    {
      "day": "Monday",
      "workout_id": "push"
    },
    {
      "day": "Tuesday",
      "workout_id": "pull"
    },
    {
      "day": "Wednesday",
      "workout_id": "legs"
    },
    {
      "day": "Thursday",
      "workout_id": "rest"
    },
    {
      "day": "Friday",
      "workout_id": "upper"
    },
    {
      "day": "Saturday",
      "workout_id": "lower"
    },
    {
      "day": "Sunday",
      "workout_id": "rest"
    }
  ],
  "training_guidelines": {
    "warm_up_minutes": "5-10",
    "compound_rest_seconds": "120-180",
    "isolation_rest_seconds": "60-90",
    "target_reps_in_reserve": "1-3",
    "progression": "When all working sets reach the top of the rep range with good form, increase the load slightly and build reps again.",
    "working_sets_only": true
  },
  "workouts": [
    {
      "id": "push",
      "name": "Push",
      "day_order": 1,
      "muscle_groups": [
        "Chest",
        "Shoulders",
        "Triceps"
      ],
      "exercises": [
        {
          "id": "push-incline-db-press",
          "name": "Incline Dumbbell Press",
          "sets": 3,
          "rep_range": "8-12",
          "rest_seconds": 120,
          "equipment": "Dumbbells",
          "tracking": {
            "completed": false,
            "sets": [
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              }
            ]
          }
        },
        {
          "id": "push-machine-chest-press",
          "name": "Flat Machine Chest Press",
          "sets": 3,
          "rep_range": "8-12",
          "rest_seconds": 120,
          "equipment": "Machine",
          "tracking": {
            "completed": false,
            "sets": [
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              }
            ]
          }
        },
        {
          "id": "push-seated-shoulder-press",
          "name": "Seated Shoulder Press",
          "sets": 3,
          "rep_range": "8-12",
          "rest_seconds": 120,
          "equipment": "Machine or dumbbells",
          "tracking": {
            "completed": false,
            "sets": [
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              }
            ]
          }
        },
        {
          "id": "push-lateral-raise",
          "name": "Dumbbell Lateral Raises",
          "sets": 3,
          "rep_range": "12-15",
          "rest_seconds": 75,
          "equipment": "Dumbbells",
          "tracking": {
            "completed": false,
            "sets": [
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              }
            ]
          }
        },
        {
          "id": "push-cable-fly",
          "name": "Cable Chest Fly",
          "sets": 2,
          "rep_range": "12-15",
          "rest_seconds": 75,
          "equipment": "Cable",
          "tracking": {
            "completed": false,
            "sets": [
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              }
            ]
          }
        },
        {
          "id": "push-rope-pushdown",
          "name": "Rope Tricep Pushdown",
          "sets": 3,
          "rep_range": "10-15",
          "rest_seconds": 75,
          "equipment": "Cable",
          "tracking": {
            "completed": false,
            "sets": [
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              }
            ]
          }
        },
        {
          "id": "push-overhead-tricep-extension",
          "name": "Overhead Cable Tricep Extension",
          "sets": 2,
          "rep_range": "10-15",
          "rest_seconds": 75,
          "equipment": "Cable",
          "tracking": {
            "completed": false,
            "sets": [
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              }
            ]
          }
        }
      ]
    },
    {
      "id": "pull",
      "name": "Pull",
      "day_order": 2,
      "muscle_groups": [
        "Back",
        "Rear Delts",
        "Biceps"
      ],
      "exercises": [
        {
          "id": "pull-lat-pulldown",
          "name": "Lat Pulldown",
          "sets": 3,
          "rep_range": "8-12",
          "rest_seconds": 120,
          "equipment": "Cable machine",
          "tracking": {
            "completed": false,
            "sets": [
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              }
            ]
          }
        },
        {
          "id": "pull-chest-supported-row",
          "name": "Chest Supported Row",
          "sets": 3,
          "rep_range": "8-12",
          "rest_seconds": 120,
          "equipment": "Machine or bench and dumbbells",
          "tracking": {
            "completed": false,
            "sets": [
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              }
            ]
          }
        },
        {
          "id": "pull-seated-cable-row",
          "name": "Seated Cable Row",
          "sets": 2,
          "rep_range": "10-12",
          "rest_seconds": 90,
          "equipment": "Cable",
          "tracking": {
            "completed": false,
            "sets": [
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              }
            ]
          }
        },
        {
          "id": "pull-reverse-pec-deck",
          "name": "Reverse Pec Deck",
          "sets": 3,
          "rep_range": "12-15",
          "rest_seconds": 75,
          "equipment": "Machine",
          "tracking": {
            "completed": false,
            "sets": [
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              }
            ]
          }
        },
        {
          "id": "pull-db-curl",
          "name": "Dumbbell Bicep Curl",
          "sets": 3,
          "rep_range": "10-12",
          "rest_seconds": 75,
          "equipment": "Dumbbells",
          "tracking": {
            "completed": false,
            "sets": [
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              }
            ]
          }
        },
        {
          "id": "pull-hammer-curl",
          "name": "Hammer Curl",
          "sets": 2,
          "rep_range": "10-12",
          "rest_seconds": 75,
          "equipment": "Dumbbells",
          "tracking": {
            "completed": false,
            "sets": [
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              }
            ]
          }
        }
      ]
    },
    {
      "id": "legs",
      "name": "Legs",
      "day_order": 3,
      "muscle_groups": [
        "Quads",
        "Hamstrings",
        "Glutes",
        "Calves"
      ],
      "exercises": [
        {
          "id": "legs-squat",
          "name": "Barbell Squat",
          "sets": 3,
          "rep_range": "6-10",
          "rest_seconds": 180,
          "equipment": "Barbell and rack",
          "tracking": {
            "completed": false,
            "sets": [
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              }
            ]
          }
        },
        {
          "id": "legs-leg-press",
          "name": "Leg Press",
          "sets": 3,
          "rep_range": "10-12",
          "rest_seconds": 120,
          "equipment": "Machine",
          "tracking": {
            "completed": false,
            "sets": [
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              }
            ]
          }
        },
        {
          "id": "legs-rdl",
          "name": "Romanian Deadlift",
          "sets": 3,
          "rep_range": "8-12",
          "rest_seconds": 150,
          "equipment": "Barbell or dumbbells",
          "tracking": {
            "completed": false,
            "sets": [
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              }
            ]
          }
        },
        {
          "id": "legs-extension",
          "name": "Leg Extension",
          "sets": 2,
          "rep_range": "12-15",
          "rest_seconds": 75,
          "equipment": "Machine",
          "tracking": {
            "completed": false,
            "sets": [
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              }
            ]
          }
        },
        {
          "id": "legs-seated-curl",
          "name": "Seated Leg Curl",
          "sets": 3,
          "rep_range": "10-15",
          "rest_seconds": 75,
          "equipment": "Machine",
          "tracking": {
            "completed": false,
            "sets": [
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              }
            ]
          }
        },
        {
          "id": "legs-standing-calf",
          "name": "Standing Calf Raises",
          "sets": 3,
          "rep_range": "12-15",
          "rest_seconds": 60,
          "equipment": "Machine or dumbbells",
          "tracking": {
            "completed": false,
            "sets": [
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              }
            ]
          }
        }
      ]
    },
    {
      "id": "upper",
      "name": "Upper",
      "day_order": 5,
      "muscle_groups": [
        "Chest",
        "Back",
        "Shoulders",
        "Biceps",
        "Triceps"
      ],
      "exercises": [
        {
          "id": "upper-incline-db-press",
          "name": "Incline Dumbbell Press",
          "sets": 3,
          "rep_range": "8-12",
          "rest_seconds": 120,
          "equipment": "Dumbbells",
          "tracking": {
            "completed": false,
            "sets": [
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              }
            ]
          }
        },
        {
          "id": "upper-lat-pulldown",
          "name": "Lat Pulldown or Pull-ups",
          "sets": 3,
          "rep_range": "8-12",
          "rest_seconds": 120,
          "equipment": "Cable machine or pull-up bar",
          "tracking": {
            "completed": false,
            "sets": [
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              }
            ]
          }
        },
        {
          "id": "upper-machine-chest-press",
          "name": "Machine Chest Press",
          "sets": 2,
          "rep_range": "10-12",
          "rest_seconds": 120,
          "equipment": "Machine",
          "tracking": {
            "completed": false,
            "sets": [
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              }
            ]
          }
        },
        {
          "id": "upper-seated-row",
          "name": "Seated Cable Row",
          "sets": 3,
          "rep_range": "10-12",
          "rest_seconds": 90,
          "equipment": "Cable",
          "tracking": {
            "completed": false,
            "sets": [
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              }
            ]
          }
        },
        {
          "id": "upper-lateral-raise",
          "name": "Dumbbell Lateral Raises",
          "sets": 3,
          "rep_range": "12-15",
          "rest_seconds": 75,
          "equipment": "Dumbbells",
          "tracking": {
            "completed": false,
            "sets": [
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              }
            ]
          }
        },
        {
          "id": "upper-ez-curl",
          "name": "EZ Bar Bicep Curl",
          "sets": 2,
          "rep_range": "10-12",
          "rest_seconds": 75,
          "equipment": "EZ bar",
          "tracking": {
            "completed": false,
            "sets": [
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              }
            ]
          }
        },
        {
          "id": "upper-rope-pushdown",
          "name": "Tricep Rope Pushdown",
          "sets": 2,
          "rep_range": "10-15",
          "rest_seconds": 75,
          "equipment": "Cable",
          "tracking": {
            "completed": false,
            "sets": [
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              }
            ]
          }
        }
      ]
    },
    {
      "id": "lower",
      "name": "Lower",
      "day_order": 6,
      "muscle_groups": [
        "Quads",
        "Hamstrings",
        "Glutes",
        "Calves",
        "Core"
      ],
      "exercises": [
        {
          "id": "lower-hack-squat",
          "name": "Hack Squat or Squat",
          "sets": 3,
          "rep_range": "8-10",
          "rest_seconds": 150,
          "equipment": "Machine or barbell",
          "tracking": {
            "completed": false,
            "sets": [
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              }
            ]
          }
        },
        {
          "id": "lower-rdl",
          "name": "Romanian Deadlift",
          "sets": 3,
          "rep_range": "8-12",
          "rest_seconds": 150,
          "equipment": "Barbell or dumbbells",
          "tracking": {
            "completed": false,
            "sets": [
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              }
            ]
          }
        },
        {
          "id": "lower-bulgarian-split-squat",
          "name": "Bulgarian Split Squat",
          "sets": 2,
          "rep_range": "10 each leg",
          "rest_seconds": 120,
          "equipment": "Dumbbells or bodyweight",
          "tracking": {
            "completed": false,
            "sets": [
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              }
            ]
          }
        },
        {
          "id": "lower-leg-curl",
          "name": "Leg Curl",
          "sets": 3,
          "rep_range": "10-15",
          "rest_seconds": 75,
          "equipment": "Machine",
          "tracking": {
            "completed": false,
            "sets": [
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              }
            ]
          }
        },
        {
          "id": "lower-leg-extension",
          "name": "Leg Extension",
          "sets": 2,
          "rep_range": "12-15",
          "rest_seconds": 75,
          "equipment": "Machine",
          "tracking": {
            "completed": false,
            "sets": [
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              }
            ]
          }
        },
        {
          "id": "lower-seated-calf",
          "name": "Seated Calf Raises",
          "sets": 3,
          "rep_range": "12-15",
          "rest_seconds": 60,
          "equipment": "Machine",
          "tracking": {
            "completed": false,
            "sets": [
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              }
            ]
          }
        },
        {
          "id": "lower-hanging-knee-raise",
          "name": "Hanging Knee Raises",
          "sets": 3,
          "rep_range": "12-15",
          "rest_seconds": 60,
          "equipment": "Pull-up bar",
          "tracking": {
            "completed": false,
            "sets": [
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              },
              {
                "weight_kg": null,
                "reps": null,
                "completed": false
              }
            ]
          }
        }
      ]
    }
  ],
  "rest_days": [
    {
      "id": "rest",
      "name": "Rest / Recovery",
      "activities": [
        "Optional easy walk",
        "Light mobility",
        "Adequate food and hydration",
        "7-9 hours of sleep"
      ]
    }
  ],
  "progress_tracking": {
    "track_per_exercise": [
      "completed",
      "set_weight_kg",
      "set_reps"
    ],
    "notes": "",
    "body_weight_kg": null
  }
};
