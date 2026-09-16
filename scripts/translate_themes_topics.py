import json
import urllib.request
import urllib.parse
import time
import re

def clean_islamic_terms(text):
    if not text:
        return text
    # Post-process common Quranic / Islamic terminology in Indonesian
    text = re.sub(r'\(pbuh\)', '(SAW)', text, flags=re.IGNORECASE)
    text = re.sub(r'\bpbuh\b', 'SAW', text, flags=re.IGNORECASE)
    text = re.sub(r'\bRasool\b', 'Rasul', text, flags=re.IGNORECASE)
    text = re.sub(r'\bRasoolullah\b', 'Rasulullah', text, flags=re.IGNORECASE)
    text = re.sub(r'\bAl-Quran\b', 'Al-Qur\'an', text, flags=re.IGNORECASE)
    text = re.sub(r'\bQuran\b', 'Al-Qur\'an', text, flags=re.IGNORECASE)
    text = re.sub(r'\bHadrat\b', 'Sayyidina', text, flags=re.IGNORECASE)
    text = re.sub(r'\bHari kiamat\b', 'Hari Kiamat', text, flags=re.IGNORECASE)
    text = re.sub(r'\bOrang -orang\b', 'Orang-orang', text)
    text = re.sub(r'\bOrang kafir\b', 'Orang kafir', text, flags=re.IGNORECASE)
    text = re.sub(r'\bAhli kitab\b', 'Ahli Kitab', text, flags=re.IGNORECASE)
    return text.strip()

def translate_batch(text_list, max_retries=3):
    if not text_list:
        return []
    combined = '\n'.join([t.replace('\n', ' ') for t in text_list])
    url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=id&dt=t&q=' + urllib.parse.quote(combined)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    
    for attempt in range(max_retries):
        try:
            with urllib.request.urlopen(req, timeout=10) as res:
                data = json.loads(res.read().decode('utf-8'))
                raw_segments = [item[0] for item in data[0] if item and item[0]]
                joined = ''.join(raw_segments)
                lines = joined.split('\n')
                # If length matches exactly
                if len(lines) == len(text_list):
                    return [clean_islamic_terms(l.strip()) for l in lines]
                elif len(lines) > len(text_list):
                    return [clean_islamic_terms(l.strip()) for l in lines[:len(text_list)]]
                else:
                    # Fallback single translate if split failed
                    print(f"Warning: batch length mismatch ({len(lines)} vs {len(text_list)}). Falling back to individual translations.")
                    results = []
                    for single_text in text_list:
                        s_url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=id&dt=t&q=' + urllib.parse.quote(single_text)
                        s_req = urllib.request.Request(s_url, headers={'User-Agent': 'Mozilla/5.0'})
                        try:
                            with urllib.request.urlopen(s_req, timeout=5) as s_res:
                                s_data = json.loads(s_res.read().decode('utf-8'))
                                s_trans = ''.join([s[0] for s in s_data[0] if s and s[0]])
                                results.append(clean_islamic_terms(s_trans.strip()))
                        except Exception as se:
                            results.append(single_text)
                        time.sleep(0.05)
                    return results
        except Exception as e:
            print(f"Attempt {attempt+1} failed: {e}")
            time.sleep(1)
            
    return text_list

def main():
    # 1. Translate Ayah Themes
    print("--- Loading Ayah Themes ---")
    with open('public/qul/ayah themes - topics/ayah-themes.json', 'r', encoding='utf-8') as f:
        themes = json.load(f)

    # Collect unique theme strings
    unique_themes = []
    seen_themes = set()
    for t in themes:
        theme_str = t.get('theme', '').strip()
        if theme_str and theme_str not in seen_themes:
            seen_themes.add(theme_str)
            unique_themes.append(theme_str)

    print(f"Total themes: {len(themes)}, Unique themes to translate: {len(unique_themes)}")

    theme_translations = {}
    batch_size = 35
    for i in range(0, len(unique_themes), batch_size):
        batch = unique_themes[i:i+batch_size]
        print(f"Translating themes batch {i+1} - {min(i+batch_size, len(unique_themes))} / {len(unique_themes)}...")
        trans = translate_batch(batch)
        for orig, tr in zip(batch, trans):
            theme_translations[orig] = tr
        time.sleep(0.15)

    # Apply translations to themes
    for t in themes:
        orig = t.get('theme', '').strip()
        t['theme_id'] = theme_translations.get(orig, orig)

    with open('public/qul/ayah themes - topics/ayah-themes.json', 'w', encoding='utf-8') as f:
        json.dump(themes, f, ensure_ascii=False, indent=2)
    print("Saved translated ayah-themes.json successfully!")

    # 2. Translate Ayah Topics
    print("\n--- Loading Ayah Topics ---")
    with open('public/qul/ayah themes - topics/topics.json', 'r', encoding='utf-8') as f:
        topics = json.load(f)

    unique_topic_names = []
    seen_topics = set()
    for top in topics:
        n = top.get('name', '').strip()
        if n and n not in seen_topics:
            seen_topics.add(n)
            unique_topic_names.append(n)

    print(f"Total topics: {len(topics)}, Unique topic names to translate: {len(unique_topic_names)}")

    topic_translations = {}
    for i in range(0, len(unique_topic_names), batch_size):
        batch = unique_topic_names[i:i+batch_size]
        print(f"Translating topics batch {i+1} - {min(i+batch_size, len(unique_topic_names))} / {len(unique_topic_names)}...")
        trans = translate_batch(batch)
        for orig, tr in zip(batch, trans):
            topic_translations[orig] = tr
        time.sleep(0.15)

    for top in topics:
        orig = top.get('name', '').strip()
        top['name_id'] = topic_translations.get(orig, orig)

    with open('public/qul/ayah themes - topics/topics.json', 'w', encoding='utf-8') as f:
        json.dump(topics, f, ensure_ascii=False, indent=2)
    print("Saved translated topics.json successfully!")

if __name__ == '__main__':
    main()
