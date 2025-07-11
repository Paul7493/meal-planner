import mongoose from 'mongoose';

const MealPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  meals: [{
    date: {
      type: Date,
      required: true
    },
    type: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
      required: true
    },
    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      required: true
    }
  }]
}, {
  timestamps: true
});

export const MealPlan = mongoose.models.MealPlan || mongoose.model('MealPlan', MealPlanSchema);
