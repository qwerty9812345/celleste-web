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
  const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds%20guilds.members.read&prompt=none`;
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
    try {
      const memberRes = await fetch(`https://discord.com/api/users/@me/guilds/${GUILD_ID}/member`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (memberRes.ok) {
        const memberData = await memberRes.json();
        const rolesRes = await fetch(`https://discord.com/api/guilds/${GUILD_ID}/roles`, {
          headers: { Authorization: `Bot ${BOT_TOKEN}` }
        });
        if (rolesRes.ok) {
          const guildRoles = await rolesRes.json();
          const verifiedRole = guildRoles.find(r => r.name === VERIFIED_ROLE);
          if (verifiedRole && memberData.roles.includes(verifiedRole.id)) {
            hasRole = true;
          }
        }
      }
    } catch (e) {
      // user not in guild
    }

    req.session.user = {
      id: user.id,
      username: user.global_name || user.username,
      avatar: user.avatar
    };
    req.session.verified = hasRole;

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
    user: req.session.user
  });
});

app.get('/api/config', (req, res) => {
  res.json({
    discordInvite: process.env.DISCORD_INVITE || '#'
  });
});

app.listen(PORT, () => {
  console.log(`\n  🏠  Celleste Family Site`);
  console.log(`  ─────────────────────`);
  console.log(`  Локально:  http://localhost:${PORT}`);
  if (isProduction) console.log(`  Продакшн:  ${BASE_URL}`);
  console.log(`  Discord:   ${REDIRECT_URI}\n`);
});
