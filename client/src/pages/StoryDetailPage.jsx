import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import { getStory, deleteStory, likeStory, addComment, replyComment } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { ArrowLeft, MapPin, Calendar, Heart, Edit, Trash2, DollarSign, Navigation, ArrowRight, Users, Clock, Compass, MessageSquare, Send, CornerDownRight } from 'lucide-react';
import StoryForm from '../components/StoryForm';
import YouTubePlaceVideos from '../components/YouTubePlaceVideos';
import toast from 'react-hot-toast';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&auto=format',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&auto=format',
  'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&auto=format',
];

const StoryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showEdit, setShowEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Comment & Doubt states
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingCommentId, setReplyingCommentId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getStory(id);
        const s = res.data.story;
        setStory(s);
        setLikeCount(s.likes?.length || 0);
        setLiked(s.likes?.some(l => l === user?._id || l?._id === user?._id));
      } catch {
        toast.error('Story not found');
        navigate('/home');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleLike = async () => {
    if (isGuest) { toast.error('Sign up to like stories!'); return; }
    try {
      const res = await likeStory(id);
      setLiked(res.data.liked);
      setLikeCount(res.data.likes);
    } catch {
      toast.error('Failed to like story');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this story? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await deleteStory(id);
      toast.success('Story deleted');
      navigate('/home');
    } catch {
      toast.error('Failed to delete story');
    } finally {
      setDeleting(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (isGuest) { toast.error('Sign up to ask questions or post doubts!'); return; }
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await addComment(id, { text: commentText.trim() });
      setStory(res.data.story);
      setCommentText('');
      toast.success('Question / Doubt posted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReplyComment = async (commentId) => {
    if (isGuest) { toast.error('Sign up to reply!'); return; }
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      const res = await replyComment(id, commentId, { text: replyText.trim() });
      setStory(res.data.story);
      setReplyText('');
      setReplyingCommentId(null);
      toast.success('Reply posted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const isAuthor = user?._id === (story?.userId?._id || story?.userId);
  const coverImg = story?.coverImage ||
    (story?.imageGallery && story.imageGallery.length > 0 ? story.imageGallery[0] : null) ||
    FALLBACK_IMAGES[id?.charCodeAt(0) % FALLBACK_IMAGES.length] ||
    FALLBACK_IMAGES[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 animate-pulse space-y-6">
          <div className="h-8 bg-slate-200/80 rounded-xl w-1/3" />
          <div className="h-72 sm:h-84 bg-slate-200/80 rounded-3xl" />
          <div className="h-6 bg-slate-200/80 rounded-xl w-2/3" />
          <div className="h-4 bg-slate-100 rounded-lg w-full" />
          <div className="h-4 bg-slate-100 rounded-lg w-3/4" />
        </div>
      </div>
    );
  }

  if (!story) return null;

  const formatCostValue = (costStr) => {
    if (!costStr || costStr === '-' || costStr === '-0' || costStr === '0') return '—';
    const cleanStr = String(costStr).replace(/-/g, '').trim();
    const num = parseFloat(cleanStr);
    if (isNaN(num) || num === 0) return '—';
    return num.toLocaleString('en-IN');
  };

  // Calculate total cost from flat activities or daysItinerary
  let totalCost = 0;
  const parseCost = (costStr) => {
    if (!costStr || costStr === '-') return 0;
    const num = Math.abs(parseFloat(String(costStr).replace(/[^0-9.]/g, '')));
    return isNaN(num) ? 0 : num;
  };

  if (story.daysItinerary?.length) {
    story.daysItinerary.forEach(d => {
      d.activities?.forEach(a => {
        totalCost += parseCost(a.cost);
      });
    });
  } else if (story.activities?.length) {
    story.activities.forEach(a => {
      totalCost += parseCost(a.cost);
    });
  }

  const mapSearchQuery = story.fromPlace ? `${story.fromPlace} to ${story.place}` : story.place;

  return (
    <div className="min-h-screen pb-20 font-sans bg-slate-950 text-slate-900 relative overflow-hidden">
      {/* Ambient Full Page Background Cover Image with Custom Opacity & Blur */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <img
          src={coverImg}
          alt=""
          className="w-full h-full object-cover opacity-70 blur-xl scale-110 transition-all duration-700"
        />

        <div className="absolute inset-0 bg-slate-950/20" />
      </div>


      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fade-in">
        {/* Back + author actions */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <button onClick={() => navigate(-1)}
            className="btn-secondary text-xs sm:text-sm py-2 px-4 font-extrabold shadow-xs inline-flex items-center gap-2 bg-white/90 backdrop-blur-md">
            <ArrowLeft size={16} /> <span>Back to feed</span>
          </button>

          {isAuthor && (
            <div className="flex gap-2.5">
              <button onClick={() => setShowEdit(true)}
                className="btn-secondary text-xs sm:text-sm py-2 px-4 font-extrabold border-sky-200 text-sky-700 hover:bg-sky-50 shadow-xs inline-flex items-center gap-1.5">
                <Edit size={15} /> <span>Update</span>
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="btn-danger text-xs sm:text-sm py-2 px-4 shadow-sm inline-flex items-center gap-1.5">
                <Trash2 size={15} />
                <span>{deleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Main Story Container */}
        <article className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden mb-8">
          {/* Cover image — 16:9 aspect ratio */}
          <div className="relative overflow-hidden w-full" style={{ aspectRatio: '16/9' }}>
            <img src={coverImg} alt={story.title}
              className="w-full h-full object-cover"
              onError={e => { e.target.src = FALLBACK_IMAGES[0]; }} />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

            {/* Like button overlay */}
            <button onClick={handleLike}
              className={`absolute top-4 right-4 inline-flex items-center gap-2 px-4 py-2 rounded-full font-extrabold text-xs sm:text-sm shadow-lg backdrop-blur-md transition-all hover:scale-105
                ${liked ? 'bg-red-500 text-white border border-red-400' : 'bg-white/85 text-slate-800 border border-white/60 hover:bg-white'}`}>
              <Heart size={16} className={liked ? 'fill-white' : 'text-slate-500'} />
              <span>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
            </button>
          </div>

          <div className="p-6 sm:p-10">
            {/* Title */}
            <h1 className="text-2xl sm:text-4xl font-extrabold mb-5 leading-tight text-slate-900 tracking-tight font-outfit">
              {story.title}
            </h1>

            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-2.5 mb-6">
              {/* Date Badge */}
              <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-700 font-bold bg-slate-100/90 px-3.5 py-1.5 rounded-full border border-slate-200/80">
                <Calendar size={14} className="shrink-0 text-sky-500" />
                <span>
                  {format(new Date(story.tripStartDate), 'MMM d, yyyy')}
                  {story.tripEndDate ? ` – ${format(new Date(story.tripEndDate), 'MMM d, yyyy')}` : ''}
                </span>
              </div>

              {/* Travelers Badge */}
              <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-700 font-bold bg-slate-100/90 px-3.5 py-1.5 rounded-full border border-slate-200/80">
                <Users size={14} className="shrink-0 text-indigo-500" />
                <span>{story.numberOfPersons || 1} {story.numberOfPersons === 1 ? 'Traveler' : 'Travelers'}</span>
              </div>

              {/* Route: From → Destination */}
              {story.fromPlace ? (
                <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200/80 text-sky-700">
                  <Navigation size={13} className="shrink-0 text-sky-600" />
                  <span className="truncate max-w-[140px] sm:max-w-[200px]">{story.fromPlace}</span>
                  <ArrowRight size={11} className="text-sky-400 shrink-0" />
                  <MapPin size={13} className="shrink-0 text-sky-600" />
                  <span className="truncate max-w-[140px] sm:max-w-[200px]">{story.place}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200/80 text-sky-700">
                  <MapPin size={14} className="shrink-0 text-sky-600" />
                  <span>{story.place}</span>
                </div>
              )}

              {/* Author Badge */}
              {story.userId?.name && (
                <Link
                  to={`/home?userId=${story.userId._id || story.userId}&authorName=${encodeURIComponent(story.userId.name)}`}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-700 hover:text-sky-600 font-bold bg-slate-100/90 hover:bg-sky-50 px-3.5 py-1.5 rounded-full border border-slate-200/80 transition-colors"
                  title={`View all places and stories posted by ${story.userId.name}`}
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-2xs">
                    {story.userId.name[0]?.toUpperCase()}
                  </div>
                  <span>by {story.userId.name}</span>
                </Link>
              )}

            </div>

            {/* Divider */}
            <div className="h-px mb-8 bg-slate-100" />

            {/* Story text */}
            <div className="prose max-w-none text-slate-700 leading-relaxed text-base sm:text-lg whitespace-pre-wrap mb-10 font-normal">
              {story.description}
            </div>

            {/* Total Trip Cost Summary */}
            {totalCost > 0 && (
              <div className="mb-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between flex-wrap gap-2">
                <span className="text-sm font-extrabold text-emerald-900 font-outfit">Estimated Trip Budget</span>
                <span className="inline-flex items-center gap-1 text-sm font-extrabold text-emerald-800 bg-white px-4 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
                  <span className="text-emerald-600 font-bold">₹</span>
                  <span>{totalCost.toLocaleString('en-IN')} INR</span>
                </span>
              </div>
            )}

            {/* Day-by-Day Itinerary Threads */}
            {story.daysItinerary?.length > 0 ? (
              <div className="pt-4">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-outfit flex items-center gap-2">
                      <span className="p-2 rounded-2xl bg-sky-100 text-sky-600 shadow-2xs">🧵</span>
                      <span>Day-by-Day Itinerary Threads</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Interactive timeline threads with activity sub-branches & budgets in ₹</p>
                  </div>
                  <span className="text-xs font-extrabold text-sky-700 bg-sky-50 border border-sky-200/80 px-3 py-1.5 rounded-full shadow-2xs">
                    {story.daysItinerary.length} Days Threaded
                  </span>
                </div>

                {/* Main Thread Spine Container */}
                <div className="relative pl-6 sm:pl-10 space-y-10">
                  {/* Vertical Glowing Thread Spine Line */}
                  <div className="thread-spine" />

                  {story.daysItinerary.map((day, dayIdx) => (
                    <div key={dayIdx} className="relative z-10 space-y-4">
                      {/* Day Node Badge & Title */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-sky-400 text-white flex items-center justify-center font-extrabold text-sm shadow-md thread-node-glowing shrink-0 border-2 border-white">
                          D{day.dayNumber || dayIdx + 1}
                        </div>
                        <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-2.5">
                          <h4 className="text-sm sm:text-base font-extrabold text-slate-900 font-outfit tracking-tight">
                            {day.dayTitle || `Day ${dayIdx + 1}`}
                          </h4>
                          <span className="text-[11px] font-extrabold text-slate-400">
                            • {day.activities?.length || 0} Sub-threads
                          </span>
                        </div>
                      </div>

                      {/* Sub-Threads (Activity Branches) */}
                      <div className="pl-6 sm:pl-8 space-y-3.5 relative">
                        {day.activities?.map((act, actIdx) => {
                          const formattedCost = formatCostValue(act.cost);
                          return (
                            <div key={actIdx} className="relative pl-4">
                              {/* Sub-Thread Curved Branch Connector Line */}
                              <div className="sub-thread-connector" />

                              {/* Activity Thread Card */}
                              <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs thread-card-interactive flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                                  <span className="w-6 h-6 rounded-full bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5 sm:mt-0">
                                    {actIdx + 1}
                                  </span>
                                  <div className="space-y-1 min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-xs sm:text-base font-bold text-slate-900 leading-snug">
                                        {act.activityName}
                                      </span>
                                      {act.time && (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-sky-700 bg-sky-50 border border-sky-200/80 px-2.5 py-0.5 rounded-full shadow-2xs">
                                          <Clock size={11} className="text-sky-500" />
                                          <span>{act.time}</span>
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                                  <span className={`cost-badge shrink-0 ${formattedCost === '—' ? 'no-cost' : 'has-cost'}`}>
                                    {formattedCost === '—' ? '—' : (
                                      <>
                                        <span className="font-extrabold text-xs">₹</span>
                                        <span>{formattedCost}</span>
                                      </>
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : story.activities?.length > 0 && (

              <div className="pt-2">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-outfit mb-6">
                  🗓️ Activity Log
                </h3>
                <div className="activity-timeline">
                  {story.activities.map((act, i) => {
                    const formattedCost = formatCostValue(act.cost);
                    return (
                      <div key={i} className="timeline-item">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="w-7 h-7 rounded-full inline-flex items-center justify-center text-xs font-extrabold text-white shrink-0 bg-gradient-to-tr from-sky-500 via-sky-600 to-indigo-600 shadow-xs">
                              {i + 1}
                            </span>
                            <span className="text-xs sm:text-base font-bold text-slate-800 truncate">{act.activityName}</span>
                          </div>
                          <span className={`cost-badge shrink-0 ${formattedCost === '—' ? 'no-cost' : 'has-cost'}`}>
                            {formattedCost === '—' ? '—' : (
                              <>
                                <span className="font-extrabold text-xs">₹</span>
                                <span>{formattedCost}</span>
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}


            {/* Trip Photo Gallery (Up to 6 Photos) */}
            {story.imageGallery?.length > 0 && (
              <div className="mt-10 pt-6 border-t border-slate-100">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-outfit mb-4 flex items-center gap-2">
                  <span>📸 Trip Photo Gallery ({story.imageGallery.length} {story.imageGallery.length === 1 ? 'Photo' : 'Photos'})</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {story.imageGallery.map((photo, pIdx) => (
                    <div key={pIdx} className="group relative aspect-4/3 rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs bg-slate-100">
                      <img
                        src={photo}
                        alt={`Gallery ${pIdx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                        <span className="text-[11px] font-extrabold text-white">Photo {pIdx + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Free Google Maps Directions Embed Container */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm overflow-hidden mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-lg sm:text-xl font-extrabold font-outfit text-slate-900 flex items-center gap-2">
              <MapPin size={20} className="text-sky-500" />
              <span>Interactive Route Map & Directions</span>
            </h3>
            <span className="text-xs font-extrabold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full">
              Free Google Maps Route
            </span>
          </div>

          <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-slate-200 relative bg-slate-100 shadow-inner">
            <iframe
              title="Route Map Directions"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(mapSearchQuery)}&output=embed`}
            ></iframe>
          </div>
        </div>

        {/* YouTube 3 Related Place Videos Section */}
        <YouTubePlaceVideos place={story.place} />

        {/* Q&A & Doubts Comments Section below Map */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/90 shadow-sm overflow-hidden mb-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold font-outfit text-slate-900 flex items-center gap-2.5">
                <MessageSquare size={22} className="text-sky-500" />
                <span>Ask Questions & Quote Doubts</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Have a question about this trip route or budget? Ask below and get direct answers from the traveler!
              </p>
            </div>
            <span className="text-xs font-extrabold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1.5 rounded-full">
              {story.comments?.length || 0} {story.comments?.length === 1 ? 'Question' : 'Questions'}
            </span>
          </div>

          {/* Form to Post New Question / Doubt */}
          <form onSubmit={handleAddComment} className="mb-8 space-y-3">
            <div className="relative">
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder={isGuest ? "Sign up to post a question or quote your doubt..." : "Quote your doubt or ask a question about this trip..."}
                disabled={isGuest}
                rows={3}
                className="w-full p-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs sm:text-sm font-medium bg-slate-50/50 disabled:bg-slate-100 disabled:cursor-not-allowed resize-y"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingComment || isGuest || !commentText.trim()}
                className="btn-primary py-2.5 px-5 text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 disabled:opacity-50"
              >
                <Send size={14} />
                <span>{submittingComment ? 'Posting...' : 'Post Question'}</span>
              </button>
            </div>
          </form>

          {/* Comments / Doubts Threads List */}
          <div className="space-y-6">
            {!story.comments || story.comments.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <MessageSquare size={28} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs sm:text-sm font-bold text-slate-600">No questions posted yet</p>
                <p className="text-xs text-slate-400 mt-1">Be the first to quote your doubt or ask a question about this trip!</p>
              </div>
            ) : (
              story.comments.map((comment) => {
                const commentAuthorName = comment.userId?.name || 'User';
                const commentAuthorAvatar = comment.userId?.avatar;
                const isCommentByAuthor = (comment.userId?._id || comment.userId) === (story.userId?._id || story.userId);
                const isReplying = replyingCommentId === comment._id;

                return (
                  <div key={comment._id} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {commentAuthorAvatar ? (
                            <img src={commentAuthorAvatar} alt={commentAuthorName} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <span>{commentAuthorName[0]?.toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-extrabold text-slate-900">{commentAuthorName}</span>
                            {isCommentByAuthor && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-sky-600 text-white shadow-2xs">
                                Author ✈️
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-medium text-slate-400">
                            {comment.createdAt ? format(new Date(comment.createdAt), 'MMM d, yyyy • h:mm a') : 'Just now'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (isReplying) {
                            setReplyingCommentId(null);
                            setReplyText('');
                          } else {
                            setReplyingCommentId(comment._id);
                            setReplyText('');
                          }
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-extrabold text-sky-700 bg-sky-100/80 hover:bg-sky-200 transition-colors"
                      >
                        <CornerDownRight size={12} />
                        <span>{isReplying ? 'Cancel' : 'Reply'}</span>
                      </button>
                    </div>

                    {/* Question / Doubt Text */}
                    <p className="text-xs sm:text-sm text-slate-700 font-normal leading-relaxed pl-11 whitespace-pre-wrap">
                      {comment.text}
                    </p>

                    {/* Threaded Replies List */}
                    {comment.replies?.length > 0 && (
                      <div className="pl-11 space-y-3 pt-2 border-t border-slate-200/60">
                        {comment.replies.map((reply, rIdx) => {
                          const replyAuthorName = reply.userId?.name || 'User';
                          const replyAuthorAvatar = reply.userId?.avatar;
                          const isReplyByAuthor = (reply.userId?._id || reply.userId) === (story.userId?._id || story.userId);

                          return (
                            <div key={rIdx} className="p-3 rounded-xl bg-white border border-slate-200/90 space-y-1.5">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                                  {replyAuthorAvatar ? (
                                    <img src={replyAuthorAvatar} alt={replyAuthorName} className="w-full h-full object-cover rounded-full" />
                                  ) : (
                                    <span>{replyAuthorName[0]?.toUpperCase()}</span>
                                  )}
                                </div>
                                <span className="text-xs font-bold text-slate-900">{replyAuthorName}</span>
                                {isReplyByAuthor && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-sky-600 text-white">
                                    Author ✈️
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-400 ml-auto">
                                  {reply.createdAt ? format(new Date(reply.createdAt), 'MMM d, h:mm a') : 'Just now'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-700 font-normal leading-relaxed pl-8">
                                {reply.text}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Inline Reply Form */}
                    {isReplying && (
                      <div className="pl-11 pt-2 animate-fade-in space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            placeholder={`Reply to ${commentAuthorName}...`}
                            className="flex-1 p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs font-medium"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleReplyComment(comment._id)}
                            disabled={submittingReply || !replyText.trim()}
                            className="btn-primary py-2 px-4 text-xs font-extrabold inline-flex items-center gap-1 disabled:opacity-50"
                          >
                            <Send size={12} />
                            <span>{submittingReply ? 'Sending...' : 'Reply'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Edit modal */}
      {showEdit && (
        <StoryForm
          story={story}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => setStory(updated)}
        />
      )}
    </div>
  );
};

export default StoryDetailPage;





