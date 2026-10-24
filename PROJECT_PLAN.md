# 🎮 Oyun Haberleri — Proje Planı (GameLaunch & Friendslop Radar)

> **Steam Odaklı Bağımsız Oyun Lansman & Topluluk Pazarlama İstihbarat Platformu**  
> Hedef Tür: **Friendslop / Online Co-Op Party Games** (Lethal Company, Content Warning, Chained Together, Phasmophobia ekolü).

---

## 1. 🎯 Projenin Amacı ve Vizyonu

Bir indie oyunun (özellikle arkadaşlarla oynanan kaos/komedi odaklı **Friendslop** türünün) Steam'de başarılı olabilmesi için oyunun iyi olması yetmez; **doğru zamanda çıkması** ve **doğru topluluk kanallarında viral hale getirilmesi** gerekir.

Bu platform, oyun geliştirici ekiplere tek bir gösterge panelinden (dashboard) şu 3 kritik gücü sağlar:
1. **Radar:** Steam'de aynı türde (Online Co-op, Friendslop, Proximity Voice) çıkacak rakip oyunları ve festival tarihlerini takip ederek çıkış çakışmalarını önlemek.
2. **Topluluk Pazarlama Dizini:** Oyunu duyurabileceğiniz en etkili platformlar (Reddit toplulukları, Discord sunucuları, streamer ve içerik üreticileri rehberi, festival takvimi).
3. **Lansman & Pitch Araç Kutusu:** Streamer'lara Steam anahtarı (key) teklif ederken kullanılacak e-posta şablonları, TikTok viral klip kurgu taktikleri ve çıkış geri sayım kontrol listesi.

---

## 2. 🏗 Mimari ve Teknoloji Yığını

| Katman | Teknoloji | Açıklama |
| :--- | :--- | :--- |
| **Ön Yüz (Frontend)** | **React 19 + TypeScript + Vite** | Hızlı, modern ve bileşen tabanlı SPA |
| **Tasarım / UI** | **Modern Gaming Dark Theme + CSS / Tailwind** | Steam / Discord estetiğinde neon & koyu renk paleti |
| **İkonlar** | **Lucide Icons** | Temiz, vektörel arayüz simgeleri |
| **Veri Katmanı** | **Curated Datasets + LocalStorage** | Rakip oyunlar, pazarlama kanalları, pitch şablonları ve kontrol listesi |
| **Dış API Entegrasyonları** | **Steam Web API / RSS Feed** | Steam çıkış takvimi ve duyuru akışları |

---

## 3. 🚀 Geliştirme Fazları (Roadmap)

### 📌 FAZ 1: Temel Proje Altyapısı & Tasarım Sistemi (Tamamlandı)
- [x] Vite + React + TypeScript proje iskeletinin kurulması
- [x] `PROJECT_PLAN.md` ve yapay zeka devir teslim dokümanı (`AGENT.md`) oluşturulması
- [x] Koyu temalı (Steam/Cyberpunk estetiğinde) responsive düzen (Navbar, Tab navigasyonu)

### 📌 FAZ 2: Friendslop & Steam Rakip Çıkış Radarı (Tamamlandı)
- [x] Steam üzerindeki benzer oyunların listesi (Çıkış tarihi, etiketler, istek listesi momentumu)
- [x] **Çıkış Çakışması Algoritması (Collision Detector):** Sizin hedef çıkış tarihinizle çakışan oyunlar için risk seviyesi (Düşük / Orta / Kritik)
- [x] Tür & Etiket filtreleri (*Online Co-op, Proximity Voice, Physics, Psychological Horror, Funny*)
- [x] Kullanıcının kendi oyun adını ve hedef çıkış tarihini kaydedebilmesi (LocalStorage)
- [x] Yeni rakip ekleme ve kaldırma imkanı (LocalStorage senkronizasyonu)

### 📌 FAZ 3: Topluluk & Pazarlama Kanalları Rehberi (Tamamlandı)
- [x] **Reddit Tanıtım Rehberi:** Subreddit listesi (r/IndieGaming, r/gamedev, r/coopgaming vb.), üye sayıları, self-promotion kuralları ve en iyi paylaşım saatleri
- [x] **Discord Ağları:** Yayıncı avcıları, indie showcase ve test sunucuları listesi
- [x] **TikTok & Shorts Viral Strateji Rehberi:** Friendslop türünde tutan altın kurallar ve formatlar
- [x] Basın & Medya listesi (Alpha Beta Gamer, RockPaperShotgun)

### 📌 FAZ 4: İçerik Üreticisi (Streamer & Press) İletişim Merkezi (Tamamlandı)
- [x] Co-op / Friendslop yayınlayan Twitch & YouTube içerik üreticileri stratejisi
- [x] **Akıllı Pitch Üretici (Pitch Studio):**
  - [x] Yayıncılara 4'lü paket key gönderme şablonu (*"Arkadaş grubunuzla oynamanız için 4 Steam Key..."*)
  - [x] Basın ve oyun haber siteleri için resmi bülten şablonu
  - [x] Reddit hikaye formatında lansman gönderisi
  - [x] TikTok 3 saniyelik kanca senaryoları
  - [x] Discord @everyone hype duyurusu
- [x] Canlı dinamik alanlarla anında metin doldurma ve tek tıkla kopyalama özelliği

### 📌 FAZ 5: İnteraktif Lansman Kontrol Listesi (Tamamlandı)
- [x] Çıkışa 6 ay kala (Steam sayfası, Teaser, Press Kit)
- [x] Çıkışa 3 ay kala (İlk Demo, Steam Next Fest başvurusu)
- [x] Çıkışa 1 ay kala (Yayıncılara key dağıtımı, ambargo tarihi belirleme)
- [x] Çıkış Günü (Fiyatlandırma stratejisi, Discord etkinliği, Reddit dalgası)
- [x] Çıkış Sonrası (İlk 24 saat hotfix, içerik yol haritası)
- [x] Yerel hafızaya (LocalStorage) kaydedilen interaktif kontrol listesi ve % ilerleme çubuğu
- [x] Yeni özel görev ekleyebilme

### 📌 FAZ 6: Yayınlama ve Canlıya Alma (Deploy) (Sıradaki Adım)
- [ ] GitHub reposu oluşturma ve pushlama
- [ ] Vercel veya Netlify ile ücretsiz internete açma
- [ ] Canlı test ve doğrulama

---

## 4. 💡 Friendslop Türü İçin Özel Pazarlama Taktikleri Veritabanı

Friendslop oyunlarının doğasında **"arkadaşlarla oynanan absürt/kaotik eğlence"** yatar. Sistemde şu taktikler gömülü olacaktır:
1. **4'lü Key Kuralı:** Yayıncılara asla tek key verilmez; arkadaşlarıyla oynamaları için her zaman en az 4 adet Steam key gönderilir.
2. **TikTok / Reels İlk 3 Saniye:** Menü veya intro gösterilmez; doğrudan bir oyuncunun arkadaşını uçuruma atması veya yakınlık sesinden gelen çığlık anı ile başlanır.
3. **Steam Fiyatlandırma Psikolojisi:** $4.99 - $9.99 bandı arkadaş gruplarının birbirine hediye almasını kolaylaştırarak viral büyümeyi tetikler.
