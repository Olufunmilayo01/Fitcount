-- +goose Up
-- Seed exercises (idempotent via ON CONFLICT DO NOTHING)

INSERT INTO exercises (slug, name, category, fitness_level, duration_seconds, met_value, steps) VALUES
('tai-chi-walk-beginner', 'Tai Chi Walking', 'tai_chi_walking', 'beginner', 600, 3.5,
'[
  {"order":1,"title":"Preparation Stance","description":"Stand with feet shoulder-width apart, arms relaxed at your sides. Soften your knees slightly.","duration_seconds":10,"animation_key":"stand_neutral"},
  {"order":2,"title":"Shift Weight Left","description":"Slowly shift your body weight onto your left foot, keeping your right foot lightly touching the ground.","duration_seconds":8,"animation_key":"weight_left"},
  {"order":3,"title":"Step Forward (Right)","description":"Lift your right foot gently and place it forward, heel first, at a comfortable distance. Keep your upper body tall.","duration_seconds":12,"animation_key":"step_forward_right"},
  {"order":4,"title":"Flow Arms Left","description":"As your weight transfers forward, float your arms upward to chest height, elbows relaxed, palms facing down.","duration_seconds":10,"animation_key":"arm_flow_left"},
  {"order":5,"title":"Transfer Weight","description":"Smoothly roll from heel to toe on your right foot, transferring your full weight forward.","duration_seconds":8,"animation_key":"weight_transfer"},
  {"order":6,"title":"Step Forward (Left)","description":"Lift your left foot and step forward past your right foot. Move slowly, as if walking through water.","duration_seconds":12,"animation_key":"step_forward_left"},
  {"order":7,"title":"Flow Arms Right","description":"Float your arms to the right, mirroring the previous movement. Breathe out slowly.","duration_seconds":10,"animation_key":"arm_flow_right"},
  {"order":8,"title":"Return to Centre","description":"Bring your feet together and let your arms settle back to your sides. Breathe naturally.","duration_seconds":10,"animation_key":"stand_neutral"}
]'::jsonb),

('tai-chi-walk-intermediate', 'Tai Chi Walking (Intermediate)', 'tai_chi_walking', 'intermediate', 900, 3.8,
'[
  {"order":1,"title":"Wide Preparation Stance","description":"Stand with feet slightly wider than shoulder-width. Root yourself by pressing gently through your heels.","duration_seconds":10,"animation_key":"stand_wide"},
  {"order":2,"title":"Deep Weight Shift Left","description":"Sink your weight deeply into your left leg, bending the knee more than a beginner would.","duration_seconds":10,"animation_key":"weight_left_deep"},
  {"order":3,"title":"Slow Forward Step (Right)","description":"Extend your right leg forward in an arc, placing it with great control. Spend twice as long as usual.","duration_seconds":15,"animation_key":"step_forward_right"},
  {"order":4,"title":"Wide Arm Arc Left","description":"Sweep both arms in a wide arc to the left, as if embracing a large ball. Keep shoulders relaxed.","duration_seconds":12,"animation_key":"arm_arc_left"},
  {"order":5,"title":"Full Weight Transfer","description":"Roll through your entire right foot from heel to ball to toe. Feel each part of the foot.","duration_seconds":10,"animation_key":"weight_transfer"},
  {"order":6,"title":"Slow Forward Step (Left)","description":"Mirror the right-side step. Extend your left leg in a slow arc, placing it with full control.","duration_seconds":15,"animation_key":"step_forward_left"},
  {"order":7,"title":"Wide Arm Arc Right","description":"Sweep both arms in a wide arc to the right. Coordinate your breathing — exhale through this movement.","duration_seconds":12,"animation_key":"arm_arc_right"},
  {"order":8,"title":"Centre and Breathe","description":"Return to centre, arms floating down. Take three full breaths before the next repetition.","duration_seconds":10,"animation_key":"stand_neutral"}
]'::jsonb),

('tai-chi-walk-advanced', 'Tai Chi Walking (Advanced)', 'tai_chi_walking', 'advanced', 1200, 4.0,
'[
  {"order":1,"title":"Rooting Stance","description":"Stand with feet wide, bend knees to a quarter-squat. Feel your connection to the ground.","duration_seconds":15,"animation_key":"stand_squat_low"},
  {"order":2,"title":"Single-Leg Rooting","description":"Transfer all weight to left leg. Raise right foot slightly — hold for a count of five.","duration_seconds":12,"animation_key":"single_leg_left"},
  {"order":3,"title":"Arc Step Forward","description":"Place the right foot in a wide, sweeping arc forward. Lower your centre of gravity as you step.","duration_seconds":15,"animation_key":"step_arc_right"},
  {"order":4,"title":"Full Arm Flow","description":"Extend both arms forward at shoulder height, then sweep one up and one down simultaneously.","duration_seconds":12,"animation_key":"arm_full_flow"},
  {"order":5,"title":"Deep Weight Transfer","description":"Sink deeply into the front foot, bending the front knee to near 90 degrees. Keep back leg straight.","duration_seconds":12,"animation_key":"lunge_transfer"},
  {"order":6,"title":"Rear Foot Arc Step","description":"Now step the left foot forward past the right in the same wide arc pattern.","duration_seconds":15,"animation_key":"step_arc_left"},
  {"order":7,"title":"Reverse Arm Flow","description":"Reverse the arm pattern — sweep the opposite pair of arms.","duration_seconds":12,"animation_key":"arm_reverse_flow"},
  {"order":8,"title":"Full Return","description":"Return to rooting stance. Three slow, deep breaths.","duration_seconds":15,"animation_key":"stand_squat_low"}
]'::jsonb),

('japanese-interval-walk-beginner', 'Japanese Interval Walking', 'interval_walking', 'beginner', 360, 4.5,
'[
  {"order":1,"title":"Warm-Up Stance","description":"Stand tall. Relax your shoulders. You will alternate 3 minutes of normal pace and 3 minutes of brisk pace.","duration_seconds":10,"animation_key":"stand_neutral"},
  {"order":2,"title":"Normal Pace Walk (3 min)","description":"Walk at your comfortable natural pace. Swing your arms gently. Breathe normally through your nose.","duration_seconds":180,"animation_key":"walk_normal"},
  {"order":3,"title":"Transition to Brisk","description":"Prepare to increase your speed. Take a deep breath in — you are about to pick up the pace.","duration_seconds":5,"animation_key":"walk_brace"},
  {"order":4,"title":"Brisk Pace Walk (3 min)","description":"Walk as fast as you can while still maintaining good form. Pump your arms actively. Breathe out through your mouth.","duration_seconds":180,"animation_key":"walk_brisk"},
  {"order":5,"title":"Decelerate","description":"Gradually slow your pace over 10 seconds back to normal. Let your breathing settle.","duration_seconds":10,"animation_key":"walk_decel"},
  {"order":6,"title":"Recovery","description":"Stand and breathe. Notice your heart rate. Well done on completing one cycle!","duration_seconds":10,"animation_key":"stand_neutral"}
]'::jsonb),

('japanese-interval-walk-intermediate', 'Japanese Interval Walking (Intermediate)', 'interval_walking', 'intermediate', 600, 5.0,
'[
  {"order":1,"title":"Active Warm-Up","description":"Begin with light marching in place for 15 seconds. Raise your knees to hip height.","duration_seconds":15,"animation_key":"march_in_place"},
  {"order":2,"title":"Normal Pace (3 min)","description":"Walk at a moderate conversational pace. Maintain upright posture and full arm swing.","duration_seconds":180,"animation_key":"walk_normal"},
  {"order":3,"title":"Speed Transition","description":"Shift gears — engage your core, drive your elbows back, and lengthen your stride.","duration_seconds":5,"animation_key":"walk_brace"},
  {"order":4,"title":"Brisk Pace (3 min)","description":"Power walk at near-maximum speed. Heels strike first, then roll to ball. Your breathing should be audible.","duration_seconds":180,"animation_key":"walk_brisk"},
  {"order":5,"title":"Slow Down","description":"Reduce speed gradually over 15 seconds. Let your arms slow and your breathing normalise.","duration_seconds":15,"animation_key":"walk_decel"},
  {"order":6,"title":"Recovery Breath","description":"Stand tall, hands on hips. Take five slow, deep breaths before the next cycle.","duration_seconds":15,"animation_key":"stand_neutral"}
]'::jsonb),

('japanese-interval-walk-advanced', 'Japanese Interval Walking (Advanced)', 'interval_walking', 'advanced', 900, 5.5,
'[
  {"order":1,"title":"Dynamic Warm-Up","description":"March in place with high knees for 20 seconds. Add arm circles. Get your whole body ready.","duration_seconds":20,"animation_key":"march_high_knees"},
  {"order":2,"title":"Moderate Pace (3 min)","description":"Walk at 60% of your maximum effort. Focus on perfect form: tall spine, active core, full arm drive.","duration_seconds":180,"animation_key":"walk_normal"},
  {"order":3,"title":"Power Transition","description":"Drive elbows back sharply. Lean slightly forward from the ankles. Prepare for maximum effort.","duration_seconds":5,"animation_key":"walk_brace"},
  {"order":4,"title":"Maximum Brisk (3 min)","description":"Walk as fast as physically possible without breaking into a jog. Every step is deliberate and powerful.","duration_seconds":180,"animation_key":"walk_brisk"},
  {"order":5,"title":"Active Recovery","description":"Drop to 30% effort for 20 seconds. Light walking, arms loosely swinging.","duration_seconds":20,"animation_key":"walk_decel"},
  {"order":6,"title":"Reset","description":"Come to a full stop. Breathe deeply. Perform a 10-second calf raise hold.","duration_seconds":20,"animation_key":"calf_raise"}
]'::jsonb),

('hip-circle-beginner', 'Hip Circles', 'hip', 'beginner', 300, 3.0,
'[
  {"order":1,"title":"Starting Position","description":"Stand with feet hip-width apart, hands on your hips. Engage your core gently.","duration_seconds":5,"animation_key":"stand_hands_hips"},
  {"order":2,"title":"Circle Right","description":"Gently push your hips to the right side, then back, then left, then forward — drawing a smooth circle.","duration_seconds":30,"animation_key":"hip_circle_right"},
  {"order":3,"title":"Pause at Back","description":"Pause with your hips pushed back (as if sitting). Hold briefly and breathe in.","duration_seconds":10,"animation_key":"hip_back"},
  {"order":4,"title":"Circle Left","description":"Reverse the circle direction — right, forward, left, back. Keep the movement smooth and unhurried.","duration_seconds":30,"animation_key":"hip_circle_left"},
  {"order":5,"title":"Pause at Front","description":"Pause with your hips pushed slightly forward. Gently squeeze your glutes.","duration_seconds":10,"animation_key":"hip_forward"},
  {"order":6,"title":"Figure Eight","description":"Now try a figure-eight motion with your hips. This engages the hip stabilisers differently.","duration_seconds":30,"animation_key":"hip_figure_eight"},
  {"order":7,"title":"Return to Centre","description":"Slow your movement to a stop and return to a neutral standing position. Take a breath.","duration_seconds":10,"animation_key":"stand_hands_hips"}
]'::jsonb),

('hip-hinge-beginner', 'Hip Hinge', 'hip', 'beginner', 240, 3.2,
'[
  {"order":1,"title":"Standing Tall","description":"Stand with feet hip-width apart, a slight bend in your knees. Imagine a rod running through your spine.","duration_seconds":8,"animation_key":"stand_neutral"},
  {"order":2,"title":"Hinge Forward (Halfway)","description":"Push your hips backward as you fold your torso forward — stop when your torso is at 45 degrees. Keep your back flat.","duration_seconds":10,"animation_key":"hinge_halfway"},
  {"order":3,"title":"Hinge to Full Depth","description":"Continue the hip push-back until your torso is nearly parallel to the floor. Hands reach toward your shins.","duration_seconds":12,"animation_key":"hinge_full"},
  {"order":4,"title":"Hold at Depth","description":"Hold this position for 5 seconds. Feel the stretch in your hamstrings.","duration_seconds":8,"animation_key":"hinge_hold"},
  {"order":5,"title":"Drive Hips Forward","description":"Squeeze your glutes and drive your hips forward to return upright. Do NOT round your lower back.","duration_seconds":10,"animation_key":"hinge_return"},
  {"order":6,"title":"Reset","description":"Stand tall and take a breath before the next repetition.","duration_seconds":8,"animation_key":"stand_neutral"}
]'::jsonb),

('hip-flexor-stretch-beginner', 'Hip Flexor Stretch', 'hip', 'beginner', 300, 2.5,
'[
  {"order":1,"title":"Starting Position","description":"Stand upright with feet together. Relax your shoulders and engage your core lightly.","duration_seconds":8,"animation_key":"stand_neutral"},
  {"order":2,"title":"Lunge Forward (Right)","description":"Step your right foot forward into a lunge. Both knees at 90 degrees. Keep your torso vertical.","duration_seconds":12,"animation_key":"lunge_right"},
  {"order":3,"title":"Drop Hip","description":"Lower your left knee toward the floor (or let it touch gently). Shift your weight forward slightly — you should feel a stretch in the front of your left hip.","duration_seconds":20,"animation_key":"hip_drop_left"},
  {"order":4,"title":"Hold and Breathe","description":"Hold the stretch for 20 seconds. Breathe slowly. With each exhale, see if you can relax a little deeper.","duration_seconds":20,"animation_key":"hip_drop_hold"},
  {"order":5,"title":"Switch Sides","description":"Return to standing, then step your left foot forward. Repeat the sequence on this side.","duration_seconds":30,"animation_key":"lunge_left"}
]'::jsonb),

('hip-circle-intermediate', 'Hip Circles (Intermediate)', 'hip', 'intermediate', 360, 3.3,
'[
  {"order":1,"title":"Wide Stance","description":"Take a stance slightly wider than shoulder-width. Hands behind your head, elbows wide.","duration_seconds":8,"animation_key":"stand_wide_hands_head"},
  {"order":2,"title":"Large Circle Right","description":"Draw the largest circle you can with your hips — push to the edge of your range in every direction.","duration_seconds":40,"animation_key":"hip_circle_large_right"},
  {"order":3,"title":"Slow Figure Eight","description":"Transition to a slow figure-eight pattern. Keep your knees soft throughout.","duration_seconds":40,"animation_key":"hip_figure_eight"},
  {"order":4,"title":"Large Circle Left","description":"Reverse direction. Move even slower than before to challenge your balance and control.","duration_seconds":40,"animation_key":"hip_circle_large_left"},
  {"order":5,"title":"Pelvic Tilt Series","description":"10 anterior (forward) tilts followed by 10 posterior (backward) tilts. Feel each segment of your spine.","duration_seconds":40,"animation_key":"pelvic_tilt"},
  {"order":6,"title":"Side Sway","description":"Sway your hips side to side 10 times, with increasing range of motion.","duration_seconds":30,"animation_key":"hip_sway"},
  {"order":7,"title":"Return and Breathe","description":"Centre your hips and stand quietly. Observe how your hips feel compared to when you started.","duration_seconds":12,"animation_key":"stand_neutral"}
]'::jsonb),

('core-plank-beginner', 'Plank Hold', 'core', 'beginner', 120, 4.0,
'[
  {"order":1,"title":"Start on All Fours","description":"Begin on hands and knees. Wrists directly under shoulders, knees under hips.","duration_seconds":5,"animation_key":"all_fours"},
  {"order":2,"title":"Step Feet Back","description":"Step one foot back, then the other, until your body forms a straight line from head to heels.","duration_seconds":8,"animation_key":"plank_setup"},
  {"order":3,"title":"Engage and Hold","description":"Press your hands firmly into the floor. Tighten your core, squeeze your glutes, keep your neck neutral. Hold for 20 seconds.","duration_seconds":20,"animation_key":"plank_hold"},
  {"order":4,"title":"Rest","description":"Lower your knees to the floor and rest in child pose for 10 seconds.","duration_seconds":10,"animation_key":"child_pose"},
  {"order":5,"title":"Second Plank","description":"Return to plank position. Hold for another 20 seconds. Focus on keeping your hips level.","duration_seconds":20,"animation_key":"plank_hold"}
]'::jsonb),

('core-crunch-beginner', 'Abdominal Crunches', 'core', 'beginner', 180, 3.8,
'[
  {"order":1,"title":"Lie Down","description":"Lie on your back with knees bent, feet flat on the floor, hip-width apart. Cross your arms over your chest.","duration_seconds":8,"animation_key":"lie_back_knees_bent"},
  {"order":2,"title":"Engage Core","description":"Press your lower back gently into the floor. This activates your transverse abdominis before you begin.","duration_seconds":5,"animation_key":"core_engage"},
  {"order":3,"title":"Crunch Up","description":"Curl your upper body toward your knees — only your shoulders and upper back leave the floor. Exhale as you rise.","duration_seconds":8,"animation_key":"crunch_up"},
  {"order":4,"title":"Hold at Top","description":"Pause at the top of the movement for 2 seconds. Feel your abs contract. Do not pull on your neck.","duration_seconds":5,"animation_key":"crunch_hold"},
  {"order":5,"title":"Lower Slowly","description":"Lower your upper body back to the floor with control. Inhale on the way down.","duration_seconds":8,"animation_key":"crunch_down"},
  {"order":6,"title":"Rest and Repeat","description":"Rest for 5 seconds, then perform 2 more sets. Focus on quality over quantity.","duration_seconds":30,"animation_key":"lie_back_rest"}
]'::jsonb),

('core-bird-dog-beginner', 'Bird Dog', 'core', 'beginner', 240, 3.5,
'[
  {"order":1,"title":"All-Fours Position","description":"Kneel on all fours. Wrists under shoulders, knees under hips. Spine in neutral — neither arched nor rounded.","duration_seconds":8,"animation_key":"all_fours"},
  {"order":2,"title":"Extend Right Arm","description":"Slowly extend your right arm straight forward at shoulder height. Pause briefly.","duration_seconds":8,"animation_key":"arm_extend_right"},
  {"order":3,"title":"Extend Left Leg","description":"Simultaneously extend your left leg straight back at hip height. Your body forms a T-shape. Hold for 5 seconds.","duration_seconds":10,"animation_key":"bird_dog_right_arm_left_leg"},
  {"order":4,"title":"Return to Centre","description":"Slowly bring your arm and leg back to the starting position without letting them touch the floor.","duration_seconds":8,"animation_key":"all_fours"},
  {"order":5,"title":"Switch Sides","description":"Now extend your left arm and right leg simultaneously. Hold for 5 seconds.","duration_seconds":10,"animation_key":"bird_dog_left_arm_right_leg"},
  {"order":6,"title":"Return and Rest","description":"Return to all fours. Take a breath.","duration_seconds":8,"animation_key":"all_fours"},
  {"order":7,"title":"Repeat Set","description":"Complete 5 more alternating repetitions, moving slowly and with control.","duration_seconds":60,"animation_key":"bird_dog_alternate"}
]'::jsonb),

('body-scan-relaxation', 'Body Scan Relaxation', 'relaxation', 'beginner', 480, 1.2,
'[
  {"order":1,"title":"Find Your Position","description":"Stand comfortably or sit in a chair. Close your eyes if comfortable. Let your body settle.","duration_seconds":15,"animation_key":"stand_neutral"},
  {"order":2,"title":"Breathe In","description":"Take a slow, deep breath in through your nose for 4 counts. Feel your chest and belly expand.","duration_seconds":15,"animation_key":"inhale_arms_rise"},
  {"order":3,"title":"Breathe Out","description":"Exhale slowly through your mouth for 6 counts. Let your shoulders drop. Release any held tension.","duration_seconds":20,"animation_key":"exhale_arms_fall"},
  {"order":4,"title":"Scan — Feet to Hips","description":"Bring gentle awareness to your feet, ankles, calves, knees, and hips. Notice without judgment. Breathe into any tension.","duration_seconds":60,"animation_key":"scan_lower"},
  {"order":5,"title":"Scan — Torso to Neck","description":"Move your awareness through your abdomen, chest, back, shoulders, and neck. With each exhale, release tightness.","duration_seconds":60,"animation_key":"scan_upper"},
  {"order":6,"title":"Full Release","description":"Take one final deep breath. As you exhale, imagine every cell in your body softening. Open your eyes slowly.","duration_seconds":20,"animation_key":"stand_release"}
]'::jsonb),

('seated-breathing-relaxation', 'Seated Breathing', 'relaxation', 'beginner', 300, 1.0,
'[
  {"order":1,"title":"Seated Position","description":"Sit upright in a chair or cross-legged on the floor. Place your hands on your knees, palms up.","duration_seconds":10,"animation_key":"seated_upright"},
  {"order":2,"title":"Box Breath In","description":"Inhale slowly for 4 counts. Breathe deeply into your belly, then your chest.","duration_seconds":10,"animation_key":"seated_inhale"},
  {"order":3,"title":"Hold","description":"Hold your breath for 4 counts. Stay relaxed — no tension in your shoulders or jaw.","duration_seconds":10,"animation_key":"seated_hold"},
  {"order":4,"title":"Exhale","description":"Exhale slowly for 4 counts. Let everything go. Notice how your body feels lighter.","duration_seconds":10,"animation_key":"seated_exhale"},
  {"order":5,"title":"Repeat 5 Cycles","description":"Continue box breathing for 5 more cycles. Each cycle calms your nervous system and lowers cortisol.","duration_seconds":120,"animation_key":"seated_breathing_cycle"}
]'::jsonb),

('standing-stretch-relaxation', 'Standing Stretch Routine', 'relaxation', 'beginner', 360, 1.5,
'[
  {"order":1,"title":"Mountain Pose","description":"Stand with feet together, arms at sides. Ground through all four corners of each foot. Breathe naturally.","duration_seconds":10,"animation_key":"stand_neutral"},
  {"order":2,"title":"Overhead Reach","description":"Inhale and sweep both arms overhead, palms together. Reach tall — lengthen your entire spine.","duration_seconds":15,"animation_key":"arms_overhead"},
  {"order":3,"title":"Side Bend Left","description":"Keeping arms overhead, bend gently to the left. Feel the stretch along your right side. Hold 15 seconds.","duration_seconds":20,"animation_key":"side_bend_left"},
  {"order":4,"title":"Side Bend Right","description":"Come back to centre and bend gently to the right. Hold 15 seconds.","duration_seconds":20,"animation_key":"side_bend_right"},
  {"order":5,"title":"Forward Fold","description":"Exhale and fold forward from your hips, letting your arms hang. Allow gravity to do the work — no forcing.","duration_seconds":25,"animation_key":"forward_fold"},
  {"order":6,"title":"Roll Up and Return","description":"Slowly roll up one vertebra at a time, starting from your lower back. Let your head come up last. Return to mountain pose.","duration_seconds":20,"animation_key":"roll_up"}
]'::jsonb),

('progressive-muscle-relaxation', 'Progressive Muscle Relaxation', 'relaxation', 'intermediate', 600, 1.3,
'[
  {"order":1,"title":"Stand or Lie Down","description":"This exercise can be done standing, sitting, or lying down. Find a comfortable, quiet position.","duration_seconds":15,"animation_key":"stand_neutral"},
  {"order":2,"title":"Tense Feet and Calves","description":"Curl your toes tightly and flex your calves. Hold the tension for 5 seconds. Then release completely.","duration_seconds":15,"animation_key":"tense_lower_legs"},
  {"order":3,"title":"Tense Thighs and Glutes","description":"Squeeze your thighs and glutes hard. Hold for 5 seconds. Then release and feel the difference.","duration_seconds":15,"animation_key":"tense_upper_legs"},
  {"order":4,"title":"Tense Abdomen","description":"Pull your belly button in and tighten your core muscles. Hold for 5 seconds. Release.","duration_seconds":15,"animation_key":"tense_core"},
  {"order":5,"title":"Tense Hands and Arms","description":"Make tight fists and flex your forearms and biceps. Hold for 5 seconds. Release.","duration_seconds":15,"animation_key":"tense_arms"},
  {"order":6,"title":"Tense Shoulders","description":"Shrug your shoulders up to your ears. Hold for 5 seconds. Then let them drop completely.","duration_seconds":15,"animation_key":"tense_shoulders"},
  {"order":7,"title":"Tense Face","description":"Scrunch your face — close your eyes tight, clench your jaw. Hold for 5 seconds. Release and feel your face soften.","duration_seconds":15,"animation_key":"tense_face"},
  {"order":8,"title":"Full Body Release","description":"Take a slow, deep breath. As you exhale, notice the pleasant heaviness throughout your body. You are fully relaxed.","duration_seconds":30,"animation_key":"stand_release"}
]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Seed badges (idempotent via ON CONFLICT DO NOTHING)
INSERT INTO badges (slug, name, description, icon_key, criteria, sort_order) VALUES
('dawn-of-wellness',       'Dawn of Wellness',      'Completed your onboarding profile. Your wellness journey begins now.',                                  'sunrise',           '{"type":"profile_complete","threshold":1}'::jsonb,   1),
('plan-getter',            'Plan Getter',            'Generated your first personalised workout plan.',                                                       'clipboard-check',   '{"type":"plans_generated","threshold":1}'::jsonb,    2),
('first-step',             'First Step',             'Completed your very first workout session. The hardest step is always the first.',                      'footprints',        '{"type":"first_session","threshold":1}'::jsonb,       3),
('week-warrior',           'Week Warrior',           'Worked out every day for 7 consecutive days.',                                                          'calendar-check',    '{"type":"streak_days","threshold":7}'::jsonb,         4),
('two-week-champion',      'Two-Week Champion',      'Maintained a 14-day workout streak. Incredible discipline.',                                            'trophy',            '{"type":"streak_days","threshold":14}'::jsonb,        5),
('month-master',           'Month Master',           'A full 30-day streak. You have made exercise a genuine habit.',                                         'medal',             '{"type":"streak_days","threshold":30}'::jsonb,        6),
('ten-sessions',           'Ten Sessions',           'Completed 10 total workout sessions.',                                                                  'dumbbell',          '{"type":"total_sessions","threshold":10}'::jsonb,     7),
('fifty-sessions',         'Fifty Sessions',         'Completed 50 total workout sessions. You are truly committed.',                                         'zap',               '{"type":"total_sessions","threshold":50}'::jsonb,     8),
('first-kilo-gone',        'First Kilo Gone',        'Lost your first kilogram. The journey of a thousand miles begins with a single step.',                 'trending-down',     '{"type":"weight_lost_kg","threshold":1}'::jsonb,      9),
('five-kg-down',           'Five KG Down',           'Lost 5 kilograms. Your hard work and consistency are clearly paying off.',                              'arrow-down-circle', '{"type":"weight_lost_kg","threshold":5}'::jsonb,      10),
('halfway-there',          'Halfway There',          'You are 50% of the way to your goal weight. The finish line is in sight.',                              'target',            '{"type":"halfway_to_goal","threshold":1}'::jsonb,     11),
('goal-reached',           'Goal Reached',           'You reached your goal weight. This is an extraordinary achievement. Celebrate!',                       'star',              '{"type":"goal_reached","threshold":1}'::jsonb,        12),
('hydration-hero',         'Hydration Hero',         'Drank at least 2 litres of water for 3 consecutive days.',                                              'droplets',          '{"type":"water_streak_days","threshold":3}'::jsonb,   13),
('water-master',           'Water Master',           'Consumed 50 total litres of water since joining Fitcount.',                                             'cup-soda',          '{"type":"total_water_litres","threshold":50}'::jsonb, 14),
('sleep-champion',         'Sleep Champion',         'Achieved adequate sleep (7–9 hours) for 5 consecutive nights.',                                         'moon',              '{"type":"sleep_streak_days","threshold":5}'::jsonb,   15),
('consistency-king',       'Consistency King',       'Logged something (water, sleep, or weight) every day for 7 consecutive days. Consistency is the key.', 'flame',             '{"type":"log_streak_days","threshold":7}'::jsonb,     16)
ON CONFLICT (slug) DO NOTHING;

-- +goose Down
TRUNCATE badges CASCADE;
TRUNCATE exercises CASCADE;
