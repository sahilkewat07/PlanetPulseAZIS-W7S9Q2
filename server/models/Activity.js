import mongoose from 'mongoose'

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['car', 'bus', 'flight', 'electricity', 'veg_meal', 'non_veg_meal'],
    required: true,
  },
  category: {
    type: String,
    enum: ['transport', 'electricity', 'food'],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  unit: {
    type: String,
    required: true,
  },
  emissionFactor: {
    type: Number,
    required: true,
  },
  co2: {
    type: Number,
    required: true,
  },
  flaggedUnusual: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema)

export default Activity
