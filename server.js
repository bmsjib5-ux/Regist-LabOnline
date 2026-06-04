// server.js — Notion API Proxy Server
// วิธีใช้:
// 1. npm init -y
// 2. npm install express node-fetch@2 cors dotenv
// 3. สร้างไฟล์ .env แล้วใส่:
//      NOTION_TOKEN=secret_xxxxxxxxxxxx  (หรือ ntn_xxxxxxxxxx)
//      DATABASE_ID=3491c083c4858041b2a4de88f339a9b0
// 4. node server.js
// 5. เปิด http://localhost:3000

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.DATABASE_ID;
const NOTION_VERSION = '2022-06-28';

app.use(cors());
app.use(express.json());

// Block sensitive / non-public files from being served by express.static.
// server.js/main.js are source; *.bat are local-dev scripts; package.json reveals
// deps. Dotfiles (.env etc) are already ignored by default.
const BLOCKED_RE = /^\/(?:server\.js|main\.js|start\.bat|package(?:-lock)?\.json|node_modules(?:\/|$))/i;
app.use((req, res, next) => {
  if (BLOCKED_RE.test(req.path)) return res.status(404).end();
  next();
});

app.use(express.static(__dirname));

if (!NOTION_TOKEN || !DATABASE_ID) {
  console.error('❌ กรุณาตั้งค่า NOTION_TOKEN และ DATABASE_ID ในไฟล์ .env');
  process.exit(1);
}

const notionHeaders = {
  'Authorization': `Bearer ${NOTION_TOKEN}`,
  'Notion-Version': NOTION_VERSION,
  'Content-Type': 'application/json'
};

// ดึงโครงสร้าง database (properties/schema)
app.get('/api/database', async (req, res) => {
  try {
    const r = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}`, {
      headers: notionHeaders
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ดึงข้อมูล pages ทั้งหมดใน database
app.post('/api/query', async (req, res) => {
  try {
    const baseBody = { ...(req.body || {}) };
    delete baseBody.start_cursor;
    baseBody.page_size = 100;

    const allResults = [];
    let cursor = req.body?.start_cursor || undefined;
    const MAX_PAGES = 100;

    for (let i = 0; i < MAX_PAGES; i++) {
      const body = { ...baseBody };
      if (cursor) body.start_cursor = cursor;

      const r = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
        method: 'POST',
        headers: notionHeaders,
        body: JSON.stringify(body)
      });
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json(data);

      allResults.push(...(data.results || []));
      if (!data.has_more || !data.next_cursor) {
        return res.json({ object: 'list', results: allResults, has_more: false, next_cursor: null });
      }
      cursor = data.next_cursor;
    }
    res.json({ object: 'list', results: allResults, has_more: true, next_cursor: cursor,
               warning: `Truncated at ${MAX_PAGES * 100} records` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// สร้าง page ใหม่
app.post('/api/pages', async (req, res) => {
  try {
    const r = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: notionHeaders,
      body: JSON.stringify({
        parent: { database_id: DATABASE_ID },
        properties: req.body.properties || {}
      })
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// อัปเดต page
app.patch('/api/pages/:pageId', async (req, res) => {
  try {
    const r = await fetch(`https://api.notion.com/v1/pages/${req.params.pageId}`, {
      method: 'PATCH',
      headers: notionHeaders,
      body: JSON.stringify({
        properties: req.body.properties || {}
      })
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ลบ (archive) page
app.delete('/api/pages/:pageId', async (req, res) => {
  try {
    const r = await fetch(`https://api.notion.com/v1/pages/${req.params.pageId}`, {
      method: 'PATCH',
      headers: notionHeaders,
      body: JSON.stringify({ archived: true })
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}\n`);
  console.log(`📊 Database ID: ${DATABASE_ID}`);
  console.log(`🔑 Token: ${NOTION_TOKEN.substring(0, 10)}...\n`);
});
