import bcrypt from 'bcryptjs';

/**
 * CLASSROOM SEATING & STUDENT DATA
 * 
 * 13 Real Girls Accounts + 42 Boys Accounts
 */

export const INITIAL_CONFIG = {
  rotation_start_date: '2026-07-26'
};

export const INITIAL_ADMIN = {
  username: 'admin',
  passwordHash: bcrypt.hashSync('admin123', 10)
};

// 21 Benches Total: 6 Girls' Benches (13 seats) + 15 Boys' Benches (42 seats)
export const INITIAL_BENCHES = [
  // 6 GIRLS' BENCHES (Capacity total = 13 seats for 13 girls)
  { id: 1, name: 'B1', gender: 'female', capacity: 2, position: 0 },
  { id: 2, name: 'B2', gender: 'female', capacity: 2, position: 1 },
  { id: 3, name: 'B3', gender: 'female', capacity: 2, position: 2 },
  { id: 4, name: 'B4', gender: 'female', capacity: 2, position: 3 },
  { id: 5, name: 'B5', gender: 'female', capacity: 2, position: 4 },
  { id: 6, name: 'B6', gender: 'female', capacity: 3, position: 5 },

  // 15 BOYS' BENCHES (Capacity total = 42 seats for 42 boys)
  { id: 7, name: 'B7', gender: 'male', capacity: 3, position: 0 },
  { id: 8, name: 'B8', gender: 'male', capacity: 3, position: 1 },
  { id: 9, name: 'B9', gender: 'male', capacity: 3, position: 2 },
  { id: 10, name: 'B10', gender: 'male', capacity: 3, position: 3 },
  { id: 11, name: 'B11', gender: 'male', capacity: 3, position: 4 },
  { id: 12, name: 'B12', gender: 'male', capacity: 3, position: 5 },
  { id: 13, name: 'B13', gender: 'male', capacity: 3, position: 6 },
  { id: 14, name: 'B14', gender: 'male', capacity: 3, position: 7 },
  { id: 15, name: 'B15', gender: 'male', capacity: 3, position: 8 },
  { id: 16, name: 'B16', gender: 'male', capacity: 3, position: 9 },
  { id: 17, name: 'B17', gender: 'male', capacity: 3, position: 10 },
  { id: 18, name: 'B18', gender: 'male', capacity: 3, position: 11 },
  { id: 19, name: 'B19', gender: 'male', capacity: 2, position: 12 },
  { id: 20, name: 'B20', gender: 'male', capacity: 2, position: 13 },
  { id: 21, name: 'B21', gender: 'male', capacity: 2, position: 14 }
];

// 13 REAL GIRLS ACCOUNTS & PASSWORDS
const GIRLS_DATA = [
  { full_name: 'Aleena Denny', roll_number: '7', username: 'Aleena Denny', pass: '7_aleena', bench_id: 1 },
  { full_name: 'Almaz Elsa Saji', roll_number: '9', username: 'Almaz Elsa Saji', pass: '9_almaz', bench_id: 1 },
  { full_name: 'Anjana Shiji', roll_number: '13', username: 'Anjana Shiji', pass: '13_anjana', bench_id: 2 },
  { full_name: 'Areena Mariya Saji', roll_number: '17', username: 'Areena Mariya Saji', pass: '17_areena', bench_id: 2 },
  { full_name: 'Elizabeth Joby', roll_number: '24', username: 'Elizabeth Joby', pass: '24_elizabeth', bench_id: 3 },
  { full_name: 'Fina Shaju', roll_number: '26', username: 'Fina Shaju', pass: '26_fina', bench_id: 3 },
  { full_name: 'Freya Parveen Marikar', roll_number: '27', username: 'Freya Parveen Marikar', pass: '27_freya', bench_id: 4 },
  { full_name: 'Hanan Fathima NS', roll_number: '29', username: 'Hanan Fathima NS', pass: '29_hanan', bench_id: 4 },
  { full_name: 'Liya Regi', roll_number: '39', username: 'Liya Regi', pass: '39_liya', bench_id: 5 },
  { full_name: 'Nowrin Fathima', roll_number: '45', username: 'Nowrin Fathima', pass: '45_nowrin', bench_id: 5 },
  { full_name: 'Princy Elin Mathew', roll_number: '48', username: 'Princy Elin Mathew', pass: '48_princy', bench_id: 6 },
  { full_name: 'Rose Brijit Abey', roll_number: '50', username: 'Rose Brijit Abey', pass: '50_rose', bench_id: 6 },
  { full_name: 'Saniya Mary J', roll_number: '52', username: 'Saniya Mary J', pass: '52_saniya', bench_id: 6 }
];

const defaultBoyPasswordHash = bcrypt.hashSync('student123', 10);

// 42 BOYS ACCOUNTS
const BOYS_DATA = [
  { full_name: 'Liam Smith', roll_number: 'M101', bench_id: 7 },
  { full_name: 'Noah Johnson', roll_number: 'M102', bench_id: 7 },
  { full_name: 'Ethan Brown', roll_number: 'M103', bench_id: 7 },
  { full_name: 'Lucas Jones', roll_number: 'M104', bench_id: 8 },
  { full_name: 'Mason Garcia', roll_number: 'M105', bench_id: 8 },
  { full_name: 'Oliver Miller', roll_number: 'M106', bench_id: 8 },
  { full_name: 'Elijah Davis', roll_number: 'M107', bench_id: 9 },
  { full_name: 'Logan Rodriguez', roll_number: 'M108', bench_id: 9 },
  { full_name: 'James Martinez', roll_number: 'M109', bench_id: 9 },
  { full_name: 'Alexander Hernandez', roll_number: 'M110', bench_id: 10 },
  { full_name: 'Benjamin Lopez', roll_number: 'M111', bench_id: 10 },
  { full_name: 'Henry Gonzalez', roll_number: 'M112', bench_id: 10 },
  { full_name: 'Sebastian Wilson', roll_number: 'M113', bench_id: 11 },
  { full_name: 'Jack Anderson', roll_number: 'M114', bench_id: 11 },
  { full_name: 'Owen Thomas', roll_number: 'M115', bench_id: 11 },
  { full_name: 'Daniel Taylor', roll_number: 'M116', bench_id: 12 },
  { full_name: 'Matthew Moore', roll_number: 'M117', bench_id: 12 },
  { full_name: 'Samuel Jackson', roll_number: 'M118', bench_id: 12 },
  { full_name: 'David Martin', roll_number: 'M119', bench_id: 13 },
  { full_name: 'Joseph Lee', roll_number: 'M120', bench_id: 13 },
  { full_name: 'Carter Perez', roll_number: 'M121', bench_id: 13 },
  { full_name: 'Wyatt Thompson', roll_number: 'M122', bench_id: 14 },
  { full_name: 'Jayden White', roll_number: 'M123', bench_id: 14 },
  { full_name: 'Gabriel Harris', roll_number: 'M124', bench_id: 14 },
  { full_name: 'Julian Sanchez', roll_number: 'M125', bench_id: 15 },
  { full_name: 'Luke Clark', roll_number: 'M126', bench_id: 15 },
  { full_name: 'Anthony Ramirez', roll_number: 'M127', bench_id: 15 },
  { full_name: 'Isaac Lewis', roll_number: 'M128', bench_id: 16 },
  { full_name: 'Dylan Robinson', roll_number: 'M129', bench_id: 16 },
  { full_name: 'Leo Walker', roll_number: 'M130', bench_id: 16 },
  { full_name: 'Henry Young', roll_number: 'M131', bench_id: 17 },
  { full_name: 'Hudson Allen', roll_number: 'M132', bench_id: 17 },
  { full_name: 'Charles King', roll_number: 'M133', bench_id: 17 },
  { full_name: 'Thomas Wright', roll_number: 'M134', bench_id: 18 },
  { full_name: 'Caleb Scott', roll_number: 'M135', bench_id: 18 },
  { full_name: 'Ryan Torres', roll_number: 'M136', bench_id: 18 },
  { full_name: 'Adrian Nguyen', roll_number: 'M137', bench_id: 19 },
  { full_name: 'Eli Hill', roll_number: 'M138', bench_id: 19 },
  { full_name: 'Nolan Flores', roll_number: 'M139', bench_id: 20 },
  { full_name: 'Aaron Green', roll_number: 'M140', bench_id: 20 },
  { full_name: 'Ezra Adams', roll_number: 'M141', bench_id: 21 },
  { full_name: 'Maverick Baker', roll_number: 'M142', bench_id: 21 }
];

export const INITIAL_STUDENTS = [
  ...GIRLS_DATA.map((g, idx) => ({
    id: idx + 1,
    username: g.username,
    passwordHash: bcrypt.hashSync(g.pass, 10),
    full_name: g.full_name,
    roll_number: g.roll_number,
    gender: 'female',
    bench_id: g.bench_id
  })),
  ...BOYS_DATA.map((b, idx) => ({
    id: idx + 14,
    username: `m_student${idx + 1}`,
    passwordHash: defaultBoyPasswordHash,
    full_name: b.full_name,
    roll_number: b.roll_number,
    gender: 'male',
    bench_id: b.bench_id
  }))
];
