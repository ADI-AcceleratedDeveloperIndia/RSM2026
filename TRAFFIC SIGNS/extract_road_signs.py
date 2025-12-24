import requests
import os
import json
import sys
from pathlib import Path
from bs4 import BeautifulSoup
import re

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Base URL for images
BASE_IMAGE_URL = "https://az-ci-afde-prd-msds-01-b3emdzgtgackhzfw.z01.azurefd.net/-/media/feature/maruti-driving-school/mock-llr-test/roadsign"

# Categories and their image ranges
CATEGORIES = {
    "mandatory": list(range(1, 33)),  # 1-32
    "cautionary": list(range(1, 37)),  # 1-36
    "informatory": list(range(1, 20))  # 1-19
}

# Create directories
def create_directories():
    for category in CATEGORIES.keys():
        os.makedirs(f"road_signs/{category}", exist_ok=True)
    os.makedirs("road_signs/content", exist_ok=True)

# Download images
def download_images():
    downloaded = []
    failed = []
    
    for category, numbers in CATEGORIES.items():
        print(f"\nDownloading {category} signs...")
        for num in numbers:
            # Try with .jpg extension
            url = f"{BASE_IMAGE_URL}/{category}/{num}.jpg"
            filename = f"road_signs/{category}/{category}_{num:02d}.jpg"
            
            try:
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    with open(filename, 'wb') as f:
                        f.write(response.content)
                    downloaded.append((category, num, url))
                    print(f"  [OK] Downloaded {filename}")
                else:
                    failed.append((category, num, url, f"Status: {response.status_code}"))
                    print(f"  [FAIL] Failed {filename} - Status: {response.status_code}")
            except Exception as e:
                failed.append((category, num, url, str(e)))
                print(f"  [FAIL] Failed {filename} - {str(e)}")
    
    return downloaded, failed

# Extract content from the page
def extract_content():
    url = "https://www.marutisuzukidrivingschool.com/mock-llr-road-sign"
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract main content
        content = {
            "title": soup.find('title').text if soup.find('title') else "",
            "main_text": [],
            "sections": {}
        }
        
        # Find main content area
        # Based on the web search results, we know the structure
        main_content = soup.find('main') or soup.find('div', class_=re.compile('content|main'))
        
        if main_content:
            # Extract paragraphs
            paragraphs = main_content.find_all('p')
            content["main_text"] = [p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True)]
        
        # Save raw HTML for reference
        with open("road_signs/content/page_content.html", 'w', encoding='utf-8') as f:
            f.write(response.text)
        
        # Save extracted content as JSON
        with open("road_signs/content/extracted_content.json", 'w', encoding='utf-8') as f:
            json.dump(content, f, indent=2, ensure_ascii=False)
        
        # Save plain text content
        text_content = f"Title: {content['title']}\n\n"
        text_content += "\n\n".join(content['main_text'])
        
        with open("road_signs/content/page_content.txt", 'w', encoding='utf-8') as f:
            f.write(text_content)
        
        print("\n[OK] Content extracted and saved")
        return content
        
    except Exception as e:
        print(f"✗ Error extracting content: {str(e)}")
        return None

# Create a summary document
def create_summary(downloaded, failed):
    summary = {
        "total_downloaded": len(downloaded),
        "total_failed": len(failed),
        "categories": {
            "mandatory": len([d for d in downloaded if d[0] == "mandatory"]),
            "cautionary": len([d for d in downloaded if d[0] == "cautionary"]),
            "informatory": len([d for d in downloaded if d[0] == "informatory"])
        },
        "downloaded_images": downloaded,
        "failed_downloads": failed
    }
    
    with open("road_signs/download_summary.json", 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    
    # Create a readable summary
    summary_text = f"""
ROAD SIGNS EXTRACTION SUMMARY
==============================

Total Images Downloaded: {summary['total_downloaded']}
Total Failed Downloads: {summary['total_failed']}

By Category:
  - Mandatory: {summary['categories']['mandatory']} images
  - Cautionary: {summary['categories']['cautionary']} images
  - Informatory: {summary['categories']['informatory']} images

Images are saved in:
  - road_signs/mandatory/
  - road_signs/cautionary/
  - road_signs/informatory/

Content extracted to:
  - road_signs/content/page_content.html
  - road_signs/content/page_content.txt
  - road_signs/content/extracted_content.json
"""
    
    if failed:
        summary_text += "\n\nFAILED DOWNLOADS:\n"
        for item in failed:
            summary_text += f"  - {item[0]}/{item[1]}: {item[3]}\n"
    
    with open("road_signs/SUMMARY.txt", 'w', encoding='utf-8') as f:
        f.write(summary_text)
    
    print("\n" + summary_text)

if __name__ == "__main__":
    print("Starting road signs extraction...")
    print("=" * 50)
    
    # Create directories
    create_directories()
    
    # Download images
    downloaded, failed = download_images()
    
    # Extract content
    extract_content()
    
    # Create summary
    create_summary(downloaded, failed)
    
    print("\n" + "=" * 50)
    print("Extraction complete!")

