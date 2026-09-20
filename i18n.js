export const messages={th:{battle:'สนามทดสอบ',builder:'จัดเด็ค',newGame:'เริ่มเกมตามกฎ',scenario:'ทดสอบสกิล Rover',activate:'Activate Skill',skip:'ไม่ใช้สกิลนี้',next:'ดำเนินต่อ',hand:'การ์ดบนมือ',inspect:'รายละเอียดการ์ด',save:'บันทึกเด็ค',search:'ค้นหาชื่อ / รหัส / ข้อความสกิล',all:'ทั้งหมด'}};
export let locale='th';
export const t=key=>messages[locale]?.[key]??messages.th[key]??key;
export const abilityText=(a,lang=locale)=>a['custom_'+lang]?.trim()||a['original_'+lang]||a.custom_th?.trim()||a.original_th||'';
