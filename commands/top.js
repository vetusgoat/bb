const { MessageAttachment, MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const messageCountFilePath = path.join(__dirname, '../data/message_count.json');
const backgroundImagePath = path.join(__dirname, '../assets/bg.png'); // Nowe tło

module.exports = {
    name: 'top',
    description: 'Displays the top 3 users by message count as an image',
    async execute(message, args) {
        // Sprawdzanie argumentów
        if (args[0] === 'reset') {
            resetMessageCounts(message);
            return;
        }

        // Wczytaj dane z pliku JSON
        let messageCounts = {};
        if (fs.existsSync(messageCountFilePath)) {
            const data = fs.readFileSync(messageCountFilePath);
            messageCounts = JSON.parse(data);
        }

        // Sortuj użytkowników według liczby wiadomości
        const sortedUsers = Object.entries(messageCounts)
            .map(([userId, { count }]) => ({ userId, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

        // Przygotuj dane do obrazka
        const canvas = createCanvas(1024, 1024); // Zwiększone tło
        const ctx = canvas.getContext('2d');

        // Załaduj tło podium
        const podiumBackground = await loadImage(backgroundImagePath);
        ctx.drawImage(podiumBackground, 0, 0, canvas.width, canvas.height);

        // Ustawienia stylów
        ctx.fillStyle = '#FFFFFF'; // Kolor tekstu
        ctx.textAlign = 'center';

        // Wyświetl tytuł
        ctx.font = 'bold 40px Arial';
        ctx.fillText('Top 3 Users', canvas.width / 2, 60);

        // Wyświetl rankingi i awatary
        const avatarSize = 256; // Rozmiar awatarów
        const radius = 40; // Promień zaokrąglenia rogów
        ctx.textAlign = 'center';

        for (let i = 0; i < sortedUsers.length; i++) {
            const user = sortedUsers[i];
            const x = i === 0 ? 384 : (i === 1 ? 22 : 746);
            const y = i === 0 ? 22 : (i === 1 ? 214 : 406);

            // Załaduj i umieść awatar
            try {
                const userInfo = await message.guild.members.fetch(user.userId);
                const avatarURL = userInfo.user.displayAvatarURL({ format: 'png', size: 256 }); // Rozmiar 256x256
                const avatarImage = await loadImage(avatarURL);

                // Rysowanie zaokrąglonego prostokąta
                ctx.save(); // Zapisz stan kontekstu
                roundRect(ctx, x, y, avatarSize, avatarSize, radius);
                ctx.clip(); // Ustal zaokrąglenie

                ctx.drawImage(avatarImage, x, y, avatarSize, avatarSize);
                ctx.restore(); // Przywróć stan kontekstu

                // Ustal rozmiar czcionki dla nickname
                let nickname = userInfo.displayName;
                let fontSize = 60; // Początkowy rozmiar czcionki
                let textWidth;

                // Dopasuj rozmiar czcionki, aby pasował do szerokości awatara
                do {
                    ctx.font = `bold ${fontSize}px Arial`;
                    textWidth = ctx.measureText(nickname).width;
                    fontSize -= 2; // Zmniejszaj czcionkę, aż tekst będzie pasował
                } while (textWidth > avatarSize * 0.9 && fontSize > 10);

                // Ustaw ostateczny rozmiar czcionki
                ctx.font = `bold ${fontSize}px Arial`;

                // Wyśrodkowanie nickname
                ctx.fillText(nickname, x + avatarSize / 2, y + avatarSize + fontSize + 20); // Umieść tekst pod awatarem

            } catch (error) {
                console.error('Failed to load user avatar:', error);
            }
        }

        // Zapisz obrazek jako buffer
        const buffer = canvas.toBuffer();
        const attachment = new MessageAttachment(buffer, 'top_users.png');

        // Przygotuj oba embedy
        const titleEmbed = new MessageEmbed()
            .setTitle(`TOP DNIA  ·  ${new Date().toLocaleDateString()}`) // Ustawienie tytułu z dzisiejszą datą

        const statsEmbed = new MessageEmbed()
            .setDescription(`
:first_place: <@${sortedUsers[0] ? sortedUsers[0].userId : 'No data available'}>
> -# \`${sortedUsers[0] ? sortedUsers[0].count : '0'}\` wiadomości

:second_place: <@${sortedUsers[1] ? sortedUsers[1].userId : 'No data available'}>
> -# \`${sortedUsers[1] ? sortedUsers[1].count : '0'}\` wiadomości

:third_place: <@${sortedUsers[2] ? sortedUsers[2].userId : 'No data available'}>
> -# \`${sortedUsers[2] ? sortedUsers[2].count : '0'}\` wiadomości
            `)


        // Wyślij najpierw embed z tytułem, potem embed ze statystykami oraz obrazek w kolejnej wiadomości
        message.channel.send({ 
            embeds: [titleEmbed] 
        })
        .then(() => {
            return message.channel.send({ 
                embeds: [statsEmbed], 
                files: [attachment] 
            });
        })
        .catch(err => console.error('Failed to send top users image and embed:', err));
    },
};

// Funkcja do resetowania liczby wiadomości
function resetMessageCounts(message) {
    if (fs.existsSync(messageCountFilePath)) {
        fs.writeFileSync(messageCountFilePath, JSON.stringify({}, null, 2)); // Zapisz pusty obiekt
    }

    // Powiadomienie o zakończeniu resetowania
    message.channel.send('Message counts have been reset.')
        .catch(err => console.error('Failed to send reset confirmation message:', err));
}

// Dodanie funkcji do rysowania prostokątów z zaokrąglonymi rogami
function roundRect(ctx, x, y, width, height, radius) {
    if (radius === undefined) {
        radius = 5;
    }

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arc(x + width - radius, y + radius, radius, -Math.PI / 2, 0);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2);
    ctx.lineTo(x + radius, y + height);
    ctx.arc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI);
    ctx.lineTo(x, y + radius);
    ctx.arc(x + radius, y + radius, radius, Math.PI, -Math.PI / 2);
    ctx.closePath();
    ctx.clip(); // Przytnij rysowanie do zaokrąglonego prostokąta
}
