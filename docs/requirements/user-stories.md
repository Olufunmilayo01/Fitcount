# User Stories — Fitcount

**Version:** 0.1.0

---

## Personas

**Alex** — A 42-year-old office worker, sedentary lifestyle, wants to lose 15 kg. Has never followed a structured fitness programme. Uses a smartphone for everything.

**Jordan** — A 35-year-old teacher, lightly active, wants to lose 5 kg and maintain energy levels. Comfortable with technology. Uses both phone and laptop.

**Sam** — A 58-year-old retiree, looking for gentle, safe exercises (Tai Chi, relaxation). Has mild knee issues. Prefers desktop.

---

## Registration & Auth

### US-001 — Register
**As a new user**, I want to create an account with my email and password  
**so that** my data is saved and private.

**Acceptance criteria:**
- [ ] Registration form requires email (valid format) and password (minimum 8 characters)
- [ ] Duplicate email shows a clear error message: "An account with this email already exists"
- [ ] On success, I am automatically logged in and redirected to onboarding
- [ ] Password is never stored in plain text

### US-002 — Log In
**As a returning user**, I want to log in with my email and password  
**so that** I can access my personal data and continue my programme.

**Acceptance criteria:**
- [ ] Incorrect credentials show: "Email or password is incorrect"
- [ ] After login, I am redirected to the dashboard (or onboarding if not complete)
- [ ] My session persists for 7 days without re-login

### US-003 — Log Out
**As a logged-in user**, I want to log out  
**so that** others cannot access my account on a shared device.

**Acceptance criteria:**
- [ ] Logout button is accessible from any page (top bar avatar menu)
- [ ] After logout, I am redirected to /login
- [ ] The auth cookie is cleared; visiting /dashboard redirects to /login

---

## Onboarding

### US-004 — Complete Onboarding Wizard
**As a new user**, I want to provide my personal details (age, height, weight, goals, fitness level) through a guided wizard  
**so that** the app can recommend an appropriate workout plan.

**Acceptance criteria:**
- [ ] Each step has clear labels and appropriate input controls
- [ ] I can go back to a previous step and change my answer
- [ ] If I close the browser mid-wizard, my progress is restored when I return
- [ ] I cannot skip mandatory fields (display name, DOB, gender, height, weights, fitness level, activity level)
- [ ] Health notes field is optional
- [ ] On completion, a personalised plan is generated and I see the dashboard

### US-005 — See Onboarding Progress
**As a user mid-onboarding**, I want to see how many steps remain  
**so that** I know how long it will take to finish.

**Acceptance criteria:**
- [ ] A progress bar or step indicator (e.g. "Step 3 of 9") is visible on every step
- [ ] Completed steps are visually distinct from upcoming steps

---

## Workout Plans

### US-006 — View My Workout Plan
**As a logged-in user**, I want to view my personalised weekly workout plan  
**so that** I know what to do each day.

**Acceptance criteria:**
- [ ] Plan shows all 7 days with exercises listed per workout day
- [ ] Rest days are clearly marked
- [ ] Each exercise shows name, duration, and category

### US-007 — Regenerate My Plan
**As a user who has updated their fitness level**, I want to regenerate my plan  
**so that** the difficulty matches my current ability.

**Acceptance criteria:**
- [ ] A "Regenerate Plan" button is visible on the Workouts page
- [ ] Clicking it generates a new plan based on the current profile
- [ ] The old plan is archived (not deleted)

### US-008 — Browse Exercises by Category
**As a user**, I want to filter exercises by category (walking, hip, core, relaxation)  
**so that** I can find exercises that suit my current needs.

**Acceptance criteria:**
- [ ] Category filter tabs are visible on the Workouts page
- [ ] Selecting a category shows only matching exercises
- [ ] "All" tab shows everything

---

## Exercise Player

### US-009 — Watch Animated Exercise Guide
**As a user starting an exercise**, I want to see an animated step-by-step guide  
**so that** I perform the movement correctly without a trainer.

**Acceptance criteria:**
- [ ] Opening an exercise shows a stick figure animation
- [ ] The figure transitions smoothly between steps
- [ ] Each step shows instruction text and a breathing cue
- [ ] I can play/pause the animation
- [ ] I can go to the previous or next step manually

### US-010 — Auto-Advance Through Steps
**As a user doing an exercise**, I want steps to advance automatically when I press Play  
**so that** I can follow along without touching the screen.

**Acceptance criteria:**
- [ ] Pressing Play starts a timer based on each step's duration
- [ ] Steps advance automatically without user input
- [ ] The last step completion shows a "Well done!" message and prompts session logging
- [ ] I can pause at any time without losing my place

### US-011 — Mark Session as Complete
**As a user who finished an exercise**, I want to log the completed session  
**so that** my progress is tracked and badges can be awarded.

**Acceptance criteria:**
- [ ] After all steps complete, a prompt asks if I want to log the session
- [ ] Confirming logs the session and shows any newly earned badges
- [ ] Cancelling does not log the session

---

## Daily Tracking

### US-012 — Log Daily Water Intake
**As a user**, I want to tap cup icons to log how much water I have drunk today  
**so that** I stay on track with my hydration goal.

**Acceptance criteria:**
- [ ] Water tracker shows 8 cups; filled cups are visually distinct
- [ ] Tapping a cup immediately fills it (optimistic update)
- [ ] The count syncs to the server within 2 seconds of the last tap
- [ ] Progress label shows "N / 8 cups" and a percentage bar
- [ ] I can undo the last tap if I made a mistake

### US-013 — Log Sleep Hours
**As a user**, I want to log how many hours I slept last night  
**so that** I can understand how sleep affects my weight loss.

**Acceptance criteria:**
- [ ] A slider or number input accepts values from 0 to 12 hours in 0.5 h increments
- [ ] After logging, I see an adequacy rating (adequate / below / above)
- [ ] A recommendation text explains how to improve (if not adequate)
- [ ] The analysis persists to the progress page

### US-014 — Log Daily Weight
**As a user**, I want to log my weight each morning  
**so that** I can see my progress toward my goal.

**Acceptance criteria:**
- [ ] A number input accepts weight in kg
- [ ] After saving, I see the change vs yesterday (e.g. "−0.3 kg")
- [ ] Weight appears on the progress chart

---

## Progress & Goal Timeline

### US-015 — View Weight Progress Chart
**As a user**, I want to see a chart of my weight over time  
**so that** I can visualise my progress.

**Acceptance criteria:**
- [ ] Chart shows weight entries on a line graph
- [ ] I can toggle between 7-day, 30-day, and 90-day views
- [ ] Chart renders correctly on mobile (touch-friendly tooltips)

### US-016 — See Goal Timeline Estimate
**As a user**, I want to see how long it will take to reach my goal weight  
**so that** I stay motivated and can plan realistically.

**Acceptance criteria:**
- [ ] A card shows estimated completion date and weeks remaining
- [ ] Estimate updates within a minute of logging a new weight
- [ ] If I am moving away from my goal, the card shows a warning message
- [ ] If I have reached my goal, the card congratulates me

---

## Milestones

### US-017 — View All Badges
**As a user**, I want to see all available badges and which I have earned  
**so that** I know what I am working toward.

**Acceptance criteria:**
- [ ] All 16 badges are visible on the Milestones page
- [ ] Earned badges are shown in full colour with the earned date
- [ ] Locked badges are greyscale and show my progress (e.g. "4 / 7 days")
- [ ] Clicking a badge opens a modal with its full description and criteria

### US-018 — Receive Badge Notification
**As a user who just earned a badge**, I want to be notified immediately  
**so that** I feel rewarded for my effort.

**Acceptance criteria:**
- [ ] A toast or modal appears when a badge is awarded
- [ ] The notification shows the badge name and icon
- [ ] The Milestones page updates to show the new badge as earned

---

## Profile

### US-019 — Update Profile
**As a user**, I want to update my current weight, fitness level, or activity level  
**so that** my plan and goal estimates stay accurate.

**Acceptance criteria:**
- [ ] Profile page shows all editable fields
- [ ] Changes are saved with a visible success confirmation
- [ ] Changing fitness level or activity level prompts: "Would you like to regenerate your plan?"
- [ ] Goal timeline recalculates after weight or goal weight change
