'use client';
import { useState } from 'react';
import type { Language } from '@/types/bowling';

interface EducationSectionProps { lang: Language; }

const TOPICS = [
  {
    id: 'physics',
    icon: '⚛',
    title: 'Bowling Physics',
    titleAr: 'فيزياء البولينج',
    color: '#00D4FF',
    description: 'The science of projectile motion, rotational dynamics, and collision mechanics.',
    descriptionAr: 'علم حركة القذيفة والديناميكا الدورانية وميكانيكا التصادم.',
    content: {
      en: [
        { term: 'Newton\'s 2nd Law', formula: 'F = ma', explain: 'The force exerted by the ball equals its mass times acceleration. A heavier ball requires more force but delivers greater momentum.' },
        { term: 'Projectile Motion', formula: 'x(t) = v₀t + ½at²', explain: 'The ball follows a parabolic path influenced by initial velocity, spin-induced forces, and gravity.' },
        { term: 'Conservation of Momentum', formula: 'p₁ + p₂ = p₁\' + p₂\'', explain: 'Total momentum before and after collision remains constant. This determines how pins scatter after impact.' },
        { term: 'Rotational Inertia', formula: 'I = 2/5 mr²', explain: 'For a solid sphere, moment of inertia determines resistance to angular acceleration and spin rate.' },
      ],
      ar: [
        { term: 'قانون نيوتن الثاني', formula: 'F = ma', explain: 'القوة المبذولة على الكرة تساوي كتلتها مضروبة في تسارعها. الكرة الأثقل تحتاج قوة أكبر لكنها تمنح زخمًا أعلى.' },
        { term: 'حركة القذيفة', formula: 'x(t) = v₀t + ½at²', explain: 'تتبع الكرة مسارًا مكافئًا متأثرًا بالسرعة الابتدائية والقوى الناجمة عن الدوران والجاذبية.' },
        { term: 'حفظ الزخم', formula: 'p₁ + p₂ = p₁\' + p₂\'', explain: 'يبقى مجموع الزخم قبل وبعد التصادم ثابتًا. هذا يحدد كيف تتبعثر الأقماع عند الاصطدام.' },
        { term: 'عزم القصور الذاتي', formula: 'I = 2/5 mr²', explain: 'لكرة صلبة، عزم القصور الذاتي يحدد مقاومة التسارع الزاوي ومعدل الدوران.' },
      ],
    },
  },
  {
    id: 'friction',
    icon: '🌊',
    title: 'Friction Mechanics',
    titleAr: 'ميكانيكا الاحتكاك',
    color: '#8B00FF',
    description: 'How oil patterns and surface friction shape the ball\'s trajectory.',
    descriptionAr: 'كيف تؤثر أنماط الزيت والاحتكاك على مسار الكرة.',
    content: {
      en: [
        { term: 'Kinetic Friction', formula: 'f_k = μ_k × N', explain: 'When the ball slides on the lane, kinetic friction decelerates lateral slip and transfers energy to forward motion.' },
        { term: 'Rolling Without Slipping', formula: 'v = ω × r', explain: 'The condition where ball velocity equals angular velocity times radius — maximum grip, minimum energy loss.' },
        { term: 'Oil Pattern Effect', formula: 'μ_eff = μ × (1 - O)', explain: 'Oil concentration O reduces effective friction, affecting the ball\'s hook potential and trajectory shape.' },
        { term: 'Deceleration', formula: 'a = -μ_k × g', explain: 'Ball decelerates at a rate equal to friction coefficient times gravitational acceleration.' },
      ],
      ar: [
        { term: 'الاحتكاك الحركي', formula: 'f_k = μ_k × N', explain: 'عندما تنزلق الكرة على المسار، يبطئ الاحتكاك الحركي الانزلاق الجانبي وينقل الطاقة إلى الحركة الأمامية.' },
        { term: 'التدحرج بدون انزلاق', formula: 'v = ω × r', explain: 'الحالة التي تساوي فيها سرعة الكرة السرعة الزاوية مضروبة في نصف القطر — أقصى تماسك وأدنى فقد للطاقة.' },
        { term: 'تأثير نمط الزيت', formula: 'μ_eff = μ × (1 - O)', explain: 'تركيز الزيت يقلل الاحتكاك الفعلي، مما يؤثر على إمكانية انحراف الكرة وشكل مسارها.' },
        { term: 'التباطؤ', formula: 'a = -μ_k × g', explain: 'تتباطأ الكرة بمعدل يساوي معامل الاحتكاك مضروبًا في تسارع الجاذبية.' },
      ],
    },
  },
  {
    id: 'angular',
    icon: '🌀',
    title: 'Angular Momentum',
    titleAr: 'الزخم الزاوي',
    color: '#00FF88',
    description: 'Rotational physics that give bowling its characteristic hook motion.',
    descriptionAr: 'فيزياء الدوران التي تمنح البولينج حركته المنحنية المميزة.',
    content: {
      en: [
        { term: 'Angular Momentum', formula: 'L = I × ω', explain: 'The ball\'s spin creates angular momentum that persists through the throw and influences direction change.' },
        { term: 'Gyroscopic Effect', formula: 'τ = dL/dt', explain: 'Changes in torque affect the precession of the spinning ball, creating the characteristic hook effect.' },
        { term: 'Angular Velocity', formula: 'ω = 2π × RPM / 60', explain: 'Converts revolutions per minute to radians per second — the standard physics unit for rotation speed.' },
        { term: 'Hook Angle', formula: 'θ = ∫ω dt × μ', explain: 'The total hook angle depends on integrated angular velocity and friction over the lane length.' },
      ],
      ar: [
        { term: 'الزخم الزاوي', formula: 'L = I × ω', explain: 'يخلق دوران الكرة زخمًا زاويًا يستمر طوال الرمية ويؤثر على تغيير الاتجاه.' },
        { term: 'التأثير الجيروسكوبي', formula: 'τ = dL/dt', explain: 'التغيرات في العزم تؤثر على التقدم الحلزوني للكرة الدوارة، مما يخلق تأثير الانحناء المميز.' },
        { term: 'السرعة الزاوية', formula: 'ω = 2π × RPM / 60', explain: 'تحويل الدورات في الدقيقة إلى راديان في الثانية — الوحدة الفيزيائية القياسية لسرعة الدوران.' },
        { term: 'زاوية الانحناء', formula: 'θ = ∫ω dt × μ', explain: 'تعتمد زاوية الانحناء الكلية على السرعة الزاوية المتراكمة والاحتكاك على طول المسار.' },
      ],
    },
  },
  {
    id: 'sensors',
    icon: '📡',
    title: 'Sensor Technology',
    titleAr: 'تقنية الاستشعار',
    color: '#FFB800',
    description: 'How modern MEMS sensors capture and quantify ball dynamics.',
    descriptionAr: 'كيف تلتقط مستشعرات MEMS الحديثة وتقيس ديناميكيات الكرة.',
    content: {
      en: [
        { term: 'Accelerometer', formula: 'a = F/m (3-axis)', explain: 'Measures linear acceleration in X, Y, Z axes at up to 1kHz. Detects ball release, spin onset, and impact events.' },
        { term: 'Gyroscope', formula: 'ω = dθ/dt (3-axis)', explain: 'Measures angular rate of rotation. Combined with accelerometer via sensor fusion for complete orientation tracking.' },
        { term: 'Kalman Filter', formula: 'X_k = A·X_{k-1} + Bu_k', explain: 'Optimal state estimator that fuses noisy sensor data to produce clean velocity, position, and orientation estimates.' },
        { term: 'Data Rate', formula: 'f_s = 1000 Hz', explain: 'Sampling at 1kHz ensures no motion event is missed during a 5-second throw — 5000 data points captured.' },
      ],
      ar: [
        { term: 'مقياس التسارع', formula: 'a = F/m (3 محاور)', explain: 'يقيس التسارع الخطي في محاور X وY وZ بمعدل يصل إلى 1 كيلو هرتز. يكتشف إطلاق الكرة وبداية الدوران.' },
        { term: 'الجيروسكوب', formula: 'ω = dθ/dt (3 محاور)', explain: 'يقيس معدل الدوران الزاوي. يُدمج مع مقياس التسارع لتتبع الاتجاه الكامل.' },
        { term: 'مرشح كالمان', formula: 'X_k = A·X_{k-1} + Bu_k', explain: 'مُقدِّر الحالة الأمثل الذي يدمج بيانات المستشعرات الضوضائية لإنتاج تقديرات دقيقة للسرعة والموضع.' },
        { term: 'معدل البيانات', formula: 'f_s = 1000 Hz', explain: 'أخذ العينات بمعدل 1000 هرتز يضمن عدم فوات أي حدث حركي — يتم التقاط 5000 نقطة بيانات في كل رمية.' },
      ],
    },
  },
];

function DiagramCard({ topic, isRTL }: { topic: typeof TOPICS[0]; isRTL: boolean }) {
  const content = isRTL ? topic.content.ar : topic.content.en;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {content.map(({ term, formula, explain }, i) => (
        <div
          key={i}
          className="relative rounded-xl p-4 border border-white/8 bg-white/2 hover:border-white/15 hover:bg-white/4 transition-all duration-300 group"
        >
          <div className="flex items-start gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0 mt-0.5"
              style={{ background: `${topic.color}18`, color: topic.color, border: `1px solid ${topic.color}30` }}
            >
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white mb-1">{term}</div>
              <div
                className="text-sm font-mono font-black mb-2 px-2 py-1 rounded-lg inline-block"
                style={{ color: topic.color, background: `${topic.color}12`, border: `1px solid ${topic.color}25` }}
              >
                {formula}
              </div>
              <p className="text-[11px] text-white/45 leading-relaxed">{explain}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* Physics animation SVG */
function PhysicsAnimation({ topicId, color }: { topicId: string; color: string }) {
  return (
    <div
      className="rounded-2xl overflow-hidden border"
      style={{ borderColor: `${color}25`, background: 'rgba(5,5,15,0.95)', height: '200px' }}
    >
      <svg viewBox="0 0 400 160" className="w-full h-full">
        {/* Grid */}
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="160"
            stroke={`${color}08`} strokeWidth="1" />
        ))}
        {Array.from({ length: 4 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 40} x2="400" y2={i * 40}
            stroke={`${color}08`} strokeWidth="1" />
        ))}

        {topicId === 'physics' && (
          <>
            {/* Ball trajectory parabola */}
            <path d="M 30 130 Q 200 20 370 130" fill="none" stroke={color} strokeWidth="2.5" opacity="0.8" />
            <path d="M 30 130 Q 200 20 370 130" fill="none" stroke={color} strokeWidth="15" opacity="0.04" />
            {/* Ball positions */}
            {[30, 100, 200, 300, 370].map((x, i) => {
              const y = 130 - 110 * 4 * (x / 400) * (1 - x / 400);
              return <circle key={i} cx={x} cy={y} r={i === 2 ? 10 : 6}
                fill="#0A0A14" stroke={color} strokeWidth="2" opacity={0.9 - i * 0.1} />;
            })}
            {/* Force vectors */}
            <line x1="200" y1="60" x2="200" y2="90" stroke="#FF3366" strokeWidth="2" markerEnd="url(#arrow)" />
            <line x1="200" y1="60" x2="240" y2="60" stroke="#00FF88" strokeWidth="2" />
            <text x="205" y="95" fill="#FF3366" fontSize="10">g</text>
            <text x="245" y="62" fill="#00FF88" fontSize="10">v</text>
          </>
        )}

        {topicId === 'friction' && (
          <>
            {/* Lane surface */}
            <rect x="30" y="110" width="340" height="25" fill="rgba(58,34,17,0.5)" rx="3" />
            {/* Oil coating */}
            <rect x="30" y="110" width="200" height="4" fill={`${color}60`} rx="1" opacity="0.6" />
            <text x="120" y="107" textAnchor="middle" fill={color} fontSize="9">OIL ZONE</text>
            {/* Ball rolling */}
            <circle cx="80" cy="100" r="15" fill="#0A0A14" stroke={color} strokeWidth="2" />
            <line x1="80" y1="95" x2="80" y2="85" stroke={color} strokeWidth="1.5" />
            <line x1="80" y1="100" x2="93" y2="100" stroke={color} strokeWidth="1.5" />
            {/* Friction arrow */}
            <line x1="85" y1="108" x2="60" y2="108" stroke="#FF3366" strokeWidth="2" />
            <text x="45" y="112" fill="#FF3366" fontSize="9">f</text>
            {/* Velocity arrows */}
            {[80, 160, 250, 330].map((x, i) => (
              <g key={i}>
                <line x1={x} y1="75" x2={x + 20 - i * 4} y2="75" stroke="#00D4FF" strokeWidth="1.5" />
                <text x={x + 5} y="70" fill="#00D4FF" fontSize="8">{(22 - i * 3).toFixed(0)}</text>
              </g>
            ))}
          </>
        )}

        {topicId === 'angular' && (
          <>
            {/* Spinning ball with rotation indicators */}
            <circle cx="200" cy="80" r="40" fill="#0A0A14" stroke={color} strokeWidth="2" />
            {/* Equator lines showing spin */}
            <ellipse cx="200" cy="80" rx="40" ry="12" fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
            <ellipse cx="200" cy="80" rx="40" ry="25" fill="none" stroke={color} strokeWidth="0.5" opacity="0.3" />
            {/* Spin arrows */}
            <path d="M 160 60 A 45 45 0 0 1 240 60" fill="none" stroke={color} strokeWidth="2" markerEnd="url(#spinArrow)" />
            <path d="M 240 100 A 45 45 0 0 1 160 100" fill="none" stroke={color} strokeWidth="2" markerEnd="url(#spinArrow2)" />
            {/* Angular velocity label */}
            <text x="200" y="78" textAnchor="middle" fill={color} fontSize="11" fontWeight="bold">ω</text>
            <text x="200" y="92" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8">320 RPM</text>
            {/* Hook trajectory */}
            <path d="M 90 150 Q 150 130 200 120 Q 280 100 350 40"
              fill="none" stroke="#00FF88" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.6" />
            <text x="300" y="55" fill="#00FF88" fontSize="9" transform="rotate(-35,300,55)">hook</text>
          </>
        )}

        {topicId === 'sensors' && (
          <>
            {/* IMU chip */}
            <rect x="165" y="45" width="70" height="60" rx="4" fill="#0D0D1A" stroke={color} strokeWidth="1.5" />
            <rect x="173" y="53" width="54" height="44" rx="2" fill={`${color}15`} />
            <text x="200" y="74" textAnchor="middle" fill={color} fontSize="10" fontWeight="bold">IMU</text>
            <text x="200" y="87" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8">MEMS 6-DOF</text>
            {/* Axes */}
            <line x1="200" y1="45" x2="200" y2="20" stroke="#00FF88" strokeWidth="2" />
            <line x1="165" y1="75" x2="140" y2="75" stroke="#FF3366" strokeWidth="2" />
            <line x1="200" y1="105" x2="220" y2="125" stroke={color} strokeWidth="2" />
            <text x="202" y="18" fill="#00FF88" fontSize="9">Z</text>
            <text x="127" y="78" fill="#FF3366" fontSize="9">Y</text>
            <text x="222" y="130" fill={color} fontSize="9">X</text>
            {/* Data wave */}
            <polyline
              points="30,140 55,128 80,145 105,120 130,140 155,125 180,138 205,122 230,136 255,120 280,135 305,122 330,140 355,125 375,138"
              fill="none" stroke={color} strokeWidth="1.5" opacity="0.8"
            />
            <text x="200" y="158" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="8">1000 Hz Data Stream</text>
          </>
        )}
      </svg>
    </div>
  );
}

export default function EducationSection({ lang }: EducationSectionProps) {
  const isRTL = lang === 'ar';
  const [activeTopic, setActiveTopic] = useState(0);
  const topic = TOPICS[activeTopic];

  return (
    <section id="education" dir={isRTL ? 'rtl' : 'ltr'} className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-bg-secondary" />
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="section-label">
            🎓 {isRTL ? 'وضع التعليم الهندسي' : 'Engineering Education Mode'}
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl font-black text-white">
            {isRTL ? 'فهم' : 'Understand'}{' '}
            <span className="gradient-text">{isRTL ? 'الفيزياء' : 'The Physics'}</span>
          </h2>
          <p className="mt-3 text-white/40 max-w-lg mx-auto text-sm">
            {isRTL
              ? 'استكشف المبادئ الهندسية والفيزيائية الكامنة وراء كل رمية بولينج ناجحة'
              : 'Explore the engineering and physics principles behind every successful bowling throw'
            }
          </p>
        </div>

        {/* Topic Selector */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {TOPICS.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setActiveTopic(i)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border ${
                activeTopic === i
                  ? 'text-white border-transparent shadow-neon'
                  : 'text-white/50 border-white/10 hover:border-white/20 hover:text-white/80 glass-hover'
              }`}
              style={activeTopic === i ? {
                background: `linear-gradient(135deg, ${t.color}25, ${t.color}10)`,
                borderColor: `${t.color}50`,
                boxShadow: `0 0 20px ${t.color}20`,
              } : {}}
            >
              <span>{t.icon}</span>
              <span>{isRTL ? t.titleAr : t.title}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Explanation Cards */}
          <div className="flex flex-col gap-4">
            <div className="hud-panel p-5">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ background: `${topic.color}18`, border: `1px solid ${topic.color}30` }}
                >
                  {topic.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{isRTL ? topic.titleAr : topic.title}</h3>
                  <p className="text-xs text-white/40 mt-0.5">{isRTL ? topic.descriptionAr : topic.description}</p>
                </div>
              </div>
              <div
                className="h-px w-full mb-4"
                style={{ background: `linear-gradient(90deg, transparent, ${topic.color}40, transparent)` }}
              />
              <DiagramCard topic={topic} isRTL={isRTL} />
            </div>
          </div>

          {/* Right: Visualization + Did You Know */}
          <div className="flex flex-col gap-4">
            <PhysicsAnimation topicId={topic.id} color={topic.color} />

            {/* Key Facts */}
            <div className="hud-panel p-5">
              <div className="text-[11px] text-white/40 uppercase tracking-wider mb-4">
                {isRTL ? 'حقائق مثيرة للاهتمام' : 'Did You Know?'}
              </div>
              <div className="space-y-3">
                {(isRTL ? [
                  'الكرة تتباطأ بنسبة 5-15% بسبب الاحتكاك على طول المسار البالغ 18.29 م',
                  'الضربة المثالية تصطدم بالقمع رقم 1 عند زاوية 5-6 درجات',
                  'أسرع رمية مسجلة في البولينج الاحترافي بلغت 42 كم/ساعة',
                  'الكرة تدور أكثر من 15 مرة كاملة في رمية نموذجية',
                ] : [
                  'A bowling ball decelerates 5–15% due to friction over the 18.29m lane.',
                  'The perfect strike hits pin #1 at precisely a 5–6° angle of entry.',
                  'The fastest recorded professional bowling delivery reached 42 km/h.',
                  'A typical ball completes over 15 full rotations in a single throw.',
                ]).map((fact, i) => (
                  <div key={i} className="flex gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0 mt-0.5"
                      style={{ background: `${topic.color}20`, color: topic.color, border: `1px solid ${topic.color}30` }}
                    >
                      {i + 1}
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed">{fact}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Formula Reference */}
            <div className="stat-card">
              <div className="text-[11px] text-white/40 uppercase tracking-wider mb-3">
                {isRTL ? 'مرجع المعادلات السريع' : 'Quick Formula Reference'}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(isRTL ? topic.content.ar : topic.content.en).map(({ term, formula }) => (
                  <div key={term} className="rounded-lg p-2 border border-white/5 bg-white/2">
                    <div className="text-[9px] text-white/30 mb-1">{term}</div>
                    <div
                      className="text-xs font-mono font-bold"
                      style={{ color: topic.color }}
                    >
                      {formula}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
