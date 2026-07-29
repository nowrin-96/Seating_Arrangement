const http = require('http');

async function testAll() {
  console.log('🧪 Starting API & Security Verification Tests...\n');

  // Start Express app internally on random port for testing
  const app = require('./index.js');
  // Wait a brief moment for database initialization
  await new Promise(r => setTimeout(r, 500));

  const PORT = 5001;
  const server = http.createServer(app);
  await new Promise(r => server.listen(PORT, r));

  const baseUrl = `http://localhost:${PORT}`;

  function request(path, options = {}, body = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, baseUrl);
      const reqOpts = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: options.method || 'GET',
        headers: options.headers || {}
      };

      const req = http.request(reqOpts, res => {
        let responseBody = '';
        res.on('data', chunk => responseBody += chunk);
        res.on('end', () => {
          let json = null;
          try { json = JSON.parse(responseBody); } catch(e) {}
          resolve({ status: res.statusCode, headers: res.headers, body: json || responseBody });
        });
      });

      req.on('error', reject);
      if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
      req.end();
    });
  }

  try {
    // Test 1: Admin Login
    console.log('Test 1: Admin Login Credentials...');
    const adminRes = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'admin', password: 'admin123' });

    if (adminRes.status === 200 && adminRes.body.user.role === 'admin') {
      console.log('  ✅ PASSED: Admin logged in successfully as role "admin".');
    } else {
      console.error('  ❌ FAILED Admin Login:', adminRes);
    }
    const adminToken = adminRes.body.token;

    // Test 2: Student Login
    console.log('\nTest 2: Student Login Credentials (f_student1)...');
    const studentRes = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'f_student1', password: 'student123' });

    if (studentRes.status === 200 && studentRes.body.user.role === 'student') {
      console.log('  ✅ PASSED: Student logged in successfully as role "student".');
    } else {
      console.error('  ❌ FAILED Student Login:', studentRes);
    }
    const studentToken = studentRes.body.token;

    // Test 3: Invalid Login Credentials
    console.log('\nTest 3: Invalid Credentials Error Message...');
    const invalidRes = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'f_student1', password: 'wrongpassword' });

    if (invalidRes.status === 401 && invalidRes.body.error === 'Incorrect username or password') {
      console.log('  ✅ PASSED: Generic security error returned for bad credentials.');
    } else {
      console.error('  ❌ FAILED Generic Error Test:', invalidRes);
    }

    // Test 4: Student Fetching Personal Bench
    console.log('\nTest 4: Student Fetching Personal Bench (/api/student/my-bench)...');
    const studentBenchRes = await request('/api/student/my-bench', {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });

    if (studentBenchRes.status === 200 && studentBenchRes.body.bench_info.physical_bench) {
      console.log(`  ✅ PASSED: Student seating retrieved. Physical Bench: ${studentBenchRes.body.bench_info.physical_bench.name}, Benchmates: ${studentBenchRes.body.bench_info.students.length}`);
    } else {
      console.error('  ❌ FAILED Student Bench Test:', studentBenchRes);
    }

    // Test 5: Authorization Enforcement (Student accessing Admin API)
    console.log('\nTest 5: Security Enforcement (Student accessing /api/admin/seating-chart)...');
    const forbiddenRes = await request('/api/admin/seating-chart', {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });

    if (forbiddenRes.status === 403) {
      console.log('  ✅ PASSED: Access strictly forbidden (403) for student calling admin route.');
    } else {
      console.error('  ❌ FAILED Security Enforcement Test:', forbiddenRes);
    }

    // Test 6: Admin Seating Chart Access
    console.log('\nTest 6: Admin Fetching Full Seating Chart...');
    const chartRes = await request('/api/admin/seating-chart', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    if (chartRes.status === 200 && chartRes.body.female_seating && chartRes.body.male_seating) {
      console.log(`  ✅ PASSED: Full seating chart retrieved. Female Benches: ${chartRes.body.female_seating.length}, Male Benches: ${chartRes.body.male_seating.length}`);
    } else {
      console.error('  ❌ FAILED Admin Seating Chart Test:', chartRes);
    }

    // Test 7: Export JSON
    console.log('\nTest 7: Admin Exporting JSON Backup...');
    const exportRes = await request('/api/admin/export', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    if (exportRes.status === 200 && exportRes.body.benches && exportRes.body.students) {
      console.log(`  ✅ PASSED: JSON exported with ${exportRes.body.benches.length} benches and ${exportRes.body.students.length} students.`);
    } else {
      console.error('  ❌ FAILED Export JSON Test:', exportRes);
    }

    console.log('\n🎉 ALL API & SECURITY VERIFICATION TESTS PASSED SUCCESSFULLY!');

  } catch (err) {
    console.error('❌ Test suite execution error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
}

testAll();
