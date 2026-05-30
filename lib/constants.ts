import type { NavItem, TechCard, BallPhysics } from '@/types/bowling';

export const DEFAULT_PHYSICS: BallPhysics = {
  speed: 22,
  angle: 4,
  weight: 5.4,
  spinRate: 320,
  friction: 0.65,
  oilPattern: 'house',
  hookStrength: 0.5,
  launchPos: 0,
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home',      labelAr: 'الرئيسية',       href: '#hero' },
  { label: 'Simulator', labelAr: 'المحاكي',         href: '#simulator' },
  { label: 'Dashboard', labelAr: 'لوحة التحكم',    href: '#dashboard' },
  { label: 'Technology', labelAr: 'التقنية',        href: '#technology' },
  { label: 'Analytics', labelAr: 'التحليلات',      href: '#analytics' },
  { label: 'Education', labelAr: 'التعليم',         href: '#education' },
];

export const PIN_POSITIONS: [number, number, number][] = [
  // Row 4 (back)
  [-0.9, 0, -8.5], [-0.3, 0, -8.5], [0.3, 0, -8.5], [0.9, 0, -8.5],
  // Row 3
  [-0.6, 0, -7.5], [0, 0, -7.5], [0.6, 0, -7.5],
  // Row 2
  [-0.3, 0, -6.5], [0.3, 0, -6.5],
  // Row 1 (front)
  [0, 0, -5.5],
];

export const TECH_CARDS: TechCard[] = [
  {
    id: 'imu',
    icon: '📡',
    title: 'IMU Sensors',
    titleAr: 'مستشعرات القصور الذاتي',
    description: '6-axis inertial measurement unit capturing ball acceleration, angular velocity, and orientation at 1kHz sampling rate.',
    descriptionAr: 'وحدة قياس القصور الذاتي ذات 6 محاور تلتقط تسارع الكرة وسرعتها الزاوية بمعدل 1 كيلو هرتز.',
    color: '#00D4FF',
    specs: ['1000 Hz sampling', '±2000 dps gyro', '±16g accelerometer', 'Bluetooth 5.0 LE'],
  },
  {
    id: 'motion',
    icon: '🎯',
    title: 'Motion Tracking',
    titleAr: 'تتبع الحركة',
    description: 'Multi-camera optical tracking system with sub-millimeter precision for complete 3D ball path reconstruction.',
    descriptionAr: 'نظام تتبع بصري متعدد الكاميرات بدقة أقل من ملليمتر لإعادة بناء مسار الكرة ثلاثي الأبعاد.',
    color: '#8B00FF',
    specs: ['120 fps cameras', '0.1mm precision', '3D path mapping', 'Real-time processing'],
  },
  {
    id: 'vision',
    icon: '👁',
    title: 'Computer Vision',
    titleAr: 'رؤية الحاسوب',
    description: 'AI-powered computer vision analyzes pin collision patterns, bowler form, and delivery technique in real-time.',
    descriptionAr: 'رؤية حاسوبية مدعومة بالذكاء الاصطناعي تحلل أنماط تصادم الأقماع وأسلوب اللاعب.',
    color: '#00FF88',
    specs: ['YOLOv8 detection', '60 fps analysis', 'Form scoring', 'Pose estimation'],
  },
  {
    id: 'laser',
    icon: '🔴',
    title: 'Laser Foul Detection',
    titleAr: 'كشف المخالفات بالليزر',
    description: 'Precision laser grid system at the foul line ensures zero-miss foul detection with microsecond response time.',
    descriptionAr: 'نظام شبكة ليزر دقيقة عند خط المخالفة يضمن كشفاً بدون أخطاء مع زمن استجابة بالميكروثانية.',
    color: '#FF3366',
    specs: ['±0.1mm detection', '<1μs response', 'Zero false positives', 'IR safe class 1'],
  },
  {
    id: 'ai',
    icon: '🤖',
    title: 'AI Performance Analysis',
    titleAr: 'تحليل الأداء بالذكاء الاصطناعي',
    description: 'Deep learning models trained on 10M+ throws provide personalized coaching insights and performance predictions.',
    descriptionAr: 'نماذج تعلم عميق مدربة على أكثر من 10 ملايين رمية توفر رؤى تدريبية شخصية.',
    color: '#FFB800',
    specs: ['10M+ training data', 'LSTM prediction', '94% accuracy', 'Cloud processing'],
  },
];

export const OIL_PATTERNS = [
  { value: 'house', label: 'House Shot', labelAr: 'مسار المنزل', difficulty: 30 },
  { value: 'sport', label: 'Sport Shot', labelAr: 'مسار الرياضة', difficulty: 60 },
  { value: 'challenge', label: 'Challenge', labelAr: 'التحدي', difficulty: 80 },
  { value: 'flooded', label: 'Flooded Lane', labelAr: 'مسار مغمور', difficulty: 50 },
  { value: 'dry', label: 'Dry Lane', labelAr: 'مسار جاف', difficulty: 90 },
];

export const CAMERA_VIEWS = [
  { id: 'front',  label: 'Front View',   labelAr: 'المنظور الأمامي',   icon: 'front'  },
  { id: 'side',   label: 'Side View',    labelAr: 'المنظور الجانبي',   icon: 'side'   },
  { id: 'top',    label: 'Top View',     labelAr: 'المنظور العلوي',    icon: 'top'    },
  { id: 'follow', label: 'Follow Ball',  labelAr: 'تتبع الكرة',        icon: 'follow' },
  { id: 'slowmo', label: 'Slow Motion',  labelAr: 'الحركة البطيئة',    icon: 'slowmo' },
  { id: 'orbit',  label: 'Free Orbit',   labelAr: 'حرية الدوران',      icon: 'orbit'  },
];
