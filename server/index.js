import { createServer } from 'node:http';
import db, { initDB } from './db.js';
import crypto from 'node:crypto';

const PORT = process.env.PORT || 3002;
const N8N_WEBHOOK_URL = 'https://tutu-n8n.mypaeg.easypanel.host/webhook/raiox';

// Initialize DB
initDB().catch(console.error);

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Parse JSON body from an IncomingMessage */
const parseBody = (req) =>
  new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk.toString()));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });

/** Send JSON response */
const json = (res, data, status = 200) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

/** Fire-and-forget n8n sync */
const syncN8n = (action, payload) => {
  fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, timestamp: new Date().toISOString(), ...payload }),
  }).catch(() => {});
};

/** Log user interaction */
const logInteraction = async (email, action) => {
  try {
    await db.query('INSERT INTO interactions (user_email, action) VALUES (?, ?)', [email || 'anonymous', action]);
  } catch (err) {
    console.error('[LOG] Interaction error:', err);
  }
};

/** Extract path params like /api/incomes/:email */
const matchRoute = (pathname, pattern) => {
  const patternParts = pattern.split('/');
  const pathParts = pathname.split('/');
  if (patternParts.length !== pathParts.length) return null;
  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
};

// ── Server ───────────────────────────────────────────────────────────────────

const server = createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const { pathname } = url;
  const method = req.method;

  try {
    let params;
    // ── Health ──────────────────────────────────────────────────────────────
    if (pathname === '/api/status' && method === 'GET') {
      return json(res, { status: 'ok', message: 'Raio X backend running' });
    }

    // ── Auth ────────────────────────────────────────────────────────────────
    if (pathname === '/api/register' && method === 'POST') {
      const { name, email, gender, region, birth_date, whatsapp, profession } = await parseBody(req);
      if (!email || !name) return json(res, { error: 'Name and email are required' }, 400);

      await db.query(`
        INSERT INTO users (name, email, gender, region, birth_date, whatsapp, profession)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = IF(VALUES(name) != '', VALUES(name), name),
          gender = IF(VALUES(gender) != '', VALUES(gender), gender),
          region = IF(VALUES(region) != '', VALUES(region), region),
          birth_date = IF(VALUES(birth_date) != '', VALUES(birth_date), birth_date),
          whatsapp = IF(VALUES(whatsapp) != '', VALUES(whatsapp), whatsapp),
          profession = IF(VALUES(profession) != '', VALUES(profession), profession)
      `, [name, email, gender || '', region || '', birth_date || '', whatsapp || '', profession || '']);

      const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      const user = users[0];
      
      syncN8n('user_register', { user });
      logInteraction(email, 'register');
      return json(res, { success: true, user });
    }

    if (pathname === '/api/login' && method === 'POST') {
      const { email, password } = await parseBody(req);
      if (!email || !password) return json(res, { error: 'E-mail e senha são obrigatórios' }, 400);

      const hash = crypto.createHash('sha256').update(password).digest('hex');
      const [admins] = await db.query('SELECT id, email, created_at FROM admins WHERE LOWER(email) = LOWER(?) AND password_hash = ?', [email, hash]);
      const admin = admins[0];
      
      if (admin) {
        return json(res, { success: true, isAdmin: true, user: admin });
      }
      return json(res, { error: 'Credenciais inválidas' }, 401);
    }

    params = matchRoute(pathname, '/api/check-user/:email');
    if (params && method === 'GET') {
      const decodedEmail = decodeURIComponent(params.email).toLowerCase();
      const [users] = await db.query('SELECT * FROM users WHERE LOWER(email) = ?', [decodedEmail]);
      const user = users[0];
      return json(res, { exists: !!user, user: user || null });
    }

    // ── Admins ──────────────────────────────────────────────────────────────
    if (pathname === '/api/admins' && method === 'GET') {
      const [admins] = await db.query('SELECT id, email, created_at FROM admins ORDER BY created_at DESC');
      return json(res, admins);
    }

    if (pathname === '/api/admins' && method === 'POST') {
      const { email, password } = await parseBody(req);
      if (!email || !password) return json(res, { error: 'E-mail e senha são obrigatórios' }, 400);

      try {
        const hash = crypto.createHash('sha256').update(password).digest('hex');
        await db.query('INSERT INTO admins (email, password_hash) VALUES (?, ?)', [email, hash]);
        return json(res, { success: true });
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return json(res, { error: 'Admin já cadastrado' }, 409);
        }
        throw err;
      }
    }

    params = matchRoute(pathname, '/api/admins/:email');
    if (params && method === 'DELETE') {
      await db.query('DELETE FROM admins WHERE email = ?', [params.email]);
      return json(res, { success: true });
    }

    // ── Users (admin panel) ──────────────────────────────────────────────────
    if (pathname === '/api/users' && method === 'GET') {
      const [users] = await db.query('SELECT * FROM users ORDER BY created_at DESC');
      return json(res, users);
    }

    if (pathname === '/api/interactions' && method === 'GET') {
      const [interactions] = await db.query('SELECT * FROM interactions ORDER BY created_at DESC');
      return json(res, interactions);
    }

    params = matchRoute(pathname, '/api/users/:email');
    if (params && method === 'DELETE') {
      await db.query('DELETE FROM users WHERE email = ?', [params.email]);
      syncN8n('user_delete', { email: params.email });
      return json(res, { success: true });
    }
    if (params && method === 'PUT') {
      const updates = await parseBody(req);
      const [currentUsers] = await db.query('SELECT contact_status FROM users WHERE email = ?', [params.email]);
      const currentUser = currentUsers[0];
      
      let queryStr = `UPDATE users SET name = ?, gender = ?, region = ?, birth_date = ?, whatsapp = ?, profession = ?, contact_status = ?`;
      const paramsList = [
        updates.name || '',
        updates.gender || '',
        updates.region || '',
        updates.birth_date || '',
        updates.whatsapp || '',
        updates.profession || '',
        updates.contact_status || 'Pendente'
      ];

      if (updates.last_contact_at !== undefined) {
        queryStr += ", last_contact_at = ?";
        paramsList.push(updates.last_contact_at);
      } else if (updates.contact_status && updates.contact_status !== currentUser?.contact_status) {
        queryStr += ", last_contact_at = NOW()";
      }

      queryStr += " WHERE email = ?";
      paramsList.push(params.email);

      await db.query(queryStr, paramsList);
      
      const [updatedUsers] = await db.query('SELECT * FROM users WHERE email = ?', [params.email]);
      return json(res, { success: true, user: updatedUsers[0] });
    }

    // ── Incomes ─────────────────────────────────────────────────────────────
    params = matchRoute(pathname, '/api/incomes/:email');
    if (params && method === 'GET') {
      const [incomes] = await db.query('SELECT * FROM incomes WHERE user_email = ? ORDER BY created_at DESC', [params.email]);
      return json(res, incomes);
    }

    if (pathname === '/api/incomes' && method === 'POST') {
      const { user_email, description, amount } = await parseBody(req);
      if (!user_email || !description || amount == null) return json(res, { error: 'Missing fields' }, 400);

      const [result] = await db.query('INSERT INTO incomes (user_email, description, amount) VALUES (?, ?, ?)', [user_email, description, amount]);
      const [incomes] = await db.query('SELECT * FROM incomes WHERE id = ?', [result.insertId]);
      const income = incomes[0];
      
      syncN8n('add_income', { user_email, income });
      logInteraction(user_email, 'add_income');
      return json(res, { success: true, income }, 201);
    }

    params = matchRoute(pathname, '/api/incomes/:id');
    if (params && method === 'DELETE') {
      const [incomes] = await db.query('SELECT * FROM incomes WHERE id = ?', [params.id]);
      const income = incomes[0];
      await db.query('DELETE FROM incomes WHERE id = ?', [params.id]);
      syncN8n('remove_income', { income });
      return json(res, { success: true });
    }

    // ── Expenses ────────────────────────────────────────────────────────────
    params = matchRoute(pathname, '/api/expenses/:email');
    if (params && method === 'GET') {
      const [expenses] = await db.query('SELECT * FROM expenses WHERE user_email = ? ORDER BY created_at DESC', [params.email]);
      return json(res, expenses);
    }

    if (pathname === '/api/expenses' && method === 'POST') {
      const { user_email, description, amount, category } = await parseBody(req);
      if (!user_email || !description || amount == null) return json(res, { error: 'Missing fields' }, 400);

      const [result] = await db.query('INSERT INTO expenses (user_email, description, amount, category) VALUES (?, ?, ?, ?)', [user_email, description, amount, category || 'outros']);
      const [expenses] = await db.query('SELECT * FROM expenses WHERE id = ?', [result.insertId]);
      const expense = expenses[0];
      
      syncN8n('add_expense', { user_email, expense });
      logInteraction(user_email, 'add_expense');
      return json(res, { success: true, expense }, 201);
    }

    params = matchRoute(pathname, '/api/expenses/:id');
    if (params && method === 'DELETE') {
      const [expenses] = await db.query('SELECT * FROM expenses WHERE id = ?', [params.id]);
      const expense = expenses[0];
      await db.query('DELETE FROM expenses WHERE id = ?', [params.id]);
      syncN8n('remove_expense', { expense });
      return json(res, { success: true });
    }

    // ── Behavioral ──────────────────────────────────────────────────────────
    params = matchRoute(pathname, '/api/behavioral/:email');
    if (params && method === 'GET') {
      const [rows] = await db.query('SELECT * FROM behavioral_answers WHERE user_email = ?', [params.email]);
      return json(res, rows[0] || null);
    }

    if (pathname === '/api/behavioral' && method === 'POST') {
      const { user_email, answers, total_score, total_percentage, level } = await parseBody(req);
      if (!user_email) return json(res, { error: 'Missing user_email' }, 400);

      await db.query(`
        INSERT INTO behavioral_answers (user_email, answers, total_score, total_percentage, level, updated_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON DUPLICATE KEY UPDATE
          answers = VALUES(answers),
          total_score = VALUES(total_score),
          total_percentage = VALUES(total_percentage),
          level = VALUES(level),
          updated_at = CURRENT_TIMESTAMP
      `, [user_email, JSON.stringify(answers || {}), total_score || 0, total_percentage || 0, level || '']);

      syncN8n('behavioral_complete', { user_email, total_percentage, level });
      logInteraction(user_email, 'quiz_complete');
      return json(res, { success: true });
    }

    // ── Custom Buttons ──────────────────────────────────────────────────────
    if (pathname === '/api/custom-buttons' && method === 'GET') {
      const [rows] = await db.query('SELECT config FROM custom_buttons WHERE id = 1');
      const row = rows[0];
      return json(res, row ? row.config : {});
    }

    if (pathname === '/api/custom-buttons' && method === 'POST') {
      const config = await parseBody(req);
      await db.query('UPDATE custom_buttons SET config = ? WHERE id = 1', [JSON.stringify(config)]);
      return json(res, { success: true });
    }

    // ── 404 ─────────────────────────────────────────────────────────────────
    return json(res, { error: 'Not Found' }, 404);

  } catch (err) {
    console.error(`[ERROR] ${method} ${pathname}:`, err);
    return json(res, { error: err.message || 'Internal Server Error' }, 500);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[SERVER] Raio X backend running on http://0.0.0.0:${PORT}`);
});

