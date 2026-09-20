import os

# المجلد الحالي الذي يحتوي على السكربت والملفات
folder_path = '.' 

# التكرار على جميع الملفات في المجلد
for filename in os.listdir(folder_path):
    # الفحص: هل الملف بصيغة .wav؟
    if filename.endswith('.wav'):
        old_path = os.path.join(folder_path, filename)
        
        # 1. استبدال "أهلاً" (إن وجدت) بـ "اهلاَ"
        new_filename = filename.replace('أهلاً', 'اهلاَ')
        
        # 2. استبدال كل المسافات بـ الشرطة السفلى (_)
        new_filename = new_filename.replace(' ', '_')
        
        # إذا كان الاسم الجديد يختلف عن القديم، يتم إعادة التسمية
        if old_path != os.path.join(folder_path, new_filename):
            new_path = os.path.join(folder_path, new_filename)
            os.rename(old_path, new_path)
            print(f"✅ تم تغيير: {filename} 👈 {new_filename}")

print("\n🎉 اكتملت إعادة تسمية وتنسيق جميع الملفات بالصيغة الدقيقة بنجاح!")