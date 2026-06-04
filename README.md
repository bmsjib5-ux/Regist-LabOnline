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

## 🚀 Deploy to Render

โปรเจกต์มี [`render.yaml`](render.yaml) ให้แล้ว — Render จะอ่านและสร้าง service อัตโนมัติ

### ขั้นตอน (ครั้งเดียว)

1. **Push ขึ้น GitHub** ให้เรียบร้อย (ทำแล้วถ้าตามคู่มือนี้ตั้งแต่ต้น)
2. ไปที่ **https://dashboard.render.com** → **New +** → **Blueprint**
3. เลือก repo `Regist-LabOnline` → Render เจอ `render.yaml` ขึ้นมาเอง
4. ก่อน **Apply** ใส่ environment variables 2 ตัว (secret, ไม่ถูก commit):
   - `NOTION_TOKEN` = `ntn_xxxxxxxx...`
   - `DATABASE_ID` = `3491c083c4858041b2a4de88f339a9b0`
5. คลิก **Apply** → Render build + deploy ให้ (~2-3 นาที)
6. ได้ URL เช่น `https://regist-labonline.onrender.com` — แจกได้เลย

### หลัง deploy
- ทุก `git push` ที่ branch `main` → Render auto-deploy ใหม่ (`autoDeploy: true`)
- ดู build log ได้ใน Render dashboard → service → **Logs**
- Health check `/api/database` ต้องคืน 200 (Render ใช้ตรวจว่า deploy สำเร็จ)

### Plan
- **Free** (default): instance จะ sleep หลังนิ่ง 15 นาที, cold start ~30 วินาที
- ถ้าต้อง always-on: เปลี่ยน `plan: free` → `plan: starter` ใน `render.yaml` ($7/เดือน)

Enjoy! 🎉
