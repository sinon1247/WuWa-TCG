# สถานะล่าสุดหลังแก้ข้อ 1–3

แก้ระบบ Advantage และเพิ่ม handler เฉพาะกลุ่ม Shorekeeper, Camellya, Encore, Chixia, Sanhua และ Echo แล้ว ดู [ผลการแก้และข้อจำกัดปัจจุบัน](RULES_IMPLEMENTATION.md) พร้อมชุดทดสอบ 103 ข้อ — ข้อ 3 นำตัวอ่านสกิลจากข้อความออก แก้กลุ่ม Rover (M), เงื่อนไข Leader, คอสต์ และการเลือกเป้าหมายแล้ว

**ข้อมูลด้านล่างเป็นรายงานรอบแรกก่อนแก้ข้อ 1–2** ข้อบกพร่องของกลุ่มดังกล่าวบางรายการได้รับการแก้แล้ว จึงไม่ใช่รายการค้างปัจจุบันทั้งหมด

---

# Card and gameplay audit — 2026-09-21

ผล: ยังไม่พร้อมรับรองว่าสกิลครบทุกใบ และยังไม่ควรแจกเป็นรุ่นที่เล่นตรงกฎทั้งหมด

ตรวจข้อความ 123 ใบ / 138 รายการสกิล เทียบ engine.js และกฎ PDF Ver1.0.1 (อ่าน text extraction); ตารางด้านล่างเป็น static review ไม่ใช่การทดสอบทุกสกิลครบทุกเงื่อนไข

## ผลทดสอบ

- เดิม 17/18 ผ่าน: Incarnation ถูก red-only policy บล็อก
- หลังแก้ 28/28 ผ่าน รวม regression ใหม่10ข้อ และ simulation20แมตช์จากชุดเดิม40รหัส
- ปรับข้อทดสอบ Incarnation ให้บันทึกพฤติกรรมเดโมเดิม ไม่ใช่ประกาศว่าตรงกฎ
- npm ในเครื่องเสีย (หา npm-cli.js ไม่พบ); ใช้ node --test tests/*.test.mjs โดยตรง
- ไม่มีการ push หรือแก้ฐานข้อมูลการ์ด

## สิ่งที่แก้แล้ว

Crownless เล็งผิดฝ่าย; Crimson Pistil บวกซ้ำ/ข้ามเงื่อนไข; Rover M Heavy ไม่จ่ายคอสต์/บวกซ้ำ; Whizzing Fight Spirit ตรวจสีผิดฝั่ง; Camellya LV0 trigger ผิดจังหวะและ LV1 ไม่เช็กสีตัวเอง; สกิล each-turn ไม่เช็ก Leader/ไม่ทำงานจบเทิร์นศัตรู; Sanhua Counter ทำซ้ำ End; ห้าม Encore LV2 อัปตาม Action; บอทตรวจผู้ชนะ0ผิด; ซ่อน modal ของบอทและกันปุ่มควบคุม; กันลากลงสนามผิดฝ่าย; ลบ mandatoryActionJudgement ที่ไม่ได้เรียกและมีกฎ tax ต่างจากตัวใช้งานจริง; เปลี่ยนป้ายพร้อมใช้เป็นทดลอง

## ประเด็นกฎที่ต้องยืนยันก่อนเปลี่ยน

ข้อ604.1.2.7 และ912.1 อนุญาต Follow-up X แม้ไม่ได้ชนะสีแดง; เดโมยังคงข้อกำหนด red-only ตามคำสั่งผู้ใช้เดิม จึงทำให้หลายสกิลไร้ผล ไม่ได้แก้กลับโดยพลการ

## ปัญหาระดับระบบที่ยังค้าง

- ไม่มี Advantage state ตามข้อ913.13 (ชนะเทิร์นก่อน/คู่แข่งข้าม Counter); generic ใช้ event หลังดาเมจแทน ผิดความหมาย
- genericActionEffect รวมข้อความทุกสกิลแล้วจับ regex ทำให้ข้ามเงื่อนไข จังหวะ optional และเป้าหมาย
- isSupported ยังคงเปิดให้ลงทุกใบ ไม่ใช่หลักฐานว่ารองรับสกิล; ป้าย UI แก้ให้ไม่รับรองเกินจริง
- mandatory trigger ยังพึ่ง app.js auto-activate; engine.skipAll ข้ามสกิลบังคับได้
- autoLevel เลือกใบแรก ไม่เรียก Level up trigger ร่างต้น; Enter/Level up ยังไม่ได้แยก event
- lastDamage/lastDraw/revealed เก็บได้ชุดล่าสุด ไม่ใช่ event queue; auto effect หลัง animateMoves อาจยังวาร์ปและพลาด aura
- leaderSwapPending/revealPending ไม่ถูกตั้งในจังหวะคำสั่งที่ต้องใช้; อนิเมชันต้องตรวจใน browser เพิ่ม
- runBot มีเพดาน30ขั้นและไม่ resume ถ้าใช้ครบ; ผู้เล่นกดข้าม/โหมดควบคุม2ฝั่งยังต้องตรวจ integration
- localStorage JSON ของเด็คลิสต์/อาร์ต parse ก่อน try; ข้อมูลเสียหรือ storage ถูกปิดอาจเปิดเว็บไม่ได้; ชื่อเด็คยังใช้ window.prompt
- ยังไม่มี multiplayer/server/ห้อง secret code; ซ่อนมือใน DOM ไม่ใช่ความปลอดภัยสำหรับเล่นออนไลน์จริง
- working tree มี playmat-a3-dark.png ถูกลบก่อนเริ่ม audit; ไม่กู้คืน/แก้โดยพลการ

## ตัวอย่างปัญหาที่ยืนยันด้วย execution

- BP01-008 Switch ไม่สร้าง draw/discard: ยืนยันปัญหา: The expression evaluated to a falsy value:
- BP01-006 heal ไม่สร้าง draw trigger: ยืนยันปัญหา: The expression evaluated to a falsy value:
- BP01-027 Counter สีแดงไม่ทำ1ดาเมจ: ยืนยันปัญหา: Expected values to be strictly equal:
- BP01-057 จั่วโดยยังไม่ได้เล่น Intro: ยืนยันปัญหา: Expected values to be strictly equal:
- SD02-018 จั่วแต่ไม่เลือกทิ้ง: ยืนยันปัญหา: The expression evaluated to a falsy value:
- SD02-016 ไม่ล็อก Combo ฝ่ายตรงข้ามในเทิร์นถัดไป: ยืนยันปัญหา: Expected values to be strictly equal:

## ตรวจรายใบ

ทุกแถวยังต้องผ่าน integration/negative cases ก่อนติดป้ายพร้อมใช้ ไม่มีแถวใดหมายถึงรับรองครบทุกกรณี

| รหัส | ชื่อ | ข้อสังเกตหลังแก้ |
|---|---|---|
| BP01-001 | Camellya | ขาดการคืน Camellya เมื่อเป็นร่างต้น Level up และตัวปรับดาเมจรับ/ทำ |
| BP01-002 | Camellya | ขาดการคืน Camellya เมื่อเป็นร่างต้น Level up และตัวปรับดาเมจรับ/ทำ |
| BP01-003 | Camellya | เลือก Basic Attack แบบ hardcode BP01-044 แทนการให้ผู้เล่นเลือกจากแท็ก; BP01-005 แก้ไม่ให้ทำงานตอน Enter แล้ว |
| BP01-004 | Camellya | แก้เงื่อนไขแพ้ให้ตรวจว่าการ์ดตัวเองเป็นสีแดงแล้ว; ยังต้องตรวจสกิลหลายชั้นร่วมกัน |
| BP01-005 | Camellya | เลือก Basic Attack แบบ hardcode BP01-044 แทนการให้ผู้เล่นเลือกจากแท็ก; BP01-005 แก้ไม่ให้ทำงานตอน Enter แล้ว |
| BP01-006 | Shorekeeper | ไม่มี hook เมื่อ heal และไม่มีตัวนับจำกัด 2 ครั้งต่อเทิร์น |
| BP01-007 | Shorekeeper | trigger อยู่ Counter หลังเลือก/จ่ายคอสต์ ทั้งที่ข้อความระบุเริ่ม own Counter ก่อนเลือก และถูกตั้ง optional |
| BP01-008 | Shorekeeper | ไม่มี Switch trigger |
| BP01-009 | Shorekeeper | คืนการ์ดใบแรกอัตโนมัติ ไม่มีตัวเลือกและไม่มี optional; ต้องตรวจแท็ก Normal/Basic |
| BP01-010 | Shorekeeper | มี reveal/heal ตรงสี แต่ heal ไม่มีการแจ้ง aura และไม่กระตุ้น BP01-006 |
| BP01-011 | Encore | แก้ห้ามอัปด้วย Action แล้ว; ยังขาดบัฟ Encore และคืนร่างตามเทิร์นที่ลง |
| BP01-012 | Encore | ไม่มี end-each-turn retrieval ตามดาเมจ; generic Enter อาจคืนการ์ดผิดจังหวะ |
| BP01-013 | Encore | generic retrieval ไม่บังคับสีแดง และใช้ owner ของ Character ซึ่งไม่มีฟิลด์นี้ |
| BP01-014 | Encore | ยังไม่มี inherited/passive damage handler ตามข้อความ |
| BP01-015 | Encore | ยังไม่มี inherited/passive damage handler ตามข้อความ |
| BP01-016 | Rover (F) | มี handler เฉพาะ; ยังต้องตรวจลำดับ trigger/optional/หลายชั้นและ presentation รายเอฟเฟกต์ |
| BP01-017 | Rover (F) | มี handler เฉพาะ; ยังต้องตรวจลำดับ trigger/optional/หลายชั้นและ presentation รายเอฟเฟกต์ |
| BP01-018 | Rover (F) | มี handler เฉพาะ; ยังต้องตรวจลำดับ trigger/optional/หลายชั้นและ presentation รายเอฟเฟกต์ |
| BP01-019 | Rover (M) | Follow-up ที่ไม่ใช่สีแดงถูกนโยบายเดโมบล็อก; BP01-031 ยังขาดเลือกสลับลีดเดอร์ |
| BP01-020 | Rover (M) | ไม่มี Enter reveal handler (มีเฉพาะ Rover F BP01-017) |
| BP01-021 | Rover (M) | generic counter ข้ามตัวเลือก optional และไม่มี skill aura |
| BP01-022 | Yangyang | มี handler เฉพาะ; ยังต้องตรวจลำดับ trigger/optional/หลายชั้นและ presentation รายเอฟเฟกต์ |
| BP01-023 | Yangyang | มี handler เฉพาะ; ยังต้องตรวจลำดับ trigger/optional/หลายชั้นและ presentation รายเอฟเฟกต์ |
| BP01-024 | Yangyang | มี handler เฉพาะ; ยังต้องตรวจลำดับ trigger/optional/หลายชั้นและ presentation รายเอฟเฟกต์ |
| BP01-025 | Chixia | ไม่มี character counterEnd trigger |
| BP01-026 | Chixia | คืนการ์ดใบแรกอัตโนมัติ ไม่มีตัวเลือกและไม่มี optional; ต้องตรวจแท็ก Normal/Basic |
| BP01-027 | Chixia | ไม่มี counter damage handler ของ Chixia |
| BP01-028 | Jinshi | มี handler เฉพาะ; ยังต้องตรวจลำดับ trigger/optional/หลายชั้นและ presentation รายเอฟเฟกต์ |
| BP01-029 | Jinshi | มี handler เฉพาะ; ยังต้องตรวจลำดับ trigger/optional/หลายชั้นและ presentation รายเอฟเฟกต์ |
| BP01-030 | Jinshi | มี handler เฉพาะ; ยังต้องตรวจลำดับ trigger/optional/หลายชั้นและ presentation รายเอฟเฟกต์ |
| BP01-031 | Sanhua | Follow-up ที่ไม่ใช่สีแดงถูกนโยบายเดโมบล็อก; BP01-031 ยังขาดเลือกสลับลีดเดอร์ |
| BP01-032 | Sanhua | ไม่มีนำการ์ดจากกองทิ้งเข้า Concerto |
| BP01-033 | Sanhua | generic Counter รับทั้งเขียวและฟ้า แทนฟ้าเท่านั้น; แก้ไม่ให้ trigger ซ้ำตอน End แล้ว |
| BP01-034 | Traffic Illuminator | ขาดข้อจำกัด Echo 1 ใบและบัฟจากชุดแท็กใน Concerto |
| BP01-035 | Inferno Rider | ขาด Echo limit/Advantage จากเทิร์นก่อน; สุ่มทิ้งแทนฝ่ายตรงข้ามเลือก |
| BP01-036 | Gulpuff | ขาดข้อจำกัด Echo 1 ใบและบัฟจากชุดแท็กใน Concerto |
| BP01-037 | Lampylumen Myriad | ขาด Echo limit/Advantage; เลือกเป้าหมายเองแบบใบแรกแทนให้ผู้เล่นเลือก |
| BP01-038 | Chirpuff | ขาดข้อจำกัด Echo 1 ใบและบัฟจากชุดแท็กใน Concerto |
| BP01-039 | Feilian Beringal | สุ่มใต้เด็คมีแล้ว แต่ขาด Echo limit/Advantage ตามกฎ |
| BP01-040 | Roseshroom | ขาดข้อจำกัด Echo 1 ใบและบัฟจากชุดแท็กใน Concerto |
| BP01-041 | Crownless | แก้ mill ผิดฝ่ายและจำนวนแล้ว; ยังขาด Echo limit/Advantage ตามกฎ |
| BP01-042 | Cruisewing | ขาดข้อจำกัด Echo 1 ใบและบัฟจากชุดแท็กใน Concerto |
| BP01-043 | Mourning Aix | ขาด Echo limit/Advantage; เลือกเป้าหมายเองแบบใบแรกแทนให้ผู้เล่นเลือก |
| BP01-044 | Burgeoning • Basic Attack | ไม่มีสกิลเฉพาะ; ใช้กฎพื้นฐานสี/คอสต์/ดาเมจ ยังไม่มี regression แยกทุกใบ |
| BP01-045 | Burgeoning • Dodge Counter | ไม่มีสกิลเฉพาะ; ใช้กฎพื้นฐานสี/คอสต์/ดาเมจ ยังไม่มี regression แยกทุกใบ |
| BP01-046 | Everblooming | autoLevel เลือกเป้าหมายใบแรก ไม่มีตัวเลือก; trigger ของร่างต้นไม่ครบ และอาจทำงานโดยไม่สลับสำเร็จ |
| BP01-047 | Burgeoning • Heavy Attack | generic จั่วเมื่อชนะมีแล้ว แต่ควรแยก handler/เพิ่ม aura และทดสอบรายใบ |
| BP01-048 | Crimson Blossom | ไม่มี Counter level-up; generic อาจพยายามทำใน Judgement ผิดเฟส |
| BP01-049 | Fervor Efflorescent | ไม่มีสกิลเฉพาะ; ใช้กฎพื้นฐานสี/คอสต์/ดาเมจ ยังไม่มี regression แยกทุกใบ |
| BP01-050 | Crimson Pistil | แก้เงื่อนไข Action >=2 และบวกครั้งเดียว; regression ผ่าน |
| BP01-051 | Vining Ronde | generic จั่วเมื่อชนะมีแล้ว แต่ควรแยก handler/เพิ่ม aura และทดสอบรายใบ |
| BP01-052 | Origin Calculus • Basic Attack | ไม่มีสกิลเฉพาะ; ใช้กฎพื้นฐานสี/คอสต์/ดาเมจ ยังไม่มี regression แยกทุกใบ |
| BP01-053 | Origin Calculus • Dodge | generic heal เมื่อชนะมีแล้ว แต่ยังไม่มี heal trigger BP01-006 |
| BP01-054 | Enlightenment | generic ทำ heal โดยไม่รอเงื่อนไขสลับสำเร็จ และอาจ heal ผิดจังหวะ Judgement |
| BP01-055 | Origin Calculus • Heavy Attack | บัฟตรวจเฉพาะ Counter ไม่อัปเดตตาม HP ขณะ Combo/ดาเมจ |
| BP01-056 | Chaos Theory | autoLevel เลือกใบแรกและไม่ทำ Level up trigger ของร่างต้น |
| BP01-057 | End loop | generic รวมทุกสกิล: จั่วผิดตอนชนะ; ไม่มีมอบสกิล Intro 2 ใบถัดไป; Follow-up ถูกบล็อก |
| BP01-058 | Supernal Stellarealm | generic จั่วได้ แต่ล็อก Combo ให้ฝั่งตัวเองผิดจังหวะ Counter แทนฝั่งศัตรูเมื่อแพ้/Advantage |
| BP01-059 | Wooly Attack • Basic Attack | ไม่มี speed override / Advantage |
| BP01-060 | Wooly Attack • Heavy Attack | จั่วเมื่อทำดาเมจ/Encore มีใน generic แต่จั่วผิดเมื่อ Judgement ชนะแม้ยังไม่ทำดาเมจ |
| BP01-061 | Black & White Woolies | ล็อก Combo เฉพาะ Counter; Combo handler ไม่ล็อก |
| BP01-062 | Cosmos Rave | ลด cost หลังจ่ายไปแล้วและไม่มี Advantage state; ไม่ลง Encore LV2 ตาม Counter |
| BP01-063 | Woolies Helpers | สลับตรงไป Encore แทนเลือกเป้าหมาย และไม่มี retrieval ที่ระบุ |
| BP01-064 | Wooly Attack • Dodge Counter | ไม่มีสกิลเฉพาะ; ใช้กฎพื้นฐานสี/คอสต์/ดาเมจ ยังไม่มี regression แยกทุกใบ |
| BP01-065 | Vibration Manifestation • Heavy Attack | มี optional discard +1; ต้องทดสอบ skip/หลาย trigger ต่อเนื่อง |
| BP01-066 | Vibration Manifestation • Mid-air Attack | มี handler จั่วเมื่อชนะ; presentation ของการจั่ว auto-trigger ยังมีข้อจำกัด |
| BP01-067 | Vibration Manifestation • Heavy Attack | แก้เป็น optional discard แล้วได้ +1 ครั้งเดียว; regression ผ่าน |
| BP01-068 | Vibration Manifestation • Mid-air Attack | generic จั่วเมื่อชนะมีแล้ว แต่ควรแยก handler/เพิ่ม aura และทดสอบรายใบ |
| BP01-069 | Feather Release • Dodge | Follow-up ถูกล็อกเมื่อไม่ชนะด้วยสีแดงตามคำสั่งเดิม ต่างจากข้อ 604.1.2.7; SD02-013 generic ไม่ตรงคำว่าได้รับ 2 |
| BP01-070 | Zephyr Domain | มีเลือกเป้าหมาย; ยังต้องเปิดเผยการ์ดค้นหา/ตรวจลำดับจั่วและเด็ครีเฟรช |
| BP01-071 | Echoing Feathers | มีตรวจแท็ก Airborn แต่ยังไม่มีประวัติการเล่นทั้งเทิร์น (ตรวจเฉพาะ Action ปัจจุบัน) |
| BP01-072 | DAKA DAKA! | ไม่มี Advantage Counter retrieval |
| BP01-073 | Overflowing Radiance | มีเลือกเป้าหมาย; ยังต้องเปิดเผยการ์ดค้นหา/ตรวจลำดับจั่วและเด็ครีเฟรช |
| BP01-074 | Illuminous Epiphany | มีบัฟตามจำนวน Action/ล็อก Combo; ยังต้องตรวจลำดับหลายสกิล |
| BP01-075 | Slash of Breaking Dawn • Heavy Attack | มี handler จั่วเมื่อชนะ; presentation ของการจั่ว auto-trigger ยังมีข้อจำกัด |
| BP01-076 | Freezing Thorns | ไม่เคารพ optional switch; Level up ไม่มีเลือกและอาจข้ามเงื่อนไข Leader |
| BP01-077 | Ice Burst | ไม่มี Judgement switch ตาม Concerto |
| SD01-001 | Rover (F) | มี handler เฉพาะ; ยังต้องตรวจลำดับ trigger/optional/หลายชั้นและ presentation รายเอฟเฟกต์ |
| SD01-002 | Rover (F) | มี handler เฉพาะ; ยังต้องตรวจลำดับ trigger/optional/หลายชั้นและ presentation รายเอฟเฟกต์ |
| SD01-003 | Yangyang | มี handler เฉพาะ; ยังต้องตรวจลำดับ trigger/optional/หลายชั้นและ presentation รายเอฟเฟกต์ |
| SD01-004 | Yangyang | มี handler เฉพาะ; ยังต้องตรวจลำดับ trigger/optional/หลายชั้นและ presentation รายเอฟเฟกต์ |
| SD01-005 | Chixia | ยังไม่มี inherited/passive damage handler ตามข้อความ |
| SD01-006 | Chixia | generic reveal เมื่อแพ้มีแล้ว แต่ไม่เป็น optional และไม่มี aura |
| SD01-007 | POW POW • Basic Attack | ไม่มีสกิลเฉพาะ; ใช้กฎพื้นฐานสี/คอสต์/ดาเมจ ยังไม่มี regression แยกทุกใบ |
| SD01-008 | POW POW • Dodge Counter | ไม่มีสกิลเฉพาะ; ใช้กฎพื้นฐานสี/คอสต์/ดาเมจ ยังไม่มี regression แยกทุกใบ |
| SD01-009 | Leaping Flames | generic Intro ไม่ให้เลือกลีดเดอร์ และโบนัสไม่ผูกกับการสลับสำเร็จ |
| SD01-010 | Whizzing Fight Spirit | แก้ตรวจสีฝ่ายชนะเป็นฟ้าแล้ว; regression ผ่าน |
| SD01-011 | Blazing Flames | มี Leader Skill gate ตามชื่อเจ้าของ; ยังต้องทดสอบเด็คหลายชุด |
| SD01-012 | Feather as Blade • Basic Attack | ไม่มีสกิลเฉพาะ; ใช้กฎพื้นฐานสี/คอสต์/ดาเมจ ยังไม่มี regression แยกทุกใบ |
| SD01-013 | Feather as Blade • Dodge | Follow-up ถูกล็อกเมื่อไม่ชนะด้วยสีแดงตามคำสั่งเดิม ต่างจากข้อ 604.1.2.7; SD02-013 generic ไม่ตรงคำว่าได้รับ 2 |
| SD01-014 | Whispering Breeze | มี Intro เลือกลีดเดอร์และผลตามเป้าหมาย; ยังไม่มี Switch trigger |
| SD01-015 | Jump | Follow-up ถูกล็อกเมื่อไม่ชนะด้วยสีแดงตามคำสั่งเดิม ต่างจากข้อ 604.1.2.7; SD02-013 generic ไม่ตรงคำว่าได้รับ 2 |
| SD01-016 | Wind Spirals | มี tax เทิร์นถัดไป; ยังต้องทดสอบร่วม cost reduction/Advantage |
| SD01-017 | Vibration Manifestation • Basic Attack | ไม่มีสกิลเฉพาะ; ใช้กฎพื้นฐานสี/คอสต์/ดาเมจ ยังไม่มี regression แยกทุกใบ |
| SD01-018 | Vibration Manifestation • Dodge | มี draw/discard หรือ reveal; การเผยมือเป็นเอฟเฟกต์ถูกกฎ ต้องแยกจากการหลุดมือบอท |
| SD01-019 | Waveshock | มี Intro เลือกลีดเดอร์และผลตามเป้าหมาย; ยังไม่มี Switch trigger |
| SD01-020 | Sensor | มี draw/discard หรือ reveal; การเผยมือเป็นเอฟเฟกต์ถูกกฎ ต้องแยกจากการหลุดมือบอท |
| SD01-021 | Grapple | Follow-up ถูกล็อกเมื่อไม่ชนะด้วยสีแดงตามคำสั่งเดิม ต่างจากข้อ 604.1.2.7; SD02-013 generic ไม่ตรงคำว่าได้รับ 2 |
| SD01-022 | Resonating Slashes | มี Leader Skill gate ตามชื่อเจ้าของ; ยังต้องทดสอบเด็คหลายชุด |
| SD01-023 | Echoing Orchestra | ใช้ hp +=5 ต่างจาก heal ที่ cap20; ต้องยืนยันเพดาน HP และใช้ heal hook ร่วมกัน |
| SD02-001 | Rover (M) | แก้ Leader และทำงานเมื่อจบเทิร์นทั้งสองฝ่าย; regression ผ่าน แต่ยังไม่มี aura |
| SD02-002 | Rover (M) | generic reveal เมื่อแพ้มีแล้ว แต่ไม่เป็น optional และไม่มี aura |
| SD02-003 | Sanhua | แก้ Leader และทำงานเมื่อจบเทิร์นทั้งสองฝ่าย; regression ผ่าน แต่ยังไม่มี aura |
| SD02-004 | Sanhua | generic reveal เมื่อแพ้มีแล้ว แต่ไม่เป็น optional และไม่มี aura |
| SD02-005 | Jinshi | มี handler เฉพาะ; ยังต้องตรวจลำดับ trigger/optional/หลายชั้นและ presentation รายเอฟเฟกต์ |
| SD02-006 | Jinshi | มี handler เฉพาะ; ยังต้องตรวจลำดับ trigger/optional/หลายชั้นและ presentation รายเอฟเฟกต์ |
| SD02-007 | Slash of Breaking Dawn • Basic Attack | ไม่มีสกิลเฉพาะ; ใช้กฎพื้นฐานสี/คอสต์/ดาเมจ ยังไม่มี regression แยกทุกใบ |
| SD02-008 | Slash of Breaking Dawn • Dodge Counter | ไม่มีสกิลเฉพาะ; ใช้กฎพื้นฐานสี/คอสต์/ดาเมจ ยังไม่มี regression แยกทุกใบ |
| SD02-009 | Loong's Halo | มี Intro เลือกลีดเดอร์และผลตามเป้าหมาย; ยังไม่มี Switch trigger |
| SD02-010 | Incarnation | Follow-up ถูกล็อกเมื่อไม่ชนะด้วยสีแดงตามคำสั่งเดิม ต่างจากข้อ 604.1.2.7; SD02-013 generic ไม่ตรงคำว่าได้รับ 2 |
| SD02-011 | Purge of Light | มีเงื่อนไข Action >=3 และบวก3; ยังต้องทดสอบร่วม passive |
| SD02-012 | Frigid Light • Basic Attack | ไม่มีสกิลเฉพาะ; ใช้กฎพื้นฐานสี/คอสต์/ดาเมจ ยังไม่มี regression แยกทุกใบ |
| SD02-013 | Frigid Light • Dodge | Follow-up ถูกล็อกเมื่อไม่ชนะด้วยสีแดงตามคำสั่งเดิม ต่างจากข้อ 604.1.2.7; SD02-013 generic ไม่ตรงคำว่าได้รับ 2 |
| SD02-014 | Silversnow | generic Intro ไม่ให้เลือก; SD02-019 ไม่จั่วหลังสลับ และอาจจั่วเมื่อ Judgement ผิดเฟส |
| SD02-015 | Eternal Frost | มี generic Concerto2 แต่ต้องตรวจเปิดเผย/รีเฟรช/ออร่า |
| SD02-016 | Glacial Gaze | ไม่มีสถานะห้ามฝ่ายตรงข้าม Combo ในเทิร์นถัดไป; regex ไม่ตรงข้อความ ไม่เกิดผลที่ระบุ |
| SD02-017 | Vibration Manifestation • Basic Attack | ไม่มีสกิลเฉพาะ; ใช้กฎพื้นฐานสี/คอสต์/ดาเมจ ยังไม่มี regression แยกทุกใบ |
| SD02-018 | Vibration Manifestation • Dodge | จั่วแต่ไม่ทิ้ง (ไม่มี explicit alias จาก SD01-018) |
| SD02-019 | Waveshock | generic Intro ไม่ให้เลือก; SD02-019 ไม่จั่วหลังสลับ และอาจจั่วเมื่อ Judgement ผิดเฟส |
| SD02-020 | Sensor | จั่วแต่ไม่เปิดเผยมือตรงข้าม (ไม่มี explicit alias จาก SD01-020) |
| SD02-021 | Grapple | Follow-up ถูกล็อกเมื่อไม่ชนะด้วยสีแดงตามคำสั่งเดิม ต่างจากข้อ 604.1.2.7; SD02-013 generic ไม่ตรงคำว่าได้รับ 2 |
| SD02-022 | Resonating Slashes | มี Leader Skill gate ตามชื่อเจ้าของ; ยังต้องทดสอบเด็คหลายชุด |
| SD02-023 | Echoing Orchestra | มี Leader Skill gate ตามชื่อเจ้าของ; ยังต้องทดสอบเด็คหลายชุด |

## ข้อความอ้างอิงรายสกิล

- BP01-001-ab1: [Level up] นำการ์ดใบนี้กลับเข้า Character deck
- BP01-001-ab2: [Leader] ดาเมจที่เจ้าของได้รับ +1 การ์ดสีแดงของ 【Camellya】ได้รับ +1 ดาเมจ
- BP01-002-ab1: [Level up] นำการ์ดใบนี้กลับเข้า Character deck
- BP01-002-ab2: [Leader] แต่ละรอบการเล่น ดาเมจที่ได้รับ -1
- BP01-003-ab1: [Enter] / [Level up] สามารถนำการ์ด <Basic Attack> 1 ใบจากกองทิ้งขึ้นมือ
- BP01-004-ab1: [Leader] [Judgement] หากแพ้การ์ดสีฟ้า ในการเล่นการ์ดสีแดง สามารถแสดงการ์ด 1 ใบบนสุดของเด็ค จากนั้นนำขึ้นมือ
- BP01-005-ab1: [Leader] [Judgement] หากชนะ นำการ์ด <Basic attack> 1 ใบจากกองทิ้งขึ้นมือ
- BP01-006-ab1: 2 ครั้งต่อรอบการเล่น หากฟื้นฟูพลังชีวิต สามารถจั่วการ์ด 1 ใบขึ้นมือ
- BP01-007-ab1: [Leader] [At start of own Counter phase]  หากบนมือมีการ์ด 4 ใบหรือต่ำกว่า จั่วให้มือมี 5 ใบ
- BP01-008-ab1: [Switch] สามารถจั่วการ์ด 1 ใบ จากนั้นทิ้งการ์ด 1 ใบ
- BP01-009-ab1: [Enter] / [Level up] สามารถนำการ์ด <Intro Skill> 1 ใบจากกองทิ้งขึ้นมือ
- BP01-010-ab1: [Leader] [Counter] หาก counter ด้วยการ์ดสีเขียว สามารถแสดงการ์ด 1 ใบบนสุดของเด็ค จากนั้นนำขึ้นมือ
- BP01-010-ab2: [Leader] [Judgement] หากชนะด้วยการ์ดสีเขียว ฟื้นฟูพลังชีวิต 1
- BP01-011-ab1: การ์ดใบนี้สามารถเล่นได้จากความสามารถเท่านั้น
- BP01-011-ab2: การ์ดสีแดงของ 【Encore】 ได้รับ +1 ดาเมจ
- BP01-011-ab3: [At end of each turn]หากการ์ดใบนี้ไม่ได้ถูกลงในรอบนี้ นำการ์ดใบนี้กลับเข้า Charcater deck
- BP01-012-ab1: [Leader] [At end of each turn] หากฝ่ายตรงข้ามได้รับดาเมจในรอบนี้ นำการ์ดของ 【Encore】 1 ใบจากกองทิ้งขึ้นมือ
- BP01-013-ab1: [Enter] / [Level up] นำการ์สีแดงของ 【Encore】1 ใบจากกองทิ้งขึ้นมือ
- BP01-014-ab1: [Leader] การ์ด <Heavy Attack> และ <Forte Circuit> ของ【Encore】ได้รับ “[Judgement] หากแพ้การ์ดสีแดงในการเล่นการ์ดใบนี้ หลังจบช่วง Counter ทำดาเมจเท่ากับดาเมจของการ์ดใบนี้แก่ฝ่ายตรงข้าม”
- BP01-015-ab1: [Leader] แต่ละรอบ การ์ด <Normal attack> ใบแรกของ 【Encore】 ได้รับ +2 ดาเมจ
- BP01-016-ab1: [Leader] [Judgement] หากชนะการ์ดสีฟ้าด้วยการ์ดสีเขียว ถ้ามีการ์ดในมือไม่ถึง 8 ใบ จั่วการ์ดให้เป็น 8 ใบ
- BP01-017-ab1: [Enter] / [Level up] แสดงการ์ด 1 ใบบนสุดของเด็ค สามารถนำการ์ดใบนี้ขึ้นมือได้
- BP01-018-ab1: [Leader] [Counter] หาก counter ด้วยการ์ดสีเขียว สามารถแสดงการ์ด 2 ใบบนสุดของเด็คจากนั้นนำขึ้นมือ
- BP01-019-ab1: [Leader] [Judgement] หากชนะด้วยการ์ดสีเขียว ได้รับ +3 [Follow-up attack]
- BP01-020-ab1: [Enter] / [Level up] แสดงการ์ด 1 ใบบนสุดของเด็ค สามารถนำการ์ดใบนี้ขึ้นมือได้
- BP01-021-ab1: [Leader] [Counter] หาก counter ด้วยการ์ดสีเขียว สามารถแสดงการ์ด 2 ใบบนสุดของเด็ค จากนั้นนำขึ้นมือ
- BP01-022-ab1: [At end of own turn] ทิ้งการ์ด 1 ใบ หากทำสลับ Leader เป็น 「Yangyang」
- BP01-023-ab1: [Enter] / [Level up] สามารถนำการ์ดใบบนสุดของเด็ควางที่ Concerto area
- BP01-024-ab1: [Leader] [Counter] หาก counter ด้วยการ์ดสีฟ้า สามารถนำการ์ด 1 ใบบนสุดของเด็ควางที่ Concerto area
- BP01-025-ab1: [Leader] [At end of Counter phase] หากใน Action area ของเจ้าของมีการ์ด <Normal Attack> 2 ใบหรือมากกว่า ทำ 3 ดาเมจใส่ฝ่ายตรงข้าม
- BP01-026-ab1: [Enter] / [Level up] สามารถนำการ์ด <Normal Attack> 1 ใบจากกองทิ้งขึ้นมือ
- BP01-027-ab1: [Leader] [Counter] หาก counter ด้วยการ์ดสีแดง ทำ 1 ดาเมจใส่ฝ่ายตรงข้าม
- BP01-028-ab1: [Leader] [Judgement] หากชนะในรอบของเจ้าของ แสดงการ์ด 5 ใบบนสุดของเด็ค นำการ์ดของ 【Jinshi】 ทั้งหมดขึ้นมือ จากนั้นนำการ์ดที่เหลือลงกองทิ้ง
- BP01-029-ab1: [Leader] [Judgement] หากชนะด้วยการ์ดสีแดง ทำ 2 ดาเมจใส่ฝ่ายตรงข้าม
- BP01-030-ab1: [Leader] [Counter] หาก counter ด้วยการ์ดสีแดง ทำ 1 ดาเมจใส่ฝ่ายตรงข้าม
- BP01-031-ab1: [Leader] [Judgement] หากชนะด้วยการ์ดสีฟ้า สามารถเปลี่ยนลีดเดอร์และได้รับ +3[follow-up attack]
- BP01-032-ab1: [Enter] / [Level up] สามารถนำการ์ดจากกองทิ้ง 1 ใบวางที่ Concerto area
- BP01-033-ab1: [Leader] [Counter] หาก counter ด้วยการ์ดสีฟ้า สามารถนำการ์ด 1 ใบบนสุดของเด็ควางที่ Concerto area
- BP01-034-ab1: การ์ด <Echo> สามารถอยู่บน Action Area ได้สูงสุด 1 ใบ
- BP01-034-ab2: หากใน Concerto Area มีการ์ด <Molten Rift> 2 ใบ หรือมากกว่ารวมการ์ดใบนี้ การ์ด <Fusion> ใบแรกที่ใช้ได้รับ +1 ดาเมจ
- BP01-035-ab1: การ์ด <Echo> สามารถอยู่บน Action Area ได้สูงสุด 1 ใบ
- BP01-035-ab2: [Advantage] หากสร้างความเสียหายแก่ฝ่ายตรงข้าม ทุกๆการ์ด 4 ใบในมือของฝ่ายตรงข้าม ฝ่ายตรงข้ามทิ้งการ์ด 1 ใบในมือ
- BP01-036-ab1: การ์ด <Echo> สามารถอยู่บน Action Area ได้สูงสุด 1 ใบ
- BP01-036-ab2: หากใน Concerto Area มีการ์ด <Freezing Frost> 2 ใบ หรือมากกว่ารวมการ์ดใบนี้ การ์ด <Glacio> ใบแรกที่ใช้ได้รับ +1 ดาเมจ
- BP01-037-ab1: การ์ด <Echo> สามารถอยู่บน Action Area ได้สูงสุด 1 ใบ
- BP01-037-ab2: [Advantage] หากสร้างความเสียหายแก่ฝ่ายตรงข้าม นำการ์ด 1 ใบใน Concerto Area ของฝ่ายตรงข้ามลงกองทิ้ง
- BP01-038-ab1: การ์ด <Echo> สามารถอยู่บน Action Area ได้สูงสุด 1 ใบ
- BP01-038-ab2: หากใน Concerto Area มีการ์ด <Sierra Gale> 2 ใบ หรือมากกว่ารวมการ์ดใบนี้ การ์ด <Aero> ใบแรกที่ใช้ได้รับ +1 ดาเมจ
- BP01-039-ab1: การ์ด <Echo> สามารถอยู่บน Action Area ได้สูงสุด 1 ใบ
- BP01-039-ab2: [Advantage] หากสร้างความเสียหายแก่ฝ่ายตรงข้าม สุ่มการ์ด 1 ใบในมือฝ่ายตรงข้ามลงไปไว้ใต้ Action deck ของฝ่ายตรงข้าม
- BP01-040-ab1: การ์ด <Echo> สามารถอยู่บน Action Area ได้สูงสุด 1 ใบ
- BP01-040-ab2: หากใน Concerto Area มีการ์ด <Havoc Eclipse> 2 ใบ หรือมากกว่ารวมการ์ดใบนี้ การ์ด <Havoc> ใบแรกที่ใช้ได้รับ +1 ดาเมจ
- BP01-041-ab1: การ์ด <Echo> สามารถอยู่บน Action Area ได้สูงสุด 1 ใบ
- BP01-041-ab2: [Advantage] หากสร้างความเสียหายแก่ฝ่ายตรงข้าม นำการ์ด 3 ใบบนสุดของเด็คฝ่ายตรงข้ามตรงข้ามลงกองทิ้ง
- BP01-042-ab1: การ์ด <Echo> สามารถอยู่บน Action Area ได้สูงสุด 1 ใบ
- BP01-042-ab2: หากใน Concerto Area มีการ์ด <Celestial Light> 2 ใบ หรือมากกว่ารวมการ์ดใบนี้ การ์ด <Spectro> ใบแรกที่ใช้ได้รับ +1 ดาเมจ
- BP01-043-ab1: การ์ด <Echo> สามารถอยู่บน Action Area ได้สูงสุด 1 ใบ
- BP01-043-ab2: [Advantage] หากสร้างความเสียหายแก่ฝ่ายตรงข้าม นำการ์ด 2 ใบจากกองทิ้งฝ่ายตรงข้าม นำไปไว้ใต้ Action deck ของฝ่ายตรงข้าม
- BP01-046-ab1: [Combo] เปลี่ยน Leader หากเปลี่ยนเป็น 「Camellya」 Level up ให้「Camellya」 ของคุณ
- BP01-047-ab1: [Judgement] หากชนะ จั่วการ์ด 1 ใบ
- BP01-048-ab1: [Leader Skill] [Counter] Level up ให้ 「Camellya」 ของคุณ
- BP01-050-ab1: [Combo] หากใน Action area ของเจ้าของมีการ์ดมากกว่าหรือเท่ากับ 2 ใบ การ์ดใบนี้ได้รับ +1 ดาเมจ
- BP01-051-ab1: [Judgement] หากชนะ จั่วการ์ด 1 ใบ
- BP01-053-ab1: [Judgement]หากชนะ ฟื้นฟู 1 พลังชีวิต
- BP01-054-ab1: [Combo] เปลี่ยน Leader หากเปลี่ยนเป็น 「Shorekeeper」ฟื้นฟู 1 พลังชีวิต
- BP01-055-ab1: หากพลังชีวิตของเจ้าของ มากกว่าฝ่ายตรงข้าม การ์ดใบนี้ได้รับ +1 ดาเมจ
- BP01-056-ab1: [Leader Skill] (การ์ดใบนี้สามารถใช้ได้ก็ต่อเมื่อลีดเดอร์ของคุณเป็นตัวละครที่ระบุไว้เท่านั้น)
- BP01-056-ab2: [Judgement] หากชนะ Level up ให้「Shorekeeper」 ของเจ้าของ
- BP01-057-ab1: [Leader Skill] (การ์ดใบนี้สามารถใช้ได้ก็ต่อเมื่อลีดเดอร์ของคุณเป็นตัวละครที่ระบุไว้เท่านั้น)
- BP01-057-ab2: [Counter] ในรอบนี้ การ์ด <Intro Skill> 2 ใบถัดไปที่เล่นได้รับ "[Combo] จั่วการ์ด 1 ใบ"
- BP01-057-ab3: [Judgement] หากชนะ ฟื้นฟู 1 พลังชีวิตและได้รับ +8 [follow-up attack]
- BP01-058-ab1: [Judgement] หากชนะ จั่วการ์ด 2 ใบ
- BP01-058-ab2: [Advantage] [Judgement] หากแพ้ด้วยการ์ดใบนี้ และหาก Leader เป็น Shorekeeper ในรอบนี้ ฝ่ายตรงข้ามไม่สามารถ Combo ได้
- BP01-059-ab1: [Advantage] [Counter] หาก Leader เป็น 「Encore」 ความเร็วของการ์ดใบนี้เป็น 10
- BP01-060-ab1: หากสร้างความเสียหายใส่ฝ่ายตรงข้าม หาก Leader เป็น 「Encore」 จั่วการ์ด 1 ใบ
- BP01-061-ab1: [Leader Skill] (การ์ดใบนี้สามารถใช้ได้ก็ต่อเมื่อลีดเดอร์ของคุณเป็นตัวละครที่ระบุไว้เท่านั้น)
- BP01-061-ab2: [Counter] / [Combo] ในรอบนี้ เจ้าของจะไม่สามารถโจมตีต่อเนื่องได้
- BP01-062-ab1: [Advantage] คอสของการ์ดใบนี้ -1
- BP01-062-ab2: [Counter] นำการ์ด 「Encore」 Level 2 วางบนสุดของ 「Encore」 ของเจ้าของ (นับเป็นการ Level up)  สลับ Leader เป็น 「Encore」
- BP01-063-ab1: [Combo] เปลี่ยน Leader หากเปลี่ยนเป็น 「Encore 」นำการ์ดสีแดงของ 【Encore】ที่ไม่ใช่ <Intro Skill>  1 ใบขึ้นมือ
- BP01-065-ab1: [Combo] สามารถทิ้งการ์ด 1 ใบ หากทำการ์ดใบนี้ได้รับ +1 ดาเมจ
- BP01-066-ab1: [Judgement] หากชนะ จั่วการ์ด 1 ใบ
- BP01-067-ab1: [Combo] สามารถทิ้งการ์ด 1 ใบ หากทำการ์ดใบนี้ได้รับ +1 ดาเมจ
- BP01-068-ab1: [Judgement] หากชนะ จั่วการ์ด 1 ใบ
- BP01-069-ab1: [Judgement] หากชนะ ได้รับ +1[follow-up attack]
- BP01-069-ab2: [At end of each counter phase] หาก Leader เป็น 「Yangyang」สามารถจ่าย 1 cost จากนั้นนั้นการ์ดใบนี้ขึ้นมือ
- BP01-070-ab1: [Leader Skill] [Judgement] หากชนะ นำการ์ดสีฟ้า 1 ใบ จากกองทิ้งขึ้นมือ
- BP01-071-ab1: [Combo] ในรอบนี้ หากเจ้าของเล่นการ์ด <Airborn> นำการ์ด 1 ใบบนสุดของเด็ควางที่ Concerto Area
- BP01-072-ab1: [Leader Skill] [Advantage] [Counter] นำการ์ด <Basic Attack> หรือ <Resonance Liberation> 1 ใบจากกองทิ้งขึ้นมือ
- BP01-073-ab1: [Leader Skill] (การ์ดใบนี้สามารถใช้ได้ก็ต่อเมื่อลีดเดอร์ของคุณเป็นตัวละครที่ระบุไว้เท่านั้น)
- BP01-073-ab2: [Judgement] หากชนะ นำ 「Incarnation」 ขึ้นมือ จากนั้นสับเด็ค
- BP01-074-ab1: [Leader Skill] (การ์ดใบนี้สามารถใช้ได้ก็ต่อเมื่อลีดเดอร์ของคุณเป็นตัวละครที่ระบุไว้เท่านั้น)
- BP01-074-ab2: [Combo] การ์ดใบนี้ได้รับ +1 ดาเมจ ตามจำนวนการ์ดที่อยู่บน Action area ฝ่ายเรา
- BP01-074-ab3: [Counter] / [Combo] ในรอบนี้ เจ้าของไม่สามารถโจมตีต่อเนื่องได้
- BP01-075-ab1: [Judgement] หากชนะ จั่วการ์ด 1 ใบ
- BP01-076-ab1: [Counter] สามารถเปลี่ยน Leader เป็น 「Sanhua」
- BP01-076-ab2: [Judgement] หากชนะและมี Leader เป็น 「Sanhua」 Level up ให้ 「Sanhua」 ของเจ้าของ
- BP01-077-ab1: [Leader Skill] (การ์ดใบนี้สามารถใช้ได้ก็ต่อเมื่อลีดเดอร์ของคุณเป็นตัวละครที่ระบุไว้เท่านั้น)
- BP01-077-ab2: [Judgement] หากชนะและมีการ์ดของ 【Sanhua】 ใน Concerto Area เจ้าของสามารถสลับ Leader ได้
- SD01-001-ab1: [At start of own turn] จั่วการ์ด 1 ใบ
- SD01-002-ab1: [Leader] [Judgement]หากแพ้ให้กับการ์ดสีแดงในการเล่นการ์ดสีเขียว สามารถแสดงการ์ด 1 ใบบนสุดของเด็ค จากนั้นนำขึ้นมือ
- SD01-003-ab1: [Leader] [Counter] หากฝ่ายตรงข้าม counter ด้วยการ์ดสีแดง ฝ่ายตรงข้ามต้องจ่าย cost เพิ่ม 1 ใบ หากไม่ทำ ฝ่ายตรงข้ามได้รับ 3 ดาเมจ
- SD01-004-ab1: [Leader] [Judgement] หากแพ้ให้การ์ดสีเขียวในการเล่นการ์ดสีฟ้า สามารถแสดงการ์ด 1 ใบบนสุดของเด็ค จากนั้นนำขึ้นมือ
- SD01-005-ab1: การ์ด [Leader skill] ของ 【Chixia】 ได้รับ +3 ดาเมจ
- SD01-006-ab1: [Leader] [Judgement] หากแพ้การ์ดสีฟ้าในการเล่นการ์ดสีแดง สามารถแสดงการ์ด 1 ใบบนสุดของเด็ค จากนั้นนำขึ้นมือ
- SD01-009-ab1: [Combo] เปลี่ยน Leader หากเปลี่ยนเป็น 「Chixia」 การ์ดใบนี้ได้รับ +2 ดาเมจ
- SD01-010-ab1: [Leader Skill] [Judgement] หากแพ้การ์ดสีฟ้าในการเล่นการ์ดใบนี้ นำการ์ดใบนี้กลับขึ้นมือ
- SD01-011-ab1: [Leader Skill] (การ์ดใบนี้สามารถใช้ได้ก็ต่อเมื่อลีดเดอร์ของคุณเป็นตัวละครที่ระบุไว้เท่านั้น)
- SD01-013-ab1: [Judgement] หากชนะ ได้รับ +2[follow-up attack]
- SD01-014-ab1: [Combo] เปลี่ยน Leader หากเปลี่ยนเป็น 「Yangyang」 นำการ์ด 1 ใบบนสุดของเด็ควางที่ Concerto area
- SD01-015-ab1: [Judgement] หากชนะ จั่วการ์ด 1 ใบ และได้รับ +1[follow-up attack]
- SD01-016-ab1: [Leader Skill] [Judgement] หากชนะ ในรอบการเล่นถัดไป การ์ดสีแดงของฝ่ายตรงข้าม Cost +1
- SD01-018-ab1: [Judgement] หากชนะ จั่วการ์ด 1 ใบ จากนั้นทิ้งการ์ดในมือ 1 ใบ
- SD01-019-ab1: [Combo] เปลี่ยน Leader หากเปลี่ยนเป็น 「Rover (F)」 จั่วการ์ด 1 ใบ
- SD01-020-ab1: [Judgement] หากชนะ จั่วการ์ด 1 ใบ ฝ่ายตรงข้ามแสดงการ์ดในมือ
- SD01-021-ab1: [Judgement] หากชนะ จั่วการ์ด 1 ใบ ได้รับ +2[follow-up attack]
- SD01-022-ab1: [Leader Skill] (การ์ดใบนี้สามารถใช้ได้ก็ต่อเมื่อลีดเดอร์ของคุณเป็นตัวละครที่ระบุไว้เท่านั้น)
- SD01-023-ab1: [Leader Skill] [Judgement] หากชนะ ฟื้นฟู 5 พลังชีวิต
- SD02-001-ab1: [Leader] [At end of each turn] จั่วการ์ด 1 ใบ
- SD02-002-ab1: [Leader] [Judgement] หากแพ้ให้กับการ์ดสีแดงในการเล่นการ์ดสีเขียว สามารถแสดงการ์ด 1 ใบบนสุดของเด็ค จากนั้นนำขึ้นมือ
- SD02-003-ab1: [Leader] [At end of each turn] นำการ์ดใบบนสุดของเด็ควางที่ Concerto area
- SD02-004-ab1: [Leader] [Judgement] หากแพ้ให้กับการ์ดสีเขียวในการเล่นการ์ดสีฟ้า สามารถแสดงการ์ด 1 ใบบนสุดของเด็ค จากนั้นนำขึ้นมือ
- SD02-005-ab1: [Leader] การ์ดสีแดงของคุณได้รับ “[Combo] การ์ดใบนี้ได้รับ +1 ดาเมจ”
- SD02-006-ab1: [Leader] [Judgement] หากแพ้ให้กับการ์ดสีฟ้าในการเล้นการ์ดสีแดง สามารถแสดงการ์ด 1 ใบบนสุดของเด็ค จากนั้นนำขึ้นมือ
- SD02-009-ab1: [Combo] เปลี่ยน Leader หากเปลี่ยนเป็น 「Jinshi」 การใบนี้ได้รับ +2 ดาเมจ
- SD02-010-ab1: [Counter] ในเทิร์นนี้ ไม่สามารถสลับ Leader ได้
- SD02-010-ab2: [Judgement] หากชนะ จั่วการ์ด 3 ใบ ได้รับ +8[follow-up attack]
- SD02-011-ab1: [Leader Skill] [Combo] หากใน Action area มีการ์ด 3 ใบหรือมากกว่า การ์ดใบนี้ได้รับ +3 ดาเมจ
- SD02-013-ab1: [Judgement] หากชนะ ได้รับ 2[follow-up attack]
- SD02-014-ab1: [Combo] เปลี่ยน Leader หากเปลี่ยนเป็น 「Sanhua」 นำการ์ด 1 ใบบนสุดของเด็ควางที่ Concerto area
- SD02-015-ab1: [Leader Skill] [Judgement] หากชนะ นำการ์ด 2 ใบบนสุดของเด็ควางที่ Concerto area
- SD02-016-ab1: [Leader Skill] [Judgement] หากชนะ ในรอบถัดไปฝ่ายตรงข้ามไม่สามารถใช้โจมตีต่อเนื่องได้
- SD02-018-ab1: [Judgement] หากชนะ จั่วการ์ด 1 ใบ จากนั้นทิ้งการ์ดในมือ 1 ใบ
- SD02-019-ab1: [Combo] เปลี่ยน Leader หากเปลี่ยนเป็น 「Rover (M)」จั่วการ์ด 1 ใบ
- SD02-020-ab1: [Judgement] หากชนะ จั่วการ์ด 1 ใบ ฝ่ายตรงข้ามแสดงการ์ดในมือ
- SD02-021-ab1: [Judgement] หากชนะ จั่วการ์ด 1 ใบ ได้รับ +2[follow-up attack]
- SD02-022-ab1: [Leader Skill] (การ์ดใบนี้สามารถใช้ได้ก็ต่อเมื่อลีดเดอร์ของคุณเป็นตัวละครที่ระบุไว้เท่านั้น)
- SD02-023-ab1: [Leader Skill] (การ์ดใบนี้สามารถใช้ได้ก็ต่อเมื่อลีดเดอร์ของคุณเป็นตัวละครที่ระบุไว้เท่านั้น)

## Browser smoke test

Chromium โปรไฟล์ทดสอบแยก: โหลดคลังครบ123ใบ, บันทึกชื่อเด็คไทยและโหลดซ้ำได้, เข้าเกม/ยืนยันมือจนถึง Action ได้, ปุ่มดูมือ BOT ถูกปิดและแสดงมือ P1, ไม่พบ pageerror ในเส้นทางนี้ ไม่ใช่การเล่นครบทุกแมตช์หรือทดสอบทุกสกิลผ่าน UI
