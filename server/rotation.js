/**
 * Greedy Pair-Tracking Weekly Seating & Daily Shift Engine (Zero Repeat Benchmates)
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

function getPairKey(idA, idB) {
  return idA < idB ? `${idA}_${idB}` : `${idB}_${idA}`;
}

function getDaysDiff(startDateStr, targetDateStr) {
  const start = new Date(startDateStr);
  const target = new Date(targetDateStr);
  
  const startUtc = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const targetUtc = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());
  
  return Math.floor((targetUtc - startUtc) / (1000 * 60 * 60 * 24));
}

function getWeekIndex(startDateStr, targetDateStr) {
  const diffDays = getDaysDiff(startDateStr, targetDateStr);
  return Math.floor(diffDays / 7);
}

function computeWeeklySeatingSequence(students, benches, weekIndex, gender) {
  const genderStudents = [...students].filter(s => s.gender === gender)
    .sort((a, b) => (parseInt(a.roll_number) || 0) - (parseInt(b.roll_number) || 0));
  const genderBenches = [...benches].filter(b => b.gender === gender)
    .sort((a, b) => a.position - b.position);

  if (genderStudents.length === 0 || genderBenches.length === 0) return [];

  const pairHistory = {};
  let currentWeekArrangement = null;

  for (let w = 0; w <= weekIndex; w++) {
    if (w === 0) {
      const benchMap = [];
      let ptr = 0;
      genderBenches.forEach(bench => {
        const group = genderStudents.slice(ptr, ptr + bench.capacity);
        benchMap.push(group);
        ptr += bench.capacity;
      });

      benchMap.forEach(group => {
        for (let i = 0; i < group.length; i++) {
          for (let j = i + 1; j < group.length; j++) {
            const key = getPairKey(group[i].id, group[j].id);
            pairHistory[key] = (pairHistory[key] || 0) + 1;
          }
        }
      });

      if (w === weekIndex) currentWeekArrangement = benchMap;
    } else {
      let bestCandidate = null;
      let bestScore = Infinity;

      for (let cand = 1; cand <= 100; cand++) {
        const seed = stringToSeed(`cand_${gender}_w${w}_c${cand}`);
        const rng = mulberry32(seed);

        const candList = [...genderStudents];
        for (let i = candList.length - 1; i > 0; i--) {
          const j = Math.floor(rng() * (i + 1));
          [candList[i], candList[j]] = [candList[j], candList[i]];
        }

        const candidateGroups = [];
        let ptr = 0;
        genderBenches.forEach(bench => {
          candidateGroups.push(candList.slice(ptr, ptr + bench.capacity));
          ptr += bench.capacity;
        });

        let score = 0;
        candidateGroups.forEach(group => {
          for (let i = 0; i < group.length; i++) {
            for (let j = i + 1; j < group.length; j++) {
              const key = getPairKey(group[i].id, group[j].id);
              const pastCount = pairHistory[key] || 0;
              score += pastCount * 100 + pastCount * pastCount * 500;
            }
          }
        });

        if (score < bestScore) {
          bestScore = score;
          bestCandidate = candidateGroups;
          if (score === 0) break;
        }
      }

      bestCandidate.forEach(group => {
        for (let i = 0; i < group.length; i++) {
          for (let j = i + 1; j < group.length; j++) {
            const key = getPairKey(group[i].id, group[j].id);
            pairHistory[key] = (pairHistory[key] || 0) + 1;
          }
        }
      });

      if (w === weekIndex) currentWeekArrangement = bestCandidate;
    }
  }

  const resultStudents = [];
  currentWeekArrangement.forEach(group => {
    resultStudents.push(...group);
  });

  return resultStudents;
}

function getSeatingForGender(genderBenches, studentsInGender, weekIndex, dayIndex = 0, gender = 'male') {
  if (genderBenches.length === 0) return [];

  const sortedBenches = [...genderBenches].sort((a, b) => a.position - b.position);
  const weekStudents = computeWeeklySeatingSequence(studentsInGender, sortedBenches, weekIndex, gender);

  const benchGroups = [];
  let ptr = 0;
  sortedBenches.forEach(bench => {
    const occupantStudents = weekStudents.slice(ptr, ptr + bench.capacity);
    benchGroups.push({
      orig_bench: bench,
      column: bench.column || (gender === 'female' ? 'C1' : 'C2'),
      position: bench.position,
      students: occupantStudents
    });
    ptr += bench.capacity;
  });

  const columns = {};
  benchGroups.forEach(bg => {
    if (!columns[bg.column]) columns[bg.column] = [];
    columns[bg.column].push(bg);
  });

  const seating = [];

  Object.keys(columns).forEach(colName => {
    const colBenchGroups = columns[colName];
    const numBenchesInCol = colBenchGroups.length;
    const dailyOffset = ((dayIndex % numBenchesInCol) + numBenchesInCol) % numBenchesInCol;

    const colPhysicalBenches = sortedBenches
      .filter(b => b.column === colName)
      .sort((a, b) => a.position - b.position);

    colPhysicalBenches.forEach((physicalBench, p) => {
      const groupPos = ((p - dailyOffset) % numBenchesInCol + numBenchesInCol) % numBenchesInCol;
      const occupantGroup = colBenchGroups[groupPos];

      seating.push({
        physical_bench: physicalBench,
        column: colName,
        students: (occupantGroup && occupantGroup.students) ? occupantGroup.students.map(s => ({
          id: s.id,
          username: s.username,
          full_name: s.full_name,
          roll_number: s.roll_number,
          gender: s.gender,
          orig_bench_id: s.bench_id
        })) : []
      });
    });
  });

  return seating;
}

function getStudentCurrentBench(student, allGenderBenches, allGenderStudents, weekIndex, dayIndex = 0) {
  const seating = getSeatingForGender(allGenderBenches, allGenderStudents, weekIndex, dayIndex, student.gender);
  
  let currentMatch = null;
  for (const entry of seating) {
    const found = entry.students && entry.students.find(s => s.id === student.id);
    if (found) {
      currentMatch = entry;
      break;
    }
  }

  if (!currentMatch) return null;

  return {
    physical_bench: currentMatch.physical_bench,
    column: currentMatch.column,
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
  getDaysDiff,
  getSeatingForGender,
  getStudentCurrentBench
};
