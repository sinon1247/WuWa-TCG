# 📖 คู่มือสำหรับ AI & Developer: วิธีอ่านและใช้งานข้อมูลการ์ด Wuthering Waves Battle TCG

เอกสารฉบับนี้จัดทำขึ้นเพื่อเป็น **คู่มือมาตรฐาน (Standard Specification & AI System Prompt Reference)** สำหรับ AI ทุกโมเดล หรือนักพัฒนาที่จะนำชุดข้อมูลนี้ไปสร้างหรือต่อยอดแอปพลิเคชัน เพื่อป้องกันความสับสน การจับคู่ความสามารถผิดใบ หรือการอ้างอิงรูปภาพผิด

---

## 🎯 กฎเหล็กสำคัญที่สุด (Golden Rules for AI)

> [!CAUTION]
> **ห้ามจำแนกการ์ดด้วยชื่อเพียงอย่างเดียว (Do NOT identify cards by name only):**
> ในเกม TCG นี้ **การ์ด 1 ใบ สามารถมีชื่อซ้ำกันได้** (เช่น มีตัวละครชื่อ "Sanhua" หลายใบ หรือ "Rover" หลายใบ โดยแต่ละใบมีค่า Level, Type, และความสามารถต่างกันอย่างสิ้นเชิง)

1. **ใช้ `card_code` เป็น Primary Key หลักเสมอ:**
   * ทุกการ์ดจะมีรหัสประจำตัวเฉพาะ เช่น `SD01-022`, `BP01-031`, `SD02-005`
   * การค้นหา อ้างอิง หรือจับคู่ข้อมูล **ต้องใช้ `card_code` เป็นหลักเสมอ**
2. **ความสามารถ (Abilities) ผูกติดอยู่ภายใน Array ของการ์ดใบนั้น:**
   * ความสามารถทุกข้อมี `ability_id` กำกับแน่นอนในรูปแบบ `{card_code}-ab1`, `{card_code}-ab2`
   * ห้ามดึงความสามารถออกมาเก็บแยกเป็นตารางเดี่ยวโดยไม่มี `card_code` กำกับเด็ดขาด
3. **ลำดับความสำคัญของข้อความคำแปล (Translation Resolution Order):**
   เมื่อแอปจะแสดงผลคำแปล ให้ใช้ตรรกะแบบ Fallback ดังนี้เสมอ:
   ```typescript
   // ตรรกะการแสดงผลคำแปลภาษาไทย
   const displayThaiText = ability.custom_th && ability.custom_th.trim() !== "" 
       ? ability.custom_th 
       : ability.original_th;

   // ตรรกะการแสดงผลภาษาอังกฤษ
   const displayEnglishText = ability.custom_en && ability.custom_en.trim() !== ""
       ? ability.custom_en
       : ability.original_en;
   ```
   * หากมีการแก้คำแปลใน `custom_th` ให้แสดง `custom_th` ทันที
   * หาก `custom_th` ยังว่างอยู่ ให้แสดง `original_th` จากฐานข้อมูลต้นฉบับ

---

## 📁 โครงสร้างโฟลเดอร์ของโปรเจกต์ (Directory Structure)

```text
E:\Wuthering Waves Battle TCG\TCG Data\
├── AI_READING_GUIDE.md        <-- คู่มือนี้ สำหรับ AI และนักพัฒนา
├── DATA_SPECIFICATION.md      <-- สเปกโครงสร้างข้อมูล Schema แบบละเอียด
├── data\
│   └── cards_master.json      <-- ไฟล์ฐานข้อมูลการ์ดชุดสมบูรณ์ (Master Database)
└── assets\
    └── cards\                 <-- รูปภาพการ์ดทั้งหมด (บันทึกแบบ Offline พร้อมใช้งาน)
        ├── BP01-001.jpg
        ├── SD01-022.jpg
        └── ...
```

---

## 🔍 คำอธิบาย Schema ของ `cards_master.json`

ไฟล์ `cards_master.json` เป็น JSON Object ขนาดใหญ่ ประกอบด้วยฟิลด์หลักดังนี้:

| ฟิลด์ | ประเภท | คำอธิบาย | ตัวอย่าง |
| :--- | :--- | :--- | :--- |
| `card_code` | `string` | **[KEY]** รหัสประจำการ์ด (ห้ามเปลี่ยน) | `"SD02-005"` |
| `system_id` | `string` | UUID ดั้งเดิมจากระบบฐานข้อมูล | `"65273e8e-..."` |
| `name_th` | `string` | ชื่อการ์ดภาษาไทย | `"Jinshi"` |
| `name_en` | `string` | ชื่อการ์ดภาษาอังกฤษ | `"Jinshi"` |
| `card_type` | `string` | ประเภทการ์ด (`Character`, `Action` ฯลฯ) | `"Character"` |
| `primary_rarity` | `string` | ระดับความหายากหลัก | `"★ ★ ★"` |
| `stats` | `object` | ค่าพลังต่าง ๆ (ขึ้นอยู่กับประเภทการ์ด) | `{"Level": "2", "Weapon": "Boardblade", "Attribute": "Spectro"}` |
| `tags` | `array[str]` | หมวดหมู่/แท็กของการ์ด | `["Jinshi", "Spectro"]` |
| `keywords` | `array[str]` | คำสำคัญของเกม | `["Combo", "Leader"]` |
| `image.local_path` | `string` | พาธรูปภาพในเครื่อง (สำหรับ Offline) | `"assets/cards/SD02-005.jpg"` |
| `image.remote_url` | `string` | ลิงก์รูปภาพสำรองบนอินเทอร์เน็ต | `"https://jobcreeper..."` |
| `rarity_variants` | `array[obj]`| ภาพหรือเวอร์ชันความหายากอื่นๆ ของการ์ดใบนี้ | `[ { "rarity": "★ ★", "local_image_path": "..." } ]` |
| `abilities` | `array[obj]`| รายการความสามารถทั้งหมดของการ์ดใบนี้ | *ดูรายละเอียดด้านล่าง* |
| `editor_notes` | `string` | โน้ตส่วนตัวของผู้ใช้เกี่ยวกับการ์ดใบนี้ | `""` |

---

## 🛠️ โครงสร้างของ Object ใน `abilities` (ความสามารถและการแก้ไข)

การ์ดแต่ละใบสามารถมีความสามารถได้ 1 ข้อขึ้นไป แต่ละข้อจะมีโครงสร้างดังนี้:

```json
{
  "ability_id": "SD02-005-ab1",
  "original_th": "[Leader] การ์ดสีแดงของคุณได้รับ “[Combo] การ์ดใบนี้ได้รับ +1 ดาเมจ”",
  "custom_th": "",
  "original_en": "",
  "custom_en": "",
  "keywords": ["Leader", "Combo"],
  "is_customized": false,
  "translation_status": "needs_review"
}
```

### คำอธิบายสถานะ `translation_status`:
* `"needs_review"`: คำแปลเดิมจากเว็บ ยังไม่ได้ผ่านการตรวจทาน
* `"verified"`: ตรวจสอบแล้วว่าถูกต้องตรงตามการ์ดจริง
* `"custom_edited"`: ได้รับการแก้ไขข้อความใน `custom_th` แล้ว

---

## 💻 ตัวอย่างโค้ดสำหรับอ่านข้อมูล (Code Snippets)

### 1. ภาษา JavaScript / TypeScript (สำหรับ React, Vue, Electron, Tauri, Node.js):

```typescript
import fs from 'fs';
import path from 'path';

interface Ability {
  ability_id: string;
  original_th: string;
  custom_th: string;
  original_en: string;
  custom_en: string;
  keywords: string[];
  is_customized: boolean;
  translation_status: string;
}

interface Card {
  card_code: string;
  name_th: string;
  name_en: string;
  card_type: string;
  primary_rarity: string;
  stats: Record<string, string>;
  tags: string[];
  image: {
    local_path: string;
    remote_url: string;
  };
  abilities: Ability[];
}

// ฟังก์ชันโหลดข้อมูล
export function loadCards(baseDir: string): Card[] {
  const jsonPath = path.join(baseDir, 'data', 'cards_master.json');
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const parsed = JSON.parse(rawData);
  return parsed.cards;
}

// ฟังก์ชันดึงคำแปลที่ถูกต้องมาแสดงผล (Safe Resolution)
export function getAbilityText(ability: Ability, lang: 'th' | 'en' = 'th'): string {
  if (lang === 'th') {
    return ability.custom_th?.trim() ? ability.custom_th : ability.original_th;
  }
  return ability.custom_en?.trim() ? ability.custom_en : ability.original_en;
}
```

### 2. ภาษา Python (สำหรับ PyQt, Tkinter, FastAPI):

```python
import json
import os

def load_cards(base_dir: str):
    json_path = os.path.join(base_dir, "data", "cards_master.json")
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data["cards"]

def get_ability_text(ability: dict, lang: str = "th") -> str:
    if lang == "th":
        custom = ability.get("custom_th", "").strip()
        return custom if custom else ability.get("original_th", "")
    else:
        custom = ability.get("custom_en", "").strip()
        return custom if custom else ability.get("original_en", "")

def update_card_ability(cards: list, card_code: str, ability_id: str, new_translation: str):
    """ฟังก์ชันอัปเดตคำแปลอย่างปลอดภัย ไม่หลงใบ"""
    for card in cards:
        if card["card_code"] == card_code:
            for ab in card["abilities"]:
                if ab["ability_id"] == ability_id:
                    ab["custom_th"] = new_translation
                    ab["is_customized"] = True
                    ab["translation_status"] = "custom_edited"
                    return True
    return False
```

---

## ⚠️ ข้อควรระวังเพิ่มเติมสำหรับ AI ที่จะสร้าง UI:

1. **รูปภาพการ์ดกับ Rarity Variants:**
   * รูปภาพเริ่มต้นของการ์ดอยู่ที่ `card.image.local_path`
   * หากผู้ใช้ต้องการดูรูปภาพแบบ Rarity พิเศษ (เช่น ฟอยล์, SP, หรือ 2 ดาว/3 ดาว) ให้อ่านจาก `card.rarity_variants` ซึ่งแต่ละ variant จะมี `local_image_path` ระบุไว้ชัดเจน
2. **ฟิลด์ Stats มีความหลากหลาย:**
   * การ์ด `Character` มักจะมี: `Level`, `Weapon`, `Attribute`
   * การ์ด `Action` มักจะมี: `cost`, `Coloe` (สี), `Speed`, `attack`, `Exclusive Character name`
   * ดังนั้น ใน UI ควรเขียนฟังก์ชันแสดง Stats แบบ Dynamic วนลูปอ่าน Key-Value หรือเช็กตาม `card_type`
