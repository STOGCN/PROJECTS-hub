# การทำงานของ Dynamic Game Carousel (Mission Service)

เอกสารนี้อธิบายถึงโครงสร้างและ Flow การทำงานล่าสุดที่ถูกปรับปรุง เพื่อให้ข้อมูลเกมจากเมนูสร้างเกมใหม่ (New Game) สามารถแสดงผลลัพธ์บนวงล้อโปรไฟล์เกม (Game Carousel) ได้อย่างสมบูรณ์และเสถียร (Dynamic Data Flow)

ไฟล์ที่เกี่ยวข้องมี 3 ไฟล์หลักๆ ดังนี้ครับ:

## 1. `mission.service.ts` (ตัวกลางจัดการข้อมูล - State Management)
**ที่ตั้ง:** `R:\Code\--STOGCN--\PROJECTS-hub\Chess Commander\Chess Commander FE\src\app\modules\dashboard\mission.service.ts`
- ไฟล์นี้ถูกสร้างขึ้นมาใหม่เพื่อทำหน้าที่เป็น **Global Store** ให้กับข้อมูลภารกิจ (Missions/Games) ทั้งหมด 
- ใช้เทคนิค **RxJS `BehaviorSubject`** (`missions$`) ในการเก็บและกระจายข้อมูล เมื่อเริ่มต้นทำงานมันจะโหลดข้อมูล Mock จำนวน 5 ภารกิจไว้ก่อน
- มีฟังก์ชันแกนหลักคือ `addMission(mission: Mission)` ซึ่งเมื่อมีหน้าไหนก็ตามเรียกใช้ฟังก์ชันนี้ ระบบจะนำออบเจกต์เกมใหม่ไป **แทรกให้เป็นอันดับแรกสุด** ของอะเรย์ทันที 

## 2. `game-carousel.component.ts` (ตัวแสดงผล - Subscriber)
**ที่ตั้ง:** `R:\Code\--STOGCN--\PROJECTS-hub\Chess Commander\Chess Commander FE\src\app\modules\dashboard\game-carousel\game-carousel.component.ts`
- **การเปลี่ยนแปลงที่สำคัญ:** ทำการรื้อข้อมูลอาเรย์เกมที่เป็นแบบ Hardcoded ทิ้งออกไปทั้งหมด 
- เปลี่ยนมาทำการทำ **Subscribe ถ่ายทอดสด** (Stream) เข้ากับ `MissionService.missions$` ตั้งแต่จังหวะ `ngOnInit()`
- ผลลัพธ์: เมื่อมีข้อมูลใหม่ถูกยิงเข้ามาใน Service ตัว Carousel จะเปลี่ยนก้อนข้อมูลอาเรย์ (`this.missions`) ในทันที และปรับ `activeIndex` อัตโนมัติ ทำให้การ์ดเกมอัปเดตบนหน้าจอคุณทันทีแบบไม่ต้องรีเฟรช 

## 3. `new-game.component.ts` (ตัวผลิตข้อมูล - Publisher)
**ที่ตั้ง:** `R:\Code\--STOGCN--\PROJECTS-hub\Chess Commander\Chess Commander FE\src\app\modules\dashboard\header\new_game\new-game.component.ts`
- หน้าจอ UI สำหรับตั้งค่าเกมของคุณ ได้ถูกสอดแทรกคำสั่งในการติดต่อกับ `MissionService`
- **ในฟังก์ชัน `startGame()`:** นอกจากการคำนวณเอาเวลาทั้งหมดโยนใส่กระดานแบบเดิมแล้ว มันจะทำการแพ็คข้อมูลต่างๆ ในฟอร์มเข้าด้วยกัน (เช่น `gameName` เปลี่ยนเป็นชื่อเกม, `totalMs` จัดฟอร์แมทใหม่ให้เป็นเวลา Timer, และดึง `coverImage` มาทำหน้าปก)
- นำข้อมูลแพ็คนี้ยิงเข้าไปในคำสั่ง `this.missionService.addMission(...)`
- หลังจากเกมถูกยิงเข้าสู่ระบบ ถัดมา User ก็พร้อมที่จะคลิกเล่นต่อไปได้ โดยถ้าผู้ใช้เปิดหน้าปก Carousel ขึ้นมาดู จะพบการตั้งค่าตัวเองปรากฎเป็นไพ่ใบหน้าสุดของลิสต์ทันทีครับ
