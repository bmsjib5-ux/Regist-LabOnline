# 🎨 Notion Gallery App

หน้าเว็บ Card/Gallery สวยงาม ที่เชื่อมต่อกับ Notion Database ของคุณ
พร้อมฟีเจอร์ **แสดง + เพิ่ม + แก้ไข + ลบ** (CRUD ครบ)

---

## 🚀 ขั้นตอนการติดตั้ง (5 นาที)

### 1️⃣ สร้าง Notion Integration

1. ไปที่ 👉 https://www.notion.so/profile/integrations
2. คลิก **"+ New integration"**
3. ตั้งชื่อ เช่น `My Gallery`, เลือก Workspace, Type = **Internal**
4. คลิก **Save**
5. คัดลอก **"Internal Integration Secret"** (ขึ้นต้นด้วย `ntn_` หรือ `secret_`) เก็บไว้

### 2️⃣ เชื่อม Integration กับ Database

1. เปิดหน้า Notion database ของคุณ
2. คลิก **`···`** มุมขวาบน → **Connections** → **Connect to**
3. เลือก Integration ที่สร้างไว้ → **Confirm**

> ⚠️ ถ้าข้ามขั้นตอนนี้ จะเจอ error `object_not_found`

### 3️⃣ ติดตั้งและรัน

เปิด Terminal ที่โฟลเดอร์นี้แล้วรัน:

```bash
# ติดตั้ง dependencies
npm install

# คัดลอกไฟล์ .env.example เป็น .env
cp .env.example .env

# แก้ไขไฟล์ .env ใส่ token ที่คัดลอกมา
#   NOTION_TOKEN=ntn_xxxxxxxxxxxxxxxx
#   DATABASE_ID=3491c083c4858041b2a4de88f339a9b0

# รัน server
npm start
```

### 4️⃣ เปิดเว็บ

ไปที่ 👉 **http://localhost:3000**

---

## 🌐 แชร์ผ่าน Cloudflare Tunnel (Optional)

ถ้าต้องการแชร์ให้คนอื่นเข้าผ่านอินเทอร์เน็ตชั่วคราว (Quick Tunnel):

### ติดตั้ง cloudflared ครั้งเดียว

- **macOS**: `brew install cloudflared`
- **Windows**: ดาวน์โหลด `.msi` จาก https://github.com/cloudflare/cloudflared/releases
- **Linux**: ดาวน์โหลด binary จาก https://github.com/cloudflare/cloudflared/releases

### รัน server + tunnel พร้อมกัน

**Windows** — ดับเบิลคลิก `start.bat` (ตรวจ Node/cloudflared/`.env`/`node_modules` ให้อัตโนมัติ)

**macOS / Linux** หรือสั่งเอง:

```bash
npm run start:tunnel
```

จะเห็น log แบบนี้:

```
[server]  🚀 Server running at http://localhost:3000
[tunnel]  Your quick Tunnel has been created! Visit it at:
[tunnel]  https://xxx-yyy-zzz.trycloudflare.com
```

> ⚠️ Quick Tunnel เป็น **URL ชั่วคราว** ทุกครั้งที่รันใหม่จะได้ URL ใหม่
> กด `Ctrl+C` ปิดทั้งสอง process พร้อมกัน

### หรือรันแยก

```bash
npm start      # terminal 1
npm run tunnel # terminal 2
```

---

## 📁 ไฟล์ในโปรเจกต์

| ไฟล์ | คำอธิบาย |
|------|----------|
| `index.html` | หน้าเว็บ Gallery (UI สวยงาม) |
| `server.js` | Node.js proxy server (bypass CORS + ซ่อน token) |
| `package.json` | ข้อมูล dependencies |
| `.env.example` | ตัวอย่างไฟล์ .env — **คัดลอกเป็น `.env` แล้วแก้ token** |

---

## ✨ ฟีเจอร์

- 🎨 **UI สวย** — Typography Fraunces + IBM Plex Sans Thai, โทนสี warm/editorial
- 📊 **Gallery view** — การ์ดสวยงาม แสดง properties ทุกชนิดอัตโนมัติ
- ➕ **Create** — คลิก "New Entry" เพื่อเพิ่มข้อมูล
- ✏️ **Edit** — คลิกที่การ์ดเพื่อแก้ไข
- 🗑️ **Delete** — ลบ (Archive) ข้อมูล (สามารถกู้คืนได้ใน Notion)
- 🔍 **Search** — ค้นหาในทุก property
- 🔄 **Refresh** — รีโหลดข้อมูลล่าสุดจาก Notion
- 📱 **Responsive** — ใช้งานได้บน mobile

## 🧩 รองรับ Notion Property Types

Title, Rich Text, Number, Select, Multi-Select, Status, Date, Checkbox, URL, Email, Phone,
People (read), Created Time (read), Last Edited Time (read)

---

## 🔐 ความปลอดภัย

- ✅ Token เก็บใน `.env` ฝั่ง server **ไม่** ส่งไปยัง browser
- ✅ Frontend เรียกแค่ `/api/*` endpoints ของ proxy ของเราเท่านั้น
- ⚠️ **อย่า** commit ไฟล์ `.env` ขึ้น git (เพิ่มใน `.gitignore`)

---

## 🐛 Troubleshooting

**"unauthorized"** → Token ผิด ตรวจสอบใน `.env`
**"object_not_found"** → ยังไม่ได้เชื่อม Integration กับ database (ดูขั้นตอน 2)
**"Could not find database"** → Database ID ผิด ใน URL Notion ให้คัดลอกเฉพาะส่วน 32 ตัวอักษรก่อน `?v=`
**CORS error** → รัน server ก่อน (`npm start`) แล้วเปิดผ่าน `http://localhost:3000` ไม่ใช่เปิด file เดี่ยว

---

## 🚀 Deploy (Optional)

- **Vercel/Netlify**: แยก `server.js` เป็น serverless function + ตั้งค่า env vars
- **Railway/Render**: push ทั้งโฟลเดอร์ขึ้น แล้วตั้งค่า env vars
- **Cloudflare Workers**: แปลง `server.js` เป็น Worker script

Enjoy! 🎉
