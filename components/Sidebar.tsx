
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Bookmark, Settings, Home, LayoutGrid, HeartHandshake, Heart, Trophy, BookHeart, Info } from 'lucide-react';
import Logo from './Logo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-[60] bg-[#1e3a34]/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel - Right side */}
      <div 
        className={`fixed top-0 right-0 bottom-0 z-[70] w-80 max-w-[85vw] bg-[#fcfbf7] shadow-2xl border-l border-[#d4af37]/20 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Logo className="w-8 h-8" />
                    <span className="font-serif font-bold text-xl text-[#1e3a34]">Menu</span>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-stone-200 text-stone-500 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <button 
                    onClick={() => handleNavigation('/')}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                        isActive('/') 
                        ? 'bg-[#d4af37]/10 text-[#1e3a34] font-bold' 
                        : 'text-gray-600 hover:bg-stone-100'
                    }`}
                >
                    <Home className={`w-5 h-5 ${isActive('/') ? 'text-[#d4af37] fill-current' : ''}`} />
                    <span>Beranda</span>
                </button>
                
                <button 
                    onClick={() => handleNavigation('/topics')}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                        isActive('/topics') 
                        ? 'bg-[#d4af37]/10 text-[#1e3a34] font-bold' 
                        : 'text-gray-600 hover:bg-stone-100'
                    }`}
                >
                    <LayoutGrid className={`w-5 h-5 ${isActive('/topics') ? 'text-[#d4af37] fill-current' : ''}`} />
                    <span>Indeks Topik</span>
                </button>

                <button 
                    onClick={() => handleNavigation('/feelings')}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                        isActive('/feelings') 
                        ? 'bg-[#d4af37]/10 text-[#1e3a34] font-bold' 
                        : 'text-gray-600 hover:bg-stone-100'
                    }`}
                >
                    <Heart className={`w-5 h-5 ${isActive('/feelings') ? 'text-[#d4af37] fill-current' : ''}`} />
                    <span>Ayat Pelipur Lara</span>
                </button>

                <button 
                    onClick={() => handleNavigation('/quiz')}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                        isActive('/quiz') 
                        ? 'bg-[#d4af37]/10 text-[#1e3a34] font-bold' 
                        : 'text-gray-600 hover:bg-stone-100'
                    }`}
                >
                    <Trophy className={`w-5 h-5 ${isActive('/quiz') ? 'text-[#d4af37] fill-current' : ''}`} />
                    <span>Kuis & Trivia</span>
                </button>
                
                <button 
                    onClick={() => handleNavigation('/tadabbur')}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                        isActive('/tadabbur') 
                        ? 'bg-[#d4af37]/10 text-[#1e3a34] font-bold' 
                        : 'text-gray-600 hover:bg-stone-100'
                    }`}
                >
                    <BookHeart className={`w-5 h-5 ${isActive('/tadabbur') ? 'text-[#d4af37] fill-current' : ''}`} />
                    <span>Jurnal Tadabbur</span>
                </button>

                <button 
                    onClick={() => handleNavigation('/duas')}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                        isActive('/duas') 
                        ? 'bg-[#d4af37]/10 text-[#1e3a34] font-bold' 
                        : 'text-gray-600 hover:bg-stone-100'
                    }`}
                >
                    <HeartHandshake className={`w-5 h-5 ${isActive('/duas') ? 'text-[#d4af37] fill-current' : ''}`} />
                    <span>Koleksi Doa</span>
                </button>

                <button 
                    onClick={() => handleNavigation('/library')}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                        isActive('/library') 
                        ? 'bg-[#d4af37]/10 text-[#1e3a34] font-bold' 
                        : 'text-gray-600 hover:bg-stone-100'
                    }`}
                >
                    <Bookmark className={`w-5 h-5 ${isActive('/library') ? 'text-[#d4af37] fill-current' : ''}`} />
                    <span>Pustaka Saya</span>
                </button>

                <div className="my-4 border-t border-stone-100 mx-4"></div>

                <button 
                    onClick={() => handleNavigation('/settings')}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                        isActive('/settings') 
                        ? 'bg-[#d4af37]/10 text-[#1e3a34] font-bold' 
                        : 'text-gray-600 hover:bg-stone-100'
                    }`}
                >
                    <Settings className={`w-5 h-5 ${isActive('/settings') ? 'text-[#d4af37]' : ''}`} />
                    <span>Pengaturan</span>
                </button>

                <button 
                    onClick={() => handleNavigation('/about')}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                        isActive('/about') 
                        ? 'bg-[#d4af37]/10 text-[#1e3a34] font-bold' 
                        : 'text-gray-600 hover:bg-stone-100'
                    }`}
                >
                    <Info className={`w-5 h-5 ${isActive('/about') ? 'text-[#d4af37]' : ''}`} />
                    <span>Tentang Aplikasi</span>
                </button>
            </nav>

            {/* Footer */}
            <div className="p-6 bg-stone-50 border-t border-stone-100 text-center">
                <p className="text-xs text-gray-400 font-serif italic">Basirah</p>
                <p className="text-[10px] text-gray-300 mt-1">Versi 20260217</p>
            </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
