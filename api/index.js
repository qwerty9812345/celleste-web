const express = require('express');
const session = require('cookie-session');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const BASE_URL = process.env.BASE_URL || 'https://family-site-umber.vercel.app';
const isProduction = BASE_URL.startsWith('https');

app.set('trust proxy', 1);

app.use(session({
  name: 'celleste_session',
  secret: process.env.SESSION_SECRET || 'celleste-family-secret',
  maxAge: 30 * 24 * 60 * 60 * 1000,
  secure: isProduction,
  httpOnly: true,
  sameSite: 'lax'
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const GUILD_ID = process.env.GUILD_ID;
const VERIFIED_ROLE = process.env.VERIFIED_ROLE || 'Celleste';
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const ADMIN_IDS = (process.env.ADMIN_IDS || '').split(',').filter(Boolean);
const REDIRECT_URI = `${BASE_URL}/auth/discord/callback`;

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
    if (!hasRole) {
      return res.redirect('/?error=no_role');
    }
    req.session.user = {
      id: user.id,
      username: user.global_name || user.username,
      avatar: user.avatar
    };
    req.session.verified = true;
    res.redirect('/member');
  } catch (err) {
    console.error('Auth error:', err);
    res.redirect('/?error=auth_failed');
  }
});

app.get('/auth/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});

app.get('/member', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  res.sendFile(path.join(__dirname, '..', 'member.html'));
});

app.get('/api/me', (req, res) => {
  if (!req.session.user) return res.json({ authenticated: false });
  res.json({
    authenticated: true,
    verified: req.session.verified || false,
    user: req.session.user,
    isAdmin: ADMIN_IDS.includes(String(req.session.user.id))
  });
});

app.get('/api/config', (req, res) => {
  res.json({ discordInvite: process.env.DISCORD_INVITE || '#' });
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
        role: { stringValue: VERIFIED_ROLE }
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
    const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await resp.json();
    const found = data && data.length > 0 && data[0].document;
    res.json({ found: !!found });
  } catch (err) {
    console.error('[Celleste] Check user error:', err);
    res.json({ found: false });
  }
});

app.get('/api/*', (req, res) => res.json({ error: 'not_found' }));

module.exports = app;
