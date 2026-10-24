import React, { useState } from 'react';
import type { ChecklistItem } from '../types';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  RotateCcw, 
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

  const handleDeleteTask = (id: string) => {
    const updated = checklist.filter((i) => i.id !== id);
    setChecklist(updated);
    localStorage.setItem('game_checklist', JSON.stringify(updated));
  };

  const handleReset = () => {
    if (window.confirm('Kontrol listesini varsayılan haline döndürmek istiyor musunuz?')) {
      setChecklist(initialChecklist);
      localStorage.setItem('game_checklist', JSON.stringify(initialChecklist));
    }
  };

  const phases: ChecklistItem['phase'][] = [
    '6 Ay Önce',
    '3 Ay Önce',
    '1 Ay Önce',
    'Çıkış Haftası',
    'Çıkış Sonrası',
  ];

  return (
    <div className="tab-pane">
      {/* 1. Progress Overview Bar */}
      <div className="checklist-summary-card">
        <div className="summary-top">
          <div>
            <h3 className="summary-title">Lansman Hazırlık Listesi</h3>
            <span className="summary-subtitle">
              {totalTasks} adımdan {completedTasks} tanesi tamamlandı (%{progressPercent})
            </span>
          </div>

          <div className="summary-actions">
            <button className="pill-btn" onClick={handleReset} title="Varsayılana Sıfırla">
              <RotateCcw size={13} /> Sıfırla
            </button>
            <button className="action-btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={14} /> Yeni Görev Ekle
            </button>
          </div>
        </div>

        {/* Clean Progress Bar */}
        <div className="simple-progress-track">
          <div 
            className="simple-progress-fill" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Filter Pills */}
        <div className="simple-filters" style={{ marginTop: '12px' }}>
          <button 
            className={`pill-btn ${filterMode === 'all' ? 'active' : ''}`}
            onClick={() => setFilterMode('all')}
          >
            Tüm Görevler ({totalTasks})
          </button>
          <button 
            className={`pill-btn ${filterMode === 'pending' ? 'active' : ''}`}
            onClick={() => setFilterMode('pending')}
          >
            Yapılacaklar ({totalTasks - completedTasks})
          </button>
          <button 
            className={`pill-btn ${filterMode === 'completed' ? 'active' : ''}`}
            onClick={() => setFilterMode('completed')}
          >
            Tamamlananlar ({completedTasks})
          </button>
        </div>
      </div>

      {/* 2. Tasks by Phase */}
      <div className="checklist-phases-wrap">
        {phases.map((phase) => {
          let items = checklist.filter((i) => i.phase === phase);
          if (filterMode === 'pending') items = items.filter((i) => !i.isDone);
          if (filterMode === 'completed') items = items.filter((i) => i.isDone);

          if (items.length === 0 && filterMode !== 'all') return null;

          const doneCount = checklist.filter((i) => i.phase === phase && i.isDone).length;
          const totalCount = checklist.filter((i) => i.phase === phase).length;

          return (
            <div key={phase} className="clean-phase-group">
              <div className="phase-title-bar">
                <h4>{phase}</h4>
                <span className="phase-badge">{doneCount}/{totalCount}</span>
              </div>

              <div className="clean-tasks-list">
                {items.map((item) => (
                  <div 
                    key={item.id} 
                    className={`clean-task-row ${item.isDone ? 'done' : ''}`}
                    onClick={() => handleToggle(item.id)}
                  >
                    <button 
                      type="button" 
                      className="task-check-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(item.id);
                      }}
                    >
                      {item.isDone ? (
                        <CheckSquare size={18} className="icon-checked" />
                      ) : (
                        <Square size={18} className="icon-unchecked" />
                      )}
                    </button>

                    <div className="task-body">
                      <div className="task-title-line">
                        <span className="task-name">{item.task}</span>
                        <span className={`priority-tag p-${item.priority.toLowerCase()}`}>
                          {item.priority}
                        </span>
                      </div>
                      <p className="task-explanation">{item.description}</p>
                    </div>

                    {item.id.startsWith('task-') && (
                      <button 
                        className="icon-del-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(item.id);
                        }}
                        title="Sil"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Task */}
      {showAddModal && (
        <div className="simple-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="simple-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h3>Yeni Lansman Görevi</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>

            <form onSubmit={handleAddTask} className="simple-form">
              <div className="input-group">
                <label>Görev Başlığı</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Örn: 20 yayıncıya e-posta at"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
              </div>

              <div className="input-group-row">
                <div className="input-group">
                  <label>Aşama</label>
                  <select 
                    value={newTaskPhase}
                    onChange={(e) => setNewTaskPhase(e.target.value as ChecklistItem['phase'])}
                  >
                    {phases.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Öncelik</label>
                  <select 
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as ChecklistItem['priority'])}
                  >
                    <option value="Kritik">Kritik</option>
                    <option value="Önemli">Önemli</option>
                    <option value="Tavsiye">Tavsiye</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Açıklama</label>
                <textarea 
                  rows={2}
                  placeholder="Detaylar veya notlar..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                />
              </div>

              <div className="modal-btn-row">
                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>İptal</button>
                <button type="submit" className="action-btn-primary">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
