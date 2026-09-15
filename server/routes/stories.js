const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const { protect, restrictGuest } = require('../middleware/auth');
const { upload, cloudinary } = require('../config/cloudinary');

// GET /api/stories — Get all public stories with search, userId, place & date filter
router.get('/', async (req, res) => {
  try {
    const { search, startDate, endDate, userId, user, place } = req.query;
    let query = { isPublic: true };

    const targetUserId = userId || user;
    if (targetUserId) {
      query.userId = targetUserId;
    }

    if (place) {
      query.$or = [
        { place: { $regex: place, $options: 'i' } },
        { fromPlace: { $regex: place, $options: 'i' } }
      ];
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (startDate || endDate) {
      query.tripStartDate = {};
      if (startDate) query.tripStartDate.$gte = new Date(startDate);
      if (endDate) query.tripStartDate.$lte = new Date(endDate);
    }

    const stories = await Story.find(query)
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, stories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/stories/:id — Get single story
router.get('/:id', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate('userId', 'name avatar')
      .populate('comments.userId', 'name avatar')
      .populate('comments.replies.userId', 'name avatar');
    if (!story) return res.status(404).json({ message: 'Story not found' });
    res.json({ success: true, story });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const cleanDaysItinerary = (rawDays) => {
  if (!Array.isArray(rawDays)) return [];
  return rawDays
    .map((day, idx) => ({
      dayNumber: day.dayNumber || idx + 1,
      dayTitle: day.dayTitle || `Day ${idx + 1}`,
      activities: (day.activities || [])
        .filter(a => a && a.activityName && a.activityName.trim() !== '')
        .map(a => ({
          activityName: a.activityName.trim(),
          cost: a.cost || '-',
          time: a.time || ''
        }))
    }))
    .filter(day => day.activities.length > 0 || (day.dayTitle && day.dayTitle !== `Day ${day.dayNumber}`));
};

// POST /api/stories — Create story (auth required, no guest)
router.post('/', protect, restrictGuest, async (req, res) => {
  try {
    const { title, fromPlace, place, tripStartDate, tripEndDate, numberOfPersons, description, activities, daysItinerary, coverImage, imageGallery } = req.body;

    const now = new Date();
    now.setHours(23, 59, 59, 999);
    if (new Date(tripStartDate) > now || new Date(tripEndDate) > now) {
      return res.status(400).json({ message: 'Trip dates cannot be in the future.' });
    }

    const cleanedDays = cleanDaysItinerary(daysItinerary);
    const cleanedActivities = (activities || []).filter(a => a && a.activityName && a.activityName.trim() !== '');

    const galleryArr = Array.isArray(imageGallery) ? imageGallery.slice(0, 6) : [];
    const finalCover = coverImage || (galleryArr.length > 0 ? galleryArr[0] : '');

    const story = await Story.create({
      userId: req.user._id,
      title,
      fromPlace: fromPlace || '',
      place,
      tripStartDate,
      tripEndDate,
      numberOfPersons: numberOfPersons ? parseInt(numberOfPersons, 10) : 1,
      description,
      activities: cleanedActivities,
      daysItinerary: cleanedDays,
      coverImage: finalCover,
      imageGallery: galleryArr,
    });

    const populated = await story.populate('userId', 'name avatar');
    res.status(201).json({ success: true, story: populated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/stories/:id — Update story (author only)
router.put('/:id', protect, restrictGuest, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    if (story.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this story' });
    }

    const { title, fromPlace, place, tripStartDate, tripEndDate, numberOfPersons, description, activities, daysItinerary, coverImage, imageGallery } = req.body;

    const cleanedDays = daysItinerary ? cleanDaysItinerary(daysItinerary) : story.daysItinerary;
    const cleanedActivities = activities ? (activities || []).filter(a => a && a.activityName && a.activityName.trim() !== '') : story.activities;
    const galleryArr = Array.isArray(imageGallery) ? imageGallery.slice(0, 6) : story.imageGallery || [];

    let updatedCover = coverImage !== undefined ? coverImage : story.coverImage;
    if (!updatedCover && galleryArr.length > 0) {
      updatedCover = galleryArr[0];
    }

    Object.assign(story, {
      title,
      fromPlace: fromPlace || '',
      place,
      tripStartDate,
      tripEndDate,
      numberOfPersons: numberOfPersons ? parseInt(numberOfPersons, 10) : story.numberOfPersons || 1,
      description,
      activities: cleanedActivities,
      daysItinerary: cleanedDays,
      coverImage: updatedCover,
      imageGallery: galleryArr,
    });
    await story.save();

    const populated = await story
      .populate('userId', 'name avatar')
      .populate('comments.userId', 'name avatar')
      .populate('comments.replies.userId', 'name avatar');
    res.json({ success: true, story: populated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/stories/:id — Delete story (author only)
router.delete('/:id', protect, restrictGuest, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    if (story.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this story' });
    }

    if (story.coverImagePublicId) {
      await cloudinary.uploader.destroy(story.coverImagePublicId);
    }

    await story.deleteOne();
    res.json({ success: true, message: 'Story deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/stories/:id/like — Toggle like (auth required, no guest)
router.patch('/:id/like', protect, restrictGuest, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    const userId = req.user._id;
    const likedIndex = story.likes.indexOf(userId);

    if (likedIndex === -1) {
      story.likes.push(userId);
    } else {
      story.likes.splice(likedIndex, 1);
    }

    await story.save();
    res.json({ success: true, likes: story.likes.length, liked: likedIndex === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/stories/:id/comments — Add comment/doubt
router.post('/:id/comments', protect, restrictGuest, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    story.comments.push({
      userId: req.user._id,
      text: text.trim(),
      replies: [],
    });

    await story.save();

    const updated = await Story.findById(req.params.id)
      .populate('userId', 'name avatar')
      .populate('comments.userId', 'name avatar')
      .populate('comments.replies.userId', 'name avatar');

    res.status(201).json({ success: true, story: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/stories/:id/comments/:commentId/reply — Reply to comment/doubt
router.post('/:id/comments/:commentId/reply', protect, restrictGuest, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Reply text is required' });
    }

    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    const comment = story.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    comment.replies.push({
      userId: req.user._id,
      text: text.trim(),
    });

    await story.save();

    const updated = await Story.findById(req.params.id)
      .populate('userId', 'name avatar')
      .populate('comments.userId', 'name avatar')
      .populate('comments.replies.userId', 'name avatar');

    res.status(201).json({ success: true, story: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/stories/:id/image — Upload cover image
router.post('/:id/image', protect, restrictGuest, upload.single('image'), async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    if (story.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (story.coverImagePublicId) {
      await cloudinary.uploader.destroy(story.coverImagePublicId);
    }

    story.coverImage = req.file.path;
    story.coverImagePublicId = req.file.filename;
    await story.save();

    res.json({ success: true, coverImage: story.coverImage });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

