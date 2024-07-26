const fs = require('fs');
const path = require('path');
const { MessageEmbed } = require('discord.js');

const anonymousChatId = '1266240518426198047';
const numbersFilePath = path.join(__dirname, '../data/numerki.json');
let anonymousUsers = {};

function loadAnonymousNumbers() {
    if (fs.existsSync(numbersFilePath)) {
        const data = fs.readFileSync(numbersFilePath);
        anonymousUsers = JSON.parse(data);
    } else {
        anonymousUsers = {};
    }
}

function saveAnonymousNumbers() {
    fs.writeFileSync(numbersFilePath, JSON.stringify(anonymousUsers, null, 2));
}

function getRandomColor() {
    return Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'); // Zapewnia 6 znaków
}

function getUserAnonId(userId) {
    if (!anonymousUsers[userId]) {
        const anonId = Object.keys(anonymousUsers).length + 1;
        const color = getRandomColor();
        anonymousUsers[userId] = { anonId, color };
        saveAnonymousNumbers();
    }
    return anonymousUsers[userId];
}

function handleAnonymousMessage(message) {
    message.delete();
    const userId = message.author.id;
    const { anonId, color } = getUserAnonId(userId);
    const anonMessage = `Anonimowy (ID: ${anonId})`;

    // URL do miniaturki z generowanym kolorem i numerem anonimowym
   

    const embed = new MessageEmbed()
    .setAuthor({ name: `${anonMessage}`, iconURL: `https://dummyimage.com/100x100/${color}/ffffff&text=${anonId}`, url: 'https://discord.js.org' })
        .setColor(`#${color}`)
        .setDescription(`\`\`\`${message.content}\`\`\``)

    // Dodanie opóźnienia przed wysłaniem wiadomości
    
    setTimeout(() => {
        message.channel.send({ embeds: [embed] });
            
    }, 1000); // 1 sekunda opóźnienia
}

module.exports = {
    name: 'hej',
    handleAnonymousMessage,
    loadAnonymousNumbers,
    saveAnonymousNumbers,
};
