import { Link } from 'react-router-dom';
import { ArrowRight, Star, Globe, Compass, BookOpen, ChevronDown, Sparkles, Shield, TrendingUp, Map } from 'lucide-react';
import logoImg from '../assets/logo.png';


const HERO_BG = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&auto=format&q=85';
const FEATURE_IMAGES = [
  { img: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&auto=format&q=80', title: 'Swiss Alps Trail', location: 'Switzerland' },
  { img: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&auto=format&q=80', title: 'Kyoto Bamboo Forest', location: 'Japan' },
  { img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&q=80', title: 'Patagonia Peaks', location: 'Argentina' },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white font-sans overflow-x-hidden">
      {/* ===== Navigation ===== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logoImg} alt="ScoutWay Logo" className="w-10 h-10 object-contain group-hover:scale-105 transition-transform drop-shadow-md" />
            <span className="text-2xl font-extrabold tracking-tight text-white font-outfit">
              ScoutWay
            </span>
          </Link>



          <div className="flex items-center gap-3">
            <Link to="/login"
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all">
              Login
            </Link>
            <Link to="/register"
              className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-md shadow-sky-500/25 transition-all">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* ===== Hero Section ===== */}
      <section className="relative min-h-screen flex items-center justify-center pt-28 pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Background image & gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img src={HERO_BG} alt="Travel scenery" className="w-full h-full object-cover opacity-80 scale-105" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/90 to-slate-950" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-sky-500/15 rounded-full blur-[120px] pointer-events-none" />
        </div>


        <div className="relative z-10 max-w-4xl mx-auto text-center my-auto flex flex-col items-center justify-center">
          {/* Badge Span */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-sky-300 text-xs sm:text-sm font-medium mb-8 backdrop-blur-xl">
            <Sparkles size={14} className="text-sky-400 shrink-0" />
            <span className="leading-none">Your Personal Travel Journal</span>
          </div>




          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-tight mb-6 font-outfit">
            Capture Your{' '}
            <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent block sm:inline mt-1 sm:mt-0">
              Journeys
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
            Record every adventure from departure to destination. Share your travel stories, track costs, and inspire fellow explorers around the world.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md sm:max-w-none mx-auto mb-16 w-full sm:w-auto">
            <Link to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-base text-white bg-gradient-to-r from-sky-500 via-sky-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-xl shadow-sky-500/25 transition-all flex items-center justify-center gap-2 group cursor-pointer">
              <span>Start Your Journey</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-base text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 backdrop-blur-md transition-all flex items-center justify-center cursor-pointer shadow-lg">
              Sign In
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto w-full">
            {[
              { value: '1,000+', label: 'Stories Shared' },
              { value: '50+', label: 'Countries Visited' },
              { value: '500+', label: 'Active Explorers' },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-900/70 border border-slate-800/90 backdrop-blur-xl rounded-2xl p-5 text-center shadow-lg">
                <div className="text-2xl sm:text-3xl font-extrabold text-sky-400 mb-1 font-outfit">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-slate-400 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden sm:block z-10">
          <a href="#features" className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors">
            <span className="text-[10px] font-extrabold tracking-widest uppercase">Explore</span>
            <ChevronDown size={18} className="animate-bounce text-sky-400" />
          </a>
        </div>
      </section>

      {/* ===== Features Section ===== */}
      <section id="features" className="py-20 sm:py-28 px-4 sm:px-8 bg-slate-900/60 border-t border-slate-800/80 relative">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-950/80 border border-sky-500/30 text-sky-400 text-xs font-extrabold uppercase tracking-wider mb-4">
              <BookOpen size={14} className="text-sky-400" />
              <span>Core Features</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 font-outfit">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                Document Adventures
              </span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
              From departure to destination, ScoutWay helps you capture every moment, track every cost, and share every story.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
            {[
              {
                icon: <Map size={28} className="text-sky-400" />,
                title: 'Journey Logging',
                desc: 'Record trips from origin to destination with day-by-day activity threads and detailed cost tracking per activity.',
              },
              {
                icon: <Globe size={28} className="text-teal-400" />,
                title: 'Open Discovery',
                desc: 'Browse a public feed of travel stories shared by adventurers worldwide. Filter by date, search by destination.',
              },
              {
                icon: <Star size={28} className="text-indigo-400" />,
                title: 'Save & Engage',
                desc: 'Like stories that inspire you, build your reading list, and connect with a community of passionate travelers.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-3xl p-8 shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-6 shadow-inner">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 font-outfit">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== How It Works ===== */}
      <section className="py-20 sm:py-28 px-4 sm:px-8 bg-slate-950 border-t border-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 flex flex-col items-center">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 font-outfit">
              How It Works
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto text-base">Three simple steps to start journaling your adventures</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
            {[
              {
                step: 'STEP 01',
                icon: <Shield size={24} className="text-sky-400" />,
                title: 'Create Account',
                desc: 'Sign up with email or Google. It takes 30 seconds to get started.',
              },
              {
                step: 'STEP 02',
                icon: <Compass size={24} className="text-teal-400" />,
                title: 'Add Your Journey',
                desc: 'Log your trip details — from origin to destination, activities, costs, and your narrative.',
              },
              {
                step: 'STEP 03',
                icon: <TrendingUp size={24} className="text-indigo-400" />,
                title: 'Share & Discover',
                desc: 'Publish your story to the feed. Browse and like stories from travelers worldwide.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-center shadow-xl relative overflow-hidden flex flex-col items-center">
                <span className="inline-block px-3 py-1 rounded-full bg-sky-950 border border-sky-800 text-sky-400 text-xs font-mono font-bold mb-5">
                  {item.step}
                </span>
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2.5 font-outfit">
                  {item.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Gallery Section ===== */}
      <section className="py-20 px-4 sm:px-8 bg-slate-900/40 border-t border-slate-800/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 flex flex-col items-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 font-outfit">
              Stories From Around the World
            </h2>
            <p className="text-slate-400 text-base">See what other travelers are sharing</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {FEATURE_IMAGES.map((item, i) => (
              <div key={i} className="group relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800 aspect-[4/3]">
                <img src={item.img} alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-sky-400 block mb-1">{item.location}</span>
                  <h4 className="text-lg font-extrabold text-white font-outfit">{item.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA Banner ===== */}
      <section className="py-20 px-4 sm:px-8 bg-slate-950 border-t border-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border border-sky-500/30 rounded-3xl p-8 sm:p-14 text-center shadow-2xl relative overflow-hidden flex flex-col items-center">
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 font-outfit">
              Ready to Start?
            </h2>
            <p className="text-slate-300 max-w-md mx-auto text-base sm:text-lg mb-8 leading-relaxed">
              Create an account and start preserving your memories. Every trip tells a story — make yours count.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto w-full sm:w-auto">
              <Link to="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-base text-white bg-gradient-to-r from-sky-500 via-sky-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-xl shadow-sky-500/30 transition-all flex items-center justify-center gap-2 group cursor-pointer">
                <span>Get Started Free</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-base text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-all flex items-center justify-center cursor-pointer shadow-md">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="py-8 px-4 sm:px-8 bg-slate-950 border-t border-slate-900 text-slate-400 text-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src={logoImg} alt="ScoutWay" className="w-8 h-8 object-contain drop-shadow-xs" />
            <span className="font-extrabold text-white text-base font-outfit">ScoutWay</span>
          </div>


          <p className="text-slate-400 text-xs sm:text-sm">
            © {new Date().getFullYear()} ScoutWay — <em>Where every trip becomes a story.</em>
          </p>

          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-white transition-colors text-xs sm:text-sm font-semibold">Login</Link>
            <Link to="/register" className="hover:text-white transition-colors text-xs sm:text-sm font-semibold">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

