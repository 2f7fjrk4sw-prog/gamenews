import React, { useState } from 'react';
import type { ChecklistItem } from '../types';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  RotateCcw, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Trash2
} from 'lucide-react';
import { initialChecklist } from '../data/launchChecklist';

interface ChecklistSectionProps {
  checklist: ChecklistItem[];
  setChecklist: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
}

export const ChecklistSection: React.FC<ChecklistSectionProps> = ({ checklist, setChecklist }) => {
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'completed'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New task form
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPhase, setNewTaskPhase] = useState<ChecklistItem['phase']>('1 Ay Önce');
  const [newTaskPriority, setNewTaskPriority] = useState<ChecklistItem['priority']>('Önemli');

  // Stats
  const totalTasks = checklist.length;
  const completedTasks = checklist.filter((item) => item.isDone).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Toggle item
  const handleToggle = (id: string) => {
    const updated = checklist.map((item) => {
      if (item.id === id) {
        return { ...item, isDone: !item.isDone };
      }
      return item;
    });
    setChecklist(updated);
    localStorage.setItem('game_checklist', JSON.stringify(updated));
  };

  // Add task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newItem: ChecklistItem = {
      id: `task-${Date.now()}`,
      task: newTaskTitle.trim(),
      description: newTaskDesc.trim() || 'Özel lansman görevi.',
      phase: newTaskPhase,
      priority: newTaskPriority,
      isDone: false,
    };

    const updated = [...checklist, newItem];
    setChecklist(updated);
    localStorage.setItem('game_checklist', JSON.stringify(updated));

    setNewTaskTitle('');
    setNewTaskDesc('');
    setShowAddModal(false);
  };

  // Delete task
  const handleDeleteTask = (id: string) => {
    const updated = checklist.filter((i) => i.id !== id);
    setChecklist(updated);
    localStorage.setItem('game_checklist', JSON.stringify(updated));
  };

  // Reset to initial
  const handleReset = () => {
    if (window.confirm('Kontrol listesini varsayılan haline döndürmek istiyor musunuz?')) {
      setChecklist(initialChecklist);
      localStorage.setItem('game_checklist', JSON.stringify(initialChecklist));
    }
  };

  // Phases in order
  const phases: ChecklistItem['phase'][] = [
    '6 Ay Önce',
    '3 Ay Önce',
    '1 Ay Önce',
    'Çıkış Haftası',
    'Çıkış Sonrası',
  ];

  return (
    <section className="section-container">
      {/* Overall Progress Banner */}
      <div className="checklist-progress-card">
        <div className="progress-top-row">
          <div>
            <div className="progress-badge">
              <Sparkles size={14} /> LANSMAN HAZIRLIK DERECESİ
            </div>
            <h2 className="progress-title">
              {progressPercent === 100
                ? '🎉 TEBRİKLER! OYUNUNUZ RESMEN LANSMANA HAZIR!'
                : progressPercent >= 60
                ? '🔥 Harika İlerleme! Lansman hazırlıkları hızla tamamlanıyor.'
                : '🚀 Lansman Yolculuğu Başladı! Kritik adımları tek tek tamamlayın.'}
            </h2>
            <p className="progress-subtitle">
              Toplam <strong>{totalTasks}</strong> görevden <strong>{completedTasks}</strong> tanesi tamamlandı.
            </p>
          </div>

          <div className="progress-stat-ring">
            <span className="stat-percentage">{progressPercent}%</span>
            <span className="stat-label">Tamamlandı</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar-track">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="checklist-actions-bar">
          <div className="filter-chips-row">
            <button 
              className={`filter-chip ${filterMode === 'all' ? 'active' : ''}`}
              onClick={() => setFilterMode('all')}
            >
              Tüm Görevler ({totalTasks})
            </button>
            <button 
              className={`filter-chip ${filterMode === 'pending' ? 'active' : ''}`}
              onClick={() => setFilterMode('pending')}
            >
              Kalanlar ({totalTasks - completedTasks})
            </button>
            <button 
              className={`filter-chip ${filterMode === 'completed' ? 'active' : ''}`}
              onClick={() => setFilterMode('completed')}
            >
              Tamamlananlar ({completedTasks})
            </button>
          </div>

          <div className="action-buttons-group">
            <button className="btn-secondary" onClick={handleReset} title="Varsayılana Sıfırla">
              <RotateCcw size={15} /> Sıfırla
            </button>
            <button className="btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> Yeni Görev Ekle
            </button>
          </div>
        </div>
      </div>

      {/* Phase Groups */}
      <div className="phase-groups-container">
        {phases.map((phase) => {
          let itemsInPhase = checklist.filter((item) => item.phase === phase);

          if (filterMode === 'pending') {
            itemsInPhase = itemsInPhase.filter((item) => !item.isDone);
          } else if (filterMode === 'completed') {
            itemsInPhase = itemsInPhase.filter((item) => item.isDone);
          }

          if (itemsInPhase.length === 0 && filterMode !== 'all') return null;

          const phaseCompleted = checklist.filter((i) => i.phase === phase && i.isDone).length;
          const phaseTotal = checklist.filter((i) => i.phase === phase).length;

          return (
            <div key={phase} className="phase-card">
              <div className="phase-header">
                <div className="phase-title-row">
                  <Clock size={18} className="phase-icon" />
                  <h3 className="phase-name">{phase}</h3>
                  <span className="phase-progress-pill">
                    {phaseCompleted} / {phaseTotal} Tamamlandı
                  </span>
                </div>
              </div>

              <div className="tasks-list">
                {itemsInPhase.map((item) => (
                  <div 
                    key={item.id} 
                    className={`task-row ${item.isDone ? 'task-done' : ''}`}
                    onClick={() => handleToggle(item.id)}
                  >
                    <button 
                      type="button" 
                      className={`task-checkbox-btn ${item.isDone ? 'checked' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(item.id);
                      }}
                    >
                      {item.isDone ? (
                        <CheckCircle2 size={20} className="checkbox-icon checked" />
                      ) : (
                        <Square size={20} className="checkbox-icon" />
                      )}
                    </button>

                    <div className="task-content">
                      <div className="task-title-row">
                        <span className="task-title">{item.task}</span>
                        <span className={`priority-badge priority-${item.priority.toLowerCase()}`}>
                          {item.priority === 'Kritik' && '🔴 Kritik'}
                          {item.priority === 'Önemli' && '🟡 Önemli'}
                          {item.priority === 'Tavsiye' && '🟢 Tavsiye'}
                        </span>
                      </div>
                      <p className="task-desc">{item.description}</p>
                    </div>

                    {item.id.startsWith('task-') && (
                      <button 
                        className="delete-task-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(item.id);
                        }}
                        title="Görevi Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}

                {itemsInPhase.length === 0 && (
                  <div className="empty-phase-note">
                    Bu aşamada görüntülenecek görev yok.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Task */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <CheckSquare size={22} className="modal-icon" />
                <h3>Yeni Lansman Görevi Ekle</h3>
              </div>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>

            <form onSubmit={handleAddTask} className="modal-form">
              <div className="form-group">
                <label>Görev Başlığı *</label>
                <input 
                  type="text" 
                  required 
                  className="form-input"
                  placeholder="Örn: Twitch yayıncıları için özel avatar filtreleri hazırla"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Zaman Aşaması</label>
                  <select 
                    className="form-select"
                    value={newTaskPhase}
                    onChange={(e) => setNewTaskPhase(e.target.value as ChecklistItem['phase'])}
                  >
                    {phases.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Öncelik Derecesi</label>
                  <select 
                    className="form-select"
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as ChecklistItem['priority'])}
                  >
                    <option value="Kritik">🔴 Kritik</option>
                    <option value="Önemli">🟡 Önemli</option>
                    <option value="Tavsiye">🟢 Tavsiye</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Görev Açıklaması & Notlar</label>
                <textarea 
                  className="form-textarea"
                  rows={3}
                  placeholder="Bu görevin detayları, linkleri veya dikkat edilecek hususlar..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  İptal
                </button>
                <button type="submit" className="btn-primary">
                  Görevi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
