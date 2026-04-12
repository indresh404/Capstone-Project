-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.batches (
  id integer NOT NULL DEFAULT nextval('batches_id_seq'::regclass),
  name character varying NOT NULL UNIQUE,
  division_id integer NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT batches_pkey PRIMARY KEY (id),
  CONSTRAINT batches_division_id_fkey FOREIGN KEY (division_id) REFERENCES public.divisions(id)
);
CREATE TABLE public.divisions (
  id integer NOT NULL DEFAULT nextval('divisions_id_seq'::regclass),
  name character varying NOT NULL UNIQUE,
  CONSTRAINT divisions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.faculty_attendance (
  id integer NOT NULL DEFAULT nextval('faculty_attendance_id_seq'::regclass),
  faculty_id integer NOT NULL,
  date date NOT NULL,
  status character varying NOT NULL DEFAULT 'unmarked'::character varying CHECK (status::text = ANY (ARRAY['present'::character varying, 'absent'::character varying, 'leave'::character varying, 'unmarked'::character varying]::text[])),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT faculty_attendance_pkey PRIMARY KEY (id),
  CONSTRAINT faculty_attendance_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.users(id)
);
CREATE TABLE public.faculty_subjects (
  id integer NOT NULL DEFAULT nextval('faculty_subjects_id_seq'::regclass),
  faculty_id integer NOT NULL,
  subject_id integer NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT faculty_subjects_pkey PRIMARY KEY (id),
  CONSTRAINT faculty_subjects_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.users(id),
  CONSTRAINT faculty_subjects_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id)
);
CREATE TABLE public.rooms (
  id integer NOT NULL DEFAULT nextval('rooms_id_seq'::regclass),
  name character varying NOT NULL UNIQUE,
  type USER-DEFINED NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT rooms_pkey PRIMARY KEY (id)
);
CREATE TABLE public.subjects (
  id integer NOT NULL DEFAULT nextval('subjects_id_seq'::regclass),
  code character varying NOT NULL UNIQUE,
  name character varying NOT NULL,
  type USER-DEFINED NOT NULL,
  lectures_per_week integer NOT NULL CHECK (lectures_per_week > 0),
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT subjects_pkey PRIMARY KEY (id)
);
CREATE TABLE public.timetable (
  id integer NOT NULL DEFAULT nextval('timetable_id_seq'::regclass),
  day character varying NOT NULL,
  slot_id integer NOT NULL,
  division_id integer,
  batch_id integer,
  subject_id integer,
  faculty_id integer,
  room_id integer,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  status character varying DEFAULT 'scheduled'::character varying,
  CONSTRAINT timetable_pkey PRIMARY KEY (id),
  CONSTRAINT timetable_division_id_fkey FOREIGN KEY (division_id) REFERENCES public.divisions(id),
  CONSTRAINT timetable_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(id),
  CONSTRAINT timetable_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id),
  CONSTRAINT timetable_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.users(id),
  CONSTRAINT timetable_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id)
);
CREATE TABLE public.timetable_backup (
  id integer,
  day character varying,
  slot_id integer,
  division_id integer,
  batch_id integer,
  subject_id integer,
  faculty_id integer,
  room_id integer,
  created_at timestamp without time zone
);
CREATE TABLE public.user_preferences (
  id integer NOT NULL DEFAULT nextval('user_preferences_id_seq'::regclass),
  user_id integer UNIQUE,
  dark_mode boolean DEFAULT false,
  language character varying DEFAULT 'English'::character varying,
  timezone character varying DEFAULT 'IST'::character varying,
  email_notifications boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT user_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
  college_id character varying NOT NULL UNIQUE,
  name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  phone character varying NOT NULL,
  password character varying NOT NULL,
  role USER-DEFINED NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  department character varying,
  two_factor_enabled boolean DEFAULT false,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);