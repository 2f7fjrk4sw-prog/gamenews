import type { ChecklistItem } from '../types';

export const initialChecklist: ChecklistItem[] = [
  // 6 AY ÖNCE
  {
    id: 'chk-1',
    phase: '6 Ay Önce',
    task: 'Steam Mağaza Sayfasını Aç ve Wishlist Toplamaya Başla',
    description: 'En az 5 kaliteli ekran görüntüsü, 1 oynanış fragmanı ve türün en önemli 5 etiketini (Online Co-Op, Funny, Proximity Chat, Physics vb.) tanımla.',
    isDone: false,
    priority: 'Kritik',
  },
  {
    id: 'chk-2',
    phase: '6 Ay Önce',
    task: 'Topluluk Discord Sunucusunu Kur',
    description: 'Oyunun çekirdek kitlesi için rolleri, oyun duyuru kanalını ve geri bildirim odasını hazırla.',
    isDone: false,
    priority: 'Önemli',
  },
  {
    id: 'chk-3',
    phase: '6 Ay Önce',
    task: 'Kısa TikTok / Shorts Oynanış Klipleri Test Etmeye Başla',
    description: 'Haftada 2-3 adet komik oynanış ve geliştirici arkası klibi paylaşarak hangi mizahın tuttuğunu test et.',
    isDone: false,
    priority: 'Tavsiye',
  },

  // 3 AY ÖNCE
  {
    id: 'chk-4',
    phase: '3 Ay Önce',
    task: 'Steam Next Fest e Başvuru Yap',
    description: 'Her oyun Steam Next Fest e ömrü boyunca 1 kez katılabilir. Başvuru tarihini kaçırma!',
    isDone: false,
    priority: 'Kritik',
  },
  {
    id: 'chk-5',
    phase: '3 Ay Önce',
    task: 'Çok Oyunculu Ücretsiz Demo Sürümünü Hazırla',
    description: 'En az 2-4 arkadaşın birlikte girip 15-20 dakika kahkaha atabileceği stabil bir demo derlemesi oluştur.',
    isDone: false,
    priority: 'Kritik',
  },
  {
    id: 'chk-6',
    phase: '3 Ay Önce',
    task: 'Basın Kiti (Press Kit) Hazırla',
    description: 'Google Drive veya web sitesinde yüksek çözünürlüklü logolar, ekran görüntüleri, gifler ve 1 sayfalık bilgi bülteni oluştur.',
    isDone: false,
    priority: 'Önemli',
  },

  // 1 AY ÖNCE
  {
    id: 'chk-7',
    phase: '1 Ay Önce',
    task: 'Yayıncılara ve İçerik Üreticilerine 4-Pack Key Dağıtımı',
    description: 'Twitch ve YouTube daki co-op yayıncılarına kişiselleştirilmiş e-postalarla 4 er adet Steam Key gönder ve ambargo tarihini belirt.',
    isDone: false,
    priority: 'Kritik',
  },
  {
    id: 'chk-8',
    phase: '1 Ay Önce',
    task: 'Çıkış Tarihi Çakışma Kontrolü Yap',
    description: 'Radar ekranından aynı hafta çıkacak büyük bir Friendslop/Co-op oyunu olup olmadığını kontrol et.',
    isDone: false,
    priority: 'Kritik',
  },
  {
    id: 'chk-9',
    phase: '1 Ay Önce',
    task: 'Lansman İndirimi Oranını Belirle (%10 - %15)',
    description: 'Steam lansman indirimi ilk 7-14 gün için hem algoritmayı tetikler hem de arkadaş gruplarına toplu alım yaptırır.',
    isDone: false,
    priority: 'Önemli',
  },

  // ÇIKIŞ HAFTASI
  {
    id: 'chk-10',
    phase: 'Çıkış Haftası',
    task: 'Reddit Lansman Gönderisini Paylaş',
    description: 'r/IndieGaming ve r/gaming üzerinde hikaye formatında komik oynanış klibiyle çıkış postu at ve yorumları anında yanıtla.',
    isDone: false,
    priority: 'Kritik',
  },
  {
    id: 'chk-11',
    phase: 'Çıkış Haftası',
    task: 'Discord ve TikTok Taarruzu',
    description: 'Discord sunucusunda @everyone duyurusu geç, TikTok ta çıkış günü için hazırlanan en iyi 3 klibi peş peşe yayınla.',
    isDone: false,
    priority: 'Kritik',
  },

  // ÇIKIŞ SONRASI
  {
    id: 'chk-12',
    phase: 'Çıkış Sonrası',
    task: 'İlk 24 Saat İçinde Acil Hata Düzeltme (Hotfix) Güncellemesi',
    description: 'Multiplayer bağlantı kopmaları veya çökme sorunlarını ilk 24 saatte çözmek olumsuz incelemeleri (Steam Reviews) engeller.',
    isDone: false,
    priority: 'Kritik',
  },
  {
    id: 'chk-13',
    phase: 'Çıkış Sonrası',
    task: 'Topluluğun İstediği İlk İçerik Yol Haritasını (Roadmap) Açıkla',
    description: 'Yeni harita, yeni canavar veya yeni komik eşya takvimini paylaşarak oyunun terk edilmediğini göster.',
    isDone: false,
    priority: 'Önemli',
  },
];
