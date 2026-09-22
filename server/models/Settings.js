import mongoose from 'mongoose'

const settingsSchema = new mongoose.Schema({
  weeklyTarget: {
    type: Number,
    required: true,
    default: 25,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema)

export default Settings
