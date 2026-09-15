import { Compass } from 'lucide-react';

const EmptyState = ({ onAdd, isGuest }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in bg-white rounded-3xl border border-slate-200/90 shadow-sm max-w-lg mx-auto my-6 font-sans">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 bg-gradient-to-tr from-sky-100 via-sky-50 to-indigo-100 text-sky-600 border border-sky-200/80 shadow-md shadow-sky-500/10 shrink-0">
        <Compass size={40} className="animate-float" />
      </div>
      <h3 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight font-outfit">
        No Stories Found
      </h3>
      <p className="text-slate-500 max-w-sm mb-6 leading-relaxed text-sm font-medium">
        Start logging your travel memories! Add trip details, places visited, activities, and photos to build your travel journal.
      </p>
      {!isGuest && (
        <button onClick={onAdd} className="btn-primary shadow-md">
          <span>+ Add Your First Story</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;


