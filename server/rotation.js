/**
 * Weekly Bench Rotation & Dynamic Classmate Shuffling Logic
 */

function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function stringToSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

function getWeekIndex(startDateStr, targetDateStr) {
  const start = new Date(startDateStr);
  const target = new Date(targetDateStr);
  
  const startUtc = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const targetUtc = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());
  
  const diffDays = Math.floor((targetUtc - startUtc) / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7);
}

function getWeeklyShuffledStudents(students, gender, weekIndex) {
  if (weekIndex === 0) {
    return [...students];
  }

  const list = [...students];
  const seed = stringToSeed(`shuffle_${gender}_week_${weekIndex}`);
  const rng = mulberry32(seed);

  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }

  return list;
}

function getSeatingForGender(genderBenches, studentsInGender, weekIndex, gender) {
  const n = genderBenches.length;
  if (n === 0) return [];

  const sortedBenches = [...genderBenches].sort((a, b) => a.position - b.position);

  if (weekIndex === 0) {
    const studentsByBench = {};
    sortedBenches.forEach(b => { studentsByBench[b.id] = []; });
    studentsInGender.forEach(s => {
      if (studentsByBench[s.bench_id]) {
        studentsByBench[s.bench_id].push(s);
      }
    });

    return sortedBenches.map(bench => ({
      physical_bench: bench,
      students: studentsByBench[bench.id] || []
    }));
  } else {
    const orderedStudents = getWeeklyShuffledStudents(studentsInGender, gender, weekIndex);

    let studentPointer = 0;
    return sortedBenches.map(bench => {
      const benchStudents = orderedStudents.slice(studentPointer, studentPointer + bench.capacity);
      studentPointer += bench.capacity;

      return {
        physical_bench: bench,
        students: benchStudents.map(s => ({
          id: s.id,
          username: s.username,
          full_name: s.full_name,
          roll_number: s.roll_number,
          gender: s.gender,
          orig_bench_id: s.bench_id
        }))
      };
    });
  }
}

function getStudentCurrentBench(student, allGenderBenches, allGenderStudents, weekIndex) {
  const seating = getSeatingForGender(allGenderBenches, allGenderStudents, weekIndex, student.gender);
  
  let currentMatch = null;
  for (const entry of seating) {
    const found = entry.students.find(s => s.id === student.id);
    if (found) {
      currentMatch = entry;
      break;
    }
  }

  if (!currentMatch) return null;

  return {
    physical_bench: currentMatch.physical_bench,
    week_index: weekIndex,
    students: currentMatch.students.map(s => ({
      id: s.id,
      full_name: s.full_name,
      roll_number: s.roll_number,
      is_current_user: s.id === student.id
    }))
  };
}

module.exports = {
  getWeekIndex,
  getSeatingForGender,
  getStudentCurrentBench
};
