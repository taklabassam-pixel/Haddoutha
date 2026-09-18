export interface NamePattern {
  id: string;
  name: string;
  gender: 'boy' | 'girl';
}

export const KNOWN_NAME_PATTERNS: NamePattern[] = [
  // ---------------- أسماء الذكور ----------------
  // حرف الألف
  { id: 'ahmad', name: 'أحمد', gender: 'boy' },
  { id: 'amir', name: 'أمير', gender: 'boy' },
  { id: 'adam', name: 'آدم', gender: 'boy' },
  { id: 'anass', name: 'أنس', gender: 'boy' },
  { id: 'ayman', name: 'أيمن', gender: 'boy' },
  { id: 'iyad', name: 'إياد', gender: 'boy' },
  { id: 'ibrahim', name: 'إبراهيم', gender: 'boy' },
  { id: 'ismail', name: 'إسماعيل', gender: 'boy' },
  { id: 'osama', name: 'أسامة', gender: 'boy' },
  { id: 'amjad', name: 'أمجد', gender: 'boy' },
  { id: 'asser', name: 'آسر', gender: 'boy' },

  // حرف الباء
  { id: 'badr', name: 'بدر', gender: 'boy' },
  { id: 'bilal', name: 'بلال', gender: 'boy' },
  { id: 'bahaa', name: 'بهاء', gender: 'boy' },
  { id: 'bassel', name: 'باسل', gender: 'boy' },
  { id: 'bsharr', name: 'بشار', gender: 'boy' },

  // حرف التاء والثاء
  { id: 'taym', name: 'تيم', gender: 'boy' },
  { id: 'tariq', name: 'طارق', gender: 'boy' },
  { id: 'tamim', name: 'تميم', gender: 'boy' },
  { id: 'tamer', name: 'تامر', gender: 'boy' },
  { id: 'thabit', name: 'ثابت', gender: 'boy' },

  // حرف الجيم والحاء والخاء
  { id: 'jad', name: 'جاد', gender: 'boy' },
  { id: 'jawad', name: 'جواد', gender: 'boy' },
  { id: 'jaber', name: 'جابر', gender: 'boy' },
  { id: 'jlal', name: 'جلال', gender: 'boy' },
  { id: 'hamza', name: 'حمزة', gender: 'boy' },
  { id: 'hassan', name: 'حسن', gender: 'boy' },
  { id: 'hussein', name: 'حسين', gender: 'boy' },
  { id: 'hashem', name: 'هاشم', gender: 'boy' },
  { id: 'hadi', name: 'هادي', gender: 'boy' },
  { id: 'khaled', name: 'خالد', gender: 'boy' },
  { id: 'khalil', name: 'خليل', gender: 'boy' },

  // حرف الدال والذال والراء والزاي
  { id: 'dawood', name: 'داوود', gender: 'boy' },
  { id: 'dani', name: 'داني', gender: 'boy' },
  { id: 'zakariya', name: 'زكريا', gender: 'boy' },
  { id: 'rayan', name: 'ريان', gender: 'boy' },
  { id: 'rida', name: 'رضا', gender: 'boy' },
  { id: 'ramy', name: 'رامي', gender: 'boy' },
  { id: 'zayd', name: 'زيد', gender: 'boy' },
  { id: 'ziad', name: 'زياد', gender: 'boy' },
  { id: 'zain', name: 'زين', gender: 'boy' },

  // حرف السين والشين والصاد والضاد
  { id: 'sami', name: 'سامي', gender: 'boy' },
  { id: 'saad', name: 'سعد', gender: 'boy' },
  { id: 'saeed', name: 'سعيد', gender: 'boy' },
  { id: 'selim', name: 'سليم', gender: 'boy' },
  { id: 'sulaiman', name: 'سليمان', gender: 'boy' },
  { id: 'samer', name: 'سامر', gender: 'boy' },
  { id: 'saif', name: 'سيف', gender: 'boy' },
  { id: 'salah', name: 'صلاح', gender: 'boy' },
  { id: 'suhaib', name: 'صهيب', gender: 'boy' },
  { id: 'dhea', name: 'ضياء', gender: 'boy' },

  // حرف العين وغين وفاء وقاف
  { id: 'omar', name: 'عمر', gender: 'boy' },
  { id: 'ali', name: 'علي', gender: 'boy' },
  { id: 'obada', name: 'عبادة', gender: 'boy' },
  { id: 'abdallah', name: 'عبد الله', gender: 'boy' },
  { id: 'abdelrahman', name: 'عبد الرحمن', gender: 'boy' },
  { id: 'ghassan', name: 'غسان', gender: 'boy' },
  { id: 'faysal', name: 'فيصل', gender: 'boy' },
  { id: 'faris', name: 'فارس', gender: 'boy' },
  { id: 'fadi', name: 'فادي', gender: 'boy' },
  { id: 'kays', name: 'قيس', gender: 'boy' },
  { id: 'kassim', name: 'قاسم', gender: 'boy' },

  // حرف الكاف واللام والميم والنون
  { id: 'kareem', name: 'كريم', gender: 'boy' },
  { id: 'kinan', name: 'كينان', gender: 'boy' },
  { id: 'layth', name: 'ليث', gender: 'boy' },
  { id: 'mohammed', name: 'محمد', gender: 'boy' },
  { id: 'malek', name: 'مالك', gender: 'boy' },
  { id: 'moustafa', name: 'مصطفى', gender: 'boy' },
  { id: 'mahmoud', name: 'محمود', gender: 'boy' },
  { id: 'majed', name: 'ماجد', gender: 'boy' },
  { id: 'mounir', name: 'منير', gender: 'boy' },
  { id: 'mahir', name: 'ماهر', gender: 'boy' },
  { id: 'nasser', name: 'ناصر', gender: 'boy' },
  { id: 'nabil', name: 'نبيل', gender: 'boy' },
  { id: 'nawaf', name: 'نواف', gender: 'boy' },

  // حرف الهاء والواو والياء
  { id: 'haitham', name: 'هيثم', gender: 'boy' },
  { id: 'waleed', name: 'وليد', gender: 'boy' },
  { id: 'wassim', name: 'وسيم', gender: 'boy' },
  { id: 'youssef', name: 'يوسف', gender: 'boy' },
  { id: 'yasin', name: 'ياسين', gender: 'boy' },
  { id: 'yahya', name: 'يحيى', gender: 'boy' },
  { id: 'yazan', name: 'يزن', gender: 'boy' },
  { id: 'yaser', name: 'ياسر', gender: 'boy' },

  // ---------------- أسماء الإناث ----------------
  // حرف الألف
  { id: 'amira', name: 'أميرة', gender: 'girl' },
  { id: 'aya', name: 'آية', gender: 'girl' },
  { id: 'amal', name: 'أمل', gender: 'girl' },
  { id: 'almaa', name: 'ألما', gender: 'girl' },
  { id: 'areej', name: 'أريج', gender: 'girl' },
  { id: 'israa', name: 'إسراء', gender: 'girl' },

  // حرف الباء والتاء
  { id: 'batoul', name: 'بتول', gender: 'girl' },
  { id: 'bayan', name: 'بيان', gender: 'girl' },
  { id: 'basma', name: 'بسمة', gender: 'girl' },
  { id: 'baysan', name: 'بيسان', gender: 'girl' },
  { id: 'tala', name: 'تالا', gender: 'girl' },
  { id: 'tia', name: 'تيا', gender: 'girl' },
  { id: 'talin', name: 'تالين', gender: 'girl' },
  { id: 'tara', name: 'تارا', gender: 'girl' },

  // حرف الجيم والحاء والخاء
  { id: 'janna', name: 'جنة', gender: 'girl' },
  { id: 'jana', name: 'جنى', gender: 'girl' },
  { id: 'judy', name: 'جودي', gender: 'girl' },
  { id: 'joumana', name: 'جومانا', gender: 'girl' },
  { id: 'jouri', name: 'جوري', gender: 'girl' },
  { id: 'hawraa', name: 'حوراء', gender: 'girl' },
  { id: 'huda', name: 'هدى', gender: 'girl' },
  { id: 'hala', name: 'حلا', gender: 'girl' },
  { id: 'haneen', name: 'حنين', gender: 'girl' },
  { id: 'khadija', name: 'خديجة', gender: 'girl' },

  // حرف الدال والراء والزاي
  { id: 'dana', name: 'دانا', gender: 'girl' },
  { id: 'dalia', name: 'داليا', gender: 'girl' },
  { id: 'dima', name: 'ديما', gender: 'girl' },
  { id: 'dania', name: 'دانية', gender: 'girl' },
  { id: 'reem', name: 'ريم', gender: 'girl' },
  { id: 'rahaf', name: 'رهف', gender: 'girl' },
  { id: 'roza', name: 'روزة', gender: 'girl' },
  { id: 'razan', name: 'رزان', gender: 'girl' },
  { id: 'raniya', name: 'رانية', gender: 'girl' },
  { id: 'rawan', name: 'روان', gender: 'girl' },
  { id: 'rima', name: 'ريما', gender: 'girl' },
  { id: 'zahraa', name: 'زهراء', gender: 'girl' },
  { id: 'zainab', name: 'زينب', gender: 'girl' },
  { id: 'zeina', name: 'زينة', gender: 'girl' },

  // حرف السين والشين والصاد
  { id: 'sara', name: 'سارة', gender: 'girl' },
  { id: 'salma', name: 'سلمى', gender: 'girl' },
  { id: 'siwar', name: 'سوار', gender: 'girl' },
  { id: 'cynthia', name: 'سينتيا', gender: 'girl' },
  { id: 'celine', name: 'سيلا', gender: 'girl' },
  { id: 'sandra', name: 'ساندرا', gender: 'girl' },
  { id: 'sidra', name: 'سدرة', gender: 'girl' },
  { id: 'shahad', name: 'شهد', gender: 'girl' },
  { id: 'shaza', name: 'شذا', gender: 'girl' },
  { id: 'saba', name: 'صبا', gender: 'girl' },
  { id: 'safa', name: 'صفاء', gender: 'girl' },

  // حرف العين والغين والفاء
  { id: 'aisha', name: 'عائشة', gender: 'girl' },
  { id: 'alia', name: 'عليا', gender: 'girl' },
  { id: 'ghazal', name: 'غزل', gender: 'girl' },
  { id: 'ghala', name: 'غلا', gender: 'girl' },
  { id: 'fatima', name: 'فاطمة', gender: 'girl' },
  { id: 'farah', name: 'فرح', gender: 'girl' },
  { id: 'fay', name: 'فيّ', gender: 'girl' },

  // حرف الكاف واللام والميم
  { id: 'kenda', name: 'كندة', gender: 'girl' },
  { id: 'karma', name: 'كارما', gender: 'girl' },
  { id: 'leen', name: 'لين', gender: 'girl' },
  { id: 'lana', name: 'لانا', gender: 'girl' },
  { id: 'layla', name: 'ليلى', gender: 'girl' },
  { id: 'lama', name: 'لمى', gender: 'girl' },
  { id: 'lori', name: 'لوري', gender: 'girl' },
  { id: 'layan', name: 'ليان', gender: 'girl' },
  { id: 'lara', name: 'لارا', gender: 'girl' },
  { id: 'lamis', name: 'لميس', gender: 'girl' },
  { id: 'mira', name: 'ميرا', gender: 'girl' },
  { id: 'maryam', name: 'مريم', gender: 'girl' },
  { id: 'maya', name: 'مايا', gender: 'girl' },
  { id: 'massa', name: 'ماسة', gender: 'girl' },
  { id: 'manal', name: 'منال', gender: 'girl' },
  { id: 'marina', name: 'مارينا', gender: 'girl' },

  // حرف النون والهاء والواو والياء
  { id: 'naya', name: 'نايا', gender: 'girl' },
  { id: 'nour', name: 'نور', gender: 'girl' },
  { id: 'nagham', name: 'نغم', gender: 'girl' },
  { id: 'nadin', name: 'نادين', gender: 'girl' },
  { id: 'norah', name: 'نورة', gender: 'girl' },
  { id: 'hadeel', name: 'هديل', gender: 'girl' },
  { id: 'wateen', name: 'وتين', gender: 'girl' },
  { id: 'yara', name: 'يارا', gender: 'girl' },
  { id: 'yasmina', name: 'ياسمينة', gender: 'girl' },
  { id: 'yosra', name: 'يسرى', gender: 'girl' }
];

export const NEUTRAL_TITLES = {
  boy: 'البطل',
  girl: 'الشاطرة',
  generic: 'الحلو'
};


