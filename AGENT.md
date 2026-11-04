# 🤖 AGENT.md — Yapay Zeka Devir Teslim & Geliştirici Kılavuzu

> **Bu dosya, bu projede çalışacak olan yapay zeka asistanları ve geliştiriciler için kesin devir kılavuzudur.**  
> Projenin bağlamını, mimarisini, kurallarını ve nerede kalındığını hızlıca kavramak için önce bu dosyayı okuyun.

---

## 📌 Proje Özeti

* **Proje Adı:** Oyun Haberleri (GameLaunch & Friendslop Marketing Radar)
* **Konum:** `c:\Users\msi pc\OneDrive\Masaüstü\oyun-haberleri`
* **Geliştirici Rolü:** Kullanıcı, Steam için **Friendslop** (Online Co-op, kaotik/eğlenceli parti oyunu, örn: Lethal Company, Content Warning, Phasmophobia ekolü) türünde bir oyun geliştiren ekibin parçasıdır.
* **Uygulamanın Amacı:**
  1. Steam üzerinde benzer/rakip oyunların çıkış tarihlerini izlemek ve çıkış çakışması (release collision) risklerini dinamik olarak hesaplamak.
  2. Oyunu hangi topluluklarda ve kanallarda (Reddit, Discord, TikTok, Instagram, Twitch, YouTube, Steam Festivalleri, Basın) nasıl pazarlayabileceğine dair net bir rehber ve veritabanı sunmak.
  3. TikTok ve Instagram Reels için hazır kanca (hook) senaryoları, video akışları ve tek tıkla kopyalanabilir açıklamalar sağlamak.
  4. Yayıncılara 4'lü key gönderme şablonları, pitch oluşturucu, canlı metin üretici ve interaktif lansman kontrol listesi sağlamak.
  5. Lansman kontrol listesindeki her madde için **adım adım yapılış kılavuzu, püf noktaları ve araç referansları** sunmak.
  6. Steam mevsimsel indirimleri ve Steam Next Fest dönemlerinde lansman blackout analizleri sunmak.

---

## 🏗 Teknik Mimari ve Dosya Yapısı

* **Framework:** React 19 (TypeScript) + Vite
* **İkonlar:** `lucide-react`
* **Stil:** Sade, modern ve göz yormayan minimalist koyu tema (`#0D1117`, kartlar `#161B22`, kenarlıklar `#30363D`, Inter Font)

```text
oyun-haberleri/
├── src/
│   ├── components/
│   │   ├── AuthGate.tsx           # Şifreli ekip giriş ekranı, oturum yönetimi ve şifre değiştirme
│   │   ├── Navbar.tsx             # Temiz üst menü, sekmeler, şifre değiştirme ve çıkış butonları
│   │   ├── RadarSection.tsx       # Sade rakip radarı, çakışma uyarısı, hızlı filtreler, yeni rakip ekleme
│   │   ├── SocialMediaSection.tsx # TikTok & Instagram duyuru, kanca (hook), senaryo ve açıklama stüdyosu
│   │   ├── MarketingSection.tsx   # Platform bazlı sade pazarlama kartları (Reddit, Discord, vb.)
│   │   ├── PitchStudioSection.tsx # Hızlı değişkenli pitch & e-posta kopyalayıcı (4-pack key generator)
│   │   ├── ChecklistSection.tsx   # Lansman kontrol listesi + her madde için açılabilir adım adım nasıl yapılır kılavuzu
│   │   ├── GuideSection.tsx       # Steam Festival Takvimi + Friendslop Taktik Rehberi (Birleşik)
│   │   └── ReportExportSection.tsx # PDF / Markdown / JSON yedekleme ve dışa aktarma merkezi
│   ├── data/
│   │   ├── competitors.ts         # Steam rakip oyun başlangıç veri seti
│   │   ├── socialTemplates.ts     # TikTok & Instagram hazır video senaryoları ve açıklamalar
│   │   ├── marketingChannels.ts   # Pazarlama ve tanıtım platformları
│   │   ├── pitchTemplates.ts      # Yayıncı, basın, Reddit, TikTok şablonları
│   │   ├── launchChecklist.ts     # 6 ay önceden çıkış sonrasına adım adım nasıl yapılır kılavuzlu görevler
│   │   └── steamFestivals.ts      # Steam resmi festival ve indirim tarihleri
│   ├── types/
│   │   └── index.ts               # TypeScript tip tanımları
│   ├── App.tsx                    # Ana dashboard koordinatörü ve state yönetimi
│   ├── App.css                    # Sade, minimalist, yüksek okunurluklu stil dosyası
│   ├── index.css                  # Fontlar ve küresel css değişkenleri
│   └── main.tsx                   # React kök montajı
├── PROJECT_PLAN.md                # Fazlar ve kilometre taşları (Faz 1-5 Tamamlandı)
├── AGENT.md                       # Bu dosya (Devir teslim kılavuzu)
├── README.md                      # Proje tanıtım ve çalıştırma rehberi
└── package.json                   # Bağımlılıklar (vite --open --host)
```

---

## 📋 Geliştirme İlkeleri & Kurallar

1. **Friendslop Türü Odaklılık:** Pazarlama tavsiyeleri genel kurumsal oyunlar için değil; doğrudan **viral TikTok klipleri, 4'lü streamer key paketleri, yakınlık sesi (proximity chat) anları ve topluluk odaklı indie pazarlama taktikleri** etrafında kurgulanmalıdır.
2. **Offline-First & LocalStorage:** Kullanıcının hedef çıkış tarihi, oyun adı, kontrol listesi durumları ve eklediği rakipler `localStorage` üzerinde saklanır.
3. **TypeScript Verbatim Module Syntax:** Tip importları daima `import type { ... } from '...'` formatında olmalıdır.
4. **Temiz Derleme:** Her değişiklikten sonra `npm run build` ve `npm run lint` çalıştırılmalıdır (0 hata, 0 uyarı standardı).
5. **Anlaşılır & Açıklayıcı Git Commit Standartları (Human-Readable Commits):**
   - GitHub commit mesajları herkesin (ekip arkadaşları, geliştiriciler, dış gözler) ilk bakışta ne yapıldığını hemen kavrayabileceği netlikte yazılmalıdır.
   - Format: `[Tür/Modül]: Net ve Anlaşılır Açıklama` (Örn: `feat(güvenlik): Ekip şifreli giriş ekranı, oturum yönetimi ve şifre değiştirme özelliği eklendi`).
   - Çoklu dosya veya büyük özelliklerde commit gövdesine yapılanların 2-3 maddelik kısa özeti eklenmelidir.

---

## 🚀 Proje Durumu ve Sonraki Adım

* **Tamamlananlar:**
  - ✅ Faz 1: Sade arayüz ve temiz navigasyon iskeleti.
  - ✅ Faz 2: Steam rakip radarı & dinamik çakışma tespit algoritması.
  - ✅ Faz 3: Tanıtım kanalları rehberi (Reddit, Discord, Basın vb.).
  - ✅ Faz 4: Akıllı pitch & streamer 4-pack e-posta üretici.
  - ✅ Faz 5: Adım adım nasıl yapılacağı açıklamalı lansman yol haritası & kontrol listesi.
  - ✅ Ek Modül: Özel Instagram & TikTok video kurgu, kanca ve açıklama stüdyosu.
  - ✅ Ek Modül: Steam Festival Takvimi & Blackout indirim uyarısı.
  - ✅ Tüm kodlar Git üzerinde commit edilmiş ve üretim derlemesi (`npm run build`) doğrulanmıştır.

* **Sonraki Seans İçin Sıradaki Adımlar (Next Tasks):**
  1. **Faz 6 - Canlıya Alma (Deploy):** Kullanıcı istediğinde GitHub reposu oluşturup kodu pushlamak ve Vercel / Netlify ile ücretsiz internete açmak.
  2. **İsteğe Bağlı:** Steam Web API veya RSS üzerinden gerçek zamanlı en çok satan / yaklaşan co-op oyun verilerini dinamik çekme seçeneği eklemek.
