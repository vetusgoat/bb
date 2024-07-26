const { Permissions, MessageEmbed } = require('discord.js');

module.exports = {
    name: 'unjail',
    description: 'Unjails a user from jail.',
    async execute(message, args) {
        // Sprawdź uprawnienia administratora
        if (!message.member.permissions.has(Permissions.FLAGS.MODERATE_MEMBERS)) {
            const noPermissionEmbed = new MessageEmbed()
                .setColor('#ff8080')
                .setAuthor({
                    name: 'Permission denied!',
                    iconURL: 'https://cdn.discordapp.com/attachments/1263273354572468265/1263273386507898880/elkooo.png?ex=6699a285&is=66985105&hm=366525140ec20a778264a2482d8ec1369937bf3fce7fdc3478fefc0c7efd5813&',
                })
                .setDescription('You **must** have `MODERATE_MEMBERS` permission to use this command!');

            message.channel.send({ embeds: [noPermissionEmbed] });
            
            return;
        }

        // Sprawdź czy użytkownik oznaczył osobę do unjail
        if (message.mentions.users.size !== 1) {
            const noPermissionEmbed = new MessageEmbed()
                .setColor('#ff8080')
                .setAuthor({
                    name: 'Jail module',
                    iconURL: 'https://cdn.discordapp.com/attachments/1263273354572468265/1263273386507898880/elkooo.png?ex=6699a285&is=66985105&hm=366525140ec20a778264a2482d8ec1369937bf3fce7fdc3478fefc0c7efd5813&',
                })
                .setDescription('-# Please mention the user that you want to unjail!');

            message.channel.send({ embeds: [noPermissionEmbed] });
            return;
        }

        const mentionedUser = message.mentions.members.first();

        try {
            // Sprawdź czy użytkownik ma rolę "jailed"
            const jailedRole = message.guild.roles.cache.find(role => role.name === 'jailed');

            if (!jailedRole || !mentionedUser.roles.cache.has(jailedRole.id)) {
                const noPermissionEmbed = new MessageEmbed()
                .setColor('#ff8080')
                .setAuthor({
                    name: 'Jail module',
                    iconURL: 'https://cdn.discordapp.com/attachments/1263273354572468265/1263273386507898880/elkooo.png?ex=6699a285&is=66985105&hm=366525140ec20a778264a2482d8ec1369937bf3fce7fdc3478fefc0c7efd5813&',
                })
                .setDescription(`-# ${mentionedUser.user.tag} is not currently jailed.`);

            message.channel.send({ embeds: [noPermissionEmbed] });
            return;
            }

            // Usuń rolę "jailed" użytkownikowi
            await mentionedUser.roles.remove(jailedRole);

            const successEmbed = new MessageEmbed()
            .setColor('#80ffb6')
            .setAuthor({
                name: 'Jailed!',
                iconURL: 'https://cdn.discordapp.com/attachments/1263256844139233380/1263259695343472671/round-check-mark-symbol-with-transparent-background-free-png.png?ex=669995c5&is=66984445&hm=aad4059d5113ce41e5defff704c3d48cb5ede0d6d6f7d01bc1b0b067035b4819&',
            })
            .setDescription(`-# > User ${mentionedUser.user.tag} has been unjailed.`);

        message.channel.send({ embeds: [successEmbed] });

        } catch (error) {
            console.error('Error unjailing user:', error);
            const noPermissionEmbed = new MessageEmbed()
                .setColor('#ff8080')
                .setAuthor({
                    name: 'Error [0x0000006]!',
                    iconURL: 'https://cdn.discordapp.com/attachments/1263273354572468265/1263273386507898880/elkooo.png?ex=6699a285&is=66985105&hm=366525140ec20a778264a2482d8ec1369937bf3fce7fdc3478fefc0c7efd5813&',
                })
                .setDescription(`-# Error unjailing user!\n\`\`\`${error}\`\`\``);

            message.channel.send({ embeds: [noPermissionEmbed] });
            return;
        }
    },
};