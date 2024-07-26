const { MessageEmbed } = require('discord.js');

// Funkcja do wysyłania wiadomości powitalnej
const welcomeMessage = async (member) => {
    // Kanał, do którego mają być wysyłane wiadomości powitalne
    const welcomeChannelId = '1266240518426198047';
    
    try {
        // Pobierz kanał za pomocą fetch
        const channel = await member.guild.channels.fetch(welcomeChannelId);

        if (!channel) {
            console.error('Kanał powitalny nie został znaleziony.');
            return;
        }

        // Pobierz liczbę członków serwera
        const memberCount = member.guild.memberCount;

        // Konfiguracja embedu powitalnego
        const embed = new MessageEmbed()
            .setDescription(`Zajrzyj na **[info](https://discord.com/channels/1028617846340735048/1248158348633702452/1266252158286827622)**!`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `${memberCount}  ·  dodaj vanity do statusu` });

        // Wyślij wiadomość powitalną
        const message = await channel.send({ 
            content: `<@${member.user.id}>`, // Pingowanie nowego członka
            embeds: [embed] 
        });



    } catch (error) {
        console.error('Wystąpił błąd podczas wysyłania wiadomości powitalnej:', error);
    }
};

module.exports = { welcomeMessage };
