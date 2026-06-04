# Product Requirements — Fitcount

**Version:** 0.1.0  
**Date:** 2026-06-02  
**Status:** Approved

---

## Product Vision

Fitcount is a personalised weight loss and wellness web application that recommends tailored workout plans based on the user's body metrics, gender, and fitness level. It guides users through animated exercise routines, tracks daily habits (water, sleep, weight), and motivates consistent progress through milestone badges and data-driven goal estimates. The app is accessible to anyone with a modern browser and works on any screen size.

---

## Target Users

- Adults who want structured, safe guidance for weight loss
- Beginners who have never followed a fitness programme
- People who prefer low-impact or gentle movement (Tai Chi, walking, stretching)
- Anyone who wants a single place to log water, sleep, and weight daily

---

## Core Features

### 1. User Registration and Multi-Step Onboarding

**Description:** New users create an account with email + password, then complete a 9-step wizard that collects detailed personal information to power plan personalisation.

**Onboarding steps:**
1. Display name
2. Date of birth
3. Gender (male / female / other / prefer not to say)
4. Height (cm)
5. Current weight (kg)
6. Goal weight (kg)
7. Fitness level (beginner / intermediate / advanced)
8. Activity level (sedentary / lightly active / moderately active / very active)
9. Health notes (free text — injuries, conditions, preferences)

**Acceptance criteria:**
- [ ] User can register with email + password
- [ ] Wizard saves progress to localStorage; back-navigation restores previous answers
- [ ] All steps must be complete before the user can proceed to the dashboard
- [ ] Profile is stored server-side; wizard re-displays correctly if page is refreshed mid-flow
- [ ] A personalised workout plan is auto-generated immediately after onboarding completes
- [ ] "Dawn of Wellness" badge is awarded upon onboarding completion

---

### 2. Personalised Workout Plan Generation

**Description:** The system generates a weekly workout schedule based on the user's fitness level, activity level, and weight-loss goal. No external AI — fully rule-based algorithm.

**Rules:**
- Workout frequency: sedentary=3 days, lightly active=4, moderately active=5, very active=6
- Session duration: beginner=20–30 min, intermediate=30–45 min, advanced=45–60 min
- Only exercises matching the user's fitness level are included
- Category rotation is deterministic by fitness level (see architecture docs)
- Users more than 20 kg from goal get extra relaxation on rest days
- Users within 2 kg of goal get reduced frequency and longer sessions

**Acceptance criteria:**
- [ ] Plan is generated automatically after onboarding
- [ ] User can view their active plan on the Workouts page
- [ ] User can regenerate their plan after updating their profile
- [ ] Plan shows day-by-day schedule for a full week
- [ ] Rest days are clearly indicated
- [ ] Plan reflects any fitness level or activity level changes within 24 hours

---

### 3. Exercise Library with Animated Guides

**Description:** A curated library of exercises across five categories, each with a step-by-step animated SVG guide.

**Categories:**
- **Tai Chi Walking** — slow, meditative walking forms
- **Japanese Interval Walking** — alternating normal and brisk 3-minute segments
- **Hip Exercises** — circles, hinges, flexor stretches
- **Core Workouts** — planks, crunches, bird-dog
- **Relaxation Routines** — breathing, body scan, progressive muscle relaxation

**Animation system:**
- SVG stick figure with Framer Motion spring animations
- 6–8 steps per exercise
- Auto-advance with configurable step duration
- Breathing cue (Inhale / Exhale / Hold) per step
- Accessible: ARIA live region announces step instruction changes

**Acceptance criteria:**
- [ ] All seeded exercises are visible and filterable by category and fitness level
- [ ] Exercise player shows animated stick figure progressing through each step
- [ ] Play / pause / previous step / next step controls work correctly
- [ ] Auto-advance timer progresses through steps automatically when playing
- [ ] Instruction text updates with each step change
- [ ] Breathing cue badge updates with each step
- [ ] Completion of all steps marks the session and prompts log confirmation

---

### 4. Daily Water Intake Tracking

**Description:** Users log water intake by tapping cup icons. Target is 8 cups (approximately 2 litres) per day.

**Acceptance criteria:**
- [ ] Dashboard shows a water widget with 8 tappable cups
- [ ] Tapping a cup fills it and increments the count (optimistic update)
- [ ] Count is debounced and persisted to the API after 1.5 s of inactivity
- [ ] Progress label shows "N / 8 cups" and a percentage progress bar
- [ ] Log persists across page refreshes for the current day
- [ ] Hydration streak badges are awarded at 3 consecutive 2L days and 50 total litres

---

### 5. Sleep Tracking and Adequacy Feedback

**Description:** Users log how many hours they slept. The app evaluates whether sleep supports their weight-loss goals using WHO guidelines (7–9 hours per night).

**Scoring:**
- `< 6 h`: score 0–50 — severely inadequate
- `6–7 h`: score 51–74 — below adequate
- `7–9 h`: score 75–100 — adequate
- `> 9 h`: score 60–74 — above recommended (slight penalty)

**Acceptance criteria:**
- [ ] User can log sleep hours via a slider or number input
- [ ] Adequacy badge (green / amber / red) appears immediately after logging
- [ ] Recommendation text explains how to improve sleep for weight loss
- [ ] Historical sleep data is visible on the progress page
- [ ] "Sleep Champion" badge is awarded for 5 consecutive nights of adequate sleep

---

### 6. Weight Logging and Goal Timeline Estimation

**Description:** Users log their weight daily. The app uses TDEE (Total Daily Energy Expenditure) and a caloric deficit model to estimate when they will reach their goal weight.

**Formula:**
```
TDEE = BMR × activity_multiplier
BMR (Mifflin-St Jeor):
  Male:   10 × weight_kg + 6.25 × height_cm − 5 × age_years + 5
  Female: 10 × weight_kg + 6.25 × height_cm − 5 × age_years − 161

Weekly caloric deficit = 7 × 500 kcal (fixed moderate deficit)
Weeks to goal = (current_weight_kg − goal_weight_kg) × 7700 kcal/kg ÷ weekly_deficit
```

**Acceptance criteria:**
- [ ] User can log weight from the dashboard or Track page
- [ ] Delta chip shows change vs previous entry (e.g. "−0.3 kg")
- [ ] Goal timeline card shows estimated completion date and weeks remaining
- [ ] Timeline updates within 1 minute of a new weight entry
- [ ] Progress chart shows weight over the past 7 / 30 / 90 days
- [ ] "First Kilo Gone" and "5 kg Down" badges are awarded at the appropriate milestones

---

### 7. Milestone Badges and Streak Tracking

**Description:** Sixteen badges motivate users across five areas: workouts, weight loss, hydration, sleep, and consistency.

**Badge catalogue:**

| Badge | Criteria |
|---|---|
| Dawn of Wellness | Complete onboarding |
| Plan Getter | Generate first workout plan |
| First Step | Complete first workout session |
| Week Warrior | 7-day workout streak |
| Two-Week Champion | 14-day workout streak |
| Month Master | 30-day workout streak |
| Ten Sessions | 10 total sessions logged |
| Fifty Sessions | 50 total sessions logged |
| First Kilo Gone | Lose 1 kg |
| Five KG Down | Lose 5 kg |
| Halfway There | 50% of the way to goal weight |
| Goal Reached | Current weight ≤ goal weight |
| Hydration Hero | 3 consecutive days ≥ 2 L water |
| Water Master | 50 total litres consumed |
| Sleep Champion | 5 consecutive nights of adequate sleep |
| Consistency King | 7-day daily logging streak (any field) |

**Acceptance criteria:**
- [ ] All 16 badges are visible on the Milestones page (locked badges greyscale)
- [ ] Locked badges show progress toward the criteria (e.g. "4 / 7 days")
- [ ] Newly earned badge triggers an animated unlock notification
- [ ] Badge modal shows full description, criteria, and earned date (if earned)
- [ ] Badges are checked server-side after every session, daily log, and profile update

---

## Non-Functional Requirements

| Requirement | Specification |
|---|---|
| Responsive | Works on mobile (≥ 320 px) and desktop (≥ 1280 px) |
| Browsers | Chrome 120+, Firefox 120+, Safari 17+, Edge 120+ |
| Performance | Dashboard LCP < 2 s on broadband |
| Accessibility | WCAG 2.1 AA target; ARIA labels on all interactive elements |
| Security | Passwords bcrypt-hashed (cost 12); JWT in httpOnly cookie (no XSS exposure) |
| Data | No PII logged to stdout; no third-party analytics in v1 |

---

## Out of Scope — v1

- Social features (sharing, friend challenges)
- AI/LLM-generated content or coaching
- Native mobile app (iOS / Android)
- Payment / subscription tiers
- Nutritional tracking / meal plans
- Integration with fitness hardware (Apple Watch, Fitbit)
- Push notifications
