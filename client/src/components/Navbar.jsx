import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, LogOut, PlusCircle } from 'lucide-react';
import logoImg from '../assets/logo.png';
import toast from 'react-hot-toast';

const Navbar = ({ searchQuery, onSearch, onAddStory }) => {
  const { user, logout, isGuest } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleAddStory = () => {
    if (isGuest) {
      toast.error('Sign up to add your travel stories!');
      navigate('/register');
      return;
    }
    if (onAddStory) {
      onAddStory();
    } else {
      navigate('/home?add=true');
    }
  };


  return (
    <header className="sticky top-0 z-50 glass shadow-xs border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2.5 shrink-0 group">
            <img
              src={logoImg}
              alt="ScoutWay Logo"
              className="w-10 h-10 object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-xs"
            />
            <span className="font-extrabold text-xl hidden xs:inline-block tracking-tight font-outfit bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 bg-clip-text text-transparent">
              ScoutWay
            </span>
          </Link>



          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-1 sm:mx-3">
            <div className="relative flex items-center">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search stories, places, routes..."
                value={searchQuery || ''}
                onChange={(e) => onSearch?.(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-100/90 border border-slate-200 rounded-2xl focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15 transition-all outline-none"
              />
            </div>
          </div>

          {/* Actions & Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {!isGuest && (
              <button onClick={handleAddStory} className="btn-primary text-xs sm:text-sm py-2 px-3 sm:px-4 shadow-xs">
                <PlusCircle size={16} />
                <span className="hidden sm:inline font-extrabold">Add Story</span>
              </button>
            )}

            {/* User Profile Badge Span */}
            <div className="inline-flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-sky-400 shrink-0" />
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-2xs">
                  {user?.name?.[0]?.toUpperCase() || 'G'}
                </div>
              )}
              <span className="text-xs sm:text-sm font-bold text-slate-800 hidden md:block max-w-[120px] truncate">
                {isGuest ? 'Guest' : user?.name}
              </span>
            </div>

            <button onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center"
              title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;



