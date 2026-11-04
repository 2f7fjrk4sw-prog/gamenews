# 🎮 Oyun Haberleri — Proje Planı (GameLaunch & Friendslop Radar)

> **Steam Odaklı Bağımsız Oyun Lansman & Topluluk Pazarlama İstihbarat Platformu**  
> Hedef Tür: **Friendslop / Online Co-Op Party Games** (Lethal Company, Content Warning, Chained Together, Phasmophobia ekolü).

---

## 1. 🎯 Projenin Amacı ve Vizyonu

Bir indie oyunun (özellikle arkadaşlarla oynanan kaos/komedi odaklı **Friendslop** türünün) Steam'de başarılı olabilmesi için oyunun iyi olması yetmez; **doğru zamanda çıkması** ve **doğru topluluk kanallarında viral hale getirilmesi** gerekir.

Bu platform, oyun geliştirici ekiplere tek bir gösterge panelinden (dashboard) şu kritik güçleri sağlar:
1. **Radar:** Steam'de aynı türde (Online Co-op, Friendslop, Proximity Voice) çıkacak rakip oyunları ve festival tarihlerini takip ederek çıkış çakışmalarını önlemek.
2. **TikTok & Instagram Duyuru Stüdyosu:** 0-3 saniye kanca senaryoları, ses fikirleri ve hazır gönderi açıklamalarıyla viral büyüme yakalamak.
3. **Topluluk Pazarlama Dizini:** Oyunu duyurabileceğiniz en etkili platformlar (Reddit toplulukları, Discord sunucuları, streamer ve içerik üreticileri rehberi, festival takvimi).
4. **Lansman & Pitch Araç Kutusu:** Streamer'lara Steam anahtarı (4-Pack key) teklif ederken kullanılacak e-posta şablonları, basın bültenleri ve Discord duyuruları.
5. **Adım Adım Lansman Rehberi:** Her bir görevin nasıl yapılacağını açıklayan püf noktaları ve yol haritası.

---

## 2. 🏗 Mimari ve Teknoloji Yığını

| Katman | Teknoloji | Açıklama |
| :--- | :--- | :--- |
| **Ön Yüz (Frontend)** | **React 19 + TypeScript + Vite** | Hızlı, modern ve bileşen tabanlı SPA |
| **Tasarım / UI** | **Minimalist Dark Theme (Inter Font)** | Sade, yüksek okunurluklu, göz yormayan modern karanlık tema |
| **İkonlar** | **Lucide Icons** | Temiz, vektörel arayüz simgeleri |
| **Veri Katmanı** | **Curated Datasets + LocalStorage** | Rakip oyunlar, pazarlama kanalları, pitch şablonları, sosyal medya formatları ve kontrol listesi |

---

## 3. 🚀 Geliştirme Fazları (Roadmap)

### 📌 FAZ 1: Temel Proje Altyapısı & Tasarım Sistemi (Tamamlandı)
- [x] Vite + React + TypeScript proje iskeletinin kurulması
- [x] `PROJECT_PLAN.md` ve yapay zeka devir teslim dokümanı (`AGENT.md`) oluşturulması
- [x] Sade, göz yormayan minimalist arayüz ve 6 sekmeli üst menü

### 📌 FAZ 2: Friendslop & Steam Rakip Çıkış Radarı (Tamamlandı)
- [x] Steam üzerindeki benzer oyunların listesi (Çıkış tarihi, etiketler, istek listesi momentumu)
- [x] **Çıkış Çakışması Algoritması (Collision Detector):** Sizin hedef çıkış tarihinizle çakışan oyunlar için risk seviyesi (Düşük / Orta / Kritik)
- [x] Tür & Etiket filtreleri (*Online Co-op, Proximity Voice, Physics, Psychological Horror, Funny*)
- [x] Kullanıcının kendi oyun adını ve hedef çıkış tarihini kaydedebilmesi (LocalStorage)
- [x] Yeni rakip ekleme ve kaldırma imkanı (LocalStorage senkronizasyonu)

### 📌 FAZ 3: Topluluk & Pazarlama Kanalları Rehberi (Tamamlandı)
- [x] **Reddit Tanıtım Rehberi:** Subreddit listesi (r/IndieGaming, r/gamedev, r/coopgaming vb.), üye sayıları, self-promotion kuralları ve en iyi paylaşım saatleri
- [x] **Discord Ağları:** Yayıncı avcıları, indie showcase ve test sunucuları listesi
- [x] Basın & Medya listesi (Alpha Beta Gamer, RockPaperShotgun)

### 📌 FAZ 4: İçerik Üreticisi, Pitch & Sosyal Medya Stüdyosu (Tamamlandı)
- [x] Co-op / Friendslop yayınlayan Twitch & YouTube içerik üreticileri stratejisi
- [x] **Akıllı Pitch Üretici (Pitch Studio):**
  - [x] Yayıncılara 4'lü paket key gönderme şablonu (*"Arkadaş grubunuzla oynamanız için 4 Steam Key..."*)
  - [x] Basın ve oyun haber siteleri için resmi bülten şablonu
  - [x] Reddit hikaye formatında lansman gönderisi
  - [x] Discord @everyone hype duyurusu
- [x] **Instagram & TikTok Duyuru Stüdyosu:**
  - [x] 0-3 saniye kanca (hook) senaryoları
  - [x] Resmi lansman Reels/TikTok video akışı
  - [x] Instagram Story & anket fikirleri
  - [x] Tek tıkla kopyalanabilir hazır açıklamalar ve hashtag paketleri

### 📌 FAZ 5: İnteraktif Lansman Yol Haritası & Yapılış Rehberleri (Tamamlandı)
- [x] Çıkışa 6 ay kala (Steam sayfası, Teaser, Press Kit)
- [x] Çıkışa 3 ay kala (İlk Demo, Steam Next Fest başvurusu)
- [x] Çıkışa 1 ay kala (Yayıncılara key dağıtımı, ambargo tarihi belirleme)
- [x] Çıkış Günü (Fiyatlandırma stratejisi, Discord etkinliği, Reddit dalgası)
- [x] Çıkış Sonrası (İlk 24 saat hotfix, içerik yol haritası)
- [x] **Her madde için açılabilir adım adım nasıl yapılır kılavuzu, püf noktaları ve araç referansları**
- [x] Yerel hafızaya (LocalStorage) kaydedilen interaktif kontrol listesi ve % ilerleme çubuğu
- [x] Yeni özel görev ekleyebilme

### 📌 FAZ 6: Dışa Aktarma, Rapor & Veri Yedekleme Merkezi (Tamamlandı)
- [x] **PDF Olarak Yazdır:** Tarayıcı yazdırma ekranına tam optimize, A4 uyumlu resmi Lansman Raporu / Pitch Deck çıktısı
- [x] **Markdown (.md) Raporu:** Obsidian, Notion veya GitHub için tek tıkla indirilebilir tam kapsamlı lansman kiti
- [x] **Panoya Kopyalama:** Raporun tamamını anında kopyalayıp Discord/ekibe gönderebilme
- [x] **JSON Yedekleme & Geri Yükleme:** Eklenen rakipleri, hedef tarihi ve kontrol listesi ilerlemesini yedekleyip başka cihazda geri yükleyebilme
- [x] **Özelleştirilebilir Bölüm Seçimi:** Rapora hangi bölümlerin dahil edileceğini belirleyen kontrol kutuları

### 📌 FAZ 7: Yayınlama ve Canlıya Alma (Deploy) (Tamamlandı)
- [x] GitHub reposu oluşturma ve pushlama (https://github.com/2f7fjrk4sw-prog/gamenews)
- [x] Vercel ile ücretsiz internete açma ve canlıya alma
- [x] Canlı test ve doğrulama (Ekip şifresi ile korumalı erişim)

---

## 4. 💡 Friendslop Türü İçin Özel Pazarlama Taktikleri Veritabanı

1. **4'lü Key Kuralı:** Yayıncılara asla tek key verilmez; arkadaşlarıyla oynamaları için her zaman en az 4 adet Steam key gönderilir.
2. **TikTok / Reels İlk 3 Saniye:** Menü veya intro gösterilmez; doğrudan bir oyuncunun arkadaşını uçuruma atması veya yakınlık sesinden gelen çığlık anı ile başlanır.
3. **Steam Fiyatlandırma Psikolojisi:** $4.99 - $9.99 bandı arkadaş gruplarının birbirine hediye almasını kolaylaştırarak viral büyümeyi tetikler.
