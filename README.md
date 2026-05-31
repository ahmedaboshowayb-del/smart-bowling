<div align="center">

# 🎳 Smart Bowling Simulator
## محاكي البولينج الذكي

![banner](https://img.shields.io/badge/Smart%20Bowling%20Simulator-University%20Engineering%20Project-00D4FF?style=for-the-badge&logo=three.js&logoColor=white)

**An interactive 3D engineering simulation platform that visualizes the physics, sensor technology, and AI intelligence behind modern professional bowling.**

> Built as a university engineering project — 2026

</div>

---

## 📌 Project Overview

**Smart Bowling Simulator** is a web-based platform that transforms bowling into an interactive engineering experience. It combines real-time 3D simulation, physics calculations, and smart technology visualization into a single professional dashboard.

The goal is to demonstrate — in a visual and interactive way — the engineering principles that power modern professional bowling systems: from ball dynamics and lane mechanics to AI performance analysis and sensor fusion.

The platform is fully bilingual, supporting both **English** and **Arabic (RTL)**.

---

## 🎯 Project Goals

- Visualize bowling physics in real time using a 3D interactive simulation
- Allow users to experiment with physical parameters and immediately see their effect
- Explain the engineering and scientific principles behind each throw
- Showcase the smart sensor systems used in professional bowling centers
- Present live analytics and engineering metrics in a professional dashboard format

---

## 🧠 What Makes It Smart?

The simulator is built around the same engineering concepts used in real professional bowling technology:

| System | What It Does |
|--------|-------------|
| **Physics Engine** | Calculates ball trajectory, hook curve, friction, and angular momentum in real time |
| **IMU Sensors** | 6-axis inertial measurement at 1000 Hz — captures spin, acceleration, and orientation |
| **Computer Vision** | YOLOv8 object detection for pin tracking and bowler form analysis |
| **Motion Tracking** | Multi-camera 3D path reconstruction with sub-millimeter precision |
| **Laser Foul Detection** | Precision grid at the foul line with microsecond response time |
| **AI Performance Analysis** | LSTM neural network trained on 10M+ throws for coaching predictions |

---

## 🎳 The 3D Simulation

The core of the platform is a fully interactive 3D bowling lane where users can:

- **Launch the ball** with full control over every physical parameter
- **Watch real physics** — the ball travels down an 18.29 m lane, decelerates from friction, curves from spin, and collides with the 10 pins using accurate collision detection
- **See chain reactions** — knocked pins trigger neighbouring pins with realistic 40–100 ms delays
- **Switch between 6 camera angles** — front, side, top, follow-ball, slow motion, and free orbit
- **View the trajectory preview** before each throw

### Physics Parameters Users Can Control

| Parameter | Range | Engineering Effect |
|-----------|-------|-------------------|
| Ball Speed | 6 – 38 km/h | Determines travel time and impact force `F = mv/t` |
| Release Angle | −12° to +12° | Controls initial lateral direction |
| Ball Weight | 2.7 – 7.3 kg | Affects momentum `p = mv` and pin scatter |
| Spin Rate | 0 – 600 RPM | Drives hook curve via angular momentum `L = Iω` |
| Friction Coefficient | 0.05 – 1.0 | Controls lane deceleration `a = μg` |
| Hook Strength | 0 – 1 | Lateral force multiplier from spin-lane interaction |
| Launch Position | Left / Center / Right | Starting board (1 of 39 boards) |
| Oil Pattern | House / Sport / Challenge / Flooded / Dry | Changes effective friction along the lane |

---

## 📊 Engineering Analysis Dashboard

Every throw generates a full engineering report:

- **Ball Velocity** — live speed in km/h, decelerating from friction
- **Angular Velocity** — `ω = 2π × RPM / 60` in rad/s
- **Kinetic Energy** — `KE = ½mv²` in Joules
- **Linear Momentum** — `p = mv` in kg·m/s
- **Angular Momentum** — `L = I × ω` in kg·m²/s
- **Impact Force** — estimated force at pin collision in Newtons
- **Energy Transfer** — percentage transferred to pins
- **Strike Probability** — calculated from speed, angle, spin, and oil pattern

Live charts (Area Chart, Radar Chart) update in real time as the ball rolls — showing speed decay, spin reduction, and energy profile frame by frame.

---

## 📡 Smart Technology Section

Five interactive cards explain the sensor ecosystem of a modern smart bowling center:

### 1. IMU Sensors (Inertial Measurement Unit)
- 6 degrees of freedom: 3-axis accelerometer + 3-axis gyroscope
- 1000 Hz sampling rate — 5,000 data points per throw
- Measures spin onset, release event, and flight dynamics

### 2. Motion Tracking System
- Multi-camera optical tracking with 0.1 mm precision
- Full 3D path reconstruction of the ball trajectory
- 120 fps cameras positioned at lane edges

### 3. Computer Vision
- YOLOv8 object detection at 60 fps
- Real-time pin tracking and bowler pose estimation
- Automatic form scoring and technique analysis

### 4. Laser Foul Detection
- Infrared laser grid at the foul line (USBC standard)
- Response time under 1 microsecond — zero false positives
- Class 1 IR safe (eye-safe wavelength)

### 5. AI Performance Analysis
- Deep LSTM neural network architecture
- Trained on 10+ million professional throws
- Provides personalized coaching recommendations and strike predictions

---

## 📈 Real-Time Analytics

The analytics dashboard provides live monitoring during every throw:

- **Speed Meter** — analog-style gauge updating frame by frame
- **RPM Gauge** — spin rate with optimal zone indicators
- **Release Accuracy** — frame vs. session vs. average comparison
- **Hit Distribution** — pie chart of strike / 9-pin / 8-pin / spare / gutter ratios
- **Session History** — bar chart of all throws in the current session
- **Performance Score** — running total out of 300

---

## 🎓 Educational Engineering Mode

Four interactive lessons explain the science behind bowling:

| Topic | Key Formulas |
|-------|-------------|
| **Bowling Physics** | `F = ma`, `x(t) = v₀t + ½at²`, `p₁ + p₂ = p₁' + p₂'` |
| **Friction Mechanics** | `f = μN`, `v = ωr` (rolling without slipping), `a = −μg` |
| **Angular Momentum** | `L = Iω`, `I = 2/5 mr²`, `τ = dL/dt` |
| **Sensor Technology** | Kalman filter `X_k = A·X_{k-1} + Bu_k`, `f_s = 1000 Hz` |

Each topic has animated SVG diagrams that visually demonstrate the physics in action.

---

## 🖥️ Platform Design

The visual design is inspired by professional engineering dashboards used in F1 analytics, NASA mission control, and Tesla's vehicle UI:

- **Dark luxury theme** — deep navy `#050508` background
- **Neon blue accents** — `#00D4FF` for all interactive and highlight elements
- **Glassmorphism cards** — frosted glass panels with backdrop blur
- **Monospace data displays** — JetBrains Mono for all numeric readouts
- **Smooth animations** — all transitions use physics-based easing

---

## 🛠️ Technology Used

| Category | Technology |
|----------|-----------|
| Web Framework | Next.js 16 (React, App Router) |
| 3D Graphics | Three.js, React Three Fiber, @react-three/drei |
| Programming Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Charts & Data Visualization | Recharts |
| Typography | Inter (English), Cairo (Arabic), JetBrains Mono (data) |
| Hosting | Vercel (free tier, global CDN) |

---

## 🌍 Accessibility & Language

- Full **Arabic (RTL)** support — all text, layouts, and UI elements adapt
- Language toggle in the navigation bar — switches instantly between EN and AR
- Responsive design — works on desktop, tablet, and mobile
- WCAG-compliant contrast ratios for all text elements

---

## 👨‍💻 Author

<div align="center">

### Ahmed Abo Shoaib | أحمد أبو شعيب

[![Email](https://img.shields.io/badge/ahmed.abo.showayb%40gmail.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:ahmed.abo.showayb@gmail.com)

*University Engineering Project — 2026*

---

*Built with Three.js · Next.js · TypeScript*

</div>

