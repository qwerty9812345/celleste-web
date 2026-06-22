require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Client, GatewayIntentBits, Events } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const VERIFIED_ROLE = process.env.VERIFIED_ROLE || 'Celleste';
const GUILD_ID = process.env.GUILD_ID;

client.once(Events.ClientReady, (c) => {
  console.log(`✅ Бот ${c.user.tag} запущен!`);
});

client.on(Events.GuildMemberAdd, async (member) => {
  if (member.guild.id !== GUILD_ID) return;
  console.log(`📥 Новый участник: ${member.user.tag}`);

  const channel = member.guild.systemChannel;
  if (channel) {
    channel.send(`👋 Добро пожаловать в семью Celleste, ${member.user}!`);
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (message.guild?.id !== GUILD_ID) return;

  if (message.content.startsWith('!role')) {
    const member = message.member;
    const role = message.guild.roles.cache.find(r => r.name === VERIFIED_ROLE);
    if (!role) {
      return message.reply(`Роль "${VERIFIED_ROLE}" не найдена на сервере.`);
    }

    if (member.roles.cache.has(role.id)) {
      message.reply(`✅ У вас уже есть роль ${role.name}.`);
    } else {
      await member.roles.add(role);
      message.reply(`🎉 Роль ${role.name} выдана! Добро пожаловать в семью!`);
    }
  }

  if (message.content.startsWith('!help')) {
    message.reply(
      '**Команды бота Celleste:**\n' +
      `- \`!role\` — получить роль ${VERIFIED_ROLE} (если выдаётся вручную)\n` +
      '- `!members` — список участников семьи\n' +
      '- `!info` — информация о семье'
    );
  }

  if (message.content === '!members') {
    const members = await message.guild.members.fetch();
    const list = members
      .filter(m => !m.user.bot)
      .map(m => `- ${m.user.global_name || m.user.username}${m.nickname ? ` (${m.nickname})` : ''}`)
      .join('\n');
    message.reply(`**Состав семьи Celleste (${members.filter(m => !m.user.bot).size}):**\n${list}`);
  }

  if (message.content === '!info') {
    message.reply(
      '**Семья Celleste** — сообщество единомышленников.\n' +
      'Наши ценности: взаимопомощь, развитие, целеустремлённость, открытость, надёжность, радость.\n' +
      `Сайт: ${process.env.BASE_URL || 'http://localhost:3000'}`
    );
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
