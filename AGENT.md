# 🤖 AGENT.md — Yapay Zeka Devir Teslim & Geliştirici Kılavuzu

> **Bu dosya, bu projede çalışacak olan yapay zeka asistanları ve geliştiriciler için hazırlanmış kesin yönerge belgesidir.**  
> Projenin bağlamını, mimarisini, kurallarını ve nerede kalındığını hızlıca kavramak için önce bu dosyayı okuyun.

---

## 📌 Proje Özeti

* **Proje Adı:** Oyun Haberleri (GameLaunch & Friendslop Marketing Radar)
* **Konum:** `c:\Users\msi pc\OneDrive\Masaüstü\oyun-haberleri`
* **Geliştirici Rolü:** Kullanıcı, Steam için **Friendslop** (Online Co-op, kaotik/eğlenceli parti oyunu, örn: Lethal Company, Content Warning, Phasmophobia ekolü) türünde bir oyun geliştiren ekibin parçasıdır.
* **Uygulamanın Amacı:**
  1. Steam üzerinde benzer/rakip oyunların çıkış tarihlerini izlemek ve çıkış çakışması (release collision) risklerini dinamik olarak hesaplamak.
  2. Oyunu hangi topluluklarda ve kanallarda (Reddit, Discord, TikTok, Twitch, YouTube, Steam Festivalleri, Basın) nasıl pazarlayabileceğine dair net bir rehber ve veritabanı sunmak.
  3. Yayıncılara key gönderme şablonları, pitch oluşturucu, canlı metin üretici ve interaktif lansman kontrol listesi sağlamak.
  4. Steam mevsimsel indirimleri ve Steam Next Fest dönemlerinde lansman blackout analizleri sunmak.

---

## 🏗 Teknik Mimari ve Dosya Yapısı

* **Framework:** React 19 (TypeScript) + Vite
* **İkonlar:** `lucide-react`
* **Stil:** Sade, modern ve göz yormayan minimalist koyu tema (`#0D1117`, kartlar `#161B22`, kenarlıklar `#30363D`, sade yeşil ve mavi aksanlar)

```text
oyun-haberleri/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx             # Temiz üst menü ve 5 ana sekme
│   │   ├── RadarSection.tsx       # Sade rakip radarı, çakışma uyarısı, hızlı filtreler
│   │   ├── MarketingSection.tsx   # Platform bazlı sade pazarlama kartları (Reddit, Discord, vb.)
│   │   ├── PitchStudioSection.tsx # Hızlı değişkenli pitch & e-posta kopyalayıcı
│   │   ├── ChecklistSection.tsx   # Sade lansman kontrol listesi ve ilerleme çubuğu
│   │   └── GuideSection.tsx       # Steam Festival Takvimi + Friendslop Taktik Rehberi (Birleşik)
│   ├── data/
│   │   ├── competitors.ts         # Steam rakip oyun başlangıç veri seti
│   │   ├── marketingChannels.ts   # Pazarlama ve tanıtım platformları
│   │   ├── pitchTemplates.ts      # Yayıncı, basın, Reddit, TikTok şablonları
│   │   ├── launchChecklist.ts     # 6 ay önceden çıkış sonrasına görevler
│   │   └── steamFestivals.ts      # Steam resmi festival ve indirim tarihleri
│   ├── types/
│   │   └── index.ts               # TypeScript tip tanımları
│   ├── App.tsx                    # Ana dashboard koordinatörü ve state yönetimi
│   ├── App.css                    # Oyun temalı modern kartlar, neon efektler ve responsive düzen
│   ├── index.css                  # Fontlar ve küresel css değişkenleri
│   └── main.tsx                   # React kök montajı
├── PROJECT_PLAN.md                # Fazlar ve kilometre taşları (Faz 1-5 Tamamlandı)
├── AGENT.md                       # Bu dosya
└── package.json                   # Bağımlılıklar
```

---

## 📋 Geliştirme İlkeleri & Kurallar

1. **Friendslop Türü Odaklılık:** Pazarlama tavsiyeleri genel kurumsal oyunlar için değil; doğrudan **viral TikTok klipleri, 4'lü streamer key paketleri, yakınlık sesi (proximity chat) anları ve topluluk odaklı indie pazarlama taktikleri** etrafında kurgulanmalıdır.
2. **Offline-First & LocalStorage:** Kullanıcının hedef çıkış tarihi, oyun adı, kontrol listesi durumları ve eklediği rakipler `localStorage` üzerinde saklanır.
3. **TypeScript Verbatim Module Syntax:** Tip importları daima `import type { ... } from '...'` formatında olmalıdır.
4. **Temiz Derleme:** Her değişiklikten sonra `npm run build` ve `npm run lint` çalıştırılmalıdır.

---

## 🚀 Proje Durumu ve Sonraki Adım

* **Mevcut Durum:**
  - ✅ Faz 1, Faz 2, Faz 3, Faz 4 ve Faz 5 eksiksiz inşa edildi ve test edildi.
  - ✅ TypeScript derlemesi (`tsc -b && vite build`) ve `oxlint` sıfır hatayla geçti.
* **Sıradaki Görev (Next Task):**
  - Faz 6: Kullanıcı talep ederse GitHub deposuna gönderme (push) veya Vercel/Netlify canlı yayını (deployment).
