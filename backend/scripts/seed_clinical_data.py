"""
CURA Clinical Data Seeder for Neon.tech PostgreSQL Database.
Populates all 13 production tables with realistic, clinically grounded data
based on ADRD-Bench, DementiaBank, and MIT Task-Breakdown specifications.
"""
import os
import sys
import uuid
import json
import psycopg2
from datetime import datetime, date, time, timedelta
from dotenv import load_dotenv

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Load backend .env
backend_env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))
load_dotenv(backend_env_path)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://neondb_owner:npg_FZfhy1jlct8d@ep-fragrant-pond-baeww0e3.c-8.eu-central-1.aws.neon.tech/neondb?sslmode=require"
)

def clean_and_seed():
    print("=" * 75)
    print("CURA CLINICAL DATABASE SEEDER (NEON POSTGRESQL)")
    print("=" * 75)
    print(f"Target DB: {DATABASE_URL.split('@')[-1]}\n")

    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = False
    cur = conn.cursor()

    try:
        print("[1/13] Clearing existing data safely...")
        # Truncate tables in cascade dependency order
        cur.execute("""
            TRUNCATE TABLE 
                sync_batches,
                emergency_events,
                emergency_contacts,
                focus_sessions,
                adhd_tasks,
                cognitive_confusion_logs,
                medication_logs,
                medication_schedules,
                medications,
                family_members,
                devices,
                caregiver_patient_relations,
                users
            CASCADE;
        """)
        print("  ✓ Tables truncated successfully.")

        # Fixed UUIDs for predictable testing and inter-table relationships
        USER_ALZ_ID = str(uuid.UUID("11111111-1111-1111-1111-111111111111"))
        USER_ADHD_ID = str(uuid.UUID("22222222-2222-2222-2222-222222222222"))
        USER_CAREGIVER_ID = str(uuid.UUID("33333333-3333-3333-3333-333333333333"))
        USER_DOCTOR_ID = str(uuid.UUID("44444444-4444-4444-4444-444444444444"))

        DEV_ALZ_ID = str(uuid.UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"))
        DEV_ADHD_ID = str(uuid.UUID("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"))

        now = datetime.utcnow()

        # ----------------------------------------------------
        # 1. USERS
        # ----------------------------------------------------
        print("\n[2/13] Seeding users...")
        users_data = [
            (
                USER_ALZ_ID,
                "إبراهيم محمود الدسوقي",
                "ibrahim.desouky@cura.health",
                "$2b$12$eX4mPLeH4sH8N.curaHash2026PatientAlzheimer",
                "+201012345678",
                "PATIENT",
                now - timedelta(days=90),
                now
            ),
            (
                USER_ADHD_ID,
                "كريم أحمد الشناوي",
                "karim.shennawy@cura.health",
                "$2b$12$eX4mPLeH4sH8N.curaHash2026PatientAdhd",
                "+201123456789",
                "PATIENT",
                now - timedelta(days=60),
                now
            ),
            (
                USER_CAREGIVER_ID,
                "د. أحمد إبراهيم الدسوقي",
                "dr.ahmed.desouky@cura.health",
                "$2b$12$eX4mPLeH4sH8N.curaHash2026Caregiver",
                "+201234567890",
                "CAREGIVER",
                now - timedelta(days=90),
                now
            ),
            (
                USER_DOCTOR_ID,
                "د. طارق السعيد (استشاري مخ وأعصاب)",
                "dr.tarek.neurology@cura.health",
                "$2b$12$eX4mPLeH4sH8N.curaHash2026Doctor",
                "+201567890123",
                "DOCTOR",
                now - timedelta(days=120),
                now
            ),
        ]
        cur.executemany("""
            INSERT INTO users (id, full_name, email, password_hash, phone_number, role, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
        """, users_data)
        print(f"  ✓ Inserted {len(users_data)} users.")

        # ----------------------------------------------------
        # 2. CAREGIVER-PATIENT RELATIONS
        # ----------------------------------------------------
        print("\n[3/13] Seeding caregiver_patient_relations...")
        relations_data = [
            (
                USER_CAREGIVER_ID,
                USER_ALZ_ID,
                "ابن / مرافق رئيسي",
                json.dumps({
                    "manage_medications": True,
                    "view_gps": True,
                    "receive_emergency_alerts": True,
                    "edit_memory_book": True,
                    "view_confusion_logs": True
                })
            ),
            (
                USER_CAREGIVER_ID,
                USER_ADHD_ID,
                "أخ أكبر ومتابع أكاديمي",
                json.dumps({
                    "view_focus_stats": True,
                    "manage_tasks": True,
                    "receive_emergency_alerts": False
                })
            )
        ]
        cur.executemany("""
            INSERT INTO caregiver_patient_relations (caregiver_id, patient_id, relationship, permissions)
            VALUES (%s, %s, %s, %s);
        """, relations_data)
        print(f"  ✓ Inserted {len(relations_data)} relationships.")

        # ----------------------------------------------------
        # 3. DEVICES
        # ----------------------------------------------------
        print("\n[4/13] Seeding devices...")
        devices_data = [
            (
                DEV_ALZ_ID,
                "CURA-PI4-ALZ-001",
                USER_ALZ_ID,
                "PAIR-ALZ-7788",
                "ALZHEIMER",
                json.dumps({
                    "platform": "Raspberry Pi 4 Model B (4GB)",
                    "display": "7-inch IPS High-Contrast Touchscreen",
                    "led_ring": "WS2812B 12-LED Neopixel",
                    "audio_hat": "WM8960 Stereo Audio CODEC",
                    "firmware_version": "v1.2.4-edge"
                }),
                True,
                now
            ),
            (
                DEV_ADHD_ID,
                "CURA-PI4-ADHD-002",
                USER_ADHD_ID,
                "PAIR-ADHD-9922",
                "ADHD",
                json.dumps({
                    "platform": "Raspberry Pi 4 Model B (4GB)",
                    "display": "7-inch IPS Touchscreen",
                    "led_ring": "WS2812B 12-LED Neopixel",
                    "firmware_version": "v1.2.4-edge"
                }),
                True,
                now - timedelta(minutes=2)
            ),
        ]
        cur.executemany("""
            INSERT INTO devices (id, device_serial, patient_id, pairing_token, current_mode, hardware_specs, is_online, last_heartbeat)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
        """, devices_data)
        print(f"  ✓ Inserted {len(devices_data)} devices.")

        # ----------------------------------------------------
        # 4. FAMILY MEMBERS (Memory Book for Alzheimer's)
        # ----------------------------------------------------
        print("\n[5/13] Seeding family_members (Alzheimer Memory Book)...")
        family_data = [
            (
                USER_ALZ_ID,
                "د. أحمد إبراهيم الدسوقي",
                "ابن",
                "https://cura-assets.b-cdn.net/family/ahmed_son.jpg",
                "face_emb_ahmed_001",
                "https://cura-assets.b-cdn.net/audio/ahmed_voice_greeting.mp3",
                "مهندس برمجيات يعيش ويعمل في دبي، متزوج ولديه ليلى. يتصل بك كل يوم في تمام الثامنة مساءً ليطمئن عليك."
            ),
            (
                USER_ALZ_ID,
                "د. منى إبراهيم الدسوقي",
                "ابنة",
                "https://cura-assets.b-cdn.net/family/mona_daughter.jpg",
                "face_emb_mona_002",
                "https://cura-assets.b-cdn.net/audio/mona_voice_note.mp3",
                "طبيبة أطفال في مستشفى القصر العيني بالقاهرة. تسكن قريباً منك وتزورك كل يوم جمعة مع وجبة الغداء المفضلة لديك."
            ),
            (
                USER_ALZ_ID,
                "ليلى أحمد الدسوقي",
                "حفيدة",
                "https://cura-assets.b-cdn.net/family/layla_granddaughter.jpg",
                "face_emb_layla_003",
                None,
                "حفيدتك الصغيرة (عمرها 10 سنوات)، في الصف الخامس الابتدائي. تحب الرسم معك وتناديك 'جدو حبيبي'."
            ),
            (
                USER_ALZ_ID,
                "الحاجة زينب عبد الرحمن",
                "زوجة (رحمها الله)",
                "https://cura-assets.b-cdn.net/family/zainab_wife.jpg",
                None,
                None,
                "رفيقة دربك وزوجتك الفاضلة. تزوجتما في الإسكندرية عام 1978، وكانت تحب زراعة الياسمين في شرفة المنزل."
            ),
        ]
        cur.executemany("""
            INSERT INTO family_members (patient_id, name, relation, photo_url, face_embedding_id, voice_note_url, bio_notes)
            VALUES (%s, %s, %s, %s, %s, %s, %s);
        """, family_data)
        print(f"  ✓ Inserted {len(family_data)} family members.")

        # ----------------------------------------------------
        # 5. MEDICATIONS
        # ----------------------------------------------------
        print("\n[6/13] Seeding medications (Realistic Egyptian Prescriptions)...")
        MED_CONCOR_ID = str(uuid.UUID("55555555-5555-5555-5555-555555555551"))
        MED_EXELON_ID = str(uuid.UUID("55555555-5555-5555-5555-555555555552"))
        MED_VITD_ID = str(uuid.UUID("55555555-5555-5555-5555-555555555553"))

        medications_data = [
            (
                MED_CONCOR_ID,
                USER_ALZ_ID,
                "كونكور 5 مجم (Concor 5mg)",
                "قرص واحد",
                "https://cura-assets.b-cdn.net/meds/concor_5mg.png",
                "دواء ضغط الدم وتنظيم ضربات القلب. يؤخذ صباحاً بعد الإفطار مع كوب ماء. الشريط أبيض في خط أزرق مميز.",
                True
            ),
            (
                MED_EXELON_ID,
                USER_ALZ_ID,
                "إكسيلون 4.6 مجم لصقات (Exelon Patch)",
                "لصقة جلدية واحدة",
                "https://cura-assets.b-cdn.net/meds/exelon_patch.png",
                "علاج لتحسين التركيز والذاكرة لمرضى الزهايمر. توضع اللصقة مساءً على أعلى الظهر أو الذراع وتستبدل كل 24 ساعة.",
                True
            ),
            (
                MED_VITD_ID,
                USER_ALZ_ID,
                "فيتامين د3 (ديفارول-إس 50,000 وحدة)",
                "كبسولة واحدة",
                "https://cura-assets.b-cdn.net/meds/vit_d3.png",
                "مكمل لتقوية العظام والمناعة. يؤخذ مرة واحدة أسبوعياً يوم الجمعة بعد الغداء.",
                True
            ),
        ]
        cur.executemany("""
            INSERT INTO medications (id, patient_id, medication_name, dosage, image_url, instructions, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, %s);
        """, medications_data)
        print(f"  ✓ Inserted {len(medications_data)} medications.")

        # ----------------------------------------------------
        # 6. MEDICATION SCHEDULES
        # ----------------------------------------------------
        print("\n[7/13] Seeding medication_schedules...")
        SCHED_CONCOR_ID = str(uuid.UUID("66666666-6666-6666-6666-666666666661"))
        SCHED_EXELON_ID = str(uuid.UUID("66666666-6666-6666-6666-666666666662"))
        SCHED_VITD_ID = str(uuid.UUID("66666666-6666-6666-6666-666666666663"))

        schedules_data = [
            (SCHED_CONCOR_ID, MED_CONCOR_ID, time(9, 0), [1, 2, 3, 4, 5, 6, 7]),  # Daily at 9:00 AM
            (SCHED_EXELON_ID, MED_EXELON_ID, time(20, 30), [1, 2, 3, 4, 5, 6, 7]), # Daily at 8:30 PM
            (SCHED_VITD_ID, MED_VITD_ID, time(14, 0), [5]),                         # Fridays only at 2:00 PM
        ]
        cur.executemany("""
            INSERT INTO medication_schedules (id, medication_id, scheduled_time, days_of_week)
            VALUES (%s, %s, %s, %s);
        """, schedules_data)
        print(f"  ✓ Inserted {len(schedules_data)} medication schedules.")

        # ----------------------------------------------------
        # 7. MEDICATION LOGS
        # ----------------------------------------------------
        print("\n[8/13] Seeding medication_logs (Adherence history)...")
        yesterday_9am = datetime.combine(date.today() - timedelta(days=1), time(9, 0))
        today_9am = datetime.combine(date.today(), time(9, 0))
        today_830pm = datetime.combine(date.today(), time(20, 30))

        med_logs_data = [
            (
                SCHED_CONCOR_ID,
                USER_ALZ_ID,
                "TAKEN",
                yesterday_9am,
                yesterday_9am + timedelta(minutes=15)
            ),
            (
                SCHED_CONCOR_ID,
                USER_ALZ_ID,
                "TAKEN",
                today_9am,
                today_9am + timedelta(minutes=8)
            ),
            (
                SCHED_EXELON_ID,
                USER_ALZ_ID,
                "SCHEDULED",
                today_830pm,
                None
            ),
        ]
        cur.executemany("""
            INSERT INTO medication_logs (schedule_id, patient_id, status, scheduled_for, responded_at)
            VALUES (%s, %s, %s, %s, %s);
        """, med_logs_data)
        print(f"  ✓ Inserted {len(med_logs_data)} medication logs.")

        # ----------------------------------------------------
        # 8. COGNITIVE CONFUSION LOGS (Alzheimer Repetition)
        # ----------------------------------------------------
        print("\n[9/13] Seeding cognitive_confusion_logs (ADRD-Bench Repetition Tracking)...")
        confusion_data = [
            (
                USER_ALZ_ID,
                "هو ابني أحمد مجاش ليه النهارده؟",
                4,
                now - timedelta(hours=3, minutes=10)
            ),
            (
                USER_ALZ_ID,
                "هي الساعة كام دلوقتي؟ والنهارده يوم إيه؟",
                6,
                now - timedelta(hours=1, minutes=45)
            ),
            (
                USER_ALZ_ID,
                "أنا حطيت نظارتي فين؟ مش لاقيها خالص",
                3,
                now - timedelta(minutes=50)
            ),
            (
                USER_ALZ_ID,
                "أحمد مسافر فين؟ مش فاكر",
                2,
                now - timedelta(minutes=15)
            ),
        ]
        cur.executemany("""
            INSERT INTO cognitive_confusion_logs (patient_id, question_intent, frequency_in_window, detected_at)
            VALUES (%s, %s, %s, %s);
        """, confusion_data)
        print(f"  ✓ Inserted {len(confusion_data)} cognitive confusion records.")

        # ----------------------------------------------------
        # 9. ADHD TASKS (MIT Task-Breakdown & Scaffolding)
        # ----------------------------------------------------
        print("\n[10/13] Seeding adhd_tasks...")
        TASK_GRAD_ID = str(uuid.UUID("77777777-7777-7777-7777-777777777771"))
        TASK_DESK_ID = str(uuid.UUID("77777777-7777-7777-7777-777777777772"))
        TASK_SLIDES_ID = str(uuid.UUID("77777777-7777-7777-7777-777777777773"))

        adhd_tasks_data = [
            (
                TASK_GRAD_ID,
                USER_ADHD_ID,
                "تسليم مسودة الفصل الأول من مشروع التخرج",
                "كتابة مشكلة البحث وأهداف نظام CURA بدون الدخول في تفاصيل معقدة.",
                "IN_PROGRESS",
                1,
                3,
                1,
                now - timedelta(days=2),
                None
            ),
            (
                TASK_DESK_ID,
                USER_ADHD_ID,
                "تنظيم مساحة العمل والمكتب (دقيقتين فقط)",
                "إبعاد الأكواب الفارغة وتوصيل شاحن اللابتوب لتجهيز بيئة التركيز.",
                "COMPLETED",
                2,
                1,
                1,
                now - timedelta(hours=4),
                now - timedelta(hours=3, minutes=30)
            ),
            (
                TASK_SLIDES_ID,
                USER_ADHD_ID,
                "تجهيز أول شريحتين في عرض الباوربوينت",
                "كتابة عنوان المشروع وأسماء الفريق فقط لكسر حاجز البدء.",
                "PENDING",
                3,
                2,
                0,
                now - timedelta(hours=1),
                None
            ),
        ]
        cur.executemany("""
            INSERT INTO adhd_tasks (id, patient_id, title, description, status, priority_order, target_pomodoros, completed_pomodoros, created_at, completed_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """, adhd_tasks_data)
        print(f"  ✓ Inserted {len(adhd_tasks_data)} ADHD tasks.")

        # ----------------------------------------------------
        # 10. FOCUS SESSIONS
        # ----------------------------------------------------
        print("\n[11/13] Seeding focus_sessions (Pomodoro calibration)...")
        sessions_data = [
            (
                TASK_DESK_ID,
                USER_ADHD_ID,
                25,
                True,
                0,
                now - timedelta(hours=4),
                now - timedelta(hours=3, minutes=35)
            ),
            (
                TASK_GRAD_ID,
                USER_ADHD_ID,
                25,
                True,
                1,  # 1 distraction pause dialog triggered and confirmed
                now - timedelta(hours=2),
                now - timedelta(hours=1, minutes=35)
            ),
        ]
        cur.executemany("""
            INSERT INTO focus_sessions (task_id, patient_id, duration_minutes, completed_successfully, pause_dialogs_count, started_at, ended_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s);
        """, sessions_data)
        print(f"  ✓ Inserted {len(sessions_data)} focus sessions.")

        # ----------------------------------------------------
        # 11. EMERGENCY CONTACTS
        # ----------------------------------------------------
        print("\n[12/13] Seeding emergency_contacts...")
        emergency_contacts_data = [
            (
                USER_ALZ_ID,
                "د. أحمد إبراهيم الدسوقي",
                "+201234567890",
                "ابن / مرافق رئيسي",
                1,
                True,  # SMS
                True,  # Phone call
                True   # Push alert
            ),
            (
                USER_ALZ_ID,
                "د. منى إبراهيم الدسوقي",
                "+201098765432",
                "ابنة",
                2,
                True,
                False,
                True
            ),
            (
                USER_ALZ_ID,
                "إسعاف مصر",
                "123",
                "طوارئ طبية حكومية",
                3,
                False,
                True,
                False
            ),
            (
                USER_ADHD_ID,
                "د. أحمد إبراهيم الدسوقي",
                "+201234567890",
                "أخ أكبر",
                1,
                False,
                False,
                True
            )
        ]
        cur.executemany("""
            INSERT INTO emergency_contacts (patient_id, name, phone_number, relation, priority, notify_via_sms, notify_via_call, notify_via_push)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
        """, emergency_contacts_data)
        print(f"  ✓ Inserted {len(emergency_contacts_data)} emergency contacts.")

        # ----------------------------------------------------
        # 12. EMERGENCY EVENTS
        # ----------------------------------------------------
        print("\n[13/13] Seeding emergency_events & sync_batches...")
        emergency_events_data = [
            (
                DEV_ALZ_ID,
                USER_ALZ_ID,
                "VOICE_COMMAND",
                "HIGH",
                "RESOLVED",
                30.0444,
                31.2357,
                USER_CAREGIVER_ID,
                now - timedelta(days=3, hours=5),
                now - timedelta(days=3, hours=4, minutes=45)
            ),
        ]
        cur.executemany("""
            INSERT INTO emergency_events (device_id, patient_id, trigger_source, severity, status, latitude, longitude, resolved_by, created_at, resolved_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """, emergency_events_data)

        # ----------------------------------------------------
        # 13. SYNC BATCHES
        # ----------------------------------------------------
        sync_batches_data = [
            (
                DEV_ALZ_ID,
                now - timedelta(hours=1),
                json.dumps({
                    "edge_node": "Raspberry Pi 4",
                    "temperature_celsius": 46.2,
                    "ram_usage_mb": 1150,
                    "offline_interactions_count": 0,
                    "stt_engine": "whisper.cpp-base",
                    "battery_backup": "OK"
                }),
                True
            ),
        ]
        cur.executemany("""
            INSERT INTO sync_batches (device_id, synced_at, batch_payload, processed_status)
            VALUES (%s, %s, %s, %s);
        """, sync_batches_data)
        print(f"  ✓ Inserted emergency events and edge sync batches.")

        # Commit all changes
        conn.commit()
        print("\n" + "=" * 75)
        print("✓ ALL 13 NEON TABLES SUCCESSFULLY POPULATED WITH CLINICAL DATA!")
        print("=" * 75)

    except Exception as e:
        conn.rollback()
        print(f"\n[ERROR] Transaction failed and rolled back: {e}")
        raise e
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    clean_and_seed()
