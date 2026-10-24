export interface SocialPostTemplate {
  id: string;
  platform: 'TikTok' | 'Instagram' | 'Both';
  type: 'Video Hook' | 'Launch Reel' | 'Story / Poll' | 'Post Caption';
  title: string;
  hookText: string;
  audioIdea: string;
  videoScenario: string;
  captionTemplate: string;
  hashtags: string[];
}

export const initialSocialTemplates: SocialPostTemplate[] = [
  {
    id: 'soc-hook-1',
    platform: 'Both',
    type: 'Video Hook',
    title: 'İhanet / Kapı Kapatma Kaosu (0-3 sn)',
    hookText: 'Arkadaşınızı satacağınız o oyun...',
    audioIdea: 'Arkadaşınızın mikrofondan gelen boğuk çığlığı: "KAPIYI AÇ LÜTFEN KAPIYI AÇ!"',
    videoScenario: `[00:00 - 00:02] Arkadaşınız canavardan kaçarken veya tuzaktayken kapıyı bilerek yüzüne kapatıyorsunuz.
[00:02 - 00:05] Arkadaşınız arkada can çekişirken karakteriniz dans ediyor veya kameraya bakıyor.
[00:05 - 00:09] 3 saniye sonra canavar size dönüyor ve iki arkadaş da çığlık atarak ölüyor.`,
    captionTemplate: `Arkadaş grubunda seni ilk satacak kişiyi etiketle 💀

Oyun Adı: [Oyun Adı]
Platform: Steam (PC)
Fiyat: $[Fiyat] (%10 Lansman İndirimiyle)

Steam istek listenize (Wishlist) eklemeyi unutmayın! Link bio'da 🔗`,
    hashtags: ['#friendslop', '#lethalcompany', '#coopgaming', '#gamingclips', '#funnygaming', '#indiegames', '#steamgames'],
  },
  {
    id: 'soc-hook-2',
    platform: 'TikTok',
    type: 'Video Hook',
    title: 'Uzaklaşan Ses / Fizik Komedisi (Proximity Chat)',
    hookText: 'Yakınlık sesi (Proximity chat) eklemek büyük hataydı 😭',
    audioIdea: 'Karakter düşerken sesin yankılanarak tizleşip birden kesilmesi.',
    videoScenario: `[00:00 - 00:03] İki arkadaş uçurum kenarında konuşuyor: "Buradan atlayabilir miyiz?"
[00:03 - 00:06] Biri yanlışlıkla veya itilerek aşağı düşüyor; sesi mesafeyle birlikte boğuklaşıp yok oluyor: "AAAAaaaa...."
[00:06 - 00:10] Yukarıda kalan arkadaş sessizce etrafa bakıyor ve telsizi kapatıyor.`,
    captionTemplate: `Mikrofonu açık unuttuğu an olanlar oldu... 😂

Oyunumuz [Oyun Adı] sonunda Steam'de çıktı! Arkadaşlarınızla bağıra bağıra oynamak için link bio'da.`,
    hashtags: ['#proximitychat', '#gamingmemes', '#tiktokgaming', '#friendslop', '#coophorror', '#steamdeals'],
  },
  {
    id: 'soc-launch-1',
    platform: 'Both',
    type: 'Launch Reel',
    title: 'Resmi Çıkış / Lansman Reels Videosu',
    hookText: '1.5 yıldır arkadaşlarımızla geliştirdiğimiz oyun BUGÜN ÇIKTI!',
    audioIdea: 'Yüksek tempolu trend oyun müziği veya komik beat drop.',
    videoScenario: `[00:00 - 00:02] En komik ölüm / ragdoll anı ile patlama.
[00:02 - 00:06] 1-4 kişilik arkadaş grubuyla oynanan en kaotik anlardan hızlı kesitler (Quick cuts).
[00:06 - 00:09] Steam mağaza ekranı ve $[Fiyat] fiyat etiketi: "Kahve fiyatına arkadaşlarına kaos hediye et."
[00:09 - 00:12] "Steam'de şimdi oynayabilirsiniz!" çağrısı.`,
    captionTemplate: `🎉 BEKLENEN GÜN GELDİ! [Oyun Adı] ARTIK STEAM'DE YAYINDA!

Arkadaşlarınızla birbirinize bağırıp gülebileceğiniz kaotik co-op oyunumuz bugün çıktı. İlk haftaya özel $[Fiyat] indirimli fiyatla kapabilirsiniz!

🎮 Oyunu denemek için profilimizdeki Steam linkine tıklayın!`,
    hashtags: ['#outnow', '#indiedev', '#steamrelease', '#coopgames', '#pcgaming', '#gamedev', '#gamingcommunity'],
  },
  {
    id: 'soc-story-1',
    platform: 'Instagram',
    type: 'Story / Poll',
    title: 'Instagram Hikaye & Anket Formatı',
    hookText: 'Bu oyunda arkadaşını canavara yem eder misin?',
    audioIdea: 'Instagram Hikaye müziklerinden gerilim/komedi temalı trend parça.',
    videoScenario: `[Story 1] 10 saniyelik komik oynanış videosu + "EVET / KESİNLİKLE EVET" anket çıkartması.
[Story 2] Oyunun Steam sayfasının ekran görüntüsü + Doğrudan tıklanabilir "Steam Sayfası" Link Çıkartması (Link Sticker).
[Story 3] "Arkadaşını etiketle, sana oyunu alsın" soru kutusu çıkartması.`,
    captionTemplate: `Hikaye Metni: [Oyun Adı] Steam'de erişime açıldı! Linke tıklayıp kütüphanene ekle 👆`,
    hashtags: ['#instagramgaming', '#reelsgaming', '#storypoll', '#indiegame'],
  },
  {
    id: 'soc-caption-1',
    platform: 'Both',
    type: 'Post Caption',
    title: 'Doğrudan Kopyalanabilir Post Açıklaması',
    hookText: 'Arkadaş grubuna at, bu hafta sonu ne oynayacağınız belli oldu 👇',
    audioIdea: 'Trend ses veya oyun içi orijinal telsiz cızırtısı.',
    videoScenario: `Oyununuzun en akıcı 15-20 saniyelik oynanış klibi.`,
    captionTemplate: `Arkadaş grubunu topla, bu akşam kaos var! 🚀

"[Oyun Adı]"
• 1-4 Kişilik Çevrim İçi Eşli Oyun
• Gerçekçi Yakınlık Sesi (Proximity Chat)
• Sakar Fizik & İhanet Mekanikleri
• Steam Fiyatı: $[Fiyat]

Profildeki linkten hemen Steam'e gidip inceleyebilirsiniz!

Senin ekibin bu oyunda kaç dakika hayatta kalabilir? Yorumlara yaz 👇`,
    hashtags: ['#friendslop', '#coopgaming', '#steamindie', '#gamingreels', '#tiktokgamer', '#indiegamebuzz'],
  },
];

