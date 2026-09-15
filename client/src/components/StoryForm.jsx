import { useState, useEffect, useRef } from 'react';
import { X, Upload, Plus, Trash2, MapPin, Calendar, FileText, Image as ImageIcon, Navigation, Users, Clock, Compass, ChevronRight, Check } from 'lucide-react';
import { createStory, updateStory, uploadStoryImage } from '../services/api';
import toast from 'react-hot-toast';

const POPULAR_DESTINATIONS = [
  'Visakhapatnam', 'Araku Valley', 'Hyderabad', 'Goa', 'Mumbai',
  'Bengaluru', 'Delhi', 'Ooty', 'Manali', 'Jaipur', 'Kochi', 'Ladakh'
];

const StoryForm = ({ story, onClose, onSaved }) => {
  const isEdit = !!story;
  const fileRef = useRef();

  const [activeStep, setActiveStep] = useState(1);
  const [form, setForm] = useState({
    title: story?.title || '',
    fromPlace: story?.fromPlace || '',
    place: story?.place || '',
    tripStartDate: story?.tripStartDate?.slice(0, 10) || '',
    tripEndDate: story?.tripEndDate?.slice(0, 10) || '',
    numberOfPersons: story?.numberOfPersons || 1,
    description: story?.description || '',
    activities: story?.activities?.length ? story.activities : [{ activityName: '', cost: '-' }],
    daysItinerary: story?.daysItinerary?.length
      ? story.daysItinerary
      : [{ dayNumber: 1, dayTitle: 'Day 1', activities: [{ activityName: '', cost: '-', time: '' }] }],
    imageGallery: story?.imageGallery?.length ? story.imageGallery : [],
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(story?.coverImage || '');
  const [galleryPreviews, setGalleryPreviews] = useState(story?.imageGallery || []);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [activeDayTab, setActiveDayTab] = useState(0);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // Sync days count when dates change
  useEffect(() => {
    if (form.tripStartDate && form.tripEndDate) {
      const s = new Date(form.tripStartDate);
      const e = new Date(form.tripEndDate);
      if (!isNaN(s) && !isNaN(e) && e >= s) {
        const totalDays = Math.max(1, Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1);
        setForm(f => {
          if (f.daysItinerary.length === totalDays) return f;
          const updatedDays = [];
          for (let i = 1; i <= totalDays; i++) {
            const existing = f.daysItinerary[i - 1];
            updatedDays.push(
              existing || {
                dayNumber: i,
                dayTitle: `Day ${i}`,
                activities: [{ activityName: '', cost: '-', time: '' }],
              }
            );
          }
          return { ...f, daysItinerary: updatedDays };
        });
      }
    }
  }, [form.tripStartDate, form.tripEndDate]);

  // Day itinerary handlers
  const setDayTitle = (dayIdx, title) => {
    const days = [...form.daysItinerary];
    days[dayIdx] = { ...days[dayIdx], dayTitle: title };
    setForm(f => ({ ...f, daysItinerary: days }));
  };

  const addDayActivity = (dayIdx) => {
    const days = [...form.daysItinerary];
    const currentActivities = days[dayIdx]?.activities || [];
    days[dayIdx] = {
      ...days[dayIdx],
      activities: [...currentActivities, { activityName: '', cost: '-', time: '' }],
    };
    setForm(f => ({ ...f, daysItinerary: days }));
  };

  const setDayActivity = (dayIdx, actIdx, key, val) => {
    const days = [...form.daysItinerary];
    const acts = [...days[dayIdx].activities];
    acts[actIdx] = { ...acts[actIdx], [key]: val };
    days[dayIdx] = { ...days[dayIdx], activities: acts };
    setForm(f => ({ ...f, daysItinerary: days }));
  };

  const removeDayActivity = (dayIdx, actIdx) => {
    const days = [...form.daysItinerary];
    const acts = days[dayIdx].activities.filter((_, idx) => idx !== actIdx);
    days[dayIdx] = { ...days[dayIdx], activities: acts.length ? acts : [{ activityName: '', cost: '-', time: '' }] };
    setForm(f => ({ ...f, daysItinerary: days }));
  };

  const addExtraDay = () => {
    setForm(f => {
      const nextNum = f.daysItinerary.length + 1;
      return {
        ...f,
        daysItinerary: [
          ...f.daysItinerary,
          { dayNumber: nextNum, dayTitle: `Day ${nextNum}`, activities: [{ activityName: '', cost: '-', time: '' }] },
        ],
      };
    });
    setActiveDayTab(form.daysItinerary.length);
  };

  const handleImageChange = async (file) => {
    if (!file) return;
    setImageFile(file);
    try {
      const compressed = await compressImage(file, 1600, 0.85);
      setImagePreview(compressed);
    } catch {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleGalleryFilesChange = async (files) => {
    if (!files || !files.length) return;
    const remainingSlots = 6 - galleryPreviews.length;
    if (remainingSlots <= 0) {
      toast.error('Maximum 6 gallery photos allowed');
      return;
    }

    const selectedFiles = Array.from(files).slice(0, remainingSlots);
    for (const file of selectedFiles) {
      try {
        const compressedBase64 = await compressImage(file);
        setGalleryPreviews((prev) => {
          if (prev.length >= 6) return prev;
          const updated = [...prev, compressedBase64];
          set('imageGallery', updated);
          return updated;
        });
      } catch {
        toast.error('Failed to process image');
      }
    }
  };

  const removeGalleryPhoto = (idx) => {
    setGalleryPreviews((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      set('imageGallery', updated);
      return updated;
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageChange(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.place || !form.tripStartDate || !form.tripEndDate || !form.description) {
      toast.error('Please fill all required fields (Title, Destination, Dates & Narrative)');
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    if (form.tripStartDate > todayStr || form.tripEndDate > todayStr) {
      toast.error('Trip dates cannot be in the future.');
      return;
    }

    setLoading(true);



    // Clean daysItinerary — filter out empty activities
    const cleanedDaysItinerary = form.daysItinerary
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
      .filter(day => day.activities.length > 0 || day.dayTitle);

    // Flatten valid activities for flat activity log
    const flatActivities = [];
    cleanedDaysItinerary.forEach((day) => {
      day.activities.forEach((act) => {
        flatActivities.push({ activityName: act.activityName, cost: act.cost || '-', time: act.time || '' });
      });
    });

    const payload = {
      ...form,
      coverImage: imagePreview || story?.coverImage || '',
      numberOfPersons: parseInt(form.numberOfPersons, 10) || 1,
      activities: flatActivities,
      daysItinerary: cleanedDaysItinerary,
      imageGallery: galleryPreviews.slice(0, 6),
    };

    try {
      let saved;
      if (isEdit) {
        const res = await updateStory(story._id, payload);
        saved = res.data.story;
      } else {
        const res = await createStory(payload);
        saved = res.data.story;
      }

      // Upload main cover image if selected
      if (imageFile) {
        const fd = new FormData();
        fd.append('image', imageFile);
        try {
          const imgRes = await uploadStoryImage(saved._id, fd);
          saved.coverImage = imgRes.data.coverImage;
        } catch {
          toast('Story saved, but cover photo upload failed.', { icon: '⚠️' });
        }
      }

      toast.success(isEdit ? 'Story updated!' : 'Story created!');
      onSaved?.(saved);
      onClose?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save story');
    } finally {
      setLoading(false);
    }
  };

  // Trap scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const formMapSearchQuery = form.fromPlace ? `${form.fromPlace} to ${form.place}` : form.place;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-md font-sans"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col animate-scale-in overflow-hidden border border-slate-200/90"
        style={{ boxShadow: '0 32px 64px rgba(15,61,92,0.3)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 bg-white/95 backdrop-blur-sm z-10 shrink-0">
          <div>
            <h2 className="text-lg sm:text-2xl font-extrabold font-outfit text-slate-900 tracking-tight flex items-center gap-2">
              <span>{isEdit ? '✏️ Edit Travel Story' : '✈️ Create Travel Story & Itinerary'}</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Plan trip routes, live map directions, day threads & 6 trip photos</p>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600 flex items-center justify-center"
            title="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Wizard Steps Navigation Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-slate-50/90 border-b border-slate-200/80 gap-2 overflow-x-auto text-xs font-extrabold shrink-0">
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              activeStep === 1 ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <span>1. Route & Map</span>
          </button>
          <ChevronRight size={14} className="text-slate-300 shrink-0" />
          <button
            type="button"
            onClick={() => setActiveStep(2)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              activeStep === 2 ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <span>2. Day Threads ({form.daysItinerary.length} Days)</span>
          </button>
          <ChevronRight size={14} className="text-slate-300 shrink-0" />
          <button
            type="button"
            onClick={() => setActiveStep(3)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              activeStep === 3 ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <span>3. Photos ({galleryPreviews.length}/6) & Story</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* STEP 1: Basic Info, Route & Live Map Preview */}
          {activeStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              {/* Title */}
              <div className="form-group">
                <label htmlFor="story-title">
                  <FileText size={14} className="text-sky-500 shrink-0" />
                  <span>Story Title *</span>
                </label>
                <input id="story-title" value={form.title} onChange={e => set('title', e.target.value)}
                  placeholder="e.g. 5 Days Vizag to Araku Valley Trip" className="input-field font-bold" required />
              </div>

              {/* From → Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="form-group">
                  <label htmlFor="story-from">
                    <Navigation size={14} className="text-sky-500 shrink-0" />
                    <span>From (Origin Place)</span>
                  </label>
                  <input id="story-from" value={form.fromPlace} onChange={e => set('fromPlace', e.target.value)}
                    placeholder="e.g. Visakhapatnam" className="input-field" />
                </div>
                <div className="form-group">
                  <label htmlFor="story-dest">
                    <MapPin size={14} className="text-sky-500 shrink-0" />
                    <span>Destination *</span>
                  </label>
                  <input id="story-dest" value={form.place} onChange={e => set('place', e.target.value)}
                    placeholder="e.g. Araku Valley" className="input-field" required />
                </div>
              </div>

              {/* Quick Destination Pill Suggestions */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <span className="text-[11px] font-bold text-slate-400 shrink-0">Quick Select:</span>
                {POPULAR_DESTINATIONS.map((dest, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => set('place', dest)}
                    className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 hover:bg-sky-100 hover:text-sky-700 transition-colors shrink-0"
                  >
                    {dest}
                  </button>
                ))}
              </div>

              {/* Live Google Maps Iframe Route Preview */}
              {form.place && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 font-outfit">
                      <MapPin size={13} className="text-sky-500" />
                      <span>Live Route Map Preview</span>
                    </span>
                    <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                      Free Google Maps
                    </span>
                  </div>
                  <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-200 relative">
                    <iframe
                      title="Route Map Form Preview"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(formMapSearchQuery)}&output=embed`}
                    ></iframe>
                  </div>
                </div>
              )}

              {/* Dates & Travelers Count */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="form-group">
                  <label htmlFor="story-start-date">
                    <Calendar size={14} className="text-sky-500 shrink-0" />
                    <span>From Date *</span>
                  </label>
                  <input id="story-start-date" type="date" value={form.tripStartDate}
                    onChange={e => set('tripStartDate', e.target.value)}
                    max={new Date().toISOString().slice(0, 10)}
                    className="input-field" required />
                </div>
                <div className="form-group">
                  <label htmlFor="story-end-date">
                    <Calendar size={14} className="text-sky-500 shrink-0" />
                    <span>To Date *</span>
                  </label>
                  <input id="story-end-date" type="date" value={form.tripEndDate}
                    onChange={e => set('tripEndDate', e.target.value)}
                    min={form.tripStartDate}
                    max={new Date().toISOString().slice(0, 10)}
                    className="input-field" required />
                </div>

                <div className="form-group">
                  <label htmlFor="story-persons">
                    <Users size={14} className="text-sky-500 shrink-0" />
                    <span>Travelers / Persons *</span>
                  </label>
                  <input id="story-persons" type="number" min="1" max="99" value={form.numberOfPersons}
                    onChange={e => set('numberOfPersons', e.target.value)}
                    className="input-field font-bold" required />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button type="button" onClick={() => setActiveStep(2)}
                  className="btn-primary inline-flex items-center gap-1.5 px-6 py-2.5">
                  <span>Next: Day-by-Day Threads</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Day-by-Day Itinerary Threads */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-200">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 font-outfit">
                    🗓️ Day-by-Day Itinerary Threads ({form.daysItinerary.length} Days)
                  </h3>
                  <p className="text-xs text-slate-500">Add activities, timing & cost in Indian Rupees (₹) for each day</p>
                </div>
                <button type="button" onClick={addExtraDay}
                  className="text-xs inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors">
                  <Plus size={14} /> <span>+ Add Day</span>
                </button>
              </div>

              {/* Day Selector Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {form.daysItinerary.map((day, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveDayTab(idx)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all border ${
                      activeDayTab === idx
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    Day {day.dayNumber || idx + 1}
                  </button>
                ))}
              </div>

              {/* Selected Day Activities List */}
              {form.daysItinerary[activeDayTab] && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-extrabold text-xs shrink-0">
                      D{activeDayTab + 1}
                    </span>
                    <input
                      value={form.daysItinerary[activeDayTab].dayTitle || ''}
                      onChange={(e) => setDayTitle(activeDayTab, e.target.value)}
                      placeholder={`Day ${activeDayTab + 1} Title (e.g. Borra Caves & Coffee Plantations)`}
                      className="input-field text-xs font-bold py-2 flex-1"
                    />
                  </div>

                  <div className="space-y-2.5 pt-2">
                    {form.daysItinerary[activeDayTab].activities.map((act, actIdx) => (
                      <div key={actIdx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                        <div className="flex-1">
                          <input
                            value={act.activityName}
                            onChange={(e) => setDayActivity(activeDayTab, actIdx, 'activityName', e.target.value)}
                            placeholder="Activity description (e.g. Katiki Waterfalls Visit)"
                            className="input-field text-xs py-1.5"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative w-28">
                            <Clock size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              value={act.time || ''}
                              onChange={(e) => setDayActivity(activeDayTab, actIdx, 'time', e.target.value)}
                              placeholder="Time (e.g. 10 AM)"
                              className="input-field text-xs py-1.5 pl-7"
                            />
                          </div>
                          <div className="relative w-28">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-extrabold text-xs">₹</span>
                            <input
                              value={act.cost}
                              onChange={(e) => setDayActivity(activeDayTab, actIdx, 'cost', e.target.value)}
                              placeholder="Cost ₹"
                              className="input-field text-xs py-1.5 pl-7 font-bold"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDayActivity(activeDayTab, actIdx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Remove activity"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => addDayActivity(activeDayTab)}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus size={14} /> <span>Add Activity to Day {activeDayTab + 1}</span>
                  </button>
                </div>
              )}

              <div className="pt-3 flex justify-between">
                <button type="button" onClick={() => setActiveStep(1)} className="btn-secondary text-xs px-4 py-2">
                  Back
                </button>
                <button type="button" onClick={() => setActiveStep(3)} className="btn-primary inline-flex items-center gap-1.5 px-6 py-2.5">
                  <span>Next: Photos & Narrative</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Main Cover Photo, Gallery Photos (Up to 6) & Story Narrative */}
          {activeStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              {/* Main Cover image */}
              <div className="form-group">
                <label>
                  <ImageIcon size={14} className="text-sky-500 shrink-0" />
                  <span>Main Cover Photo *</span>
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  className={`upload-zone ${dragOver ? 'drag-over' : ''}`}>
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="preview-img" />
                      <div className="absolute bottom-2 right-2 px-3 py-1 rounded-lg text-xs font-bold text-white bg-slate-900/70 backdrop-blur-sm border border-white/20">
                        Click to change main photo
                      </div>
                    </div>
                  ) : (
                    <div className="py-7 text-center px-4 flex flex-col items-center justify-center">
                      <Upload size={28} className="text-slate-300 mb-1.5" />
                      <p className="text-xs sm:text-sm font-bold text-slate-700 mb-0.5">Upload main cover photo</p>
                      <p className="text-[11px] text-slate-400">JPG, PNG, WebP — Recommended 16:9 ratio</p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" hidden
                    onChange={e => handleImageChange(e.target.files[0])} />
                </div>
              </div>

              {/* Trip Photo Gallery (Up to 6 Photos) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 font-outfit flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-sky-500" />
                      <span>Trip Photo Gallery (Up to 6 Photos)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">Showcase extra photos from your journey</p>
                  </div>
                  <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                    {galleryPreviews.length}/6 Photos
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
                  {galleryPreviews.map((img, gIdx) => (
                    <div key={gIdx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-200">
                      <img src={img} alt={`Gallery ${gIdx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryPhoto(gIdx)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white opacity-90 hover:opacity-100 transition-opacity"
                        title="Remove photo"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}

                  {galleryPreviews.length < 6 && (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-sky-300 hover:border-sky-500 bg-sky-50/50 hover:bg-sky-50 flex flex-col items-center justify-center cursor-pointer transition-colors text-sky-600">
                      <Plus size={20} />
                      <span className="text-[10px] font-bold mt-1">Add Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={(e) => handleGalleryFilesChange(e.target.files)}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="story-desc">
                  <FileText size={14} className="text-sky-500 shrink-0" />
                  <span>Story Narrative / Overview *</span>
                </label>
                <textarea id="story-desc" value={form.description} onChange={e => set('description', e.target.value)}
                  placeholder="Describe your trip highlights, overall experience, travel tips..."
                  rows={4} className="input-field resize-none leading-relaxed" required />
              </div>

              <div className="pt-3 flex justify-between">
                <button type="button" onClick={() => setActiveStep(2)} className="btn-secondary text-xs px-4 py-2">
                  Back
                </button>
              </div>
            </div>
          )}

          {/* Sticky Submit Footer */}
          <div className="flex gap-3 pt-3 border-t border-slate-100 sticky bottom-0 bg-white z-10">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <Check size={16} />
                  <span>{isEdit ? 'Update Story' : 'Publish Story'}</span>
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoryForm;





