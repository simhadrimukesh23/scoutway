import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import logoImg from '../assets/logo.png';

const NotFoundPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-slate-950 text-white font-sans">
    <img src={logoImg} alt="ScoutWay" className="w-24 h-24 object-contain mb-6 drop-shadow-xl" />

    <h1 className="text-8xl font-black mb-2 tracking-tight text-white font-outfit">404</h1>
    <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 text-sky-400 font-outfit">
      Route Not Found
    </h2>
    <p className="text-slate-400 mb-8 max-w-sm text-sm leading-relaxed">
      Looks like this adventure trail doesn't exist. Let's get you back on the map!
    </p>
    <Link to="/" className="btn-primary">
      <ArrowLeft size={18} /> <span>Back to Home</span>
    </Link>
  </div>
);

export default NotFoundPage;

