import { ArrowRight, Calendar, CheckCircle2, CircleDashed, Clock, GraduationCap, Music, Pause, Plus, StickyNote, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const App = () => {
  // State untuk tugas dan catatan
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('skripsi_tasks');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', title: 'Cari 5 Jurnal Referensi Bab 2', status: 'todo', dueDate: '2026-04-05' },
      { id: '2', title: 'Revisi latar belakang masalah', status: 'doing', dueDate: '2026-04-02' },
      { id: '3', title: 'Konsultasi Judul dengan Dospem', status: 'done', dueDate: null }
    ];
  });

  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('skripsi_notes');
    return saved || 'Catatan Dospem:\n- Persempit ruang lingkup\n- Perbanyak sitasi dari 3 tahun terakhir\n- JANGAN MENUNDA LAGI!';
  });

  const [newTaskInput, setNewTaskInput] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  
  // Audio Player State (Hardcoded Lofi Track)
  const [isPlaying, setIsPlaying] = useState(false);
  const audioSrc = "/public/music/lofi.mp3";
  const audioRef = useRef(null);

  // Simpan ke localStorage setiap ada perubahan
  useEffect(() => {
    localStorage.setItem('skripsi_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('skripsi_notes', notes);
  }, [notes]);

  // Mencoba Autoplay saat komponen dimuat (Seringkali diblokir oleh browser modern)
  useEffect(() => {
    const attemptAutoplay = async () => {
      if (audioRef.current) {
        audioRef.current.volume = 0.4;
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          // Browser memblokir autoplay tanpa interaksi pengguna. Ini adalah perilaku standar.
          console.warn("Autoplay diblokir oleh browser. Pengguna harus mengklik play secara manual.", error);
          setIsPlaying(false);
        }
      }
    };
    
    // Memberikan sedikit jeda sebelum mencoba memutar
    const timer = setTimeout(attemptAutoplay, 1000);
    return () => clearTimeout(timer);
  }, []);

  const addTask = (e) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    
    const newTask = {
      id: Date.now().toString(),
      title: newTaskInput.trim(),
      status: 'todo',
      dueDate: newTaskDate || null
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskInput('');
    setNewTaskDate('');
  };

  const moveTask = (id, newStatus) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, status: newStatus } : task
    ));
  };

  const updateTaskDate = (id, newDate) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, dueDate: newDate || null } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.volume = 0.4;
      audioRef.current.play().catch(e => console.error("Audio play failed:", e));
    }
    setIsPlaying(!isPlaying);
  };

  const columns = [
    { id: 'todo', title: 'Belum Dikerjakan', icon: <CircleDashed size={20} />, color: 'bg-pink-300' },
    { id: 'doing', title: 'Sedang Berjalan', icon: <Clock size={20} />, color: 'bg-yellow-300' },
    { id: 'done', title: 'Selesai!', icon: <CheckCircle2 size={20} />, color: 'bg-green-300' }
  ];

  return (
    <div className="min-h-screen bg-blue-50 p-4 md:p-8 font-sans text-black selection:bg-yellow-300 selection:text-black">
      
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef} 
        src={audioSrc} 
        loop 
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Header */}
      <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex w-full md:w-auto items-center justify-between md:justify-start gap-4 bg-white border-4 border-black p-4 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-300 border-4 border-black rounded-full p-2 hidden sm:block">
              <GraduationCap size={40} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-black uppercase tracking-wider">Tracker Skripsi</h1>
              <p className="font-bold text-gray-700 text-sm md:text-base">Ayookk semangaaatt, Calon S.Kom 2027</p>
            </div>
          </div>
          
          {/* Music Player Controls */}
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleAudio}
              className={`flex items-center justify-center gap-2 border-4 border-black rounded-xl p-2 px-4 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] transition-all ${isPlaying ? 'bg-pink-400 text-white' : 'bg-green-300 text-black'}`}
              title={isPlaying ? "Jeda Musik" : "Putar Musik Lofi"}
            >
              {isPlaying ? (
                <>
                  <Pause size={20} fill="currentColor" /> <span className="text-sm hidden sm:inline">Jeda</span>
                </>
              ) : (
                <>
                  <Music size={20} /> <span className="text-sm hidden sm:inline">Putar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Form Tambah Tugas */}
        <form onSubmit={addTask} className="w-full md:w-auto flex flex-col md:flex-row gap-2">
          <input
            type="text"
            value={newTaskInput}
            onChange={(e) => setNewTaskInput(e.target.value)}
            placeholder="Tugas baru apa hari ini?"
            className="flex-1 md:w-64 bg-white border-4 border-black rounded-xl p-3 font-bold placeholder-gray-500 focus:outline-none focus:bg-pink-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors"
          />
          <input
            type="date"
            value={newTaskDate}
            onChange={(e) => setNewTaskDate(e.target.value)}
            className="bg-white border-4 border-black rounded-xl p-3 font-bold focus:outline-none focus:bg-pink-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors"
          />
          <button 
            type="submit"
            className="bg-blue-500 hover:bg-blue-400 text-white border-4 border-black rounded-xl p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center"
          >
            <Plus size={24} strokeWidth={3} />
          </button>
        </form>
      </header>

      {/* Main Content: Kanban & Notes */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Kanban Board (3 Columns) */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map(col => (
            <div key={col.id} className="flex flex-col gap-4">
              {/* Column Header */}
              <div className={`${col.color} border-4 border-black rounded-xl p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between`}>
                <h2 className="font-black text-lg uppercase flex items-center gap-2">
                  {col.icon} {col.title}
                </h2>
                <span className="bg-white border-2 border-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                  {tasks.filter(t => t.status === col.id).length}
                </span>
              </div>

              {/* Task List */}
              <div className="flex flex-col gap-4 min-h-[200px]">
                {tasks.filter(t => t.status === col.id).map(task => (
                  <div key={task.id} className="bg-white border-4 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group flex flex-col gap-3 transition-transform hover:-translate-y-1">
                    <div className="flex flex-col gap-1">
                      <p className="font-bold text-lg leading-tight">{task.title}</p>
                      <div className="flex items-center gap-1 bg-gray-100 border-2 border-black w-fit rounded-md px-1 mt-1 hover:bg-pink-100 focus-within:bg-pink-100 transition-colors">
                        <Calendar size={12} className="text-gray-700" />
                        <input
                          type="date"
                          value={task.dueDate || ''}
                          onChange={(e) => updateTaskDate(task.id, e.target.value)}
                          className="bg-transparent text-xs font-bold outline-none cursor-pointer p-0.5 w-[110px]"
                          title="Ubah Tanggal Tenggat"
                        />
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center justify-between mt-auto pt-2 border-t-2 border-gray-200 border-dashed">
                      <div className="flex gap-2">
                        {col.id !== 'todo' && (
                          <button 
                            onClick={() => moveTask(task.id, col.id === 'done' ? 'doing' : 'todo')}
                            className="bg-gray-100 hover:bg-gray-200 border-2 border-black rounded-lg p-1.5 transition-colors"
                            title="Kembalikan status"
                          >
                            <ArrowRight size={16} className="rotate-180" />
                          </button>
                        )}
                        {col.id !== 'done' && (
                          <button 
                            onClick={() => moveTask(task.id, col.id === 'todo' ? 'doing' : 'done')}
                            className="bg-green-300 hover:bg-green-400 border-2 border-black rounded-lg p-1.5 transition-colors"
                            title="Majukan status"
                          >
                            <ArrowRight size={16} />
                          </button>
                        )}
                      </div>
                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors border-2 border-transparent hover:border-red-500 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Hapus tugas"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                
                {tasks.filter(t => t.status === col.id).length === 0 && (
                  <div className="border-4 border-dashed border-gray-300 rounded-xl p-6 flex items-center justify-center text-gray-400 font-bold text-center">
                    Kosong
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Sticky Notes Area */}
        <div className="lg:col-span-1">
          <div className="bg-yellow-200 border-4 border-black rounded-2xl p-0 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col h-[500px]">
            <div className="bg-yellow-400 border-b-4 border-black p-3 flex items-center gap-2">
              <StickyNote size={20} />
              <h2 className="font-black text-lg uppercase">Brain Dump</h2>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tulis ide acak, saran dosen, atau daftar pustaka sementara di sini..."
              className="flex-1 w-full bg-transparent p-4 font-medium text-lg resize-none focus:outline-none focus:bg-yellow-100/50 transition-colors leading-relaxed"
              style={{
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(0,0,0,0.1) 31px, rgba(0,0,0,0.1) 32px)',
                backgroundAttachment: 'local',
                lineHeight: '32px'
              }}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;