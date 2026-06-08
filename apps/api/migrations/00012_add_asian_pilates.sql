-- +goose Up

-- 1. Expand the category CHECK to include asian_pilates
ALTER TABLE exercises DROP CONSTRAINT IF EXISTS exercises_category_check;
ALTER TABLE exercises ADD CONSTRAINT exercises_category_check
  CHECK (category IN ('tai_chi_walking','interval_walking','hip','core','relaxation','asian_pilates'));

-- 2. Add optional video URL column
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 3. Insert Asian Pilates exercises (idempotent)
INSERT INTO exercises (slug, name, category, fitness_level, duration_seconds, met_value, video_url, steps) VALUES

('asian-pilates-full-body-beginner', 'Asian Pilates — Full Body', 'asian_pilates', 'beginner', 600, 3.2,
 'https://www.youtube.com/embed/EVzK30dOZ1I',
'[
  {"order":1,"title":"Centering Breath","description":"Lie on your back, knees bent, feet flat. Place both hands on your lower belly. Inhale through the nose for 4 counts, exhale through the mouth for 6 counts. Let your spine soften into the mat.","duration_seconds":30,"animation_key":"lie_breathe"},
  {"order":2,"title":"Pelvic Curl","description":"On an exhale, gently tilt your pelvis upward, pressing your lower back into the mat. Hold for 3 seconds, then release. Repeat 8 times — slow and controlled.","duration_seconds":60,"animation_key":"pelvic_tilt"},
  {"order":3,"title":"Knee Folds (Alternating)","description":"Float one knee up toward your chest while keeping the other foot grounded. Lower slowly and alternate. Keep your core gently engaged throughout — do not hold your breath.","duration_seconds":60,"animation_key":"knee_fold"},
  {"order":4,"title":"Single Leg Stretch","description":"Bring both knees to your chest. Extend one leg at 45 degrees while drawing the other knee in. Switch legs smoothly in a flowing rhythm. This is the heart of Pilates core work.","duration_seconds":60,"animation_key":"leg_stretch"},
  {"order":5,"title":"Spine Twist (Seated)","description":"Sit tall with legs extended or crossed. Inhale to lengthen your spine, exhale and rotate to the right, reaching your opposite arm forward. Inhale back to centre, exhale left. 5 each side.","duration_seconds":60,"animation_key":"spine_twist"},
  {"order":6,"title":"Child Pose Rest","description":"From hands and knees, sink your hips back toward your heels, arms stretched forward or resting by your sides. Breathe naturally. Allow your back to open and decompress.","duration_seconds":30,"animation_key":"child_pose"},
  {"order":7,"title":"Roll Down","description":"Sit with knees bent, feet flat. Slowly roll one vertebra at a time down to the mat, starting from your tailbone. Pause at the bottom, then roll back up. Repeat 4 times.","duration_seconds":60,"animation_key":"roll_down"},
  {"order":8,"title":"Final Relaxation","description":"Lie flat on your back, legs long, arms at your sides. Close your eyes. Breathe naturally. Let your body absorb the work you have done.","duration_seconds":30,"animation_key":"lie_neutral"}
]'::jsonb),

('asian-pilates-fat-burn-beginner', 'Asian Pilates Fat Burn', 'asian_pilates', 'beginner', 540, 3.8,
 'https://www.youtube.com/embed/Bwb0hMNf9Hg',
'[
  {"order":1,"title":"Standing Warm-Up","description":"Stand with feet hip-width apart. Roll your shoulders back and down. Take 3 deep breaths, letting each exhale release any tension in your jaw and neck.","duration_seconds":20,"animation_key":"stand_neutral"},
  {"order":2,"title":"Standing Side Bend","description":"Reach your right arm overhead and lean to the left, drawing a long arc. Hold 3 seconds, return to centre. Repeat to the right. 6 reps each side — feel the side of your torso lengthen.","duration_seconds":60,"animation_key":"side_bend"},
  {"order":3,"title":"Pilates Stance Squats","description":"Turn your toes out slightly (Pilates V). Lower into a shallow squat, squeezing your inner thighs on the way up. Keep your spine long. 12 slow reps.","duration_seconds":60,"animation_key":"squat_pilates"},
  {"order":4,"title":"Arm Circles (Standing)","description":"Extend both arms to the sides at shoulder height. Make 10 small forward circles, then 10 backward circles. Keep the movement precise and controlled — do not shrug.","duration_seconds":40,"animation_key":"arm_circles"},
  {"order":5,"title":"Standing Leg Lift (Side)","description":"Balance on one leg, lift the other leg out to the side with a pointed toe. Lower with control. 10 lifts each side. Use a wall for balance if needed.","duration_seconds":60,"animation_key":"leg_lift_side"},
  {"order":6,"title":"Marching in Place","description":"Lift your knees to hip height alternately. Swing your arms gently. Pick up the pace slightly for the last 15 seconds. This elevates your heart rate.","duration_seconds":40,"animation_key":"march_in_place"},
  {"order":7,"title":"Cool-Down Reach","description":"Reach both arms overhead and gently lean back slightly, then fold forward to hang for 10 seconds. Roll up one vertebra at a time.","duration_seconds":30,"animation_key":"stand_reach"}
]'::jsonb),

('asian-pilates-toning-beginner', 'Asian Pilates — Toning & Flexibility', 'asian_pilates', 'beginner', 1800, 3.0,
 'https://www.youtube.com/embed/-0S6qnm2EqU',
'[
  {"order":1,"title":"Mindful Arrival","description":"Lie on your back. Close your eyes. Scan from your feet to your crown, releasing tension in each body part. Take 5 full breaths here before beginning.","duration_seconds":60,"animation_key":"lie_neutral"},
  {"order":2,"title":"Knee-to-Chest Hugs","description":"Draw both knees into your chest and wrap your arms around your shins. Rock gently side to side to massage your lower back. 30 seconds.","duration_seconds":30,"animation_key":"knee_hug"},
  {"order":3,"title":"Bridge (Slow)","description":"Feet hip-width, arms by sides. Exhale and peel your spine off the mat one bone at a time until your hips are high. Inhale at the top, exhale to roll down slowly. 8 repetitions.","duration_seconds":120,"animation_key":"bridge"},
  {"order":4,"title":"Hundred Prep","description":"Bring knees to tabletop. Lift your head and shoulders, extending arms long by your sides. Pump your arms up and down 10 times while breathing in for 5 pumps and out for 5.","duration_seconds":60,"animation_key":"hundred_prep"},
  {"order":5,"title":"Rolling Like a Ball","description":"Balance on your tailbone with knees drawn in. Roll back to your shoulder blades, then roll back up to balance. The roll should be smooth — use your breath and abs.","duration_seconds":60,"animation_key":"rolling_ball"},
  {"order":6,"title":"Seated Forward Stretch","description":"Sit tall with legs extended. Inhale to grow tall, exhale to hinge forward from the hips — not the waist. Hold each stretch for 3 breaths. 4 repetitions.","duration_seconds":90,"animation_key":"seated_forward"},
  {"order":7,"title":"Mermaid Stretch","description":"Sit with both legs folded to one side. Reach the top arm overhead and lean to the opposite side. Hold 5 breaths, switch sides. Opens the lateral line of your body.","duration_seconds":90,"animation_key":"mermaid_stretch"},
  {"order":8,"title":"Final Relaxation","description":"Lie in Savasana. Breathe naturally. Let your body absorb the practice. Stay here for as long as you like.","duration_seconds":60,"animation_key":"lie_neutral"}
]'::jsonb),

('asian-pilates-glutes-intermediate', 'Asian Pilates — Glutes & Lower Body', 'asian_pilates', 'intermediate', 900, 3.5,
 'https://www.youtube.com/embed/o06Tcve9M6k',
'[
  {"order":1,"title":"Hip Bridge Pulses","description":"Lie on back, knees bent. Lift into a bridge. Hold at the top and pulse your hips up 1 cm, 20 times. Your glutes should be working hard — squeeze at the top of each pulse.","duration_seconds":60,"animation_key":"bridge_pulse"},
  {"order":2,"title":"Clamshell Series","description":"Lie on your side, knees bent and stacked. Keeping feet together, lift the top knee as high as possible without rolling your pelvis back. Lower with control. 15 reps each side.","duration_seconds":90,"animation_key":"clamshell"},
  {"order":3,"title":"Donkey Kicks","description":"On hands and knees, kick one leg back and up, keeping the knee bent at 90 degrees. Squeeze the glute at the top. Lower with control. 15 reps each side.","duration_seconds":90,"animation_key":"donkey_kick"},
  {"order":4,"title":"Fire Hydrant","description":"From the same tabletop position, lift one knee out to the side (like a dog at a hydrant). Keep your hips square and still. 15 reps each side.","duration_seconds":90,"animation_key":"fire_hydrant"},
  {"order":5,"title":"Single-Leg Bridge","description":"Lie on back, one leg extended to the sky. Press through the heel of the grounded foot and lift your hips. Lower with control. 12 reps each side.","duration_seconds":90,"animation_key":"single_leg_bridge"},
  {"order":6,"title":"Lateral Leg Circles","description":"Lie on your side, lift the top leg. Draw slow circles in the air — 8 forward, 8 backward. Keep your core engaged and your hips stacked.","duration_seconds":60,"animation_key":"leg_circles"},
  {"order":7,"title":"Glute Stretch","description":"In a figure-four position (one ankle over the opposite knee), gently press the top knee away and draw the legs toward your chest. Hold 30 seconds each side.","duration_seconds":60,"animation_key":"figure_four_stretch"}
]'::jsonb),

('k-pilates-full-body-intermediate', 'K-Pilates — Full Body Shred', 'asian_pilates', 'intermediate', 720, 4.0,
 'https://www.youtube.com/embed/E117FImUQ0o',
'[
  {"order":1,"title":"Warm-Up Flow","description":"Stand and roll your shoulders, swing your arms gently, and shift your weight side to side for 30 seconds. Arrive in your body.","duration_seconds":30,"animation_key":"stand_warm"},
  {"order":2,"title":"Pilates Squat Series","description":"Feet wider than hip-width, toes pointed out. Lower slowly for 4 counts, rise for 2 counts. On the way up, lift onto your toes for the last half. 12 reps.","duration_seconds":90,"animation_key":"squat_pilates"},
  {"order":3,"title":"Side Leg Kick Series","description":"Balance on one leg. Kick the other leg forward (hip height), then swing it behind you (hip height). Stay tall. 10 kicks each direction, each side.","duration_seconds":90,"animation_key":"side_kick"},
  {"order":4,"title":"Push-Up (Pilates Style)","description":"From kneeling or full plank, lower with a straight body for 3 counts and press up for 1. Keep your elbows hugging your sides, not flaring wide. 8-10 reps.","duration_seconds":60,"animation_key":"push_up"},
  {"order":5,"title":"Teaser Prep","description":"Lie on your back, legs at tabletop, arms overhead. Exhale and simultaneously bring arms and legs to meet in the middle, lifting your upper body. Hold 3 seconds, lower slowly. 6 reps.","duration_seconds":60,"animation_key":"teaser_prep"},
  {"order":6,"title":"Swan Prep","description":"Lie face down, hands under shoulders. On an inhale, press your forearms down and lift your chest, keeping your lower ribs on the mat. Hold 3 breaths. 5 reps.","duration_seconds":60,"animation_key":"swan_prep"},
  {"order":7,"title":"Standing Cool-Down","description":"Stand and reach both arms overhead, rise on toes, then fold forward to hang. Roll up slowly. Breathe. Repeat 3 times.","duration_seconds":30,"animation_key":"stand_reach"}
]'::jsonb),

('k-pilates-core-intermediate', 'K-Pilates — Core & Flat Stomach', 'asian_pilates', 'intermediate', 600, 3.8,
 'https://www.youtube.com/embed/RzIghbSKnzs',
'[
  {"order":1,"title":"Imprint & Release","description":"Lie on your back. Alternate between gently pressing your lower back into the mat (imprint) and releasing it away (neutral). 10 repetitions. This trains your core before any movement.","duration_seconds":40,"animation_key":"pelvic_tilt"},
  {"order":2,"title":"Dead Bug","description":"Lie on your back with arms pointing to the sky and knees at tabletop. Slowly lower one arm overhead while extending the opposite leg — keep your back flat. Alternate sides. 10 reps.","duration_seconds":90,"animation_key":"dead_bug"},
  {"order":3,"title":"Criss-Cross (Bicycle)","description":"Hands behind head, knees at tabletop. Rotate your right elbow toward your left knee while extending the right leg. Switch smoothly. 20 total reps — go slowly for maximum oblique activation.","duration_seconds":90,"animation_key":"criss_cross"},
  {"order":4,"title":"Plank to Down Dog","description":"From a plank, push your hips up and back into a downward-facing dog. Hold 3 breaths, then return to plank. 8 transitions. This builds both core stability and shoulder strength.","duration_seconds":90,"animation_key":"plank_to_dog"},
  {"order":5,"title":"Side Plank (Modified)","description":"From a side-lying position, prop yourself on your forearm and knee or full foot. Lift your hips into a straight line. Hold 20 seconds each side. 2 sets.","duration_seconds":90,"animation_key":"side_plank"},
  {"order":6,"title":"Spine Stretch Forward","description":"Sit tall, legs extended hip-width apart. Reach forward, scooping your abs inward as you go. This is not a reach — it is a spine articulation. Hold 3 breaths. 5 reps.","duration_seconds":40,"animation_key":"seated_forward"}
]'::jsonb),

('asian-pilates-gentle-beginner', 'Asian Pilates — Gentle & Joint-Friendly', 'asian_pilates', 'beginner', 900, 2.5,
 'https://www.youtube.com/embed/uTvRhZY5bUM',
'[
  {"order":1,"title":"Supine Breath Awareness","description":"Lie on your back. Place one hand on your chest and one on your belly. Breathe so that only your belly hand rises. This activates your diaphragm and calms your nervous system. 8 breaths.","duration_seconds":60,"animation_key":"lie_breathe"},
  {"order":2,"title":"Ankle Circles","description":"Flex and point each foot 10 times, then trace large slow circles with each ankle — 5 clockwise, 5 counter-clockwise. Excellent for joint mobility and circulation.","duration_seconds":60,"animation_key":"ankle_circles"},
  {"order":3,"title":"Gentle Knee Rocks","description":"Both knees bent, feet flat. Let both knees drop slowly to one side, hold 5 breaths, return to centre. Repeat on the other side. Keep your shoulders flat on the mat.","duration_seconds":90,"animation_key":"knee_rocks"},
  {"order":4,"title":"Cat-Cow (Floor)","description":"On hands and knees. Inhale and arch your back (cow — belly drops, gaze rises). Exhale and round your back (cat — belly draws in, chin tucks). Move with your breath. 10 slow cycles.","duration_seconds":90,"animation_key":"cat_cow"},
  {"order":5,"title":"Seated Neck Release","description":"Sit comfortably. Drop your right ear toward your right shoulder. Hold 5 breaths. Repeat left. Then gently nod yes 5 times and shake no 5 times — slowly and mindfully.","duration_seconds":60,"animation_key":"neck_release"},
  {"order":6,"title":"Supine Twist","description":"Lie on your back, bring knees to chest. Let both knees drop to the right while turning your head left. Arms open wide. Hold 5 long breaths each side.","duration_seconds":90,"animation_key":"supine_twist"},
  {"order":7,"title":"Resting Breath","description":"Come to a comfortable seated or lying position. Close your eyes. Take 10 conscious breaths, letting each exhale be longer than the inhale. Simply rest.","duration_seconds":60,"animation_key":"lie_neutral"}
]'::jsonb)

ON CONFLICT (slug) DO NOTHING;

-- +goose Down
-- Remove the inserted exercises
DELETE FROM exercises WHERE category = 'asian_pilates';

-- Remove video_url column
ALTER TABLE exercises DROP COLUMN IF EXISTS video_url;

-- Restore original category CHECK
ALTER TABLE exercises DROP CONSTRAINT IF EXISTS exercises_category_check;
ALTER TABLE exercises ADD CONSTRAINT exercises_category_check
  CHECK (category IN ('tai_chi_walking','interval_walking','hip','core','relaxation'));
