import type { PitchTemplate } from '../types';

export const pitchTemplates: PitchTemplate[] = [
  {
    id: 'pitch-streamer',
    title: 'Yayıncılara 4-Pack Key Gönderme Şablonu (Twitch / YouTube)',
    category: 'Streamer 4-Pack',
    badge: 'En Yüksek Geri Dönüş 🎯',
    subject: 'Arkadaş grubunuzla kaos için 4 Steam Key: [Oyununuzun Adı] (Lethal Company / Content Warning sevenlere)',
    templateBody: `Merhaba [Yayıncı Adı],

Kanalınızda arkadaşlarınızla oynadığınız kaotik co-op oyunları (Lethal Company / Phasmophobia gibi) izlerken çok eğleniyoruz.

Biz de tam olarak arkadaş gruplarının birbirine bağırıp gülebileceği yeni bir Friendslop oyunu geliştirdik: [Oyununuzun Adı]

Oyun kısaca: [1 Cümlelik Kaotik Mekanik Örn: Arkadaşlarınızla terk edilmiş bir tesisten kaçmaya çalışırken birbirinizin sesini sadece yakındayken duyabildiğiniz bir fizik-korku oyunu.]

Tek başınıza oynamak eğlenceli olmayacağı için, yayın ekibinizle / arkadaşlarınızla birlikte deneyebilmeniz adına aşağıya 4 adet Steam Key bırakıyoruz:

🔑 Key 1: [STEAM-KEY-1]
🔑 Key 2: [STEAM-KEY-2]
🔑 Key 3: [STEAM-KEY-3]
🔑 Key 4: [STEAM-KEY-4]

Steam Mağaza Sayfası: [Steam Linkiniz]
30 Saniyelik Komik Oynanış Klibi: [Klip Linki]

Herhangi bir yayın zorunluluğu yok, sadece ekibinizle kahkaha dolu 1 saat geçirmeniz bile bizi çok mutlu eder!

Sevgiler,
[Adınız / Ekip Adınız]`,
    tips: [
      'Friendslop oyunları tek kişi oynanmaz; asla 1 key göndermeyin, mutlaka 3-4 key verin.',
      'E-postaya büyük video dosyası eklemeyin; sadece 30 saniyelik komik bir YouTube/TikTok linki koyun.',
      'Yayıncının oynadığı benzer bir oyuna (örn: Content Warning veya Chained Together) mutlaka ilk cümlede atıfta bulunun.',
    ],
  },
  {
    id: 'pitch-press',
    title: 'Oyun Basını & Editörler İçin Lansman Bülteni (PC Gamer, IGN, RockPaperShotgun)',
    category: 'Press / News',
    badge: 'Resmi Basın Duyurusu 📰',
    subject: '[BASIN BÜLTENİ] Friendslop Kaosu Geri Döndü: [Oyun Adı] Steam’de Çıktı!',
    templateBody: `Sayın Editör,

Lethal Company ve Content Warning akımının getirdiği "arkadaşlarla kaotik komedi" türünü bir adım öteye taşıyan bağımsız oyunumuz [Oyun Adı], bugün Steam platformunda PC için erişime açıldı.

ÖNE ÇIKAN DETAYLAR:
• Tür: Çevrim içi Eşli Oyun / Komedi / Fizik Tabanlı Hayatta Kalma (1-4 Oyuncu)
• Temel Dinamik: [1 Cümlelik Kaotik Mekanik]
• Platform & Fiyat: PC (Steam) — $[Fiyat] (%10 Lansman İndirimiyle)
• Geliştirici: [Adınız / Ekip Adınız]

OYUN HAKKINDA:
[Oyun Adı], oyuncuların birbirini sabote edebildiği dinamik fizik motoru ve gerçekçi yakınlık sesi (proximity voice) desteğiyle her oturumda benzersiz komik anlar üretmek üzere tasarlandı.

İNCELEME VE İÇERİK KİTİ:
• Steam İnceleme Anahtarları (Review Keys): [STEAM-KEY-1], [STEAM-KEY-2]
• Steam Sayfası: [Steam Linkiniz]
• Basın Kiti (Görseller, Logolar, GIF'ler): [Press Kit Linki / Google Drive]
• Oynanış Fragmanı: [Klip Linki]

Röportaj veya ek soru talepleriniz için bu e-postayı doğrudan yanıtlayabilirsiniz.

Saygılarımla,
[Adınız / Ekip Adınız]
İletişim: [E-posta / Discord]`,
    tips: [
      'Basın bülteninin ilk paragrafında haberin özünü (kim, ne, ne zaman, nerede) verin.',
      'Ekran görüntüleri ve logoları e-postaya ek (attachment) yapmayın; yüksek çözünürlüklü Drive/Dropbox linki sağlayın.',
      'Oyunun fiyatını ve çıkış indirim oranını açıkça belirtin.',
    ],
  },
  {
    id: 'pitch-reddit',
    title: 'Reddit Samimi Hikaye Lansman Gönderisi (r/IndieGaming & r/gaming)',
    category: 'Reddit Launch',
    badge: 'Organik İstek Listesi Mıknatısı 🚀',
    subject: 'r/IndieGaming için Gönderi Başlığı: "Arkadaşımla 1.5 yıldır boş zamanlarımızda yaptığımız yakınlık sesli komik co-op oyunu sonunda Steam de çıktı! İşte başımıza gelenler..."',
    templateBody: `Başlık:
After 1.5 years of development after our day jobs, my friends and I finally released our chaotic co-op game "[Oyun Adı]" on Steam! Here is our favorite moment so far [GIF/Video]

Gönderi Metni:
Hey everyone!

A small team of friends from [Adınız / Ekip Adınız]. We grew up playing co-op games and missed that feeling of screaming at your friends over proximity chat when physics go completely wrong.

So we decided to make "[Oyun Adı]":
- 1-4 Player Online Co-Op with spatial voice chat (your voice muffles behind walls!)
- Ragdoll physics and accidental team-killing
- [1 Cümlelik Kaotik Mekanik]

We just launched on Steam with a launch discount of $[Fiyat] (less than a coffee so you can gift your broke friend!).

Here is the Steam link if you want to check it out: [Steam Linkiniz]

Would love to hear your brutally honest feedback and what mechanics we should add in the next update!`,
    tips: [
      'Reddit kurumsal reklamları sevmez; samimi, esprili ve geliştirici odaklı bir dil kullanın.',
      'Videoyu doğrudan Reddit video oynatıcısına yükleyin (asla harici YouTube linki vermeyin).',
      'Yorumlara gelen her soruya ilk 2 saat içinde bizzat esprili yanıtlar verin (Reddit algoritması etkileşimi öne çıkarır).',
    ],
  },
  {
    id: 'pitch-tiktok',
    title: 'TikTok & Shorts Viral Kurgu Senaryoları (5 Altın Kural)',
    category: 'TikTok Hook',
    badge: 'Milyonlarca İzlenme Taktikleri 📱',
    subject: 'Friendslop Türü İçin 3 Saniyede İzleyiciyi Kilitleyen Video Formatları',
    templateBody: `🎬 VİRAL SENARYO 1: "İhanet / Arkadaşını Satma"
- 00:00 - 00:02: Arkadaşınız bir canavardan kaçarken veya tuzaktayken kapıyı yüzüne kilitlediğiniz an.
- Ses: Arkadaşınızın yakınlık sesinden gelen çığlığı: "KAPIYI AÇ LÜTFEN KAPIYI AÇ!!"
- Ekrandaki Yazı: "Arkadaşınızı satacağınız o oyun: [Oyun Adı]..."

🎬 VİRAL SENARYO 2: "Uzaklaşan Çığlık (Fizik Komedisi)"
- 00:00 - 00:03: Bir uçurum veya yüksekten düşme anı.
- Ses: Arkadaşınız düşerken sesi tizleşerek yankılanıp kayboluyor.
- Ekrandaki Yazı: "Proximity chat in [Oyun Adı] was a mistake 😭"

🎬 VİRAL SENARYO 3: "Sessiz Olmamız Gerekiyordu Ama..."
- 00:00 - 00:03: Canavarın yanından sessizce geçerken birinin hapşırması veya saçma bir ses çıkarması.
- Canavarın aniden o kişiye dönüp saldırması.
- Ekrandaki Yazı: "We told him to stay quiet for 5 seconds in [Oyun Adı]..."`,
    tips: [
      'Oyunun introsunu, logosunu veya menüsünü asla videonun başına koymayın.',
      'Yazıları ekranın ortasına koyun, alt yazıları kelime kelime renkli parlatın.',
      'Yorum kısmında Steam adını sabitleyin (Pin): "Oyun adı: [Oyun Adı] - Steam de wishlist e ekleyebilirsiniz!"',
    ],
  },
  {
    id: 'pitch-discord',
    title: 'Discord Topluluk Lansman Duyurusu (@everyone Hype)',
    category: 'Discord Community',
    badge: 'İlk 24 Saat Satış Dalgası ⚡️',
    subject: '🎉 [Oyun Adı] RESMEN STEAM\'DE YAYINDA! (%10 Lansman İndirimiyle)',
    templateBody: `@everyone
🚨 **BEKLENEN GÜN GELDİ! [Oyun Adı] ARTIK STEAM'DE!** 🚨

Aylardır süren alfa testleri, komik bug'lar ve sabaha kadar süren kodlamaların ardından sonunda [Oyun Adı] Steam mağazasında tüm dünyaya açıldı!

🎮 **Oyunu Buradan Kapın:** [Steam Linkiniz]
💸 **Lansman Fırsatı:** Arkadaşlarınıza hediye edebilmeniz için ilk hafta sadece **$[Fiyat]**!

🔥 **Lansman Özellikleri:**
• 4 Kişilik Çevrim İçi Eşli Kaos
• Dinamik Yakınlık Sesi (Proximity Chat)
• [1 Cümlelik Kaotik Mekanik]

🏆 **Lansman Çekilişi:**
Bu duyuruya 🎉 emojisi bırakan 3 kişiye yayıncı arkadaşlarına hediye edebilmeleri için ek Steam Anahtarı hediye edeceğiz!

Oynadıktan sonra Steam üzerinden dürüst bir inceleme (Review) bırakmayı lütfen unutmayın; bağımsız bir ekip olarak her yorumunuz bizi Steam algoritmasında yukarılara taşıyor.

Gelin ses kanallarına, kaos başlasın! 🍻
— [Adınız / Ekip Adınız]`,
    tips: [
      'Lansman anında Discord sunucunuzdaki çekirdek kitleyi ses kanallarına davet edin.',
      'Steam incelemesinin (Review) indie oyunlar için hayati önem taşıdığını hatırlatın.',
      'Sunucuda anlık oynanış yayını açıp geliştirici olarak soruları yanıtlayın.',
    ],
  },
];
