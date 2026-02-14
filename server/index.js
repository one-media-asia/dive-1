import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { getDb, initDb } from './db.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
await initDb();

// Simple auth middleware (for now, accepts any request with a user-id header)
function authMiddleware(req, res, next) {
  req.userId = req.headers['x-user-id'] || 'user-1';
  next();
}

app.use(authMiddleware);

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// GET /api/groups - list all groups with leader and members
app.get('/api/groups', (req, res) => {
  const db = getDb();

  db.all(`
    SELECT id, name, type, leader_id, course_id, days, description, created_at FROM groups ORDER BY created_at DESC
  `, (err, groups) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: err.message });
    }

    // Fetch leader, course, and members for each group
    let processed = 0;
    const result = groups.map(g => ({ ...g, leader: null, course: null, members: [] }));

    if (groups.length === 0) {
      db.close();
      return res.json(result);
    }

    groups.forEach((group, i) => {
      // Fetch leader
      if (group.leader_id) {
        db.get('SELECT id, name FROM divers WHERE id = ?', [group.leader_id], (err, leader) => {
          if (!err && leader) result[i].leader = leader;
          processed++;
          if (processed === groups.length * 3) {
            db.close();
            res.json(result);
          }
        });
      } else {
        processed++;
      }

      // Fetch course
      if (group.course_id) {
        db.get('SELECT id, name, price FROM courses WHERE id = ?', [group.course_id], (err, course) => {
          if (!err && course) result[i].course = course;
          processed++;
          if (processed === groups.length * 3) {
            db.close();
            res.json(result);
          }
        });
      } else {
        processed++;
      }

      // Fetch members with diver info
      db.all(`
        SELECT gm.id, gm.role, d.id as diver_id, d.name
        FROM group_members gm
        JOIN divers d ON gm.diver_id = d.id
        WHERE gm.group_id = ?
      `, [group.id], (err, members) => {
        if (!err && members) {
          result[i].members = members.map(m => ({
            id: m.id,
            role: m.role,
            diver: { id: m.diver_id, name: m.name }
          }));
        }
        processed++;
        if (processed === groups.length * 3) {
          db.close();
          res.json(result);
        }
      });
    });
  });
});

// POST /api/groups - create a group
app.post('/api/groups', (req, res) => {
  const { name, type, leader_id, course_id, days, description } = req.body;
  const id = uuidv4();

  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  const db = getDb();
  db.run(
    'INSERT INTO groups (id, name, type, leader_id, course_id, days, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, name, type || 'fundive', leader_id || null, course_id || null, days || null, description || null],
    (err) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: err.message });
      }

      // Fetch and return the created group
      db.get('SELECT id, name, type, leader_id, course_id, days, description, created_at FROM groups WHERE id = ?', [id], (err, group) => {
        db.close();
        if (err) return res.status(500).json({ error: err.message });
        res.json({ 
          id: group.id, 
          name: group.name, 
          type: group.type,
          leader_id: group.leader_id, 
          course_id: group.course_id,
          days: group.days,
          description: group.description, 
          created_at: group.created_at, 
          leader: null, 
          course: null,
          members: [] 
        });
      });
    }
  );
});

// POST /api/groups/:groupId/members - add a member
app.post('/api/groups/:groupId/members', (req, res) => {
  const { diver_id, role } = req.body;
  const { groupId } = req.params;
  const id = uuidv4();

  if (!diver_id) {
    return res.status(400).json({ error: 'diver_id is required' });
  }

  const db = getDb();
  db.run(
    'INSERT INTO group_members (id, group_id, diver_id, role) VALUES (?, ?, ?, ?)',
    [id, groupId, diver_id, role || null],
    (err) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: err.message });
      }

      // Fetch and return the created member
      db.get(`
        SELECT gm.id, gm.role, d.id as diver_id, d.name
        FROM group_members gm
        JOIN divers d ON gm.diver_id = d.id
        WHERE gm.id = ?
      `, [id], (err, member) => {
        db.close();
        if (err) return res.status(500).json({ error: err.message });
        res.json({
          id: member.id,
          role: member.role,
          diver: { id: member.diver_id, name: member.name }
        });
      });
    }
  );
});

// DELETE /api/groups/:groupId/members/:memberId - remove a member
app.delete('/api/groups/:groupId/members/:memberId', (req, res) => {
  const { memberId } = req.params;

  const db = getDb();
  db.run('DELETE FROM group_members WHERE id = ?', [memberId], (err) => {
    db.close();
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true });
  });
});

// GET /api/divers - list all divers (for dropdowns)
app.get('/api/divers', (req, res) => {
  const db = getDb();

  db.all('SELECT * FROM divers ORDER BY name ASC', (err, divers) => {
    db.close();
    if (err) return res.status(500).json({ error: err.message });
    res.json(divers || []);
  });
});

// GET /api/divers/:id - get a specific diver
app.get('/api/divers/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();

  db.get('SELECT * FROM divers WHERE id = ?', [id], (err, diver) => {
    db.close();
    if (err) return res.status(500).json({ error: err.message });
    if (!diver) return res.status(404).json({ error: 'Diver not found' });
    res.json(diver);
  });
});

// POST /api/divers - create a diver
app.post('/api/divers', (req, res) => {
  const { name, email, phone, certification_level, medical_cleared } = req.body;
  const id = uuidv4();

  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }

  const db = getDb();
  db.run(
    `INSERT INTO divers (id, name, email, phone, certification_level, medical_cleared) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, name, email, phone || null, certification_level || null, medical_cleared ? 1 : 0],
    (err) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: err.message });
      }

      db.get('SELECT * FROM divers WHERE id = ?', [id], (err, diver) => {
        db.close();
        if (err) return res.status(500).json({ error: err.message });
        res.json(diver);
      });
    }
  );
});

// GET /api/courses - list all courses
app.get('/api/courses', (req, res) => {
  const db = getDb();
  db.all(`
    SELECT c.id, c.name, c.price, c.description, c.duration_days, c.start_date, c.end_date, c.max_students,
           c.instructor_id, i.name as instructor_name,
           c.boat_id, b.name as boat_name
    FROM courses c
    LEFT JOIN instructors i ON c.instructor_id = i.id
    LEFT JOIN boats b ON c.boat_id = b.id
    ORDER BY c.created_at DESC
  `, (err, courses) => {
    db.close();
    if (err) return res.status(500).json({ error: err.message });
    res.json((courses || []).map(c => ({
      id: c.id,
      name: c.name,
      price: c.price,
      description: c.description,
      duration_days: c.duration_days,
      start_date: c.start_date,
      end_date: c.end_date,
      max_students: c.max_students,
      instructor_id: c.instructor_id,
      instructors: { name: c.instructor_name },
      boat_id: c.boat_id,
      boats: { name: c.boat_name }
    })));
  });
});

// POST /api/courses - create a course
app.post('/api/courses', (req, res) => {
  const { name, price, duration_days, description, instructor_id, boat_id, start_date, end_date, max_students } = req.body;
  const id = uuidv4();

  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  const db = getDb();
  db.run(
    `INSERT INTO courses (id, name, price, duration_days, description, instructor_id, boat_id, start_date, end_date, max_students) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, price || 0, duration_days || null, description || null, instructor_id || null, boat_id || null, start_date || null, end_date || null, max_students || 6],
    (err) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: err.message });
      }
      db.get(`
        SELECT c.id, c.name, c.price, c.description, c.duration_days, c.start_date, c.end_date, c.max_students,
               c.instructor_id, i.name as instructor_name,
               c.boat_id, b.name as boat_name
        FROM courses c
        LEFT JOIN instructors i ON c.instructor_id = i.id
        LEFT JOIN boats b ON c.boat_id = b.id
        WHERE c.id = ?
      `, [id], (err, course) => {
        db.close();
        if (err) return res.status(500).json({ error: err.message });
        res.json({
          id: course.id,
          name: course.name,
          price: course.price,
          description: course.description,
          duration_days: course.duration_days,
          start_date: course.start_date,
          end_date: course.end_date,
          max_students: course.max_students,
          instructor_id: course.instructor_id,
          instructors: { name: course.instructor_name },
          boat_id: course.boat_id,
          boats: { name: course.boat_name }
        });
      });
    }
  );
});

// DELETE /api/courses/:id - delete a course
app.delete('/api/courses/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();
  db.run('DELETE FROM courses WHERE id = ?', [id], (err) => {
    db.close();
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true });
  });
});

// GET /api/instructors - list all instructors
app.get('/api/instructors', (req, res) => {
  const db = getDb();
  db.all('SELECT id, name, email, phone, certification FROM instructors ORDER BY name ASC', (err, instructors) => {
    db.close();
    if (err) return res.status(500).json({ error: err.message });
    res.json(instructors || []);
  });
});

// POST /api/instructors - create an instructor
app.post('/api/instructors', (req, res) => {
  const { name, email, phone, certification } = req.body;
  const id = uuidv4();

  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  const db = getDb();
  db.run(
    'INSERT INTO instructors (id, name, email, phone, certification) VALUES (?, ?, ?, ?, ?)',
    [id, name, email || null, phone || null, certification || null],
    (err) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: err.message });
      }
      db.get('SELECT id, name, email, phone, certification FROM instructors WHERE id = ?', [id], (err, instructor) => {
        db.close();
        if (err) return res.status(500).json({ error: err.message });
        res.json(instructor);
      });
    }
  );
});

// GET /api/boats - list all boats
app.get('/api/boats', (req, res) => {
  const db = getDb();
  db.all('SELECT id, name, capacity, location FROM boats ORDER BY name ASC', (err, boats) => {
    db.close();
    if (err) return res.status(500).json({ error: err.message });
    res.json(boats || []);
  });
});

// POST /api/boats - create a boat
app.post('/api/boats', (req, res) => {
  const { name, capacity, location } = req.body;
  const id = uuidv4();

  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  const db = getDb();
  db.run(
    'INSERT INTO boats (id, name, capacity, location) VALUES (?, ?, ?, ?)',
    [id, name, capacity || null, location || null],
    (err) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: err.message });
      }
      db.get('SELECT id, name, capacity, location FROM boats WHERE id = ?', [id], (err, boat) => {
        db.close();
        if (err) return res.status(500).json({ error: err.message });
        res.json(boat);
      });
    }
  );
});

// GET /api/accommodations - list all accommodations
app.get('/api/accommodations', (req, res) => {
  const db = getDb();
  db.all('SELECT id, name, price_per_night, tier FROM accommodations ORDER BY name ASC', (err, accs) => {
    db.close();
    if (err) return res.status(500).json({ error: err.message });
    res.json(accs || []);
  });
});

// POST /api/accommodations - create an accommodation
app.post('/api/accommodations', (req, res) => {
  const { name, price_per_night, tier, description } = req.body;
  const id = uuidv4();

  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  const db = getDb();
  db.run(
    'INSERT INTO accommodations (id, name, price_per_night, tier, description) VALUES (?, ?, ?, ?, ?)',
    [id, name, price_per_night || 0, tier || 'standard', description || null],
    (err) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: err.message });
      }
      db.get('SELECT id, name, price_per_night, tier FROM accommodations WHERE id = ?', [id], (err, acc) => {
        db.close();
        if (err) return res.status(500).json({ error: err.message });
        res.json(acc);
      });
    }
  );
});

// GET /api/bookings - list all bookings with related data
app.get('/api/bookings', (req, res) => {
  const db = getDb();

  db.all(`
    SELECT 
      b.id, b.diver_id, b.course_id, b.accommodation_id, b.check_in, b.check_out,
      b.total_amount, b.invoice_number, b.payment_status, b.notes, b.created_at,
      d.name as diver_name,
      c.name as course_name, c.price as course_price,
      a.name as accommodation_name, a.price_per_night, a.tier
    FROM bookings b
    LEFT JOIN divers d ON b.diver_id = d.id
    LEFT JOIN courses c ON b.course_id = c.id
    LEFT JOIN accommodations a ON b.accommodation_id = a.id
    ORDER BY b.created_at DESC
  `, (err, bookings) => {
    db.close();
    if (err) return res.status(500).json({ error: err.message });
    
    const result = (bookings || []).map(b => ({
      id: b.id,
      diver_id: b.diver_id,
      course_id: b.course_id,
      accommodation_id: b.accommodation_id,
      check_in: b.check_in,
      check_out: b.check_out,
      total_amount: b.total_amount,
      invoice_number: b.invoice_number,
      payment_status: b.payment_status,
      notes: b.notes,
      created_at: b.created_at,
      divers: { name: b.diver_name },
      courses: { name: b.course_name, price: b.course_price },
      accommodations: { name: b.accommodation_name, price_per_night: b.price_per_night, tier: b.tier }
    }));
    res.json(result);
  });
});

// GET /api/bookings/stats/last30days - get bookings and revenue for last 30 days
app.get('/api/bookings/stats/last30days', (req, res) => {
  const db = getDb();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  db.get(`
    SELECT 
      COUNT(*) as booking_count,
      SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as total_revenue,
      SUM(total_amount) as total_amount
    FROM bookings
    WHERE created_at >= ?
  `, [thirtyDaysAgo], (err, stats) => {
    db.close();
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      booking_count: stats?.booking_count || 0,
      total_revenue: stats?.total_revenue || 0,
      total_amount: stats?.total_amount || 0
    });
  });
});

// POST /api/bookings - create a booking
app.post('/api/bookings', (req, res) => {
  const { diver_id, course_id, accommodation_id, check_in, check_out, total_amount, notes } = req.body;
  const id = uuidv4();
  const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;

  if (!diver_id) {
    return res.status(400).json({ error: 'diver_id is required' });
  }

  const db = getDb();
  db.run(
    `INSERT INTO bookings (id, diver_id, course_id, accommodation_id, check_in, check_out, total_amount, invoice_number, payment_status, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'unpaid', ?)`,
    [id, diver_id, course_id || null, accommodation_id || null, check_in || null, check_out || null, total_amount || 0, invoiceNumber, notes || null],
    (err) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: err.message });
      }

      db.get(`
        SELECT 
          b.id, b.diver_id, b.course_id, b.accommodation_id, b.check_in, b.check_out,
          b.total_amount, b.invoice_number, b.payment_status, b.notes, b.created_at,
          d.name as diver_name,
          c.name as course_name, c.price as course_price,
          a.name as accommodation_name, a.price_per_night, a.tier
        FROM bookings b
        LEFT JOIN divers d ON b.diver_id = d.id
        LEFT JOIN courses c ON b.course_id = c.id
        LEFT JOIN accommodations a ON b.accommodation_id = a.id
        WHERE b.id = ?
      `, [id], (err, booking) => {
        db.close();
        if (err) return res.status(500).json({ error: err.message });
        res.json({
          id: booking.id,
          diver_id: booking.diver_id,
          course_id: booking.course_id,
          accommodation_id: booking.accommodation_id,
          check_in: booking.check_in,
          check_out: booking.check_out,
          total_amount: booking.total_amount,
          invoice_number: booking.invoice_number,
          payment_status: booking.payment_status,
          notes: booking.notes,
          created_at: booking.created_at,
          divers: { name: booking.diver_name },
          courses: { name: booking.course_name, price: booking.course_price },
          accommodations: { name: booking.accommodation_name, price_per_night: booking.price_per_night, tier: booking.tier }
        });
      });
    }
  );
});

// PATCH /api/bookings/:id - update payment status
app.patch('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const { payment_status } = req.body;

  const db = getDb();
  db.run('UPDATE bookings SET payment_status = ? WHERE id = ?', [payment_status, id], (err) => {
    db.close();
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true });
  });
});

// DELETE /api/bookings/:id - delete a booking
app.delete('/api/bookings/:id', (req, res) => {
  const { id } = req.params;

  const db = getDb();
  db.run('DELETE FROM bookings WHERE id = ?', [id], (err) => {
    db.close();
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true });
  });
});

// PUT /api/divers/:id - update a diver
app.put('/api/divers/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, phone, certification_level, medical_cleared } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }

  const db = getDb();
  db.run(
    `UPDATE divers SET name = ?, email = ?, phone = ?, certification_level = ?, medical_cleared = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name, email, phone || null, certification_level || null, medical_cleared ? 1 : 0, id],
    (err) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: err.message });
      }

      db.get('SELECT * FROM divers WHERE id = ?', [id], (err, diver) => {
        db.close();
        if (err) return res.status(500).json({ error: err.message });
        res.json(diver);
      });
    }
  );
});

// DELETE /api/divers/:id - delete a diver
app.delete('/api/divers/:id', (req, res) => {
  const { id } = req.params;

  const db = getDb();
  db.run('DELETE FROM divers WHERE id = ?', [id], (err) => {
    db.close();
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true });
  });
});

// PUT /api/bookings/:id - update a booking
app.put('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const { diver_id, course_id, accommodation_id, check_in, check_out, total_amount, payment_status, notes } = req.body;

  if (!diver_id) {
    return res.status(400).json({ error: 'diver_id is required' });
  }

  const db = getDb();
  db.run(
    `UPDATE bookings SET diver_id = ?, course_id = ?, accommodation_id = ?, check_in = ?, check_out = ?, total_amount = ?, payment_status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [diver_id, course_id || null, accommodation_id || null, check_in || null, check_out || null, total_amount || 0, payment_status || 'unpaid', notes || null, id],
    (err) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: err.message });
      }

      db.get(`
        SELECT 
          b.id, b.diver_id, b.course_id, b.accommodation_id, b.check_in, b.check_out,
          b.total_amount, b.invoice_number, b.payment_status, b.notes, b.created_at, b.updated_at,
          d.name as diver_name,
          c.name as course_name, c.price as course_price,
          a.name as accommodation_name, a.price_per_night, a.tier
        FROM bookings b
        LEFT JOIN divers d ON b.diver_id = d.id
        LEFT JOIN courses c ON b.course_id = c.id
        LEFT JOIN accommodations a ON b.accommodation_id = a.id
        WHERE b.id = ?
      `, [id], (err, booking) => {
        db.close();
        if (err) return res.status(500).json({ error: err.message });
        res.json({
          id: booking.id,
          diver_id: booking.diver_id,
          course_id: booking.course_id,
          accommodation_id: booking.accommodation_id,
          check_in: booking.check_in,
          check_out: booking.check_out,
          total_amount: booking.total_amount,
          invoice_number: booking.invoice_number,
          payment_status: booking.payment_status,
          notes: booking.notes,
          created_at: booking.created_at,
          updated_at: booking.updated_at,
          divers: { name: booking.diver_name },
          courses: { name: booking.course_name, price: booking.course_price },
          accommodations: { name: booking.accommodation_name, price_per_night: booking.price_per_night, tier: booking.tier }
        });
      });
    }
  );
});

// GET /api/waivers - list all waivers
app.get('/api/waivers', (req, res) => {
  const db = getDb();

  db.all(`
    SELECT w.id, w.diver_id, w.status, w.signed_at, w.notes, w.created_at, d.name as diver_name, d.email as diver_email
    FROM waivers w
    LEFT JOIN divers d ON w.diver_id = d.id
    ORDER BY w.created_at DESC
  `, (err, waivers) => {
    db.close();
    if (err) return res.status(500).json({ error: err.message });
    res.json(waivers || []);
  });
});

// GET /api/waivers/:diver_id - get waiver for a specific diver
app.get('/api/waivers/:diver_id', (req, res) => {
  const { diver_id } = req.params;
  const db = getDb();

  db.get(`
    SELECT w.id, w.diver_id, w.document_url, w.signature_data, w.status, w.signed_at, w.notes, w.created_at, d.name as diver_name, d.email as diver_email
    FROM waivers w
    LEFT JOIN divers d ON w.diver_id = d.id
    WHERE w.diver_id = ?
  `, [diver_id], (err, waiver) => {
    db.close();
    if (err) return res.status(500).json({ error: err.message });
    res.json(waiver || null);
  });
});

// POST /api/waivers - create/update waiver
app.post('/api/waivers', (req, res) => {
  const { diver_id, document_url, signature_data, notes } = req.body;
  const id = uuidv4();

  if (!diver_id) {
    return res.status(400).json({ error: 'diver_id is required' });
  }

  const db = getDb();

  // Check if waiver exists for this diver
  db.get('SELECT id FROM waivers WHERE diver_id = ?', [diver_id], (err, existing) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: err.message });
    }

    if (existing) {
      // Update existing waiver
      db.run(
        `UPDATE waivers SET document_url = ?, signature_data = ?, status = 'signed', signed_at = CURRENT_TIMESTAMP, notes = ?
         WHERE diver_id = ?`,
        [document_url || null, signature_data || null, notes || null, diver_id],
        (err) => {
          if (err) {
            db.close();
            return res.status(500).json({ error: err.message });
          }

          // Also update diver's waiver_signed flag
          db.run(
            `UPDATE divers SET waiver_signed = 1, waiver_signed_date = CURRENT_TIMESTAMP WHERE id = ?`,
            [diver_id],
            (err) => {
              db.get('SELECT * FROM waivers WHERE diver_id = ?', [diver_id], (err, waiver) => {
                db.close();
                if (err) return res.status(500).json({ error: err.message });
                res.json(waiver);
              });
            }
          );
        }
      );
    } else {
      // Create new waiver
      db.run(
        `INSERT INTO waivers (id, diver_id, document_url, signature_data, status, signed_at, notes)
         VALUES (?, ?, ?, ?, 'signed', CURRENT_TIMESTAMP, ?)`,
        [id, diver_id, document_url || null, signature_data || null, notes || null],
        (err) => {
          if (err) {
            db.close();
            return res.status(500).json({ error: err.message });
          }

          // Update diver's waiver_signed flag
          db.run(
            `UPDATE divers SET waiver_signed = 1, waiver_signed_date = CURRENT_TIMESTAMP WHERE id = ?`,
            [diver_id],
            (err) => {
              db.get('SELECT * FROM waivers WHERE id = ?', [id], (err, waiver) => {
                db.close();
                if (err) return res.status(500).json({ error: err.message });
                res.json(waiver);
              });
            }
          );
        }
      );
    }
  });
});

// PATCH /api/divers/:id/onboarding - complete onboarding
app.patch('/api/divers/:id/onboarding', (req, res) => {
  const { id } = req.params;
  const db = getDb();

  db.run(
    `UPDATE divers SET onboarding_completed = 1, onboarding_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [id],
    (err) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: err.message });
      }

      db.get('SELECT * FROM divers WHERE id = ?', [id], (err, diver) => {
        db.close();
        if (err) return res.status(500).json({ error: err.message });
        res.json(diver);
      });
    }
  );
});

// GET /api/dive-sites - list all dive sites
app.get('/api/dive-sites', (req, res) => {
  const db = getDb();
  db.all('SELECT id, name, location, max_depth, difficulty, description FROM dive_sites ORDER BY name ASC', (err, sites) => {
    db.close();
    if (err) return res.status(500).json({ error: err.message });
    res.json(sites || []);
  });
});

// POST /api/dive-sites - create a dive site
app.post('/api/dive-sites', (req, res) => {
  const { name, location, max_depth, difficulty, description, emergency_contacts, nearest_hospital, dan_info } = req.body;
  const id = uuidv4();

  if (!name || !location) {
    return res.status(400).json({ error: 'name and location are required' });
  }

  const db = getDb();
  db.run(
    `INSERT INTO dive_sites (id, name, location, max_depth, difficulty, description, emergency_contacts, nearest_hospital, dan_info)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, location, max_depth || null, difficulty || null, description || null, emergency_contacts || null, nearest_hospital || null, dan_info || null],
    (err) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: err.message });
      }
      db.get('SELECT id, name, location, max_depth, difficulty, description FROM dive_sites WHERE id = ?', [id], (err, site) => {
        db.close();
        if (err) return res.status(500).json({ error: err.message });
        res.json(site);
      });
    }
  );
});

// DELETE /api/dive-sites/:id - delete a dive site
app.delete('/api/dive-sites/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();
  db.run('DELETE FROM dive_sites WHERE id = ?', [id], (err) => {
    db.close();
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true });
  });
});

// GET /api/groups/:id/itinerary - get dive itinerary for a group
app.get('/api/groups/:id/itinerary', (req, res) => {
  const { id } = req.params;
  const db = getDb();

  db.all(`
    SELECT gdi.id, gdi.group_id, gdi.day_number, gdi.dive_site_id, gdi.notes,
           ds.name as site_name, ds.location, ds.max_depth, ds.difficulty
    FROM group_dive_itinerary gdi
    LEFT JOIN dive_sites ds ON gdi.dive_site_id = ds.id
    WHERE gdi.group_id = ?
    ORDER BY gdi.day_number ASC
  `, [id], (err, itinerary) => {
    db.close();
    if (err) return res.status(500).json({ error: err.message });
    res.json(itinerary || []);
  });
});

// POST /api/groups/:id/itinerary - add or update dive plan for a day
app.post('/api/groups/:id/itinerary', (req, res) => {
  const { id } = req.params;
  const { day_number, dive_site_id, notes } = req.body;

  if (!day_number) {
    return res.status(400).json({ error: 'day_number is required' });
  }

  const db = getDb();
  
  // Check if entry exists for this group and day
  db.get('SELECT id FROM group_dive_itinerary WHERE group_id = ? AND day_number = ?', [id, day_number], (err, existing) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: err.message });
    }

    if (existing) {
      // Update
      db.run(
        `UPDATE group_dive_itinerary SET dive_site_id = ?, notes = ? WHERE group_id = ? AND day_number = ?`,
        [dive_site_id || null, notes || null, id, day_number],
        (err) => {
          if (err) {
            db.close();
            return res.status(500).json({ error: err.message });
          }
          
          db.get(`
            SELECT gdi.id, gdi.group_id, gdi.day_number, gdi.dive_site_id, gdi.notes,
                   ds.name as site_name, ds.location, ds.max_depth, ds.difficulty
            FROM group_dive_itinerary gdi
            LEFT JOIN dive_sites ds ON gdi.dive_site_id = ds.id
            WHERE gdi.group_id = ? AND gdi.day_number = ?
          `, [id, day_number], (err, result) => {
            db.close();
            if (err) return res.status(500).json({ error: err.message });
            res.json(result);
          });
        }
      );
    } else {
      // Insert
      const itineraryId = uuidv4();
      db.run(
        `INSERT INTO group_dive_itinerary (id, group_id, day_number, dive_site_id, notes)
         VALUES (?, ?, ?, ?, ?)`,
        [itineraryId, id, day_number, dive_site_id || null, notes || null],
        (err) => {
          if (err) {
            db.close();
            return res.status(500).json({ error: err.message });
          }
          
          db.get(`
            SELECT gdi.id, gdi.group_id, gdi.day_number, gdi.dive_site_id, gdi.notes,
                   ds.name as site_name, ds.location, ds.max_depth, ds.difficulty
            FROM group_dive_itinerary gdi
            LEFT JOIN dive_sites ds ON gdi.dive_site_id = ds.id
            WHERE gdi.id = ?
          `, [itineraryId], (err, result) => {
            db.close();
            if (err) return res.status(500).json({ error: err.message });
            res.json(result);
          });
        }
      );
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
