const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'clear',
    description: 'Usuwa określoną liczbę wiadomości z czatu.',
    async execute(message, args) {
        // ID użytkownika z uprawnieniami do usuwania wiadomości (np. ID administratora lub dewelopera)
        const userId = '1142532888450060419';

        if (message.author.id !== userId) {
            const noPermissionEmbed = new MessageEmbed()
                .setColor('#ff8080')
                .setAuthor({
                    name: 'Brak uprawnień',
                    iconURL: 'https://cdn.discordapp.com/attachments/1263273354572468265/1263273386507898880/elkooo.png',
                })
                .setDescription('Tylko **deweloper bota** może używać tej komendy!');
            return message.channel.send({ embeds: [noPermissionEmbed] });
        }

        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount <= 0 || amount > 100) {
            const errorEmbed = new MessageEmbed()
                .setColor('#ff8080')
                .setDescription('Proszę podać poprawną liczbę wiadomości do usunięcia (1-100).');
            return message.channel.send({ embeds: [errorEmbed] });
        }

        try {
            const messages = await message.channel.bulkDelete(amount, true);
            const successEmbed = new MessageEmbed()
                .setColor('#bdfff4')
                .setDescription(`Usunięto **${messages.size}** wiadomości.`);
            message.channel.send({ embeds: [successEmbed] }).then(msg => {
                setTimeout(() => msg.delete(), 5000);
            });
        } catch (err) {
            console.error(err);
            const errorEmbed = new MessageEmbed()
                .setColor('#ff8080')
                .setDescription('Wystąpił błąd podczas próby usunięcia wiadomości.');
            message.channel.send({ embeds: [errorEmbed] });
        }
    },
};
