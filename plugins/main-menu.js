import { xpRange } from '../lib/levelling.js';
import axios from 'axios';

const clockString = ms => {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
};

const saludarSegunHora = () => {
  const hora = new Date().getHours();
  if (hora >= 5 && hora < 12) return '🌄 Buenos días';
  if (hora >= 12 && hora < 19) return '🌞 Buenas tardes';
  return '🌙 Buenas noches';
};

const img = 'https://cdn.adoolab.xyz/dl/985b1ed9.jpg';

const sectionDivider = '╰━━━━━━━━━━━━━━━━━━⭓';

const menuFooter = `
╭─❒ 「📌 INFO FINAL」
│ ⚠️ Usa los comandos con el prefijo correspondiente
│ 📌 Ejemplo:.ping |.menu
│ 🛡️ Creado por Nightwish
╰❒
`.trim();

const handler = async (m, { conn, usedPrefix }) => {
  try {
    const saludo = saludarSegunHora();
    const user = global.db.data.users[m.sender] || { level: 1, exp: 0, limit: 5 };
    const { exp, level, limit } = user;
    const { min, xp } = xpRange(level, global.multiplier || 1);
    const totalUsers = Object.keys(global.db.data.users).length;
    const mode = global.opts?.self ? 'Privado 🔒' : 'Público 🌐';
    const uptime = clockString(process.uptime() * 1000);
    const userName = await conn.getName(m.sender);
    const tagUsuario = `@${m.sender.split('@')[0]}`;

    const text = [
      "*Etiqueta General X McQueen*",
      "𝙈𝙚𝙣𝙘𝙞𝙤𝙣 𝙂𝙚𝙣𝙚𝙧𝙖𝙡",
      "𝙀𝙩𝙞𝙦𝙪𝙚𝙩𝙖𝙣𝙙𝙤 𝙖 𝙡𝙤𝙨 𝙉𝙋𝘾"
    ].getRandom();
    const imgRandom = [
      "https://cdn.adoolab.xyz/dl/985b1ed9.jpg",
      "https://cdn.adoolab.xyz/dl/985b1ed9.jpg"
    ].getRandom();

    // --- Inicio del código arreglado ---
    let thumbnailBuffer;
    try {
      const response = await axios.get(imgRandom, { responseType: 'arraybuffer' });
      thumbnailBuffer = Buffer.from(response.data);
    } catch (e) {
      console.error('❌ Error al descargar la imagen para el quoted:', e);
      // Usar una imagen de respaldo o un buffer vacío si falla
      // Si usas un buffer vacío, asegúrate de que el resto del código lo maneje.
      thumbnailBuffer = Buffer.from('');
    }
    // --- Fin del código arreglado ---

    const izumi = {
      key: { participants: "0@s.whatsapp.net", fromMe: false, id: "Halo" },
      message: {
        locationMessage: {
          name: text,
          jpegThumbnail: thumbnailBuffer,
          vcard:
            "BEGIN:VCARD\nVERSION:3.0\nN:;Unlimited;;;\nFN:Unlimited\nORG:Unlimited\nTITLE:\n" +
            "item1.TEL;waid=19709001746:+1 (970) 900-1746\nitem1.X-ABLabel:Unlimited\n" +
            "X-WA-BIZ-DESCRIPTION:ofc\nX-WA-BIZ-NAME:Unlimited\nEND:VCARD"
        }
      },
      participant: "0@s.whatsapp.net"
    };
    // --- Fin del código agregado ---

    let categorizedCommands = {};
    Object.values(global.plugins)
      .filter(p => p?.help && !p.disabled)
      .forEach(p => {
        const tag = Array.isArray(p.tags) ? p.tags[0] : p.tags || 'Otros';
        const cmds = Array.isArray(p.help) ? p.help : [p.help];
        categorizedCommands[tag] = categorizedCommands[tag] || new Set();
        cmds.forEach(cmd => categorizedCommands[tag].add(usedPrefix + cmd));
      });

    const categoryEmojis = {
      anime: '🎭', info: 'ℹ️', search: '🔎', diversión: '🎉', subbots: '🤖',
      rpg: '🌀', registro: '📝', sticker: '🎨', imagen: '🖼️', logo: '🖌️',
      premium: '🎖️', configuración: '⚙️', descargas: '📥', herramientas: '🛠️',
      nsfw: '🔞', 'base de datos': '📀', audios: '🔊', 'freefire': '🔥', otros: '🪪'
    };

    const menuBody = Object.entries(categorizedCommands).map(([title, cmds]) => {
      const emoji = categoryEmojis[title.toLowerCase()] || '📁';
      const list = [...cmds].map(cmd => `│ ◦ ${cmd}`).join('\n');
      return `╭─「 ${emoji} ${title.toUpperCase()} 」\n${list}\n${sectionDivider}`;
    }).join('\n\n');

    const header = `
${saludo} ${tagUsuario} 👋

╭─ 「 MᴄQᴜᴇᴇɴ Bᴏᴛ 🌀 」
│ 👤 Nombre: ${userName}
│ 🎖 Nivel: ${level} | XP: ${exp - min}/${xp}
│ 🔓 Límite: ${limit}
│ 🧭 Modo: ${mode}
│ ⏱️ Tiempo activo: ${uptime}
│ 🌍 Usuarios registrados: ${totalUsers}
╰─❒
`.trim();

    const fullMenu = `${header}\n\n${menuBody}\n\n${menuFooter}`;

    const bot = global.db.data.settings[conn.user.jid]
    let bannerr = bot.banner || 'https://cdn.adoolab.xyz/dl/985b1ed9.jpg'

    await conn.sendMessage(m.chat, {
      image: { url: bannerr },
      caption: fullMenu,
      mentions: [m.sender]
    }, { quoted: izumi });

  } catch (e) {
    console.error('❌ Error al generar el menú:', e);
    await conn.reply(m.chat, '⚠️ Ocurrió un error al mostrar el menú.', m);
  }
};

handler.command = ['menu', 'help', 'menú'];
export default handler;
