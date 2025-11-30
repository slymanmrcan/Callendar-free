# Takvim Uygulaması

Next.js 15 + TypeScript ile geliştirilmiş full-stack monolit takvim uygulaması.

## Özellikler

- ✅ **Full-page Calendar**: React Big Calendar ile tam sayfa takvim görünümü
- ✅ **Authentication**: NextAuth v5 ile admin girişi
- ✅ **CRUD İşlemleri**: Etkinlik ekleme, düzenleme, silme ve görüntüleme
- ✅ **PostgreSQL + Prisma**: Veritabanı yönetimi
- ✅ **Shadcn UI**: Modern ve şık UI bileşenleri
- ✅ **TypeScript**: Tip güvenliği

## Teknolojiler

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth v5
- **UI**: Shadcn UI + Tailwind CSS
- **Calendar**: React Big Calendar

## Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
npm install --legacy-peer-deps
```

> **Not**: NextAuth v5 henüz Next.js 16'yı resmi olarak desteklemediği için `--legacy-peer-deps` bayrağı kullanılmaktadır.

### 2. Ortam Değişkenlerini Ayarlayın

`.env.sample` dosyasını `.env` olarak kopyalayın ve değerleri doldurun:

```bash
cp env.sample .env
```

`env.sample` içeriği örnek olarak:

```env
DATABASE_URL=postgresql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DB_NAME>
NEXTAUTH_SECRET=replace-with-32-char-secret
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace-with-strong-password
REGISTER_CODE=set-a-registration-code
NEXT_PUBLIC_HEADER_BADGE=Bilgisayar Kavramları Topluluğu
NEXT_PUBLIC_HEADER_TITLE=Etkinlik Takvimi
NEXT_PUBLIC_HEADER_SUBTITLE=Kampüs, çevrim içi ve atölye buluşmalarını tek ekranda takip edin.
```

**NEXTAUTH_SECRET oluşturmak için**:
```bash
openssl rand -base64 32
```
- Değerleri gerçek bilgilerle değiştirin; placeholders ile build/run etmeyin. `.env` Git'e dahil edilmez (`.gitignore`, `.dockerignore`), bu yüzden kendi `.env` dosyanızı oluşturun. Env satırlarında tırnak kullanmayın.
- `NEXTAUTH_URL`: Prod'da dışarıdan erişilen tam URL olmalı (örn. `https://takvim.ornek.com`). Lokal docker için `http://localhost:3000` yeter.
- Prisma 6: `prisma/schema.prisma` içinde `url = env("DATABASE_URL")` tanımlıdır; bağlantı değeri `.env` üzerinden gelir. Runtime için `@prisma/adapter-pg` gereklidir (package.json'da var).
- Kayıt kodu zorunlu: `.env` içindeki `REGISTER_CODE` seed sırasında `RegistrationCode` tablosuna yazılır; UI'da kayıt formu bu kodu ister.
- PostgreSQL kullanıcı/şifre/DB adını `DATABASE_URL` içinde kendi bilgilerinize göre verin; compose örneğinde user/pass `postgres/postgres`, db adı `calendar_db`.

### 3. Veritabanını Hazırlayın

PostgreSQL veritabanınızı oluşturun ve Prisma migration'larını çalıştırın:

```bash
# Prisma Client oluştur
npx prisma generate

# Migration'ları çalıştır
npx prisma migrate dev --name init

# Seed verilerini yükle (admin kullanıcı)
ADMIN_EMAIL=... ADMIN_PASSWORD=... REGISTER_CODE=... npx prisma db seed
```

### 4. Uygulamayı Çalıştırın

```bash
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## Admin Kullanıcı

Seed sırasında `.env` içindeki `ADMIN_EMAIL` / `ADMIN_PASSWORD` kullanılır; şifreyi güçlü seçin. Varsayılan yoktur, değişkenler set edilmezse seed hata verir.
- Yeni kullanıcı kayıtları için `/register` sayfasındaki form kullanılır ve `REGISTER_CODE` ile doğrulama yapılır.

## Kısayol Kullanım Akışı

1. Bağımlılıkları yükle: `npm install --legacy-peer-deps`
2. Ortam değişkenlerini hazırla: `cp env.sample .env` ve `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` değerlerini gir.
3. Prisma hazırlığı:  
   - `npx prisma generate`  
   - `npx prisma migrate dev --name init`  
   - `ADMIN_EMAIL=... ADMIN_PASSWORD=... npx prisma db seed`
4. Çalıştır: geliştirme için `npm run dev`, prod için `npm run build && npm start`.
5. Giriş: seed'de verdiğin mail/şifre ile `/login` üzerinden admin girişi yap.

## Güvenlik Notları
- Giriş ekranında basit toplama doğrulaması (captcha) bulunur; front ve back tarafında zorunlu.
- `/api/events` ve `/api/auth` uçları için IP bazlı rate limit (dakikada 60 istek) uygulanır; bellek içi sayaç tek instance senaryosu için uygundur.
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` zorunlu; default admin yok. Seed sırasında set edilmezse hata alınır.

## Docker ile Çalıştırma (örnek)

`.env` dosyanızı `env.sample`'dan kopyalayıp doldurun. Build aşamasında `DATABASE_URL` için default `postgresql://postgres:postgres@localhost:5432/calendar_db` kullanılır, bu yüzden image üretirken env olmasa da build patlamaz. Diğer env'ler (NEXTAUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD vb.) env'den gelmek zorunda; DB dışındaki yapıları hardcode etmedik.

```bash
# build (env olmasa da default DB URL ile generate/build çalışır)
docker build -t calendar-app .

# seed (migrate deploy container start'ta otomatik çalışır; seed'i manuel tetikleyin)
docker run --rm --env-file .env calendar-app npx prisma db seed

# run (container start'ta entrypoint otomatik `prisma migrate deploy` çalıştırır; boş DB ise tabloları kurar)
# mutlaka env verin; aksi halde container içindeki default DB localhost'a bakar
docker run -p 3000:3000 --env-file .env calendar-app
# Eğer Postgres aynı docker ağına bağlı farklı bir container'daysa `DATABASE_URL`'da host olarak o container'ın adı veya `host.docker.internal` kullanın (örn: `postgresql://postgres:postgres@host.docker.internal:5432/calendar_db`). Aynı bridge ağına koymak için:
#   docker network create calendar-net
#   docker network connect calendar-net pg
#   docker run --network calendar-net -p 3000:3000 --env-file .env calendar-app
# header metinlerini override etmek için (örnek):
# docker run -p 3000:3000 --env-file .env -e NEXT_PUBLIC_HEADER_TITLE="Topluluk Takvimi" calendar-app
```

GHCR gibi registry'den alırken tek fark image adı (örn. `ghcr.io/kullanici/calendar-app:latest`); `--env-file` ile aynı değişkenleri geçirmeniz yeterli.

## Docker Compose ile Çalıştırma
1. `.env.sample`'ı `.env` olarak kopyalayın ve değerleri girin. `DATABASE_URL`'ı `postgres://postgres:postgres@db:5432/calendar_db` yapın (compose ağı için).
2. Uygulamayı başlatın:
   ```bash
   docker compose up --build
   ```
   İlk çalıştırmada Postgres için `db_data` volume oluşur; app image'ı build edilir.
3. Prod seed (migrate deploy container start'ta otomatik çalışır; seed'i manuel tetikleyin):
   ```bash
   docker compose run --rm app npx prisma db seed
   ```

Notlar:
- `NEXTAUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` zorunlu; set edilmezse uygulama hata verir.
- `REGISTER_CODE` zorunlu; seed sırasında `RegistrationCode` tablosuna eklenir ve kayıt formu bu kodu ister.
- `DATABASE_URL` set edilmezse build/generate/seed sırasında default `postgresql://postgres:postgres@localhost:5432/calendar_db` adresi kullanılır. Prod için gerçek DB bilgilerinizi `.env` veya `-e` ile verin; DB dışında hiçbir env hardcode edilmez.
- Container içinde `localhost` DB host'u çalışmaz; `host.docker.internal` veya aynı docker ağına alınmış bir servis adı (örn. `pg`) kullanın. `entrypoint.sh` `localhost` görürse otomatik `host.docker.internal`'a çevirir.
- `NEXT_PUBLIC_HEADER_*` set edilmezse header default metinlerle gelir; değişiklik sonrası yeniden build gerekir (public env build-time).
- Prisma CLI Prisma 6 ile çalışır; `prisma.config.js` içindeki `DATABASE_URL` kullanılır. Container start esnasında entrypoint `prisma migrate deploy` çalıştırır; seed için komutları elle verin.

## Header Metinlerini Özelleştirme
- `.env` veya `docker run -e` ile `NEXT_PUBLIC_HEADER_BADGE`, `NEXT_PUBLIC_HEADER_TITLE`, `NEXT_PUBLIC_HEADER_SUBTITLE` değerlerini set edebilirsiniz.
- Bu değerler build-time alındığı için değişiklik sonrası `next build`/docker image rebuild gerekir.

## Kullanım

### Ziyaretçi Modu
- Takvimi görüntüleyebilir
- Etkinlik detaylarını görebilir
- Etkinlik ekleyemez/düzenleyemez

### Admin Modu (Giriş Yapıldığında)
- Boş bir güne tıklayarak yeni etkinlik ekleyebilir
- Mevcut etkinliklere tıklayarak düzenleyebilir
- Etkinlikleri silebilir

## API Endpoints

- `GET /api/events` - Tüm etkinlikleri getir
- `POST /api/events` - Yeni etkinlik oluştur (Admin)
- `GET /api/events/:id` - Tek etkinlik getir
- `PUT /api/events/:id` - Etkinlik güncelle (Admin)
- `DELETE /api/events/:id` - Etkinlik sil (Admin)

## Proje Yapısı

```
callendar-full/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth API routes
│   │   └── events/
│   │       ├── route.ts                  # GET, POST /api/events
│   │       └── [id]/route.ts             # GET, PUT, DELETE /api/events/:id
│   ├── login/
│   │   └── page.tsx                      # Admin login sayfası
│   ├── layout.tsx                        # Root layout
│   ├── page.tsx                          # Ana sayfa (takvim)
│   └── globals.css                       # Global stiller
├── components/
│   ├── ui/                               # Shadcn UI bileşenleri
│   ├── Calendar.tsx                      # Takvim bileşeni
│   ├── EventModal.tsx                    # Etkinlik modal'ı
│   ├── Header.tsx                        # Header bileşeni
│   └── Providers.tsx                     # Session provider
├── lib/
│   ├── prisma.ts                         # Prisma client
│   └── utils.ts                          # Utility fonksiyonlar
├── prisma/
│   ├── schema.prisma                     # Prisma schema
│   └── seed.ts                           # Seed script
├── auth.ts                               # NextAuth config
├── proxy.ts                              # Rate limit proxy (middleware)
└── package.json
```

## Veritabanı Şeması

### User Model
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Event Model
```prisma
model Event {
  id          String   @id @default(cuid())
  title       String
  description String?
  imageUrl    String?
  speaker     String?
  location    String?
  platform    String?
  isOnline    Boolean  @default(false)
  startDate   DateTime
  endDate     DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Geliştirme

### Prisma Studio
Veritabanını görsel olarak yönetmek için:

```bash
npx prisma studio
```

### Build
Production build oluşturmak için:

```bash
npm run build
npm start
```

## Lisans

MIT
