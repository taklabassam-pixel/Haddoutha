import os

# 1. تحديد المسار المطلق لمجلد ahlan_names بمرجعية مكان ملف البايثون نفسه
script_dir = os.path.dirname(os.path.abspath(__file__))
audio_folder = os.path.join(script_dir, 'ahlan_names')

def rename_audio_files(folder_path):
    if not os.path.exists(folder_path):
        print(f"المجلد غير موجود: {folder_path}")
        return

    count = 0
    for filename in os.listdir(folder_path):
        if ' ' in filename:
            new_filename = filename.replace(' ', '_')
            
            old_file_path = os.path.join(folder_path, filename)
            new_file_path = os.path.join(folder_path, new_filename)
            
            os.rename(old_file_path, new_file_path)
            print(f"تمت إعادة التسمية: '{filename}' ⬅️ '{new_filename}'")
            count += 1

    print(f"\nتمت معالجة وإعادة تسمية {count} ملف بنجاح!")

# تشغيل السكريبت
rename_audio_files(audio_folder)