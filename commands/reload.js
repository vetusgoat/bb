const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'reload',
    description: 'Restartuje bota',
    execute(message) {
        
        const userId = '1142532888450060419';
        if (message.author.id !== userId) {
            const noPermissionEmbed = new MessageEmbed()
                .setColor('#ff8080')
                .setAuthor({
                    name: 'Missing permissions',
                    iconURL: 'https://cdn.discordapp.com/attachments/1263273354572468265/1263273386507898880/elkooo.png?ex=6699a285&is=66985105&hm=366525140ec20a778264a2482d8ec1369937bf3fce7fdc3478fefc0c7efd5813&',
                })
                .setDescription('Only the **bot developer** can use this command!');
            return message.channel.send({ embeds: [noPermissionEmbed] });
        }

        // Wyślij wiadomość o restarcie
        const restartEmbed = new MessageEmbed()
            .setColor('#000')
            .setDescription(`All commands have been **reloaded**!`); 

        message.channel.send({ embeds: [restartEmbed] }).then(() => {
          
            process.exit(0); //to zamyka proces ale pm2 go automatycznie otworzy znow ;DDD
        });
    },
};
