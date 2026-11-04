# 🎮 GameLaunch Radar (Friendslop & Co-Op Marketing Radar)

> Steam odaklı bağımsız oyun lansman, rakip çakışma analizi ve topluluk pazarlama istihbarat platformu.  
> **Hedef Tür:** Friendslop / Online Co-Op Party Games (*Lethal Company, Content Warning, Chained Together, Phasmophobia ekolü*).

🌐 **Canlı Uygulama:** [https://gamenews-teal.vercel.app/](https://gamenews-teal.vercel.app/)  
🔐 **Varsayılan Ekip Şifresi:** `friendslop` *(Giriş sonrası panelden değiştirilebilir)*

---

## 📌 Özellikler ve Modüller

1. **📡 Rakip Radarı & Çıkış Çakışması Analizörü (`RadarSection`):**
   - Hedef çıkış tarihinize göre Steam'deki benzer oyunlarla çıkış çakışması (release collision) riskini anlık hesaplar.
   - 🚨 Kritik Risk (±7 gün mesafedeki yüksek istek listeli rakipler), 🟡 Orta Risk ve 🟢 Güvenli Çıkış pencereleri.
   - Yeni keşfedilen rakip oyunları radara ekleme/silme (yerel hafızaya kaydedilir).

2. **📱 Instagram & TikTok Duyuru ve Kanca Stüdyosu (`SocialMediaSection`):**
   - 0-3 saniye kanca (hook) senaryoları (kapı kapatma, uzaklaşan ses komedisi).
   - Resmi lansman Reels/TikTok video akışı.
   - Tek tıkla kopyalanabilir gönderi açıklamaları ve trend hashtag paketleri.

3. **📢 Tanıtım Kanalları Dizini (`MarketingSection`):**
   - Reddit (`r/IndieGaming`, `r/coopgaming`, `r/playmygame`), Discord ağları, Twitch co-op yayıncıları ve basın listesi.
   - En uygun paylaşım saatleri, topluluk kuralları ve Friendslop pazarlama tüyoları.

4. **✉️ Pitch & E-Posta Oluşturucu (`PitchStudioSection`):**
   - Yayıncılara 4'lü Steam Key gönderme şablonu (otomatik key üreticiyle).
   - Basın bülteni, samimi Reddit lansman hikayesi ve Discord duyuru metinleri.
   - Canlı metin doldurma ve tek tıkla panoya kopyalama.

5. **✅ Lansman Yol Haritası & Kontrol Listesi (`ChecklistSection`):**
   - 6 ay önceden çıkış sonrasına kadar tüm kritik kilometre taşları.
   - **Adım Adım Yapılış Kılavuzu:** Her maddenin altında açılabilir pratik rehber, püf noktaları (Pro-Tip) ve gereken araçlar.
   - % ilerleme çubuğu ve `localStorage` kalıcılığı.

6. **📖 Steam & Taktik Rehberi (`GuideSection`):**
   - Steam resmi festivalleri ve mevsimsel indirim takvimi (İndirim dönemi blackout uyarısı).
   - Friendslop viral oyun formülü ve Steam algoritmasının 3 gizli eşiği.

7. **📄 Dışa Aktarma, Rapor & Veri Yedekleme (`ReportExportSection`):**
   - **PDF Yazdır:** Sayfa sonu ve düzeni ayarlanmış A4 uyumlu resmi Lansman Raporu / Pitch Deck çıktısı.
   - **Markdown (.md):** Obsidian, Notion ve GitHub için tek tıkla indirilebilir master lansman kiti.
   - **JSON Yedekleme:** Yerel tarayıcı verilerini dışa aktarma ve başka cihaza geri yükleme.

8. **🔒 Ekip & Geliştirici Giriş Kapısı (`AuthGate`):**
   - Sitenin kamuya açık URL'inde yabancıların veya rakiplerin stratejilerinizi görmesini engelleyen şifreli giriş ekranı.
   - Varsayılan şifre: `friendslop` (Navbar üzerinden dilediğiniz zaman değiştirilebilir).
   - "Beni Hatırla" ve tek tıkla oturum kapatma (Logout).

---

## 🚀 Kurulum ve Çalıştırma

Projeyi yerel ortamınızda başlatmak için:

```bash
# Bağımlılıkları yükleyin (ilk seferde)
npm install

# Geliştirme sunucusunu başlatın (Tarayıcı otomatik açılır)
npm run dev

# Üretim derlemesi (Production Build)
npm run build

# Kod kalitesi kontrolü (Linter)
npm run lint
```

Geliştirme sunucusu varsayılan olarak `http://localhost:5173/` adresinde çalışır.

---

## 🛠 Teknoloji Yığını

* **Ön Yüz:** React 19 + TypeScript + Vite
* **İkonlar:** `lucide-react`
* **Stil:** Minimalist Dark Gaming UI (Inter Font + Zero-bloat CSS)
* **Veri:** Curated Datasets + Offline LocalStorage
* **Linter:** `oxlint`

---

## 🤖 Geliştirici & AI Devir Teslim

Sonraki geliştirme adımları ve mimari detaylar için lütfen [AGENT.md](AGENT.md) ve [PROJECT_PLAN.md](PROJECT_PLAN.md) dosyalarını inceleyin.
