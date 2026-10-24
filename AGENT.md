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
* **Stil:** Modern Dark Gaming UI (`#090C12`, Neon yeşil `#10B981`, Mor `#8B5CF6`, Camgöbeği `#06B6D4`, Kırmızı `#EF4444`)

```text
oyun-haberleri/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx             # Üst header, oyun adı & tarih yapılandırma, tab geçişleri
│   │   ├── RadarSection.tsx       # Çıkış çakışması algoritması, filtreler, yeni rakip ekleme
│   │   ├── MarketingSection.tsx   # Topluluk ve pazarlama rehberi (Reddit, Discord, TikTok, Twitch)
│   │   ├── PitchStudioSection.tsx # Akıllı değişkenli pitch ve e-posta üretici (4-pack key generator)
│   │   ├── ChecklistSection.tsx   # LocalStorage senkronlu interaktif lansman kontrol listesi
│   │   ├── SteamCalendarSection.tsx # Resmi Steam indirimleri & Next Fest takvimi & blackout uyarıları
│   │   └── PlaybookSection.tsx    # Friendslop formülü, mekanik rehberi ve Steam algoritma eşikleri
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
