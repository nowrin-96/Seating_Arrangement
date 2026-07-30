import bcrypt from 'bcryptjs';

/**
 * CLASSROOM SEATING & STUDENT DATA TEMPLATE
 * 
 * 4 Columns (C1, C2, C3, C4) with 5 Benches each = 20 Benches Total
 * C1 (Girls): 5 Benches (13 Seats: C1 B1(3), C1 B2(3), C1 B3(3), C1 B4(2), C1 B5(2))
 * C2, C3, C4 (Boys): 15 Benches (42 Seats)
 */

export const INITIAL_CONFIG = {
  rotation_start_date: '2026-07-26'
};

export const INITIAL_ADMIN = {
  username: 'admin',
  passwordHash: bcrypt.hashSync('admin123', 10)
};

// 20 BENCHES TOTAL (4 Columns x 5 Benches)
export const INITIAL_BENCHES = [
  // COLUMN C1 (GIRLS - 5 Benches, 13 Seats Total)
  { id: 1, name: 'C1 B1', gender: 'female', column: 'C1', capacity: 3, position: 0 },
  { id: 2, name: 'C1 B2', gender: 'female', column: 'C1', capacity: 3, position: 1 },
  { id: 3, name: 'C1 B3', gender: 'female', column: 'C1', capacity: 3, position: 2 },
  { id: 4, name: 'C1 B4', gender: 'female', column: 'C1', capacity: 2, position: 3 },
  { id: 5, name: 'C1 B5', gender: 'female', column: 'C1', capacity: 2, position: 4 },

  // COLUMN C2 (BOYS - 5 Benches, 15 Seats Total)
  { id: 6, name: 'C2 B1', gender: 'male', column: 'C2', capacity: 3, position: 0 },
  { id: 7, name: 'C2 B2', gender: 'male', column: 'C2', capacity: 3, position: 1 },
  { id: 8, name: 'C2 B3', gender: 'male', column: 'C2', capacity: 3, position: 2 },
  { id: 9, name: 'C2 B4', gender: 'male', column: 'C2', capacity: 3, position: 3 },
  { id: 10, name: 'C2 B5', gender: 'male', column: 'C2', capacity: 3, position: 4 },

  // COLUMN C3 (BOYS - 5 Benches, 15 Seats Total)
  { id: 11, name: 'C3 B1', gender: 'male', column: 'C3', capacity: 3, position: 5 },
  { id: 12, name: 'C3 B2', gender: 'male', column: 'C3', capacity: 3, position: 6 },
  { id: 13, name: 'C3 B3', gender: 'male', column: 'C3', capacity: 3, position: 7 },
  { id: 14, name: 'C3 B4', gender: 'male', column: 'C3', capacity: 3, position: 8 },
  { id: 15, name: 'C3 B5', gender: 'male', column: 'C3', capacity: 3, position: 9 },

  // COLUMN C4 (BOYS - 5 Benches, 12 Seats Total)
  { id: 16, name: 'C4 B1', gender: 'male', column: 'C4', capacity: 3, position: 10 },
  { id: 17, name: 'C4 B2', gender: 'male', column: 'C4', capacity: 3, position: 11 },
  { id: 18, name: 'C4 B3', gender: 'male', column: 'C4', capacity: 2, position: 12 },
  { id: 19, name: 'C4 B4', gender: 'male', column: 'C4', capacity: 2, position: 13 },
  { id: 20, name: 'C4 B5', gender: 'male', column: 'C4', capacity: 2, position: 14 }
];

// 13 REAL GIRLS ACCOUNTS & PASSWORDS
const GIRLS_DATA = [
  { full_name: 'Aleena Denny', roll_number: '7', username: 'Aleena Denny', pass: '7_aleena', bench_id: 1 },
  { full_name: 'Almaz Elsa Saji', roll_number: '9', username: 'Almaz Elsa Saji', pass: '9_almaz', bench_id: 1 },
  { full_name: 'Anjana Shiji', roll_number: '13', username: 'Anjana Shiji', pass: '13_anjana', bench_id: 1 },
  { full_name: 'Areena Mariya Saji', roll_number: '17', username: 'Areena Mariya Saji', pass: '17_areena', bench_id: 2 },
  { full_name: 'Elizabeth Joby', roll_number: '24', username: 'Elizabeth Joby', pass: '24_elizabeth', bench_id: 2 },
  { full_name: 'Fina Shaju', roll_number: '26', username: 'Fina Shaju', pass: '26_fina', bench_id: 2 },
  { full_name: 'Freya Parveen Marikar', roll_number: '27', username: 'Freya Parveen Marikar', pass: '27_freya', bench_id: 3 },
  { full_name: 'Hanan Fathima NS', roll_number: '29', username: 'Hanan Fathima NS', pass: '29_hanan', bench_id: 3 },
  { full_name: 'Liya Regi', roll_number: '39', username: 'Liya Regi', pass: '39_liya', bench_id: 3 },
  { full_name: 'Nowrin Fathima', roll_number: '45', username: 'Nowrin Fathima', pass: '45_nowrin', bench_id: 4 },
  { full_name: 'Princy Elin Mathew', roll_number: '48', username: 'Princy Elin Mathew', pass: '48_princy', bench_id: 4 },
  { full_name: 'Rose Brijit Abey', roll_number: '50', username: 'Rose Brijit Abey', pass: '50_rose', bench_id: 5 },
  { full_name: 'Saniya Mary J', roll_number: '52', username: 'Saniya Mary J', pass: '52_saniya', bench_id: 5 }
];

// 42 REAL BOYS ACCOUNTS & PASSWORDS
const BOYS_DATA = [
  { full_name: 'AANS THOMAS', roll_number: '1', username: 'AANS THOMAS', pass: '1_aans', bench_id: 6 },
  { full_name: 'ABHISHEK A', roll_number: '2', username: 'ABHISHEK A', pass: '2_abhishek', bench_id: 6 },
  { full_name: 'ADARSH R', roll_number: '3', username: 'ADARSH R', pass: '3_adarsh', bench_id: 6 },
  { full_name: 'ADHITHYAN ANILKUMAR', roll_number: '4', username: 'ADHITHYAN ANILKUMAR', pass: '4_adhithyan', bench_id: 7 },
  { full_name: 'ADWAITH RATHEESH', roll_number: '5', username: 'ADWAITH RATHEESH', pass: '5_adwaith', bench_id: 7 },
  { full_name: 'ALAN TOM JAMES', roll_number: '6', username: 'ALAN TOM JAMES', pass: '6_alan', bench_id: 7 },
  { full_name: 'ALEN MATHEW', roll_number: '8', username: 'ALEN MATHEW', pass: '8_alen', bench_id: 8 },
  { full_name: 'ALOSHY ANTONY', roll_number: '10', username: 'ALOSHY ANTONY', pass: '10_aloshy', bench_id: 8 },
  { full_name: 'AMAL BINOY', roll_number: '11', username: 'AMAL BINOY', pass: '11_amal', bench_id: 8 },
  { full_name: 'AMAL JEES GEORGE', roll_number: '12', username: 'AMAL JEES GEORGE', pass: '12_amal', bench_id: 9 },
  { full_name: 'ANTO BOBAN', roll_number: '14', username: 'ANTO BOBAN', pass: '14_anto', bench_id: 9 },
  { full_name: 'ANWIN RAJU GEORGE', roll_number: '15', username: 'ANWIN RAJU GEORGE', pass: '15_anwin', bench_id: 9 },
  { full_name: 'ARAVINDH ANOJ', roll_number: '16', username: 'ARAVINDH ANOJ', pass: '16_aravindh', bench_id: 10 },
  { full_name: 'ARUN P GEORGEKUTTY', roll_number: '18', username: 'ARUN P GEORGEKUTTY', pass: '18_arun', bench_id: 10 },
  { full_name: 'BEN ABY GEORGE', roll_number: '19', username: 'BEN ABY GEORGE', pass: '19_ben', bench_id: 10 },
  { full_name: 'BEN SIJO', roll_number: '20', username: 'BEN SIJO', pass: '20_ben', bench_id: 11 },
  { full_name: 'BINTO BENNY', roll_number: '21', username: 'BINTO BENNY', pass: '21_binto', bench_id: 11 },
  { full_name: 'BREJITH R MATHEW', roll_number: '22', username: 'BREJITH R MATHEW', pass: '22_brejith', bench_id: 11 },
  { full_name: 'DEYON MATHEW', roll_number: '23', username: 'DEYON MATHEW', pass: '23_deyon', bench_id: 12 },
  { full_name: 'FEBIN JOSE PHILIP', roll_number: '25', username: 'FEBIN JOSE PHILIP', pass: '25_febin', bench_id: 12 },
  { full_name: 'GEO GIJI', roll_number: '28', username: 'GEO GIJI', pass: '28_geo', bench_id: 12 },
  { full_name: 'HARIKRISHNA A J', roll_number: '30', username: 'HARIKRISHNA A J', pass: '30_harikrishna', bench_id: 13 },
  { full_name: 'HARIKRISHNAN M', roll_number: '31', username: 'HARIKRISHNAN M', pass: '31_harikrishnan', bench_id: 13 },
  { full_name: 'JACKSON THOMAS', roll_number: '32', username: 'JACKSON THOMAS', pass: '32_jackson', bench_id: 13 },
  { full_name: 'JAKE JOHN', roll_number: '33', username: 'JAKE JOHN', pass: '33_jake', bench_id: 14 },
  { full_name: 'JISSON JAISON', roll_number: '34', username: 'JISSON JAISON', pass: '34_jisson', bench_id: 14 },
  { full_name: 'JOEL TOM VARGHESE', roll_number: '35', username: 'JOEL TOM VARGHESE', pass: '35_joel', bench_id: 14 },
  { full_name: 'JOSHUA JOMON', roll_number: '36', username: 'JOSHUA JOMON', pass: '36_joshua', bench_id: 15 },
  { full_name: 'JOYAL REJI', roll_number: '37', username: 'JOYAL REJI', pass: '37_joyal', bench_id: 15 },
  { full_name: 'LEO LENY JOHN', roll_number: '38', username: 'LEO LENY JOHN', pass: '38_leo', bench_id: 15 },
  { full_name: 'MIDHUN JOSE', roll_number: '40', username: 'MIDHUN JOSE', pass: '40_midhun', bench_id: 16 },
  { full_name: 'MIDHUN MATHEW', roll_number: '41', username: 'MIDHUN MATHEW', pass: '41_midhun', bench_id: 16 },
  { full_name: 'MILAN ABHILASH', roll_number: '42', username: 'MILAN ABHILASH', pass: '42_milan', bench_id: 16 },
  { full_name: 'NIDHIN S M', roll_number: '43', username: 'NIDHIN S M', pass: '43_nidhin', bench_id: 17 },
  { full_name: 'NIMAL SEBASTIAN JOSEPH', roll_number: '44', username: 'NIMAL SEBASTIAN JOSEPH', pass: '44_nimal', bench_id: 17 },
  { full_name: 'NOYAL JOSE BIJOY', roll_number: '46', username: 'NOYAL JOSE BIJOY', pass: '46_noyal', bench_id: 17 },
  { full_name: 'P VAISHNAV', roll_number: '47', username: 'P VAISHNAV', pass: '47_vaishnav', bench_id: 18 },
  { full_name: 'RON N PRADEESH', roll_number: '49', username: 'RON N PRADEESH', pass: '49_ron', bench_id: 18 },
  { full_name: 'SABARINATH S', roll_number: '51', username: 'SABARINATH S', pass: '51_sabarinath', bench_id: 19 },
  { full_name: 'SHONE ABRAHAM', roll_number: '53', username: 'SHONE ABRAHAM', pass: '53_shone', bench_id: 19 },
  { full_name: 'TONY THOMAS', roll_number: '54', username: 'TONY THOMAS', pass: '54_tony', bench_id: 20 },
  { full_name: 'VINEK VINOD', roll_number: '55', username: 'VINEK VINOD', pass: '55_vinek', bench_id: 20 }
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
    username: b.username,
    passwordHash: bcrypt.hashSync(b.pass, 10),
    full_name: b.full_name,
    roll_number: b.roll_number,
    gender: 'male',
    bench_id: b.bench_id
  }))
];
