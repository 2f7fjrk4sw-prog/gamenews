import React, { useState } from 'react';
import type { ChecklistItem } from '../types';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  RotateCcw, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  Wrench, 
  ListOrdered 
} from 'lucide-react';
import { initialChecklist } from '../data/launchChecklist';

interface ChecklistSectionProps {
  checklist: ChecklistItem[];
  setChecklist: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
}

export const ChecklistSection: React.FC<ChecklistSectionProps> = ({ checklist, setChecklist }) => {
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'completed'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New task form
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPhase, setNewTaskPhase] = useState<ChecklistItem['phase']>('1 Ay Önce');
  const [newTaskPriority, setNewTaskPriority] = useState<ChecklistItem['priority']>('Önemli');
  const [newTaskSteps, setNewTaskSteps] = useState('');
  const [newTaskProTip, setNewTaskProTip] = useState('');

  const totalTasks = checklist.length;
  const completedTasks = checklist.filter((item) => item.isDone).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Toggle item done
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

  // Toggle expand guide
  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Add task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const stepsArray = newTaskSteps
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const newItem: ChecklistItem = {
      id: `task-${Date.now()}`,
      task: newTaskTitle.trim(),
      description: newTaskDesc.trim() || 'Özel lansman görevi.',
      phase: newTaskPhase,
      priority: newTaskPriority,
      isDone: false,
      howTo: stepsArray.length > 0 || newTaskProTip ? {
        steps: stepsArray.length > 0 ? stepsArray : ['Görevi tamamlayın ve kontrol listesinden işaretleyin.'],
        proTip: newTaskProTip || 'Önemli detayları Discord ve ekibinizle paylaşın.',
      } : undefined,
    };

    const updated = [...checklist, newItem];
    setChecklist(updated);
    localStorage.setItem('game_checklist', JSON.stringify(updated));

    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskSteps('');
    setNewTaskProTip('');
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
            <h3 className="summary-title">Lansman Yol Haritası & Kontrol Listesi</h3>
            <span className="summary-subtitle">
              {totalTasks} adımdan {completedTasks} tanesi tamamlandı (%{progressPercent}) — Her maddenin detaylı yapılış rehberini altındaki butondan açabilirsiniz.
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
                <span className="phase-badge">{doneCount}/{totalCount} Tamamlandı</span>
              </div>

              <div className="clean-tasks-list">
                {items.map((item) => {
                  const isExpanded = expandedId === item.id;

                  return (
                    <div 
                      key={item.id} 
                      className={`clean-task-row-container ${item.isDone ? 'done' : ''}`}
                    >
                      <div 
                        className="clean-task-row"
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

                        {/* Guide Toggle Button */}
                        {item.howTo && (
                          <button 
                            className={`guide-expand-btn ${isExpanded ? 'active' : ''}`}
                            onClick={(e) => toggleExpand(item.id, e)}
                            title="Nasıl yapılacağına dair adım adım kılavuz"
                          >
                            <span>{isExpanded ? 'Rehberi Kapat' : 'Nasıl Yapılır?'}</span>
                            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </button>
                        )}

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

                      {/* Expandable Step-by-Step How-To Guide */}
                      {isExpanded && item.howTo && (
                        <div className="task-how-to-guide">
                          <div className="guide-steps-section">
                            <div className="guide-section-header">
                              <ListOrdered size={14} className="guide-icon blue" />
                              <span>Adım Adım Yapılış Kılavuzu:</span>
                            </div>
                            <ol className="guide-steps-list">
                              {item.howTo.steps.map((step, sIdx) => (
                                <li key={sIdx}>{step}</li>
                              ))}
                            </ol>
                          </div>

                          {item.howTo.proTip && (
                            <div className="guide-protip-box">
                              <Lightbulb size={14} className="guide-icon amber" />
                              <div>
                                <strong>Püf Noktası:</strong> {item.howTo.proTip}
                              </div>
                            </div>
                          )}

                          {item.howTo.toolsOrLinks && (
                            <div className="guide-tools-box">
                              <Wrench size={13} className="guide-icon cyan" />
                              <span>Gereken Araç / Platform: <strong>{item.howTo.toolsOrLinks}</strong></span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
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
              <h3>Yeni Lansman Görevi Ekle</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>

            <form onSubmit={handleAddTask} className="simple-form">
              <div className="input-group">
                <label>Görev Başlığı *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Örn: 30 Twitch yayıncısına e-posta at"
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
                <label>Kısa Açıklama</label>
                <input 
                  type="text"
                  placeholder="Bu görevin 1 cümlelik özeti..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Nasıl Yapılır? (Her satıra bir adım yazın)</label>
                <textarea 
                  rows={3}
                  placeholder={`1. Adım: Yayıncı listesini aç\n2. Adım: Şablonu kopyala\n3. Adım: 4 adet Steam key ekle`}
                  value={newTaskSteps}
                  onChange={(e) => setNewTaskSteps(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Püf Noktası (Pro Tip)</label>
                <input 
                  type="text"
                  placeholder="Örn: Asla tek key verme, 4 key gönder."
                  value={newTaskProTip}
                  onChange={(e) => setNewTaskProTip(e.target.value)}
                />
              </div>

              <div className="modal-btn-row">
                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>İptal</button>
                <button type="submit" className="action-btn-primary">Görevi Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
