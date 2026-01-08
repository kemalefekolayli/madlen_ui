# Madlen Chat UI

Madlen için OpenRouter API entegrasyonu ile çalışan modern bir sohbet arayüzü.

## 🎨 Özellikler

- **Madlen Teması**: Madlen'in turuncu/amber renk paletine uygun tasarım
- **Karanlık/Aydınlık Mod**: Sistem tercihine göre otomatik veya manuel geçiş
- **Model Seçimi**: OpenRouter üzerinden birden fazla AI modeli desteği
- **Sohbet Geçmişi**: Geçmiş sohbetleri görüntüleme ve yönetme
- **Responsive Tasarım**: Tüm ekran boyutlarına uyum

## 🛠 Teknolojiler

- React 18 + TypeScript
- Vite 7
- Tailwind CSS 4
- Context API (State Management)

## 📦 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Prodüksiyon build
npm run build
```

## 📁 Proje Yapısı

```
src/
├── components/          # UI bileşenleri
│   ├── ChatInput.tsx    # Mesaj giriş alanı
│   ├── ChatMessage.tsx  # Mesaj baloncukları
│   ├── ChatView.tsx     # Ana sohbet görünümü
│   ├── MadlenLogo.tsx   # Logo bileşeni
│   ├── ModelSelector.tsx # Model seçici dropdown
│   ├── Sidebar.tsx      # Yan panel
│   └── ThemeToggle.tsx  # Tema değiştirici
├── context/
│   └── ThemeContext.tsx # Tema state yönetimi
├── types/
│   └── index.ts         # TypeScript tipleri
├── App.tsx              # Ana uygulama
├── main.tsx             # Entry point
└── index.css            # Global stiller + Tailwind config
```

## 🔌 Backend Entegrasyonu

Bu UI, backend API'si ile entegre edilmek üzere tasarlanmıştır. `App.tsx` içindeki TODO yorumlarını takip ederek API çağrılarını ekleyebilirsiniz:

```typescript
// API endpoint örnekleri
POST /api/chat          - Mesaj gönder
GET  /api/models        - Model listesi
GET  /api/chats         - Sohbet geçmişi
```

## 🎯 Sonraki Adımlar

1. Backend API entegrasyonu
2. OpenRouter API bağlantısı
3. Gerçek zamanlı mesaj streaming
4. Sohbet kalıcılığı (localStorage/backend)
5. OpenTelemetry trace'leri için UI
