const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  activityName: { type: String, default: '', trim: true },
  cost: { type: String, default: '-' },
  time: { type: String, default: '' },
});


const dayItinerarySchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true },
  dayTitle: { type: String, default: '' },
  activities: [activitySchema],
});

const replySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, trim: true },
  replies: [replySchema],
  createdAt: { type: Date, default: Date.now },
});

const storySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Story title is required'],
      trim: true,
      maxlength: [200, 'Title too long'],
    },
    fromPlace: {
      type: String,
      default: '',
      trim: true,
    },
    place: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    tripStartDate: {
      type: Date,
      required: [true, 'Trip start date is required'],
    },
    tripEndDate: {
      type: Date,
      required: [true, 'Trip end date is required'],
    },
    numberOfPersons: {
      type: Number,
      default: 1,
      min: [1, 'Number of persons must be at least 1'],
    },
    coverImage: {
      type: String,
      default: '',
    },
    coverImagePublicId: {
      type: String,
      default: '',
    },
    imageGallery: [{ type: String }],
    description: {
      type: String,
      required: [true, 'Story description is required'],
    },

    activities: [activitySchema],
    daysItinerary: [dayItinerarySchema],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Text index for search
storySchema.index({ title: 'text', description: 'text', place: 'text', fromPlace: 'text' });

module.exports = mongoose.model('Story', storySchema);


