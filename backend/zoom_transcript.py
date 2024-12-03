import requests
from datetime import datetime
import sys
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

API_KEY = os.getenv("RECALL_API_KEY")
BOT_NAME = os.getenv("BOT_NAME")
MEETING_URL = os.getenv("MEETING_URL")
PROVIDER = os.getenv("PROVIDER")
BOT_ID_FILE = ".env"

def save_bot_id(bot_id):
    with open(BOT_ID_FILE, "r+") as f:
        lines = f.readlines()
        f.seek(0)
        updated = False
        for line in lines:
            if line.startswith("BOT_ID="):
                f.write(f"BOT_ID={bot_id}\n")
                updated = True
            else:
                f.write(line)
        if not updated:
            f.write(f"BOT_ID={bot_id}\n")
        f.truncate()

def create_bot():
    url = "https://us-west-2.recall.ai/api/v1/bot/"
    current_time = datetime.utcnow().isoformat() + "Z"  # Get current UTC time in ISO format

    payload = {
        "meeting_url": MEETING_URL,
        "bot_name": BOT_NAME,
        "join_at": current_time,
        "transcription_options": {
            "provider": PROVIDER
        },
        "recording": {
            "include_video": False,
            "include_audio": False,
            "include_transcript": True
        }
    }

    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "Authorization": API_KEY  # Use API key from .env
    }

    response = requests.post(url, json=payload, headers=headers)

    if response.status_code == 200:
        data = response.json()
        bot_id = data.get("id")
        save_bot_id(bot_id)
        print(bot_id)
        return bot_id
    else:
        print(f"Error creating bot: {response.status_code}, {response.text}")
        return None

def get_transcript(bot_id):
    url = f"https://us-west-2.recall.ai/api/v1/bot/{bot_id}/transcript/"

    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "Authorization": API_KEY  # Use API key from .env
    }

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        print("Transcript retrieved successfully:")
        transcript_data = response.json()
        
        # Extract and save to a text file
        transcript_file = f"transcript_{bot_id}.txt"
        with open(transcript_file, "w") as file:
            for entry in transcript_data:
                speaker = entry.get("speaker", "Unknown Speaker")
                words = entry.get("words", [])
                text = " ".join(word.get("text", "") for word in words)
                file.write(f"{speaker}: {text}\n")
        
        print(f"Transcript saved to {transcript_file}")
    else:
        print(f"Error retrieving transcript: {response.status_code}, {response.text}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python script.py [create_bot|get_transcript] [bot_id]")
    else:
        action = sys.argv[1]

        if action == "create_bot":
            create_bot()
        elif action == "get_transcript":
            if len(sys.argv) < 3:
                print("Error: Bot ID is required for get_transcript.")
            else:
                bot_id = sys.argv[2]
                get_transcript(bot_id)
        else:
            print("Invalid action. Use 'create_bot' or 'get_transcript'.")
