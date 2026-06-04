  -- ── 5. INSERT / UPDATE course_offerings ─────────────────────────────
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='BS112'), v_dr_mayda, 60, '[]'::jsonb, 'Central Hall (Upper)')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='BS112') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Sat', '09:00', '11:00', 'Central Hall (Upper)', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='CS111'), v_dr_osama, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='CS111') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Sun', '11:00', '13:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='IS111'), v_dr_omneya, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IS111') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Sun', '07:00', '09:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='BS111'), v_dr_nancy, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='BS111') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Mon', '11:00', '13:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='BS116'), v_dr_shimaa, 60, '[]'::jsonb, 'Central Hall (Upper)')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='BS116') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Mon', '09:00', '11:00', 'Central Hall (Upper)', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='UNV113'), v_dr_walid_s, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='UNV113') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Mon', '13:00', '15:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='BS115'), v_dr_mayda, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='BS115') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Sat', '07:00', '09:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='UNV112'), v_dr_ahmed, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='UNV112') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Sat', '11:00', '13:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='BS113'), v_dr_mostafa, 60, '[]'::jsonb, 'Central Hall (Upper)')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='BS113') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Sun', '11:00', '13:00', 'Central Hall (Upper)', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='BS115') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Mon', '09:00', '11:00', 'Central Hall (Upper)', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='UNV114'), v_dr_arwa_a, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='UNV114') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Tue', '07:00', '09:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='UNV111'), v_dr_shimaa, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='UNV111') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Wed', '07:00', '09:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='CS112'), v_dr_osama, 60, '[]'::jsonb, 'Central Hall (Upper)')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='CS112') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Wed', '11:00', '13:00', 'Central Hall (Upper)', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='BS114'), v_dr_hanaa_h, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='BS114') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Sat', '07:00', '09:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='BS117'), v_dr_nancy, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='BS117') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Sat', '13:00', '15:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='CS211'), v_dr_osama, 60, '[]'::jsonb, 'Central Hall (Upper)')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='CS211') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Tue', '11:00', '13:00', 'Central Hall (Upper)', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='SE211'), v_dr_arwa_a, 60, '[]'::jsonb, 'Central Hall (Upper)')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='SE211') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Wed', '11:00', '13:00', 'Central Hall (Upper)', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='CS212'), v_dr_mostafa, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='CS212') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Thu', '07:00', '09:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='IT211'), v_dr_mayda, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IT211') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Thu', '13:00', '15:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='IS211'), v_dr_omneya, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IS211') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Sun', '07:00', '09:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='CS214'), v_dr_hanaa_e, 60, '[]'::jsonb, 'Central Hall (Upper)')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='CS214') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Mon', '09:00', '11:00', 'Central Hall (Upper)', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='IT212'), v_dr_marian, 60, '[]'::jsonb, 'Central Hall (Upper)')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IT212') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Tue', '09:00', '11:00', 'Central Hall (Upper)', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='IS212'), v_dr_nancy, 60, '[]'::jsonb, 'Central Hall (Upper)')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IS212') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Tue', '11:00', '13:00', 'Central Hall (Upper)', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='CS213'), v_dr_osama, 60, '[]'::jsonb, 'Central Hall (Upper)')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='CS213') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Thu', '11:00', '13:00', 'Central Hall (Upper)', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='IT311'), v_dr_ahmed, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IT311') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Sun', '07:00', '09:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='CS313'), v_dr_ahmed, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='CS313') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Sun', '07:00', '09:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='CS311'), v_dr_mostafa, 60, '[]'::jsonb, 'Central Hall (Upper)')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='CS311') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Mon', '09:00', '11:00', 'Central Hall (Upper)', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='IS311'), v_dr_shimaa, 60, '[]'::jsonb, 'Central Hall (Lower)')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IS311') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Mon', '11:00', '13:00', 'Central Hall (Lower)', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='CS312'), v_dr_walid_k, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='CS312') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Wed', '11:00', '13:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='CS331'), v_dr_osama, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='CS331') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Thu', '11:00', '13:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='CS314'), v_dr_walid_k, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='CS314') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Sat', '11:00', '13:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='CS332'), v_dr_ahmed, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='CS332') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Wed', '07:00', '09:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='CS411'), v_dr_mostafa, 60, '[]'::jsonb, 'Central Hall (Upper)')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='CS411') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Wed', '09:00', '11:00', 'Central Hall (Upper)', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='SE315'), v_dr_arwa_a, 60, '[]'::jsonb, 'Central Hall (Upper)')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='SE315') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Wed', '11:00', '13:00', 'Central Hall (Upper)', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='CS315'), v_dr_walid_k, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='CS315') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Thu', '07:00', '09:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='CS316'), v_dr_ahmed, 60, '[]'::jsonb, 'Central Hall (Upper)')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='CS316') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Thu', '07:00', '09:00', 'Central Hall (Upper)', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IT311') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Sun', '11:00', '13:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='IT321'), v_dr_hany, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='CS313') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Tue', '11:00', '13:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='IT315'), v_dr_tahani, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IT315') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Wed', '07:00', '09:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='IT312'), v_dr_marian, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IT312') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Thu', '07:00', '09:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='IT314'), v_dr_mayda, 50, '[]'::jsonb, 'Hall 2')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IT314') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Thu', '09:00', '11:00', 'Hall 2', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='IT319'), v_dr_marian, 60, '[]'::jsonb, 'Central Hall (Upper)')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IT319') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Sun', '09:00', '11:00', 'Central Hall (Upper)', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='IT322'), v_dr_mayda, 50, '[]'::jsonb, 'Hall 3')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IT322') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Sun', '11:00', '13:00', 'Hall 3', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='IT318'), v_dr_arwa_a, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IT318') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Mon', '11:00', '13:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IT317') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Thu', '07:00', '09:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='IT316'), v_dr_marian, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IT316') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Thu', '15:00', '17:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='CS314'), v_dr_ahmed, 50, '[]'::jsonb, 'Hall 3')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='CS314') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Sun', '09:00', '11:00', 'Hall 3', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='IS313'), v_dr_hany, 50, '[]'::jsonb, 'Hall 3')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IS313') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Sun', '11:00', '13:00', 'Hall 3', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IS311') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Sun', '11:00', '13:00', 'Central Hall (Lower)', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='IS312'), v_dr_shimaa, 50, '[]'::jsonb, 'Hall 1')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IS312') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Mon', '09:00', '11:00', 'Hall 1', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='CS313') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Tue', '07:00', '09:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='IS351'), v_dr_omneya, 50, '[]'::jsonb, 'Hall 2')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IS351') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Tue', '09:00', '11:00', 'Hall 2', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='IS315'), v_dr_shimaa, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IS315') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Sat', '07:00', '09:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='IS317'), v_dr_ibrahim, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IS317') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Sun', '07:00', '09:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='IS321'), v_dr_shimaa, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IS321') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Tue', '07:00', '09:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='IS318'), v_dr_omneya, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IS318') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Tue', '11:00', '13:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='IS314'), v_dr_omneya, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IS314') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Wed', '07:00', '09:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IS321') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Thu', '11:00', '13:00', 'Hall 3', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='CS315'), v_dr_walid_k, 60, '[]'::jsonb, 'Central Hall (Lower)')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='CS315') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Sat', '09:00', '11:00', 'Central Hall (Lower)', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='CS443'), v_dr_marian, 60, '[]'::jsonb, 'Central Hall (Upper)')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='CS443') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Sat', '11:00', '13:00', 'Central Hall (Upper)', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='SE321'), v_dr_ahmed, 60, '[]'::jsonb, 'Central Hall (Lower)')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='SE321') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Sun', '09:00', '11:00', 'Central Hall (Lower)', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='CS434'), v_dr_walid_k, 60, '[]'::jsonb, 'Central Hall (Lower)')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='CS434') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Mon', '09:00', '11:00', 'Central Hall (Lower)', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='CS413'), v_dr_hanaa_h, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='CS413') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Wed', '07:00', '09:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='CS331'), v_dr_hanaa_h, 60, '[]'::jsonb, 'Central Hall (Upper)')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='CS331') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Sat', '07:00', '09:00', 'Central Hall (Upper)', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='CS332') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Sun', '07:00', '09:00', 'Central Hall (Upper)', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='CS416'), v_dr_hanaa_h, 60, '[]'::jsonb, 'Central Hall (Upper)')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='CS416') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Mon', '07:00', '09:00', 'Central Hall (Upper)', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='CS415'), v_dr_walid_k, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='CS415') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Mon', '11:00', '13:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='CS433'), v_dr_mostafa, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='IT415'), v_dr_arwa_e, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IT415') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Sat', '07:00', '09:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IT315') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Sat', '11:00', '13:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='CS315') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Sun', '09:00', '11:00', 'Central Hall (Lower)', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='IT444'), v_dr_marian, 50, '[]'::jsonb, 'Hall 1')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IT444') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Tue', '09:00', '11:00', 'Hall 1', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='IT313'), v_dr_mayda, 60, '[]'::jsonb, 'Central Hall (Upper)')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IT313') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Wed', '09:00', '11:00', 'Central Hall (Upper)', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IT319') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Sun', '09:00', '11:00', 'Central Hall (Upper)', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='IT414'), v_dr_mayda, 50, '[]'::jsonb, 'Hall 2')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IT414') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Mon', '09:00', '11:00', 'Hall 2', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='IT413'), v_dr_arwa_a, 50, '[]'::jsonb, 'Hall 3')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IT413') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Tue', '11:00', '13:00', 'Hall 3', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='IT314'), v_dr_marwa, 50, '[]'::jsonb, 'Hall 1')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IT314') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Tue', '09:00', '11:00', 'Hall 1', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='IT411'), v_dr_iman, 50, '[]'::jsonb, 'Hall 2')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IT411') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Wed', '09:00', '11:00', 'Hall 2', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='IS341'), v_dr_ibrahim, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IS341') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Sat', '07:00', '09:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='IS411'), v_dr_shimaa, 50, '[]'::jsonb, 'Hall 3')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IS411') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Sat', '07:00', '09:00', 'Hall 3', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_fall2025_id, (SELECT id FROM courses WHERE code='IS412'), v_dr_hany, 50, '[]'::jsonb, 'Hall 1')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IS412') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Sat', '11:00', '13:00', 'Hall 1', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IS351') 
    AND semester_id=v_fall2025_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Sun', '09:00', '11:00', 'Hall 2', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='IS413'), v_dr_ibrahim, 80, '[]'::jsonb, 'Online')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IS413') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Sun', '07:00', '09:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='IS342'), v_dr_shimaa, 50, '[]'::jsonb, 'Hall 1')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IS342') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Mon', '09:00', '11:00', 'Hall 1', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='IS415'), v_dr_iman, 50, '[]'::jsonb, 'Hall 1')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IS415') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Mon', '11:00', '13:00', 'Hall 1', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room)
  VALUES (v_spring2026_id, (SELECT id FROM courses WHERE code='IS414'), v_dr_shimaa, 50, '[]'::jsonb, 'Hall 3')
  ON CONFLICT (semester_id, course_id)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IS414') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Tue', '09:00', '11:00', 'Hall 3', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='IS321') 
    AND semester_id=v_spring2026_id;

  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Thu', '11:00', '13:00', 'Hall 3', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;

  -- ── 7. Mark seed as complete ──────────────────────────────────────────
  INSERT INTO seed_logs (seed_name, rows_affected)
  VALUES ('004_real_professors.sql', 19);

  RAISE NOTICE 'Seed 004 complete — 19 real professors loaded';
END $$;
