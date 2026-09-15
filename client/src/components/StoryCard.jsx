import { useState } from 'react';
import { Heart, MapPin, Calendar, Navigation, ArrowRight, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { likeStory } from '../services/api';
import toast from 'react-hot-toast';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&q=80',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&auto=format&q=80',
  'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&auto=format&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&q=80',
];

const StoryCard = ({ story, onLikeUpdate }) => {
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();
  const [likes, setLikes] = useState(story.likes?.length || 0);
  const [liked, setLiked] = useState(story.likes?.includes(user?._id));
  const [liking, setLiking] = useState(false);

  // Cover image fallback hierarchy: coverImage -> imageGallery[0] -> FALLBACK_IMAGES
  const coverImg = story.coverImage ||
    (story.imageGallery && story.imageGallery.length > 0 ? story.imageGallery[0] : null) ||
    FALLBACK_IMAGES[story._id ? story._id.charCodeAt(0) % FALLBACK_IMAGES.length : 0] ||
    FALLBACK_IMAGES[0];

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isGuest) { toast.error('Sign up to like stories!'); return; }
    if (liking) return;
    setLiking(true);
    try {
      const res = await likeStory(story._id);
      setLikes(res.data.likes);
      setLiked(res.data.liked);
      onLikeUpdate?.(story._id, res.data.likes);
    } catch {
      toast.error('Failed to like story');
    } finally {
      setLiking(false);
    }
  };

  // Calculate total trip cost
  let totalCost = 0;
  const parseCost = (costStr) => {
    if (!costStr || costStr === '-') return 0;
    const num = Math.abs(parseFloat(String(costStr).replace(/[^0-9.]/g, '')));
    return isNaN(num) ? 0 : num;
  };


  if (story.daysItinerary?.length) {
    story.daysItinerary.forEach((day) => {
      day.activities?.forEach((act) => {
        totalCost += parseCost(act.cost);
      });
    });
  } else if (story.activities?.length) {
    story.activities.forEach((act) => {
      totalCost += parseCost(act.cost);
    });
  }

  // Days count calculation for YouTube-style duration tag
  let totalDays = 1;
  if (story.daysItinerary?.length) {
    totalDays = story.daysItinerary.length;
  } else if (story.tripStartDate && story.tripEndDate) {
    const s = new Date(story.tripStartDate);
    const e = new Date(story.tripEndDate);
    if (!isNaN(s) && !isNaN(e) && e >= s) {
      totalDays = Math.max(1, Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1);
    }
  }

  const handleAuthorClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const uId = story.userId?._id || story.userId;
    if (uId) {
      onLikeUpdate?.('AUTHOR_FILTER', { userId: uId, name: story.userId?.name });
      navigate(`/home?userId=${uId}&authorName=${encodeURIComponent(story.userId?.name || '')}`);
    }
  };

  const authorName = story.userId?.name || 'Traveler';
  const authorAvatar = story.userId?.avatar;
  const authorInitial = authorName[0]?.toUpperCase() || 'T';

  return (
    <Link to={`/story/${story._id}`} className="block h-full group">
      <article className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 border border-slate-200/80 flex flex-col h-full hover:-translate-y-1">
        {/* Cover Image Container — YouTube 16:9 Widescreen aspect ratio */}
        <div className="relative overflow-hidden bg-slate-900 shrink-0 w-full aspect-video">
          <img
            src={coverImg}
            alt={story.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = FALLBACK_IMAGES[0];
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80" />

          {/* Like button overlay */}
          <button
            onClick={handleLike}
            className={`absolute top-2.5 right-2.5 p-2 rounded-full shadow-md backdrop-blur-md transition-all duration-300 hover:scale-110 flex items-center justify-center z-10
              ${liked ? 'bg-red-500/90 border border-red-400 text-white shadow-red-500/20' : 'bg-slate-900/60 text-white border border-white/30 hover:bg-slate-900/90'}
            `}
            title={liked ? 'Unlike' : 'Like'}
          >
            <Heart
              size={14}
              className={`transition-all ${liked ? 'fill-white text-white' : ''}`}
            />
          </button>

          {/* Total Trip Cost Badge on Top-Left */}
          {totalCost > 0 && (
            <div className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-950/85 backdrop-blur-md text-emerald-300 text-[11px] font-extrabold border border-emerald-500/30 shadow-xs">
              <span>₹{totalCost.toLocaleString('en-IN')}</span>
            </div>
          )}

          {/* YouTube Duration-Style Badge (Bottom Right) */}
          <div className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950/90 backdrop-blur-sm text-white text-[11px] font-extrabold tracking-wide border border-white/20">
            <Clock size={10} className="text-sky-400" />
            <span>{totalDays} {totalDays === 1 ? 'Day' : 'Days'}</span>
          </div>
        </div>

        {/* Card Metadata Body — YouTube Channel Video Style */}
        <div className="p-3.5 sm:p-4 flex flex-col flex-1 bg-white justify-between space-y-3">
          <div className="flex gap-3 items-start">
            {/* Author Circle Avatar (YouTube Channel Icon Style) */}
            <div
              onClick={handleAuthorClick}
              className="w-9 h-9 rounded-full overflow-hidden shrink-0 mt-0.5 border border-slate-200 shadow-2xs hover:ring-2 hover:ring-sky-500 transition-all cursor-pointer bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold"
              title={`View stories by ${authorName}`}
            >
              {authorAvatar ? (
                <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
              ) : (
                <span>{authorInitial}</span>
              )}
            </div>

            {/* Video-style Details Column */}
            <div className="min-w-0 flex-1">
              <h3
                className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug line-clamp-2 group-hover:text-sky-600 transition-colors font-outfit mb-1"
                title={story.title}
              >
                {story.title}
              </h3>

              {/* Author Channel Name */}
              <div
                onClick={handleAuthorClick}
                className="text-xs font-semibold text-slate-500 hover:text-sky-600 transition-colors truncate cursor-pointer flex items-center gap-1"
              >
                <span>{authorName}</span>
              </div>

              {/* Stats Line: Destination + Dates */}
              <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400 mt-1 flex-wrap">
                <span className="inline-flex items-center gap-1 text-slate-600 font-extrabold">
                  <MapPin size={11} className="text-sky-500" />
                  <span className="truncate max-w-[120px]">{story.place}</span>
                </span>
                <span>•</span>
                <span>{story.tripStartDate ? format(new Date(story.tripStartDate), 'MMM yyyy') : ''}</span>
              </div>
            </div>
          </div>

          {/* Footer Bar: Route & Likes count */}
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px]">
            <div className="inline-flex items-center gap-1 text-slate-500 font-semibold truncate max-w-[70%]">
              {story.fromPlace ? (
                <>
                  <Navigation size={11} className="shrink-0 text-sky-500" />
                  <span className="truncate">{story.fromPlace}</span>
                  <ArrowRight size={9} className="shrink-0 text-slate-400" />
                  <span className="truncate">{story.place}</span>
                </>
              ) : (
                <>
                  <MapPin size={11} className="shrink-0 text-sky-500" />
                  <span className="truncate">{story.place}</span>
                </>
              )}
            </div>

            <div className="inline-flex items-center gap-1 text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
              <Heart size={11} className={liked ? 'fill-red-500 text-red-500' : 'text-slate-400'} />
              <span>{likes}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default StoryCard;





