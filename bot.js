const { Client, Intents, MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const welcomeConfig = require('./commands/welcome'); // Poprawne ścieżki do pliku
const hejCommand = require('./commands/hej');
const topCommand = require('./commands/top');

const settingsFilePath = path.join(__dirname, 'data/vanity_settings.json');
const messageCountFilePath = path.join(__dirname, 'data/message_count.json');

let settings = {};
let messageCounts = {}; // Dodane do śledzenia liczby wiadomości w pamięci

function loadSettings() {
    if (fs.existsSync(settingsFilePath)) {
        const data = fs.readFileSync(settingsFilePath);
        settings = JSON.parse(data);
    } else {
        settings = {};
    }
}

function saveSettings() {
    fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2));
}

function loadMessageCounts() {
    if (fs.existsSync(messageCountFilePath)) {
        const data = fs.readFileSync(messageCountFilePath);
        messageCounts = JSON.parse(data);
    } else {
        messageCounts = {};
    }
}

function saveMessageCounts() {
    fs.writeFileSync(messageCountFilePath, JSON.stringify(messageCounts, null, 2));
}

function resetMessageCounts() {
    fs.writeFileSync(messageCountFilePath, JSON.stringify({}, null, 2)); // Zapisz pusty obiekt
    messageCounts = {}; // Resetowanie liczby wiadomości w pamięci
}

loadSettings();
loadMessageCounts(); // Wczytaj liczbę wiadomości przy starcie

hejCommand.loadAnonymousNumbers();

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.MESSAGE_CONTENT,
    ],
});

const TOKEN = 'MTI2NTgwODE3NDQxNDI5OTE2Ng.GfrYg8.eGFPI6XMODf14pyOwUIByW0VuvoPjZ15IDUUjA'; // Zastąp swoim prawdziwym tokenem

const commands = [];
const commandsFolder = path.join(__dirname, 'commands');

fs.readdirSync(commandsFolder).forEach(file => {
    if (file.endsWith('.js')) {
        const command = require(path.join(commandsFolder, file));
        commands.push(command);
    }
});

client.once('ready', () => {
    console.log(`Bot logged in as: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Update message count
    if (!messageCounts[message.author.id]) {
        messageCounts[message.author.id] = { count: 0 };
    }
    messageCounts[message.author.id].count += 1;
    saveMessageCounts(); // Save message counts to file

    // Anonimowy kanał
    const anonymousChannelId = '1266294173703864423';
    if (message.channel.id === anonymousChannelId) {
        hejCommand.handleAnonymousMessage(message);
        return;
    }

    // ID ról, które są wyjątkiem
    const exemptRoles = ['1028693029994901636', '1266253354364047444', '1266249099146039378'];

    // Sprawdzenie czy wiadomość zawiera link lub załącznik (zdjęcie)
    const hasLink = /https?:\/\/[^\s]+/.test(message.content);
    const hasAttachment = message.attachments.size > 0;

    // Sprawdzenie, czy użytkownik ma jedną z ról wyjątku
    const hasExemptRole = message.member.roles.cache.some(role => exemptRoles.includes(role.id));

    if ((hasLink || hasAttachment) && !hasExemptRole) {
        await message.delete();

        const warningMessage = await message.channel.send({
            content: `${message.author}`,
            embeds: [
                {
                    description: "**Przeczytaj** na kanale <#1248158348633702452> za jakie rzeczy możesz dostać dostęp do wysyłania **zdjęć i linków**!",
                    color: 0
                }
            ],
            attachments: []
        });

        setTimeout(() => {
            warningMessage.delete().catch(err => console.error('Błąd przy usuwaniu wiadomości:', err));
        }, 5000);

        return;
    }

    const prefix = '.';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = commands.find(cmd => cmd.name === commandName);
    if (command) {
        if (commandName === 'top' && args[0] === 'reset') {
            resetMessageCounts(); // Resetowanie liczby wiadomości w pamięci i pliku
            message.channel.send('Message counts have been reset.')
                .catch(err => console.error('Failed to send reset confirmation message:', err));
            return;
        }
        command.execute(message, args, settings, saveSettings);
    }
});

client.on('presenceUpdate', (oldPresence, newPresence) => {
    if (!newPresence || !newPresence.guild) return;

    const member = newPresence.guild.members.cache.get(newPresence.userId);
    if (!member) return;

    const guildId = newPresence.guild.id;
    const guildSettings = settings[guildId] || {
        setVanityMessage: null,
        deleteVanityMessage: null,
        checkPhrase: null,
        targetChannelId: null,
        roleId: null,
    };

    const oldCustomStatus = oldPresence?.activities.find(activity => activity.name === 'Custom Status' && activity.state && activity.state.includes(guildSettings.checkPhrase));
    const newCustomStatus = newPresence.activities.find(activity => activity.name === 'Custom Status' && activity.state && activity.state.includes(guildSettings.checkPhrase));
    
    const channelId = guildSettings.targetChannelId;
    const channel = channelId ? newPresence.guild.channels.cache.get(channelId) : null;

    if (!channel) return;

    if (!oldCustomStatus && newCustomStatus) {
        if (guildSettings.roleId) {
            const role = newPresence.guild.roles.cache.get(guildSettings.roleId);
            if (role) {
                member.roles.add(role).catch(err => console.error('Błąd dodawania roli:', err));
            }
        }
        
        if (guildSettings.setVanityMessage !== null && guildSettings.setVanityMessage !== undefined) {
            const embed = new MessageEmbed()
                .setColor('#0f0f0f')
                .setDescription(guildSettings.setVanityMessage);

            channel.send({
                content: `${member}`,
                embeds: [embed]
            }).catch(err => console.error('Błąd wysyłania embeda:', err));
        }
    } else if (oldCustomStatus && !newCustomStatus) {
        if (guildSettings.roleId) {
            const role = newPresence.guild.roles.cache.get(guildSettings.roleId);
            if (role) {
                member.roles.remove(role).catch(err => console.error('Błąd usuwania roli:', err));
            }
        }

        if (guildSettings.deleteVanityMessage !== null && guildSettings.deleteVanityMessage !== undefined) {
            const embed = new MessageEmbed()
                .setColor('#0f0f0f')
                .setDescription(guildSettings.deleteVanityMessage);

            channel.send({
                content: `${member}`,
                embeds: [embed]
            }).catch(err => console.error('Błąd wysyłania embeda:', err));
        }
    }

    settings[guildId] = guildSettings;
    saveSettings();
});

client.on('guildMemberAdd', async member => {
    try {
        // Wywołaj funkcję z welcomeConfig
        await welcomeConfig.welcomeMessage(member);
        console.log('Wiadomość powitalna została wysłana.');
    } catch (error) {
        console.error('Wystąpił błąd podczas wysyłania wiadomości powitalnej:', error);
    }
});

client.login(TOKEN);
