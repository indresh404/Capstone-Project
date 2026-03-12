// timetable.js - Updated for Supabase/PostgreSQL
const pool = require('./db/db.js');

// Fisher-Yates shuffle - returns a new shuffled array
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

class TimetableEngine {
  constructor(data) {
    this.rooms = data.rooms || [];
    this.faculty = data.faculty || [];
    this.subjects = data.subjects || [];
    this.divisions = data.divisions || [];
    this.batches = data.batches || [];
    this.slots = data.slots || this.getDefaultSlots();
    this.days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    
    // Create lookup maps for quick ID retrieval
    this.roomMap = {};
    this.rooms.forEach(r => { 
      this.roomMap[r.name] = r; 
      this.roomMap[r.id] = r; 
    });
    
    this.facultyMap = {};
    this.faculty.forEach(f => { 
      this.facultyMap[f.name] = f; 
      this.facultyMap[f.id] = f; 
    });
    
    this.subjectMap = {};
    this.subjects.forEach(s => { 
      this.subjectMap[s.name] = s; 
      this.subjectMap[s.code] = s; 
      this.subjectMap[s.id] = s; 
    });
    
    this.divisionMap = {};
    this.divisions.forEach(d => { 
      this.divisionMap[d.name] = d; 
      this.divisionMap[d.id] = d; 
    });
    
    this.batchMap = {};
    this.batches.forEach(b => { 
      this.batchMap[b.name] = b; 
      this.batchMap[b.id] = b; 
    });

    // Create subject to faculty mapping
    this.subjectFacultyMap = {};
    this.subjects.forEach(sub => {
      if (sub.faculty_id) {
        this.subjectFacultyMap[sub.id] = sub.faculty_id;
        console.log(`📚 Subject ${sub.name} (ID: ${sub.id}) assigned to faculty ID: ${sub.faculty_id}`);
      }
    });

    // Initialize tracking structures
    this.timetable = {};
    this.facultyOccupied = {};
    this.roomOccupied = {};
    this.divOccupied = {};
    this.batchOccupied = {};
    this.lectureCount = {};
    this.labCount = {};
    this.batchTestDone = {};

    this.initTracking();
  }

  getDefaultSlots() {
    return [
      { id: 1, time: "09:15-10:15", type: "regular" },
      { id: 2, time: "10:15-11:15", type: "regular" },
      { id: 3, time: "11:15-12:15", type: "regular" },
      { id: 4, time: "12:15-12:45", type: "break" },
      { id: 5, time: "12:45-01:45", type: "regular" },
      { id: 6, time: "01:45-02:45", type: "regular" },
      { id: 7, time: "02:45-03:45", type: "regular" },
      { id: 8, time: "03:45-04:45", type: "extra" }
    ];
  }

  getRegularSlotIds() {
    return this.slots.filter(s => s.type === "regular").map(s => s.id);
  }

  initTracking() {
    const maxSlot = Math.max(...this.slots.map(s => s.id)) + 1;

    this.days.forEach(day => {
      this.timetable[day] = {};
      this.divisions.forEach(div => {
        this.timetable[day][div.name] = [];
        this.divOccupied[div.name] = this.divOccupied[div.name] || {};
        this.divOccupied[div.name][day] = Array(maxSlot).fill(false);
      });
      
      this.faculty.forEach(f => {
        this.facultyOccupied[f.id] = this.facultyOccupied[f.id] || {};
        this.facultyOccupied[f.id][day] = Array(maxSlot).fill(false);
      });
      
      this.rooms.forEach(r => {
        this.roomOccupied[r.id] = this.roomOccupied[r.id] || {};
        this.roomOccupied[r.id][day] = Array(maxSlot).fill(false);
      });
      
      this.batches.forEach(b => {
        this.batchOccupied[b.name] = this.batchOccupied[b.name] || {};
        this.batchOccupied[b.name][day] = Array(maxSlot).fill(false);
      });
    });

    this.divisions.forEach(div => {
      this.lectureCount[div.name] = {};
      this.labCount[div.name] = {};
      this.subjects.forEach(sub => {
        this.lectureCount[div.name][sub.code] = 0;
        this.labCount[div.name][sub.code] = 0;
      });
    });

    this.batches.forEach(b => { this.batchTestDone[b.name] = false; });
  }

  canAssignDiv(sub, divName, day, slotId, roomId) {
    const slot = this.slots.find(s => s.id === slotId);
    if (!slot || slot.type !== "regular") return false;
    if (this.divOccupied[divName][day][slotId]) return false;
    if (this.roomOccupied[roomId][day][slotId]) return false;
    
    const facultyId = this.subjectFacultyMap[sub.id];
    if (facultyId && this.facultyOccupied[facultyId][day][slotId]) return false;
    
    const divBatches = this.batches.filter(b => b.division === divName);
    if (divBatches.some(b => this.batchOccupied[b.name][day][slotId])) return false;
    return true;
  }

  canAssignBatch(sub, divName, day, slotId, roomId, batchName) {
    const slot = this.slots.find(s => s.id === slotId);
    if (!slot || slot.type !== "regular") return false;
    if (this.batchOccupied[batchName][day][slotId]) return false;
    if (this.roomOccupied[roomId][day][slotId]) return false;
    
    const facultyId = this.subjectFacultyMap[sub.id];
    if (facultyId && this.facultyOccupied[facultyId][day][slotId]) return false;
    
    return true;
  }

  assignDiv(sub, divName, day, slotId, roomId) {
    const facultyId = this.subjectFacultyMap[sub.id];
    const facultyMember = facultyId ? this.facultyMap[facultyId] : null;
    const room = this.roomMap[roomId];
    const division = this.divisionMap[divName];
    const slotInfo = this.slots.find(s => s.id === slotId);

    const session = {
      slot: slotId,
      time: slotInfo.time,
      subject_id: sub.id,
      subject_code: sub.code,
      subject_name: sub.name,
      type: sub.type,
      room_id: roomId,
      room_name: room.name,
      faculty_id: facultyId,
      faculty_name: facultyMember ? facultyMember.name : "-",
      batch: "Full Division",
      batch_id: null,
      division: divName,
      division_id: division.id,
      day: day
    };

    console.log(`📝 Assigning Div: ${sub.name} to ${divName} on ${day} slot ${slotId} - Faculty ID: ${facultyId}, Room ID: ${roomId}`);

    this.timetable[day][divName].push(session);

    if (facultyId) this.facultyOccupied[facultyId][day][slotId] = true;
    this.roomOccupied[roomId][day][slotId] = true;
    this.divOccupied[divName][day][slotId] = true;
    
    this.batches.filter(b => b.division === divName).forEach(b => {
      this.batchOccupied[b.name][day][slotId] = true;
    });

    if (!["test", "break"].includes(sub.type)) {
      this.lectureCount[divName][sub.code]++;
    }
    return session;
  }

  assignBatch(sub, divName, day, slotId, roomId, batchName) {
    const facultyId = this.subjectFacultyMap[sub.id];
    const facultyMember = facultyId ? this.facultyMap[facultyId] : null;
    const room = this.roomMap[roomId];
    const division = this.divisionMap[divName];
    const batch = this.batchMap[batchName];
    const slotInfo = this.slots.find(s => s.id === slotId);

    const session = {
      slot: slotId,
      time: slotInfo.time,
      subject_id: sub.id,
      subject_code: sub.code,
      subject_name: sub.name,
      type: sub.type,
      room_id: roomId,
      room_name: room.name,
      faculty_id: facultyId,
      faculty_name: facultyMember ? facultyMember.name : (sub.type === "test" ? "Coordinator" : "-"),
      batch: batchName,
      batch_id: batch ? batch.id : null,
      division: divName,
      division_id: division.id,
      day: day
    };

    console.log(`📝 Assigning Batch: ${sub.name} to ${batchName} on ${day} slot ${slotId} - Faculty ID: ${facultyId}, Room ID: ${roomId}, Batch ID: ${batch ? batch.id : null}`);

    this.timetable[day][divName].push(session);

    if (facultyId) this.facultyOccupied[facultyId][day][slotId] = true;
    this.roomOccupied[roomId][day][slotId] = true;
    this.batchOccupied[batchName][day][slotId] = true;

    if (sub.type === "lab") {
      this.labCount[divName][sub.code]++;
      this.lectureCount[divName][sub.code]++;
    }
    if (sub.type === "test") {
      this.batchTestDone[batchName] = true;
    }
    return session;
  }

  // ============================================================
  // SCHEDULE TESTS - 1 per batch per week
  // ============================================================
  scheduleTests() {
    const testSub = this.subjects.find(s => s.type === "test");
    if (!testSub) {
      console.log('⚠️ No test subject found');
      return;
    }

    const theoryRooms = this.rooms.filter(r => r.type === "theory");
    const usedSlots = new Set();

    const batchList = shuffle([...this.batches]);

    batchList.forEach(batch => {
      const divName = batch.division;
      let scheduled = false;

      for (const day of shuffle(this.days)) {
        for (const slotId of shuffle([7, 6, 5, 3, 2, 1])) {
          const key = `${day}-${slotId}`;
          if (usedSlots.has(key)) continue;
          
          const room = theoryRooms.find(r => !this.roomOccupied[r.id][day][slotId]);
          if (!room) continue;
          
          if (this.canAssignBatch(testSub, divName, day, slotId, room.id, batch.name)) {
            this.assignBatch(testSub, divName, day, slotId, room.id, batch.name);
            usedSlots.add(key);
            scheduled = true;
            break;
          }
        }
        if (scheduled) break;
      }
    });
  }

  // ============================================================
  // SCHEDULE LABS - 3 per week per batch (2-slot blocks)
  // ============================================================
  scheduleLabs() {
    const labSubs = this.subjects.filter(s => s.type === "lab");
    if (labSubs.length < 2) {
      console.log('⚠️ Not enough lab subjects');
      return;
    }
    
    const labRooms = this.rooms.filter(r => r.type === "lab");
    if (labRooms.length < 2) {
      console.log('⚠️ Not enough lab rooms');
      return;
    }
    
    const regularSlotIds = this.getRegularSlotIds();

    const slotPairs = [];
    for (let i = 0; i < regularSlotIds.length - 1; i++) {
      const s1 = regularSlotIds[i];
      const s2 = regularSlotIds[i + 1];
      const between = this.slots.filter(s => s.id > s1 && s.id < s2);
      if (between.length === 0 || between.every(s => s.type !== "break")) {
        slotPairs.push([s1, s2]);
      }
    }

    this.divisions.forEach(div => {
      const divBatches = this.batches.filter(b => b.division === div.name);
      if (divBatches.length < 2) return;
      
      let labDaysScheduled = 0;

      for (const day of shuffle(this.days)) {
        if (labDaysScheduled >= 3) break;

        for (const [s1, s2] of shuffle(slotPairs)) {
          const swapped = (labDaysScheduled % 2 === 1);
          const assignment = [
            { batch: divBatches[0], sub: swapped ? labSubs[1] : labSubs[0], room: labRooms[0] },
            { batch: divBatches[1], sub: swapped ? labSubs[0] : labSubs[1], room: labRooms[1] }
          ];

          const canAll = assignment.every(a =>
            this.canAssignBatch(a.sub, div.name, day, s1, a.room.id, a.batch.name) &&
            this.canAssignBatch(a.sub, div.name, day, s2, a.room.id, a.batch.name)
          );

          if (canAll) {
            assignment.forEach(a => {
              this.assignBatch(a.sub, div.name, day, s1, a.room.id, a.batch.name);
              this.assignBatch(a.sub, div.name, day, s2, a.room.id, a.batch.name);
            });
            labDaysScheduled++;
            break;
          }
        }
      }
    });
  }

  // ============================================================
  // SCHEDULE THEORY
  // ============================================================
  scheduleTheory() {
    const theories = this.subjects.filter(s => s.type === "theory");
    const theoryRooms = this.rooms.filter(r => r.type === "theory");
    if (theoryRooms.length === 0) {
      console.log('⚠️ No theory rooms found');
      return;
    }
    
    const divRoom = {};
    
    this.divisions.forEach((div, index) => {
      divRoom[div.name] = theoryRooms[index % theoryRooms.length];
    });

    theories.forEach((sub) => {
      const target = sub.lectures_per_week || 4;
      const divCounts = {};
      this.divisions.forEach(div => { divCounts[div.name] = 0; });

      const rotatedDays = shuffle(this.days);

      // First pass: 1 per day per division
      for (const day of rotatedDays) {
        for (const divName of this.divisions.map(d => d.name)) {
          if (divCounts[divName] >= target) continue;
          
          const dayCount = this.timetable[day][divName]
            .filter(s => s.subject_id === sub.id && s.type === "theory").length;
          if (dayCount >= 1) continue;
          
          for (const slotId of shuffle(this.getRegularSlotIds())) {
            if (this.canAssignDiv(sub, divName, day, slotId, divRoom[divName].id) &&
                !this.wouldMakeTriple(sub, divName, day, slotId)) {
              this.assignDiv(sub, divName, day, slotId, divRoom[divName].id);
              divCounts[divName]++;
              break;
            }
          }
        }
      }

      // Second pass: fill remaining quota
      for (const day of shuffle(rotatedDays)) {
        for (const divName of this.divisions.map(d => d.name)) {
          if (divCounts[divName] >= target) continue;
          
          const dayCount = this.timetable[day][divName]
            .filter(s => s.subject_id === sub.id && s.type === "theory").length;
          if (dayCount >= 2) continue;
          
          for (const slotId of shuffle(this.getRegularSlotIds())) {
            if (this.canAssignDiv(sub, divName, day, slotId, divRoom[divName].id) &&
                !this.wouldMakeTriple(sub, divName, day, slotId)) {
              this.assignDiv(sub, divName, day, slotId, divRoom[divName].id);
              divCounts[divName]++;
              break;
            }
          }
        }
      }
    });
  }

  wouldMakeTriple(sub, divName, day, slotId) {
    const sessions = this.timetable[day][divName];
    const prev1 = sessions.find(s => s.slot === slotId - 1);
    const prev2 = sessions.find(s => s.slot === slotId - 2);
    if (prev1?.subject_id === sub.id && prev2?.subject_id === sub.id) return true;
    return false;
  }

  // ============================================================
  // POST-PROCESSING
  // ============================================================
  postProcess() {
    const regularSlotIds = this.getRegularSlotIds();
    
    this.days.forEach(day => {
      this.divisions.forEach(div => {
        const sessions = this.timetable[day][div.name].slice().sort((a, b) => a.slot - b.slot);

        const ordered = regularSlotIds.map(sid => {
          const slotSessions = sessions.filter(s => s.slot === sid);
          const primary = slotSessions.find(s => s.batch === "Full Division") || slotSessions[0] || null;
          return { slotId: sid, primary, allSessions: slotSessions };
        });

        // Remove triple consecutive same subject
        for (let i = 2; i < ordered.length; i++) {
          const a = ordered[i - 2].primary;
          const b = ordered[i - 1].primary;
          const c = ordered[i].primary;
          if (a && b && c &&
              a.type === "theory" && b.type === "theory" && c.type === "theory" &&
              a.subject_id === b.subject_id && b.subject_id === c.subject_id) {
            ordered[i].allSessions = ordered[i].allSessions.filter(s => s !== c);
            ordered[i].primary = null;
          }
        }

        this.timetable[day][div.name] = ordered.flatMap(e => e.allSessions);
      });
    });
  }

  // ============================================================
  // FILL GAPS
  // ============================================================
  fillGaps() {
    const theoryRooms = this.rooms.filter(r => r.type === "theory");
    const regularSlotIds = this.getRegularSlotIds();

    this.days.forEach(day => {
      this.divisions.forEach(div => {
        regularSlotIds.forEach(slotId => {
          const has = this.timetable[day][div.name].find(s => s.slot === slotId);
          if (!has) {
            const slotInfo = this.slots.find(s => s.id === slotId);
            const room = theoryRooms[0] || { id: null, name: "-" };
            const division = this.divisionMap[div.name];
            
            this.timetable[day][div.name].push({
              slot: slotId,
              time: slotInfo.time,
              subject_id: null,
              subject_code: "FREE",
              subject_name: "FREE PERIOD",
              type: "zero",
              room_id: room.id,
              room_name: room.name,
              faculty_id: null,
              faculty_name: "-",
              batch: "Full Division",
              batch_id: null,
              division: div.name,
              division_id: division.id,
              day: day
            });
          }
        });
      });
    });
  }

  // ============================================================
  // INSERT BREAKS
  // ============================================================
  insertBreaks() {
    const breakSlots = this.slots.filter(s => s.type === "break");
    const extraSlots = this.slots.filter(s => s.type === "extra");

    this.days.forEach(day => {
      this.divisions.forEach(div => {
        breakSlots.forEach(bs => {
          this.timetable[day][div.name].push({
            slot: bs.id,
            time: bs.time,
            subject_id: null,
            subject_code: "BREAK",
            subject_name: "BREAK",
            type: "break",
            room_id: null,
            room_name: "-",
            faculty_id: null,
            faculty_name: "-",
            batch: "-",
            batch_id: null,
            division: div.name,
            division_id: this.divisionMap[div.name].id,
            day: day
          });
        });

        extraSlots.forEach(es => {
          this.timetable[day][div.name].push({
            slot: es.id,
            time: es.time,
            subject_id: null,
            subject_code: "FREE",
            subject_name: "FREE PERIOD",
            type: "zero",
            room_id: null,
            room_name: "-",
            faculty_id: null,
            faculty_name: "-",
            batch: "Full Division",
            batch_id: null,
            division: div.name,
            division_id: this.divisionMap[div.name].id,
            day: day
          });
        });

        this.timetable[day][div.name].sort((a, b) => a.slot - b.slot);
      });
    });
  }

  // ============================================================
  // GENERATE TIMETABLE
  // ============================================================
  generate() {
    console.log('🚀 Starting timetable generation...');
    this.scheduleTests();
    this.scheduleLabs();
    this.scheduleTheory();
    this.postProcess();
    this.fillGaps();
    this.insertBreaks();
    console.log('✅ Timetable generation complete');
    return this.timetable;
  }

  // ============================================================
  // GET ALL SESSIONS WITH IDS
  // ============================================================
  getAllSessionsWithIds() {
    const allSessions = [];
    Object.keys(this.timetable).forEach(day => {
      Object.keys(this.timetable[day]).forEach(division => {
        this.timetable[day][division].forEach(session => {
          allSessions.push(session);
        });
      });
    });
    return allSessions;
  }
}

// ============================================================
// DATABASE LOADER
// ============================================================
async function loadDataFromDB() {
  const client = await pool.connect();
  try {
    const roomsRes = await client.query('SELECT * FROM rooms');
    const rooms = roomsRes.rows;
    console.log('🏛️ Rooms:', rooms.map(r => `${r.name} (ID: ${r.id})`).join(', '));

    const facultyRes = await client.query(
      'SELECT id, name FROM users WHERE role = $1',
      ['faculty']
    );
    const faculty = facultyRes.rows;
    console.log('👨‍🏫 Faculty:', faculty.map(f => `${f.name} (ID: ${f.id})`).join(', '));

    const subjectsRes = await client.query(`
      SELECT s.*, fs.faculty_id 
      FROM subjects s 
      LEFT JOIN faculty_subjects fs ON s.id = fs.subject_id
    `);
    const subjects = subjectsRes.rows;
    console.log('📚 Subjects:', subjects.map(s => `${s.name} (ID: ${s.id}, Faculty: ${s.faculty_id || 'none'})`).join(', '));

    const divisionsRes = await client.query('SELECT * FROM divisions');
    const divisions = divisionsRes.rows;
    console.log('📌 Divisions:', divisions.map(d => `${d.name} (ID: ${d.id})`).join(', '));

    const batchesRes = await client.query(`
      SELECT b.*, d.name as division 
      FROM batches b 
      JOIN divisions d ON b.division_id = d.id
    `);
    const batches = batchesRes.rows;
    console.log('👥 Batches:', batches.map(b => `${b.name} (ID: ${b.id}, Div: ${b.division})`).join(', '));

    return { rooms, faculty, subjects, divisions, batches };
  } finally {
    client.release();
  }
}

// ============================================================
// SAVE TIMETABLE TO DB
// ── Changed from original: added name→ID fallback resolution
//    for sessions that were manually added via the admin UI
//    (those arrive with names but no IDs).
// ============================================================
async function saveTimetableToDB(timetable) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query('DELETE FROM timetable');
    console.log('🗑️ Cleared existing timetable');

    const insertQuery = `
      INSERT INTO timetable 
      (day, slot_id, division_id, batch_id, subject_id, faculty_id, room_id, created_at) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    `;

    let insertCount = 0;
    let sessionCount = 0;

    Object.keys(timetable).forEach(day => {
      Object.keys(timetable[day]).forEach(division => {
        sessionCount += timetable[day][division].length;
      });
    });
    console.log(`📊 Total sessions to process: ${sessionCount}`);

    for (const day in timetable) {
      for (const divisionName in timetable[day]) {
        const sessions = timetable[day][divisionName];

        // Resolve division ID once per division per day
        const divisionRes = await client.query(
          'SELECT id FROM divisions WHERE name = $1',
          [divisionName]
        );
        const divisionId = divisionRes.rows[0]?.id;

        if (!divisionId) {
          console.warn(`⚠️ Division ${divisionName} not found, skipping`);
          continue;
        }

        for (const session of sessions) {
          // Skip break and zero periods — not stored in DB
          if (session.type === 'break' || session.type === 'zero') {
            continue;
          }

          // ── Resolve subject ID ──────────────────────────────
          let subjectId = session.subject_id ?? null;
          if (!subjectId) {
            const name = session.subject_name ?? session.subject ?? null;
            if (name) {
              const r = await client.query(
                'SELECT id FROM subjects WHERE name = $1',
                [name]
              );
              subjectId = r.rows[0]?.id ?? null;
            }
          }

          // ── Resolve faculty ID ──────────────────────────────
          let facultyId = session.faculty_id ?? null;
          if (!facultyId) {
            const name = session.faculty_name ?? session.faculty ?? null;
            if (name && name !== '-' && name !== 'NULL') {
              const r = await client.query(
                "SELECT id FROM users WHERE name = $1 AND role = 'faculty'",
                [name]
              );
              facultyId = r.rows[0]?.id ?? null;
            }
          }

          // ── Resolve room ID ─────────────────────────────────
          let roomId = session.room_id ?? null;
          if (!roomId) {
            const name = session.room_name ?? session.room ?? null;
            if (name && name !== '-') {
              const r = await client.query(
                'SELECT id FROM rooms WHERE name = $1',
                [name]
              );
              roomId = r.rows[0]?.id ?? null;
            }
          }

          // ── Resolve batch ID ────────────────────────────────
          let batchId = session.batch_id ?? null;
          if (!batchId) {
            const name = session.batch_name ?? session.batch ?? null;
            if (name && name !== 'Full Division' && name !== '-' && name !== 'NULL') {
              if (session.batch_id) {
                batchId = session.batch_id;
              } else {
                const r = await client.query(
                  'SELECT id FROM batches WHERE name = $1',
                  [name]
                );
                batchId = r.rows[0]?.id ?? null;
              }
            }
          }

          await client.query(insertQuery, [
            session.day || day,
            session.slot,
            divisionId,
            batchId,
            subjectId,
            facultyId,
            roomId,
          ]);

          insertCount++;
          if (insertCount % 10 === 0) {
            console.log(`📊 Progress: ${insertCount}/${sessionCount} records inserted`);
          }
        }
      }
    }

    await client.query('COMMIT');
    console.log(`✅ ${insertCount} timetable entries saved to database`);

    const verifyRes = await client.query('SELECT COUNT(*) as count FROM timetable');
    console.log(`🔍 Verification: ${verifyRes.rows[0].count} records in timetable table`);

    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error saving timetable to database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// ============================================================
// MAIN GENERATION FUNCTION
// ============================================================
async function generateTimetable() {
  try {
    console.log('\n📥 Loading data from database...');
    const data = await loadDataFromDB();
    
    console.log('\n⚙️ Generating timetable...');
    const engine = new TimetableEngine(data);
    const timetable = engine.generate();
    
    const sessionsWithIds = engine.getAllSessionsWithIds();
    console.log(`\n📊 Generated ${sessionsWithIds.length} sessions`);
    
    console.log('\n📝 Sample sessions with IDs:');
    let sampleCount = 0;
    for (const day in timetable) {
      for (const division in timetable[day]) {
        const sessions = timetable[day][division];
        for (const session of sessions) {
          if (sampleCount < 5 && session.type !== 'break' && session.type !== 'zero') {
            console.log(`   - ${day} ${division}: ${session.subject_name} (Subj:${session.subject_id}, Fac:${session.faculty_id}, Room:${session.room_id})`);
            sampleCount++;
          }
        }
      }
    }
    
    return timetable;
  } catch (error) {
    console.error('❌ Error in timetable generation:', error);
    throw error;
  }
}

// ============================================================
// VIEW TIMETABLE
// ============================================================
async function viewTimetable() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT 
        t.id,
        t.day,
        t.slot_id,
        s.name as subject_name,
        s.type as subject_type,
        u.name as faculty_name,
        r.name as room_name,
        d.name as division_name,
        b.name as batch_name
      FROM timetable t
      LEFT JOIN subjects s ON t.subject_id = s.id
      LEFT JOIN users u ON t.faculty_id = u.id
      LEFT JOIN rooms r ON t.room_id = r.id
      LEFT JOIN divisions d ON t.division_id = d.id
      LEFT JOIN batches b ON t.batch_id = b.id
      ORDER BY 
        CASE t.day
          WHEN 'Monday'    THEN 1
          WHEN 'Tuesday'   THEN 2
          WHEN 'Wednesday' THEN 3
          WHEN 'Thursday'  THEN 4
          WHEN 'Friday'    THEN 5
          ELSE 6
        END,
        t.slot_id
    `);
    
    const rows = res.rows;
    
    console.log('\n📅 Current Timetable in Database:');
    console.log('='.repeat(100));
    
    let currentDay = '';
    rows.forEach(row => {
      if (row.day !== currentDay) {
        currentDay = row.day;
        console.log(`\n📌 ${currentDay}:`);
        console.log('-'.repeat(100));
      }
      console.log(
        `   Slot ${String(row.slot_id).padEnd(2)} | ` +
        `${(row.subject_name || 'FREE').padEnd(14)} | ` +
        `${(row.subject_type || 'free').padEnd(7)} | ` +
        `Room: ${(row.room_name || '-').padEnd(5)} | ` +
        `Faculty: ${(row.faculty_name || '-').padEnd(16)} | ` +
        `Div: ${row.division_name} | ` +
        `Batch: ${row.batch_name || 'Full'}`
      );
    });
    
    console.log('\n' + '='.repeat(100));
    console.log(`Total entries: ${rows.length}`);
    
    return rows;
  } finally {
    client.release();
  }
}

// ============================================================
// EXPORTS
// ============================================================
module.exports = {
  generateTimetable,
  saveTimetableToDB,
  viewTimetable,
  TimetableEngine,
  loadDataFromDB
};

// ============================================================
// TEST RUNNER (if run directly)
// ============================================================
if (require.main === module) {
  require('dotenv').config();
  
  const args = process.argv.slice(2);
  
  if (args[0] === 'view') {
    viewTimetable().then(() => process.exit(0));
  } else {
    (async () => {
      try {
        const timetable = await generateTimetable();
        await saveTimetableToDB(timetable);
        
        console.log('\n📋 To view the timetable, run:');
        console.log('   node timetable.js view');
        
        process.exit(0);
      } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
      }
    })();
  }
}
