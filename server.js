require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const isProduction = BASE_URL.startsWith('https');

app.set('trust proxy', 1);

app.use(session({
  secret: process.env.SESSION_SECRET || 'celleste-family-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const GUILD_ID = process.env.GUILD_ID;
const VERIFIED_ROLE = process.env.VERIFIED_ROLE || 'Celleste';
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const REDIRECT_URI = `${BASE_URL}/auth/discord/callback`;
const REQUIRED_ENV = ['DISCORD_CLIENT_ID', 'DISCORD_CLIENT_SECRET', 'DISCORD_BOT_TOKEN', 'GUILD_ID'];
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length) {
  console.error('Ошибка: не заполнены переменные в .env:', missing.join(', '));
  process.exit(1);
}

app.get('/auth/discord', (req, res) => {
  const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds%20guilds.members.read`;
  res.redirect(url);
});

app.get('/auth/discord/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.redirect('/?error=no_code');

    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        scope: 'identify guilds guilds.members.read'
      })
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return res.redirect('/?error=token_failed');

    const accessToken = tokenData.access_token;

    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const user = await userRes.json();

    let hasRole = false;
    let roleError = '';
    try {
      const memberRes = await fetch(`https://discord.com/api/users/@me/guilds/${GUILD_ID}/member`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!memberRes.ok) {
        roleError = 'not_in_guild';
      } else {
        const memberData = await memberRes.json();
        const rolesRes = await fetch(`https://discord.com/api/guilds/${GUILD_ID}/roles`, {
          headers: { Authorization: `Bot ${BOT_TOKEN}` }
        });
        if (!rolesRes.ok) {
          roleError = 'roles_api_failed';
        } else {
          const guildRoles = await rolesRes.json();
          console.log(`[Celleste] User roles:`, memberData.roles);
          console.log(`[Celleste] Guild roles:`, guildRoles.map(r => r.name));
          const verifiedRole = guildRoles.find(r => r.name === VERIFIED_ROLE);
          if (!verifiedRole) {
            roleError = 'role_not_found';
          } else if (!memberData.roles.includes(verifiedRole.id)) {
            roleError = 'no_role';
          } else {
            hasRole = true;
          }
        }
      }
    } catch (e) {
      roleError = 'exception:' + e.message;
    }

    req.session.user = {
      id: user.id,
      username: user.global_name || user.username,
      avatar: user.avatar
    };
    req.session.verified = hasRole;
    req.session.roleError = roleError;

    console.log(`[Celleste] User ${user.username} verified: ${hasRole} (${roleError})`);

    res.redirect('/');
  } catch (err) {
    console.error('Auth error:', err);
    res.redirect('/?error=auth_failed');
  }
});

app.get('/auth/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/api/me', (req, res) => {
  if (!req.session.user) return res.json({ authenticated: false });
  res.json({
    authenticated: true,
    verified: req.session.verified || false,
    roleError: req.session.roleError || null,
    user: req.session.user
  });
});

app.get('/api/config', (req, res) => {
  res.json({
    discordInvite: process.env.DISCORD_INVITE || '#'
  });
});

app.post('/api/save-user', async (req, res) => {
  try {
    if (!req.session.user) return res.status(401).json({ error: 'not_authenticated' });
    const { id, username } = req.session.user;
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/celleste-skills-f6a96/databases/(default)/documents/family_members?key=AIzaSyBqbDBQuYJffTHwcCwwwc-1dK6ZBsStWW8`;
    const body = {
      fields: {
        discordId: { stringValue: id },
        username: { stringValue: username },
        verifiedAt: { stringValue: new Date().toISOString() },
        role: { stringValue: process.env.VERIFIED_ROLE || 'Celleste' }
      }
    };
    const checkRes = await fetch(`${firestoreUrl}&pageSize=1&filter=discordId=%3D%22${id}%22`);
    const checkData = await checkRes.json();
    const existing = checkData.documents;
    if (!existing || existing.length === 0) {
      await fetch(firestoreUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      console.log(`[Celleste] User ${username} saved to family_members`);
    }
    res.json({ saved: true });
  } catch (err) {
    console.error('[Celleste] Save user error:', err);
    res.json({ saved: false });
  }
});

app.get('/api/check-user', async (req, res) => {
  try {
    const { discordId } = req.query;
    if (!discordId) return res.json({ found: false });
    const url = `https://firestore.googleapis.com/v1/projects/celleste-skills-f6a96/databases/(default)/documents:runQuery?key=AIzaSyBqbDBQuYJffTHwcCwwwc-1dK6ZBsStWW8`;
    const body = {
      structuredQuery: {
        from: [{ collectionId: 'family_members' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'discordId' },
            op: 'EQUAL',
            value: { stringValue: discordId }
          }
        },
        limit: 1
      }
    };
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await resp.json();
    const found = data && data.length > 0 && data[0].document;
    res.json({ found: !!found });
  } catch (err) {
    console.error('[Celleste] Check user error:', err);
    res.json({ found: false });
  }
});

app.listen(PORT, () => {
  console.log(`\n  🏠  Celleste Family Site`);
  console.log(`  ─────────────────────`);
  console.log(`  Локально:  http://localhost:${PORT}`);
  if (isProduction) console.log(`  Продакшн:  ${BASE_URL}`);
  console.log(`  Discord:   ${REDIRECT_URI}\n`);
});
