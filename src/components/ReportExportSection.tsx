import React, { useState, useMemo, useRef } from 'react';
import type { CompetitorGame, ChecklistItem } from '../types';
import { initialSocialTemplates } from '../data/socialTemplates';
import { pitchTemplates } from './../data/pitchTemplates';
import { steamFestivals } from '../data/steamFestivals';
import { 
  FileText, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  Upload, 
  Gamepad2
} from 'lucide-react';

interface ReportExportSectionProps {
  myGameTitle: string;
  setMyGameTitle: (title: string) => void;
  targetDate: string;
  setTargetDate: (date: string) => void;
  competitors: CompetitorGame[];
  setCompetitors: React.Dispatch<React.SetStateAction<CompetitorGame[]>>;
  checklist: ChecklistItem[];
  setChecklist: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
  criticalCollisionsCount: number;
  checklistProgress: number;
}

export const ReportExportSection: React.FC<ReportExportSectionProps> = ({
  myGameTitle,
  setMyGameTitle,
  targetDate,
  setTargetDate,
  competitors,
  setCompetitors,
  checklist,
  setChecklist,
  criticalCollisionsCount,
  checklistProgress,
}) => {
  // Report inclusion toggles
  const [includeOverview, setIncludeOverview] = useState(true);
  const [includeRadar, setIncludeRadar] = useState(true);
  const [includeChecklist, setIncludeChecklist] = useState(true);
  const [includeChecklistGuides, setIncludeChecklistGuides] = useState(true);
  const [includeSocial, setIncludeSocial] = useState(true);
  const [includePitch, setIncludePitch] = useState(true);
  const [includeFestivals, setIncludeFestivals] = useState(true);

  // Status feedback
  const [copied, setCopied] = useState(false);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [reportDate] = useState(() => new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }));
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compile Markdown Document
  const markdownContent = useMemo(() => {
    const getDiffDays = (dateStr: string) => {
      const compTime = new Date(dateStr).getTime();
      const myTime = new Date(targetDate).getTime();
      return Math.round((compTime - myTime) / (1000 * 60 * 60 * 24));
    };

    const lines: string[] = [];

    lines.push(`# 🎮 ${myGameTitle} — Steam Lansman & Pazarlama Raporu`);
    lines.push(`> **Rapor Oluşturma Tarihi:** ${reportDate} | **Platform:** Steam (PC) | **Hedef Tür:** Friendslop & Online Co-Op`);
    lines.push(``);

    // 1. Overview
    if (includeOverview) {
      lines.push(`## 📌 1. Lansman Genel Bakış`);
      lines.push(`- **Oyun Başlığı:** ${myGameTitle}`);
      lines.push(`- **Hedeflenen Çıkış Tarihi:** ${targetDate}`);
      lines.push(`- **Lansman Hazırlık Derecesi:** %${checklistProgress} Tamamlandı`);
      lines.push(`- **Kritik Çakışma Durumu:** ${criticalCollisionsCount > 0 ? `🚨 ${criticalCollisionsCount} Kritik Çakışma Tespit Edildi!` : `✅ Güvenli Çıkış Penceresi`}`);
      lines.push(``);
    }

    // 2. Competitor Radar
    if (includeRadar) {
      lines.push(`## 📡 2. Steam Rakip Çıkış Radarı & Çakışma Analizi`);
      lines.push(`Hedef tarihinize göre Steam pazarındaki benzer oyunların çıkış zamanlaması:`);
      lines.push(``);
      lines.push(`| Oyun Adı | Geliştirici | Çıkış Tarihi | Gün Farkı | İstek Listesi Seviyesi | Risk Durumu |`);
      lines.push(`| :--- | :--- | :--- | :--- | :--- | :--- |`);

      competitors.forEach((c) => {
        const diff = getDiffDays(c.releaseDate);
        const diffText = diff === 0 ? 'Aynı Gün' : diff > 0 ? `+${diff} gün` : `${diff} gün`;
        const absDiff = Math.abs(diff);
        const isHighTier = c.wishlistTier === 'Very High (100k+)' || c.wishlistTier === 'High (50k-100k)';
        const risk = absDiff <= 7 && isHighTier ? '🚨 Kritik Çakışma' : absDiff <= 14 ? '⚠️ Orta Risk' : '🟢 Güvenli';

        lines.push(`| **${c.title}** | ${c.developer} | ${c.releaseDate} | ${diffText} | ${c.wishlistTier} | ${risk} |`);
      });
      lines.push(``);
    }

    // 3. Roadmap & Checklist
    if (includeChecklist) {
      lines.push(`## ✅ 3. Lansman Kontrol Listesi & Yol Haritası`);
      const completedCount = checklist.filter((i) => i.isDone).length;
      lines.push(`*Toplam İlerleme: ${completedCount}/${checklist.length} (%${checklistProgress})*`);
      lines.push(``);

      const phases: ChecklistItem['phase'][] = [
        '6 Ay Önce',
        '3 Ay Önce',
        '1 Ay Önce',
        'Çıkış Haftası',
        'Çıkış Sonrası',
      ];

      phases.forEach((phase) => {
        const items = checklist.filter((i) => i.phase === phase);
        if (items.length > 0) {
          lines.push(`### ⏳ ${phase}`);
          items.forEach((item) => {
            const mark = item.isDone ? '[x]' : '[ ]';
            lines.push(`- ${mark} **${item.task}** (${item.priority})`);
            lines.push(`  - *Özet:* ${item.description}`);

            if (includeChecklistGuides && item.howTo) {
              lines.push(`  - *Adım Adım Yapılış:*`);
              item.howTo.steps.forEach((st, sIdx) => {
                lines.push(`    ${sIdx + 1}. ${st}`);
              });
              if (item.howTo.proTip) {
                lines.push(`    - 💡 **Püf Noktası:** ${item.howTo.proTip}`);
              }
              if (item.howTo.toolsOrLinks) {
                lines.push(`    - 🛠 **Araç / Platform:** ${item.howTo.toolsOrLinks}`);
              }
            }
          });
          lines.push(``);
        }
      });
    }

    // 4. Social Media
    if (includeSocial) {
      lines.push(`## 📱 4. Instagram & TikTok Viral Kanca (Hook) Planı`);
      lines.push(`Friendslop türü için ilk 3 saniyede etkileşim alan kısa video kurguları:`);
      lines.push(``);

      initialSocialTemplates.forEach((tpl) => {
        lines.push(`### 🎬 ${tpl.title} (${tpl.platform})`);
        lines.push(`- **Ekrandaki İlk Yazı:** "${tpl.hookText.replace(/\[Oyun Adı\]/g, myGameTitle)}"`);
        lines.push(`- **Önerilen Ses / Audio:** ${tpl.audioIdea}`);
        lines.push(`- **Kurgu Senaryosu:**`);
        tpl.videoScenario.split('\n').forEach((sc) => {
          lines.push(`  ${sc}`);
        });
        lines.push(`- **Gönderi Açıklaması:**`);
        lines.push(`> ${tpl.captionTemplate.replace(/\[Oyun Adı\]/g, myGameTitle).replace(/\[Fiyat\]/g, '6.99').split('\n').join('\n> ')}`);
        lines.push(`- **Hashtagler:** ${tpl.hashtags.join(' ')}`);
        lines.push(``);
      });
    }

    // 5. Pitch Templates
    if (includePitch) {
      lines.push(`## ✉️ 5. İçerik Üreticisi & Basın İletişim Şablonları`);
      pitchTemplates.slice(0, 3).forEach((tpl) => {
        lines.push(`### 📨 ${tpl.title}`);
        lines.push(`**Konu:** ${tpl.subject.replace(/\[Oyununuzun Adı\]/g, myGameTitle).replace(/\[Oyun Adı\]/g, myGameTitle)}`);
        lines.push(``);
        lines.push(`\`\`\``);
        lines.push(
          tpl.templateBody
            .replace(/\[Oyununuzun Adı\]/g, myGameTitle)
            .replace(/\[Oyun Adı\]/g, myGameTitle)
            .replace(/\[Fiyat\]/g, '6.99')
        );
        lines.push(`\`\`\``);
        lines.push(``);
      });
    }

    // 6. Steam Festivals
    if (includeFestivals) {
      lines.push(`## 🎪 6. Resmi Steam Festivalleri & İndirim Takvimi`);
      steamFestivals.forEach((f) => {
        lines.push(`- **${f.name}** (${f.startDate} - ${f.endDate})`);
        lines.push(`  - *Tür:* ${f.type} | *Etki:* ${f.impactLevel}`);
        lines.push(`  - *Geliştirici Tavsiyesi:* ${f.developerAction}`);
      });
      lines.push(``);
    }

    lines.push(`---`);
    lines.push(`*Bu rapor GameLaunch Radar platformu tarafından otomatik derlenmiştir.*`);

    return lines.join('\n');
  }, [
    myGameTitle,
    targetDate,
    reportDate,
    checklistProgress,
    criticalCollisionsCount,
    competitors,
    checklist,
    includeOverview,
    includeRadar,
    includeChecklist,
    includeChecklistGuides,
    includeSocial,
    includePitch,
    includeFestivals,
  ]);

  // Copy to clipboard
  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Markdown file (.md)
  const handleDownloadMarkdown = () => {
    const filename = `${myGameTitle.replace(/[^a-zA-Z0-9_\u00C0-\u017F-]/g, '_')}_Lansman_Raporu.md`;
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Trigger browser print to PDF
  const handlePrintPDF = () => {
    window.print();
  };

  // Export full JSON Backup
  const handleExportJSON = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      myGameTitle,
      targetDate,
      competitors,
      checklist,
    };

    const filename = `${myGameTitle.replace(/[^a-zA-Z0-9_\u00C0-\u017F-]/g, '_')}_Yedek.json`;
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import JSON Backup
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.myGameTitle) setMyGameTitle(parsed.myGameTitle);
        if (parsed.targetDate) setTargetDate(parsed.targetDate);
        if (Array.isArray(parsed.competitors)) {
          setCompetitors(parsed.competitors);
          localStorage.setItem('game_competitors', JSON.stringify(parsed.competitors));
        }
        if (Array.isArray(parsed.checklist)) {
          setChecklist(parsed.checklist);
          localStorage.setItem('game_checklist', JSON.stringify(parsed.checklist));
        }
        setBackupStatus('✅ Yedek başarıyla geri yüklendi!');
        setTimeout(() => setBackupStatus(null), 3000);
      } catch {
        setBackupStatus('❌ Geçersiz yedek dosyası!');
        setTimeout(() => setBackupStatus(null), 3000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="tab-pane">
      {/* 1. Header Banner & Actions */}
      <div className="clean-config-card no-print">
        <div className="config-inputs-row" style={{ justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} style={{ color: '#58a6ff' }} />
              Lansman Raporu & Dışa Aktarma Merkezi
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Tüm rakip analizlerini, görevleri, TikTok kancalarını ve şablonları tek tıkla PDF, Markdown veya JSON yedeği olarak kaydedin.
            </p>
          </div>

          <div className="summary-actions" style={{ gap: '8px', flexWrap: 'wrap' }}>
            <button className="pill-btn" onClick={handlePrintPDF} title="Tarayıcı yazdırma ekranını açarak PDF olarak kaydetmenizi sağlar">
              <Printer size={14} /> PDF Olarak Yazdır
            </button>
            <button className="pill-btn" onClick={handleCopyMarkdown}>
              {copied ? <Check size={14} style={{ color: '#3fb950' }} /> : <Copy size={14} />}
              {copied ? 'Kopyalandı!' : 'Markdown Kopyala'}
            </button>
            <button className="action-btn-primary" onClick={handleDownloadMarkdown}>
              <Download size={14} /> .md İndir
            </button>
          </div>
        </div>

        {/* Backup & Restore Bar */}
        <div className="backup-toolbar">
          <span className="backup-label">💾 Veri Yedekleme:</span>
          <button className="pill-btn" onClick={handleExportJSON} title="Oyun verilerini JSON olarak bilgisayarınıza indirir">
            <Download size={13} /> JSON Yedek İndir
          </button>
          <button className="pill-btn" onClick={() => fileInputRef.current?.click()} title="Daha önce indirilen JSON yedeğini geri yükler">
            <Upload size={13} /> Yedek Geri Yükle
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept=".json"
            onChange={handleImportJSON} 
          />
          {backupStatus && <span className="backup-status-text">{backupStatus}</span>}
        </div>
      </div>

      {/* 2. Options Panel (Checkboxes for what to include) */}
      <div className="report-options-card no-print">
        <span className="options-title">Rapora Dahil Edilecek Bölümler:</span>
        <div className="options-grid">
          <label className="checkbox-option">
            <input 
              type="checkbox" 
              checked={includeOverview} 
              onChange={(e) => setIncludeOverview(e.target.checked)} 
            />
            <span>Genel Bakış & Durum</span>
          </label>

          <label className="checkbox-option">
            <input 
              type="checkbox" 
              checked={includeRadar} 
              onChange={(e) => setIncludeRadar(e.target.checked)} 
            />
            <span>Rakip Radarı & Çakışma Tablosu</span>
          </label>

          <label className="checkbox-option">
            <input 
              type="checkbox" 
              checked={includeChecklist} 
              onChange={(e) => setIncludeChecklist(e.target.checked)} 
            />
            <span>Lansman Kontrol Listesi</span>
          </label>

          <label className="checkbox-option" style={{ paddingLeft: '14px' }}>
            <input 
              type="checkbox" 
              disabled={!includeChecklist}
              checked={includeChecklistGuides && includeChecklist} 
              onChange={(e) => setIncludeChecklistGuides(e.target.checked)} 
            />
            <span style={{ fontSize: '12px', color: includeChecklist ? 'var(--text-main)' : 'var(--text-muted)' }}>
              ↳ Görevlerin Adım Adım Yapılış Kılavuzları
            </span>
          </label>

          <label className="checkbox-option">
            <input 
              type="checkbox" 
              checked={includeSocial} 
              onChange={(e) => setIncludeSocial(e.target.checked)} 
            />
            <span>Instagram & TikTok Kanca Planı</span>
          </label>

          <label className="checkbox-option">
            <input 
              type="checkbox" 
              checked={includePitch} 
              onChange={(e) => setIncludePitch(e.target.checked)} 
            />
            <span>Yayıncı & Basın Şablonları</span>
          </label>

          <label className="checkbox-option">
            <input 
              type="checkbox" 
              checked={includeFestivals} 
              onChange={(e) => setIncludeFestivals(e.target.checked)} 
            />
            <span>Steam Festivalleri Takvimi</span>
          </label>
        </div>
      </div>

      {/* 3. Printable & Preview Report Container */}
      <div className="print-report-container" id="printable-launch-report">
        {/* Printable Cover Header */}
        <div className="report-print-header">
          <div className="report-print-brand">
            <Gamepad2 size={24} style={{ color: '#58a6ff' }} />
            <div>
              <h2>{myGameTitle} — Steam Lansman & Pazarlama Raporu</h2>
              <span className="report-meta">
                Hedef Çıkış: <strong>{targetDate}</strong> | Tür: <strong>Friendslop & Online Co-Op</strong> | Durum: <strong>%{checklistProgress} Hazır</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Markdown Render Area */}
        <div className="report-markdown-preview">
          <pre className="markdown-pre">{markdownContent}</pre>
        </div>
      </div>
    </div>
  );
};
