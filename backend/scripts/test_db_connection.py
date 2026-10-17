"""
CURA Database Connection Tester for Neon.tech.
Run this script to verify your laptop can reach the shared cloud PostgreSQL database.
"""
import sys
import os

# Set UTF-8 encoding for Windows console compatibility
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.infrastructure.database.neon_session import test_neon_connection, DATABASE_URL

def main():
    print("=" * 65)
    print("CURA -- Neon.tech Cloud Database Connection Test")
    print("=" * 65)
    print(f"Target Database URL:\n  {DATABASE_URL}\n")
    print("Attempting to connect to Neon PostgreSQL...")
    
    success = test_neon_connection()
    if success:
        print("\n[SUCCESS] CONNECTION VERIFIED!")
        print("Your environment is connected to the shared CURA Neon database.")
        print("All team members can read/write to this single source of truth.")
    else:
        print("\n[FAILED] CONNECTION FAILED.")
        print("Please verify your internet connection or check credentials in .env.")
    print("=" * 65)

if __name__ == "__main__":
    main()
