# 📊 ข้อกำหนดโครงสร้างข้อมูล (Data Specification)

**Project:** Wuthering Waves Battle TCG Dataset  
**Version:** 1.0.0  
**Data Path:** `data/cards_master.json`  
**Assets Path:** `assets/cards/`

---

## 1. Data Schema Overview

```json
{
  "database_name": "Wuthering Waves Battle TCG Card Database",
  "version": "1.0.0",
  "total_cards": 123,
  "total_images": 164,
  "cards": [
    {
      "card_code": "SD02-005",
      "system_id": "65273e8e-c73e-43a5-8951-2a8087c09e21",
      "name_th": "Jinshi",
      "name_en": "Jinshi",
      "card_type": "Character",
      "primary_rarity": "★ ★ ★",
      "stats": {
        "Level": "2",
        "Weapon": "Boardblade",
        "Attribute": "Spectro"
      },
      "tags": [
        "Jinshi"
      ],
      "keywords": [],
      "sources": [],
      "sort_order": 0,
      "image": {
        "remote_url": "https://jobcreeper.github.io/WUWATCGbyjobcreep/CardPic/SD02-005.jpg",
        "local_path": "assets/cards/SD02-005.jpg"
      },
      "rarity_variants": [
        {
          "variant_id": "...",
          "rarity": "★ ★",
          "sources": ["BP01"],
          "image_url": "...",
          "local_image_path": "assets/cards/..."
        }
      ],
      "abilities": [
        {
          "ability_id": "SD02-005-ab1",
          "original_th": "[Leader] การ์ดสีแดงของคุณได้รับ “[Combo] การ์ดใบนี้ได้รับ +1 ดาเมจ”",
          "custom_th": "",
          "original_en": "",
          "custom_en": "",
          "keywords": [],
          "is_customized": false,
          "translation_status": "needs_review"
        }
      ],
      "editor_notes": "",
      "meta": {
        "created_at": "...",
        "updated_at": "..."
      }
    }
  ]
}
```

---

## 2. ฟิลด์และความหมาย (Fields Dictionary)

### ส่วนของการ์ด (Card Level):
- **`card_code` (string):** รหัสการ์ดที่เป็น Unique Key (เช่น `SD01-022`, `BP01-031`) ใช้เป็นตัวระบุหลักในการพัฒนาโปรแกรม
- **`system_id` (string):** รหัส UUID ต้นฉบับจากฐานข้อมูล
- **`name_th` (string):** ชื่อการ์ด (ภาษาไทย หรือชื่อตัวละครสากล)
- **`name_en` (string):** ชื่อการ์ดภาษาอังกฤษ
- **`card_type` (string):** ประเภทการ์ด เช่น `Character`, `Action`
- **`primary_rarity` (string):** ระดับความหายากหลัก เช่น `★`, `★ ★`, `★ ★ ★`
- **`stats` (dict):** คู่ Key-Value ของค่าพลัง
  - สำหรับ `Character`: มักมี `Level`, `Weapon`, `Attribute`
  - สำหรับ `Action`: มักมี `cost`, `Coloe` (สีของการ์ด เช่น แดง, ฟ้า), `Speed`, `attack`, `Exclusive Character name`
- **`tags` (list[string]):** แท็กหรือคุณลักษณะ เช่น `Resonance Skill`, `Rover (F)`, `Spectro`, `Glacio`
- **`keywords` (list[string]):** คำสำคัญของระบบเกม
- **`image` (object):**
  - `local_path`: พาธไฟล์ภาพในโฟลเดอร์ `assets/cards/` สำหรับโหลดแบบ Offline
  - `remote_url`: URL รูปภาพบน GitHub Pages ต้นฉบับ
- **`rarity_variants` (list[object]):** อาร์เรย์ของภาพ/เวอร์ชัน Rarity อื่นๆ ของการ์ดใบเดียวกัน
- **`abilities` (list[object]):** รายการความสามารถ/สกิลของการ์ด

---

### ส่วนของความสามารถ (Ability Level):
- **`ability_id` (string):** รหัสประจำความสามารถ รูปแบบ `{card_code}-ab{index}` (เช่น `BP01-031-ab1`) ป้องกันการสับสนระหว่างการ์ด
- **`original_th` (string):** คำแปลภาษาไทยดั้งเดิมจากเว็บ
- **`custom_th` (string):** **[จุดสำหรับแก้ไข]** หากผู้ใช้ต้องการแก้คำแปล ให้ใส่ข้อความที่แก้แล้วลงในช่องนี้
- **`original_en` (string):** คำอธิบายภาษาอังกฤษดั้งเดิม (ถ้ามี)
- **`custom_en` (string):** คำอธิบายภาษาอังกฤษที่แก้ใหม่ (ถ้ามี)
- **`is_customized` (boolean):** ค่าสถานะว่ามีการแก้คำแปลหรือไม่ (`true`/`false`)
- **`translation_status` (string):**
  - `"needs_review"` = รอตรวจสอบ
  - `"verified"` = ตรวจสอบแล้ว ถูกต้อง
  - `"custom_edited"` = แก้ไขโดยผู้ใช้แล้ว
