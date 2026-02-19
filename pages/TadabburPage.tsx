
import React, { useState, useEffect } from 'react';
import { BookHeart, Plus, Save, Trash2, X, PenTool, Calendar, Loader2 } from 'lucide-react';
import * as DB from '../services/db'; // Use DB directly
import { TadabburData, TadabburTag } from '../types';
import ConfirmationModal from '../components/ConfirmationModal';

const TAGS: { id: TadabburTag; label: string; color: string }[] = [
    { id: 'syukur', label: 'Syukur', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
    { id: 'sabar', label: 'Sabar', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
    { id: 'istighfar', label: 'Istighfar', color: 'bg-stone-200 text-stone-600 dark:bg-slate-600 dark:text-slate-300' },
    { id: 'doa', label: 'Doa', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
    { id: 'ibrah', label: 'Ibrah/Pelajaran', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
    { id: 'umum', label: 'Refleksi Umum', color: 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300' },
];

const TadabburPage: React.FC = () => {
    const [entries, setEntries] = useState<TadabburData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    
    // Editor State
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedTag, setSelectedTag] = useState<TadabburTag>('umum');

    // Modal State
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        loadEntries();
    }, []);

    const loadEntries = async () => {
        setIsLoading(true);
        try {
            const data = await DB.getAllTadabbur();
            setEntries(data);
        } catch (error) {
            console.error("Failed to load journal", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenEditor = (entry?: TadabburData) => {
        if (entry) {
            setCurrentId(entry.id);
            setTitle(entry.title);
            setContent(entry.content);
            setSelectedTag(entry.tag);
        } else {
            setCurrentId(null);
            setTitle('');
            setContent('');
            setSelectedTag('umum');
        }
        setIsEditorOpen(true);
    };

    const handleSave = async () => {
        if (!title.trim() && !content.trim()) return;

        const newEntry: TadabburData = {
            id: currentId || Date.now().toString(),
            title: title || 'Tanpa Judul',
            content,
            tag: selectedTag,
            timestamp: currentId ? entries.find(e => e.id === currentId)?.timestamp || Date.now() : Date.now()
        };

        await DB.saveTadabbur(newEntry);
        await loadEntries(); // Reload to update UI
        setIsEditorOpen(false);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            await DB.deleteTadabbur(deleteId);
            await loadEntries();
            if (isEditorOpen) setIsEditorOpen(false);
            setDeleteId(null);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in min-h-screen pb-24 relative">
            
            {/* Header Area */}
            <div className="mb-10 text-center">
                 <div className="inline-block p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-4 border border-stone-100 dark:border-slate-700">
                    <BookHeart className="w-8 h-8 text-quran-dark dark:text-white" />
                 </div>
                 <h2 className="text-3xl font-bold text-quran-dark dark:text-gray-100 font-serif mb-2">Jurnal Tadabbur</h2>
                 <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-sm italic">
                     "Ikatlah ilmu dengan tulisan. Renungkan ayat-Nya, dan abadikan hikmah yang menyentuh hatimu."
                 </p>
            </div>

            {/* Content State */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-quran-gold" />
                </div>
            ) : entries.length === 0 ? (
                <div className="text-center py-16 bg-white/50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-stone-200 dark:border-slate-700">
                    <PenTool className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 dark:text-gray-500 text-sm">Belum ada catatan tadabbur.</p>
                    <button 
                        onClick={() => handleOpenEditor()}
                        className="mt-4 px-5 py-2 bg-quran-gold text-white rounded-xl text-sm font-bold shadow-lg shadow-quran-gold/20 hover:bg-yellow-500 transition-all"
                    >
                        Mulai Menulis
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {entries.map(entry => {
                        const tagInfo = TAGS.find(t => t.id === entry.tag) || TAGS[5];
                        const date = new Date(entry.timestamp);

                        return (
                            <div 
                                key={entry.id} 
                                onClick={() => handleOpenEditor(entry)}
                                className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-slate-700 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-quran-dark opacity-10 group-hover:opacity-100 transition-opacity"></div>
                                
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${tagInfo.color}`}>
                                        {tagInfo.label}
                                    </span>
                                    <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-xs">
                                        <Calendar className="w-3 h-3" />
                                        <span>{date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-gray-800 dark:text-white font-serif mb-2 line-clamp-1 group-hover:text-quran-gold transition-colors">
                                    {entry.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3 font-serif opacity-80">
                                    {entry.content}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Floating Action Button */}
            <button 
                onClick={() => handleOpenEditor()}
                className="fixed bottom-6 right-6 md:right-10 w-14 h-14 bg-quran-dark dark:bg-quran-gold text-white dark:text-quran-dark rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-40 border-2 border-white dark:border-slate-800"
            >
                <Plus className="w-8 h-8" />
            </button>

            {/* Editor Modal */}
            {isEditorOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-stone-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsEditorOpen(false)}
                    />
                    
                    <div className="relative bg-[#fcfbf7] dark:bg-slate-900 w-full max-w-2xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in border border-white/20">
                        
                        {/* Toolbar */}
                        <div className="px-6 py-4 border-b border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-between items-center">
                            <h3 className="font-serif font-bold text-gray-800 dark:text-white">
                                {currentId ? 'Edit Jurnal' : 'Tulis Jurnal Baru'}
                            </h3>
                            <div className="flex gap-2">
                                {currentId && (
                                    <button 
                                        onClick={() => setDeleteId(currentId)}
                                        className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Hapus"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                                <button 
                                    onClick={() => setIsEditorOpen(false)}
                                    className="p-2 text-gray-400 dark:text-gray-500 hover:bg-stone-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Editor Area */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                            <input 
                                type="text" 
                                placeholder="Judul Renungan..."
                                className="w-full text-2xl md:text-3xl font-serif font-bold bg-transparent border-none focus:ring-0 placeholder-gray-300 dark:placeholder-gray-600 text-quran-dark dark:text-white mb-6 p-0"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />

                            {/* Tags Selection */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {TAGS.map(tag => (
                                    <button
                                        key={tag.id}
                                        onClick={() => setSelectedTag(tag.id)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                                            selectedTag === tag.id 
                                            ? 'bg-quran-gold text-white border-quran-gold' 
                                            : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-stone-200 dark:border-slate-700 hover:border-quran-gold/50'
                                        }`}
                                    >
                                        {tag.label}
                                    </button>
                                ))}
                            </div>

                            <textarea 
                                className="w-full h-[50vh] bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-200 font-serif text-lg leading-loose resize-none p-0 placeholder-gray-300 dark:placeholder-gray-600"
                                placeholder="Tuliskan apa yang Anda rasakan, pelajari, atau syukuri hari ini..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            ></textarea>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-white dark:bg-slate-800 border-t border-stone-200 dark:border-slate-700 flex justify-end">
                            <button 
                                onClick={handleSave}
                                className="px-6 py-3 bg-quran-dark dark:bg-quran-gold text-white dark:text-quran-dark rounded-xl font-bold flex items-center gap-2 hover:bg-quran-dark/90 dark:hover:bg-quran-gold/90 shadow-lg"
                            >
                                <Save className="w-4 h-4" /> Simpan
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            <ConfirmationModal 
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Hapus Catatan?"
                message="Catatan tadabbur yang dihapus tidak dapat dikembalikan lagi. Anda yakin?"
                confirmText="Hapus"
                variant="danger"
            />

        </div>
    );
};

export default TadabburPage;
