import type { ChecklistItem } from '../types';

export const initialChecklist: ChecklistItem[] = [
  // 6 AY ÖNCE
  {
    id: 'chk-1',
    phase: '6 Ay Önce',
    task: 'Steam Mağaza Sayfasını Aç ve Wishlist Toplamaya Başla',
    description: 'En az 5 kaliteli ekran görüntüsü, 1 oynanış fragmanı ve türün en önemli 5 etiketini tanımlayarak sayfayı aç.',
    isDone: false,
    priority: 'Kritik',
    howTo: {
      steps: [
        'Steamworks geliştirici paneline giriş yapın (partner.steamgames.com) ve $100 app fee yatırın.',
        'En az 5 adet 1920x1080 oyun içi ekran görüntüsü yükleyin (Arayüz açık, kaotik oynanış anları olmalı).',
        '30-45 saniyelik, doğrudan oynanış gösteren hızlı kesilmiş bir teaser fragman ekleyin.',
        'En kritik 5 etiketi seçin: Online Co-Op, Proximity Voice, Comedy, Physics, Multiplayer.',
        'Sayfayı Valve incelemesine gönderin (3-5 iş günü sürer) ve onay gelince "Coming Soon" olarak herkese açın.',
      ],
      proTip: 'Mağaza sayfanız açılmadan hiçbir platformda reklam yapmayın; gelen tüm trafiğin tek amacı Steam İstek Listesi (Wishlist) toplamaktır.',
      toolsOrLinks: 'Steamworks Developer Portal (partner.steamgames.com)',
    },
  },
  {
    id: 'chk-2',
    phase: '6 Ay Önce',
    task: 'Topluluk Discord Sunucusunu Kur',
    description: 'Oyunun çekirdek kitlesi için rolleri, oyun duyuru kanalını ve geri bildirim odasını hazırla.',
    isDone: false,
    priority: 'Önemli',
    howTo: {
      steps: [
        'Discord\'da sade bir sunucu açın: #duyurular, #oyun-hakkında, #öneri-ve-bug, #oyun-ses-odaları (1-4 Kişilik).',
        'Geliştirici arkası (devlog) paylaşımları için #geliştirici-günlüğü odası oluşturun.',
        'Kalıcı sunucu davet linkini Steam mağaza açıklamasına ve TikTok/Instagram bio kısmına ekleyin.',
        'İlk katılan 50 oyuncuya özel "Öncü Testçi (VIP Tester)" rolü verin.',
      ],
      proTip: 'Sunucuyu çok karmaşık kanallarla doldurmayın; oyuncular geliştiriciyle doğrudan sohbet etmek ve oynayacak arkadaş bulmak ister.',
      toolsOrLinks: 'Discord Desktop / Web',
    },
  },
  {
    id: 'chk-3',
    phase: '6 Ay Önce',
    task: 'Kısa TikTok / Shorts Oynanış Klipleri Test Etmeye Başla',
    description: 'Haftada 2-3 adet komik oynanış ve geliştirici arkası klibi paylaşarak hangi mizahın tuttuğunu test et.',
    isDone: false,
    priority: 'Tavsiye',
    howTo: {
      steps: [
        'OBS ile oyunu 1080x1920 dikey çözünürlükte kaydedin veya 1080p videoyu CapCut ile 9:16 oranına kırpın.',
        'İntro veya logo koymayın; ilk 2 saniyede bir oyuncunun arkadaşını uçuruma atması veya yakınlık sesli çığlığıyla başlayın.',
        'Ekranın ortasına renkli ve kelime kelime ekranda patlayan altyazılar yerleştirin.',
        'Haftada en az 3 video paylaşarak hangi formatın organik etkileşim aldığını keşfedin.',
      ],
      proTip: 'Sitemizdeki "Instagram & TikTok" sekmesindeki hazır kanca (hook) senaryolarını birebir video şablonu olarak kullanabilirsiniz.',
      toolsOrLinks: 'CapCut / Premiere Pro, OBS Studio',
    },
  },

  // 3 AY ÖNCE
  {
    id: 'chk-4',
    phase: '3 Ay Önce',
    task: 'Steam Next Fest\'e Başvuru Yap',
    description: 'Her oyun Steam Next Fest\'e ömrü boyunca 1 kez katılabilir. Başvuru tarihini kaçırma!',
    isDone: false,
    priority: 'Kritik',
    howTo: {
      steps: [
        'Steamworks -> Etkinlikler (Events) sayfasına gidin.',
        'Sıradaki Steam Next Fest dönemini seçin (Şubat, Haziran veya Ekim edisyonları).',
        'Katılım şartlarını kontrol edin: Mağaza sayfanız açık olmalı ve festivalden 2-3 hafta önce çalışan bir demo yüklenmiş olmalıdır.',
        'Festival takvimindeki resmi canlı yayın tarih ve saatini planlayın.',
      ],
      proTip: 'Next Fest hakkı her oyun için ömründe SADECE 1 KEZDİR! Oyununuz henüz çok ham ve çökmeler varsa başvuruyu bir sonraki festivale erteleyin.',
      toolsOrLinks: 'Steamworks Events Tab',
    },
  },
  {
    id: 'chk-5',
    phase: '3 Ay Önce',
    task: 'Çok Oyunculu Ücretsiz Demo Sürümünü Hazırla',
    description: 'En az 2-4 arkadaşın birlikte girip 15-20 dakika kahkaha atabileceği stabil bir demo derlemesi oluştur.',
    isDone: false,
    priority: 'Kritik',
    howTo: {
      steps: [
        'Demoyu 15-20 dakikalık 1 tam maç / kaçış görevi ile sınırlandırın.',
        '2-4 oyuncunun Steam üzerinden birbirini doğrudan davet edebildiği (Steam P2P/Lobby) sistemi test edin.',
        'Demo bitiş ekranına devasa ve tıklanabilir bir "Tam Sürümü Steam\'de İstek Listesine Ekle!" butonu koyun.',
        'Discord sunucunuzdaki çekirdek ekiple en az 10 maçlık çok oyunculu bağlantı stres testi yapın.',
      ],
      proTip: 'Demo asla çok uzun olmamalıdır; arkadaş grubunda "hemen tam sürümü alıp sabaha kadar oynamalıyız" açlığı bırakmalıdır.',
      toolsOrLinks: 'Steamworks Build & Depots Panel',
    },
  },
  {
    id: 'chk-6',
    phase: '3 Ay Önce',
    task: 'Basın Kiti (Press Kit) Hazırla',
    description: 'Google Drive veya web sitesinde yüksek çözünürlüklü logolar, ekran görüntüleri, gifler ve bilgi bülteni oluştur.',
    isDone: false,
    priority: 'Önemli',
    howTo: {
      steps: [
        'Google Drive\'da herkese açık bir "OyunAdı_PressKit" klasörü oluşturun.',
        'İçine: Şeffaf PNG logolar, 10 adet 4K ekran görüntüsü, 5 adet komik oynanış GIF\'i koyun.',
        '1 sayfalık PDF veya Word bilgi bülteni ekleyin: Oyunun türü, fiyatı, çıkış tarihi ve 1 cümlelik kilit mekaniği.',
        'Bu klasörün linkini Steam mağaza sayfanıza ve basın e-postalarınıza ekleyin.',
      ],
      proTip: 'E-postalarınıza asla büyük zip dosyaları eklemeyin; editörler tek tıkla açabileceği doğrudan Drive linklerini tercih eder.',
      toolsOrLinks: 'Google Drive / presskit() by Rami Ismail',
    },
  },

  // 1 AY ÖNCE
  {
    id: 'chk-7',
    phase: '1 Ay Önce',
    task: 'Yayıncılara ve İçerik Üreticilerine 4-Pack Key Dağıtımı',
    description: 'Twitch ve YouTube\'daki co-op yayıncılarına kişiselleştirilmiş e-postalarla 4\'er adet Steam Key gönder.',
    isDone: false,
    priority: 'Kritik',
    howTo: {
      steps: [
        'Twitch ve YouTube\'da Lethal Company, Phasmophobia, Content Warning oynayan en az 40 yayıncı belirleyin.',
        'Steamworks panelinden "Release State Overrides / Beta Key" talebinde bulunun.',
        'Sitemizdeki "Pitch & E-Posta" sekmesindeki 4-Pack Streamer şablonunu kullanın.',
        'Her yayıncıya ekibiyle oynaması için 4 adet Steam Key ve ambargo tarihini (videoları yayınlayabilecekleri tarih) iletin.',
      ],
      proTip: 'Friendslop oyunları tek kişi oynanmaz; tek key alan yayıncı oyunu genellikle açmaz. Mutlaka arkadaşlarıyla oynayabileceği 4 key verin.',
      toolsOrLinks: 'Sitemizdeki Pitch & E-Posta Sekmesi / Keymailer',
    },
  },
  {
    id: 'chk-8',
    phase: '1 Ay Önce',
    task: 'Çıkış Tarihi Çakışma Kontrolü Yap',
    description: 'Radar ekranından aynı hafta çıkacak büyük bir Friendslop/Co-op oyunu olup olmadığını kontrol et.',
    isDone: false,
    priority: 'Kritik',
    howTo: {
      steps: [
        'Sitemizdeki "Rakip Radarı" sekmesine gidin ve hedef tarihinizi girin.',
        'Çıkış haftanızla çakışan 50k+ istek listeli rakip bir oyun olup olmadığını kontrol edin.',
        'Sitemizdeki "Rehber" sekmesinden o hafta büyük bir Steam İndirimi (Mevsimsel İndirim) olup olmadığını teyit edin.',
        'Eğer çakışma varsa lansman tarihinizi 1-2 hafta ileri veya geri kaydırın.',
      ],
      proTip: 'Steam için en ideal lansman günleri Salı ve Perşembe öğleden sonradır (TR saatiyle 20:00). Cuma günü teknik destek zorlaşabileceği için kaçının.',
      toolsOrLinks: 'Sitemizdeki Rakip Radarı Sekmesi',
    },
  },
  {
    id: 'chk-9',
    phase: '1 Ay Önce',
    task: 'Lansman İndirimi Oranını Belirle (%10 - %15)',
    description: 'Steam lansman indirimi ilk 7-14 gün için hem algoritmayı tetikler hem de arkadaş gruplarına toplu alım yaptırır.',
    isDone: false,
    priority: 'Önemli',
    howTo: {
      steps: [
        'Steamworks -> Fiyatlandırma ve İndirimler (Pricing & Discounts) sekmesine girin.',
        '"Custom Discount" bölümünden "Launch Discount" seçeneğini işaretleyin.',
        '%10 veya %15 oranını seçin ve süreyi 7 ila 14 gün olarak belirleyin.',
        'Değişiklikleri kaydedip Valve onayına gönderin.',
      ],
      proTip: 'Lansman indirimi, oyununuzu istek listesine eklemiş binlerce kişiye Steam tarafından otomatik "İstek listenizdeki oyun indirimde!" e-postası gitmesini sağlar.',
      toolsOrLinks: 'Steamworks Pricing Panel',
    },
  },

  // ÇIKIŞ HAFTASI
  {
    id: 'chk-10',
    phase: 'Çıkış Haftası',
    task: 'Reddit Lansman Gönderisini Paylaş',
    description: 'r/IndieGaming ve r/coopgaming üzerinde hikaye formatında komik oynanış klibiyle çıkış postu at ve yorumları yanıtla.',
    isDone: false,
    priority: 'Kritik',
    howTo: {
      steps: [
        'Lansman anında r/IndieGaming, r/coopgaming ve r/playmygame topluluklarına gidin.',
        'Sitemizdeki "Pitch & E-Posta" sekmesindeki Reddit Samimi Hikaye şablonunu kullanın.',
        'Oyunun en komik 20-30 saniyelik klibini doğrudan Reddit video player ile yükleyin (asla harici YouTube linki vermeyin).',
        'Gelen tüm sorulara ilk 2 saat içinde samimi ve esprili yanıtlar verin (Reddit algoritması ilk 2 saatteki etkileşimi ana sayfaya çıkarır).',
      ],
      proTip: 'Kurumsal reklam dili Reddit\'te linç edilir; "3 arkadaş geceleri boş zamanlarımızda yaptık" gibi samimi bir indie hikayesi anlatın.',
      toolsOrLinks: 'reddit.com/r/IndieGaming, reddit.com/r/coopgaming',
    },
  },
  {
    id: 'chk-11',
    phase: 'Çıkış Haftası',
    task: 'Discord ve TikTok Taarruzu',
    description: 'Discord sunucusunda @everyone duyurusu geç, TikTok\'ta hazırlanan en iyi 3 klibi peş peşe yayınla.',
    isDone: false,
    priority: 'Kritik',
    howTo: {
      steps: [
        'Lansman dakikasında Discord sunucunuzda @everyone duyurusu geçin ve ses odalarında geliştirici oynanış gecesi başlatın.',
        'TikTok ve Instagram Reels\'ta önceden hazırladığınız en komik 3 videoyu 4-5 saat arayla paylaşın.',
        'Videoların ilk yorumuna Steam mağaza linkini sabitleyin (Pin).',
        'İlk 24 saatte oyunu satın alan oyunculara Discord\'da "Day 1 Supporter" rolü verin.',
      ],
      proTip: 'TikTok\'taki videolar için sitemizin "Instagram & TikTok" sekmesindeki kancaları kullanabilirsiniz.',
      toolsOrLinks: 'Discord, TikTok Mobile App, Instagram App',
    },
  },

  // ÇIKIŞ SONRASI
  {
    id: 'chk-12',
    phase: 'Çıkış Sonrası',
    task: 'İlk 24 Saat İçinde Acil Hata Düzeltme (Hotfix) Güncellemesi',
    description: 'Multiplayer bağlantı kopmaları veya çökme sorunlarını ilk 24 saatte çözmek olumsuz incelemeleri engeller.',
    isDone: false,
    priority: 'Kritik',
    howTo: {
      steps: [
        'Steam Topluluk Forumlarını ve Discord #bug-bildirimi odasını anlık takip edin.',
        'Lobiye bağlanamama, yakınlık sesi kesintisi veya oyun içi çökmeleri hemen tespit edin.',
        'Sorunları çözüp v1.0.1 hotfix yamasını aynı gün Steam\'e yükleyin.',
        'Steam Duyurular kısmında oyunculara teşekkür edip hatanın giderildiğini açıklayın.',
      ],
      proTip: 'İlk 24 saatteki hızlı geliştirici müdahalesi, oyuncuların olumsuz inceleme (Negative Review) yazmasını doğrudan engeller.',
      toolsOrLinks: 'Steamworks Builds Panel, Discord Bug Channel',
    },
  },
  {
    id: 'chk-13',
    phase: 'Çıkış Sonrası',
    task: 'Topluluğun İstediği İlk İçerik Yol Haritasını (Roadmap) Açıkla',
    description: 'Yeni harita, yeni canavar veya yeni komik eşya takvimini paylaşarak oyunun terk edilmediğini göster.',
    isDone: false,
    priority: 'Önemli',
    howTo: {
      steps: [
        'Discord ve Steam incelemelerinde oyuncuların en çok talep ettiği 3 özelliği not alın.',
        'Gelecek 1-2 ay için sade bir görsel yol haritası (Yeni Harita, Yeni Canavar, Yeni Eşyalar) hazırlayın.',
        'Bu yol haritasını Steam Haberler (Steam News Hub) ve Discord\'da yayınlayın.',
        'Düzenli aralıklarla geliştirme ekran görüntüleri paylaşmaya devam edin.',
      ],
      proTip: 'Aktif bir yol haritası oyunculara oyunun geliştirilmeye devam ettiğini gösterir ve arkadaşlarına tavsiye etme oranını 2 katına çıkarır.',
      toolsOrLinks: 'Steam News Hub, Canva / Photoshop',
    },
  },
];
