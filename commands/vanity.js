const { Permissions } = require('discord.js');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'vanity',
    description: 'Sets or removes messages for the vanity status',
    execute(message, args, settings, saveSettings) {
        const guildId = message.guildId; // Guild ID

        // Check if the user has ADMINISTRATOR permissions
        if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            const noPermissionEmbed = new MessageEmbed()
                .setColor('#ff8080')
                .setAuthor({
                    name: 'Permission denied!',
                    iconURL: 'https://cdn.discordapp.com/attachments/1263273354572468265/1263273386507898880/elkooo.png?ex=6699a285&is=66985105&hm=366525140ec20a778264a2482d8ec1369937bf3fce7fdc3478fefc0c7efd5813&',
                })
                .setDescription('You **must** have `ADMINISTRATOR` permission to use this command!');

            message.channel.send({ embeds: [noPermissionEmbed] });
            return;
        }

        // Ensure settings are initialized for the guild
        if (!settings[guildId]) {
            settings[guildId] = {
                setVanityMessage: null,
                deleteVanityMessage: null,
                checkPhrase: null,
                targetChannelId: null,
                roleId: null,
            };
        }

        const guildSettings = settings[guildId];

        if (args[0] === 'setmessage') {
            const newMessage = args.slice(1).join(' ');
            if (newMessage) {
                guildSettings.setVanityMessage = newMessage;
                const commandEmbed = new MessageEmbed()
                    .setColor('#80ffb6')
                    .setAuthor({
                        name: 'Set vanity message changed!',
                        iconURL: 'https://cdn.discordapp.com/attachments/1263256844139233380/1263259695343472671/round-check-mark-symbol-with-transparent-background-free-png.png?ex=669995c5&is=66984445&hm=aad4059d5113ce41e5defff704c3d48cb5ede0d6d6f7d01bc1b0b067035b4819&',
                    })
                    .setDescription(`> New message: \n\`\`\`${guildSettings.setVanityMessage}\`\`\``);

                message.channel.send({ embeds: [commandEmbed] });
                saveSettings(); // Save settings after change
            } else {
                const commandEmbed = new MessageEmbed()
                    .setColor('#ff8080')
                    .setAuthor({
                        name: 'Missing args!',
                        iconURL: 'https://cdn.discordapp.com/attachments/1263273354572468265/1263273386507898880/elkooo.png?ex=6699a285&is=66985105&hm=366525140ec20a778264a2482d8ec1369937bf3fce7fdc3478fefc0c7efd5813&',
                    })
                    .setDescription('```.vanity setmessage <message>\n                       ^ missing argument ```');

                message.channel.send({ embeds: [commandEmbed] });
            }
        } else if (args[0] === 'deletemessage') {
            const newMessage = args.slice(1).join(' ');
            if (newMessage) {
                guildSettings.deleteVanityMessage = newMessage;
                const commandEmbed = new MessageEmbed()
                    .setColor('#80ffb6')
                    .setAuthor({
                        name: 'Delete vanity message changed!',
                        iconURL: 'https://cdn.discordapp.com/attachments/1263256844139233380/1263259695343472671/round-check-mark-symbol-with-transparent-background-free-png.png?ex=669995c5&is=66984445&hm=aad4059d5113ce41e5defff704c3d48cb5ede0d6d6f7d01bc1b0b067035b4819&',
                    })
                    .setDescription(`> New message: \n\`\`\`${guildSettings.deleteVanityMessage}\`\`\``);

                message.channel.send({ embeds: [commandEmbed] });
                saveSettings(); // Save settings after change
            } else {
                const commandEmbed = new MessageEmbed()
                    .setColor('#ff8080')
                    .setAuthor({
                        name: 'Missing args!',
                        iconURL: 'https://cdn.discordapp.com/attachments/1263273354572468265/1263273386507898880/elkooo.png?ex=6699a285&is=66985105&hm=366525140ec20a778264a2482d8ec1369937bf3fce7fdc3478fefc0c7efd5813&',
                    })
                    .setDescription('```.vanity deletemessage <message>\n                         ^ missing argument ```');

                message.channel.send({ embeds: [commandEmbed] });
            }
        } else if (args[0] === 'set') {
            const newPhrase = args.slice(1).join(' ');
            if (newPhrase) {
                guildSettings.checkPhrase = newPhrase;
                const commandEmbed = new MessageEmbed()
                    .setColor('#80ffb6')
                    .setAuthor({
                        name: 'Vanity changed!',
                        iconURL: 'https://cdn.discordapp.com/attachments/1263256844139233380/1263259695343472671/round-check-mark-symbol-with-transparent-background-free-png.png?ex=669995c5&is=66984445&hm=aad4059d5113ce41e5defff704c3d48cb5ede0d6d6f7d01bc1b0b067035b4819&',
                    })
                    .setDescription(`> New vanity: \n\`\`\`${guildSettings.checkPhrase}\`\`\``);

                message.channel.send({ embeds: [commandEmbed] });
                saveSettings(); // Save settings after change
            } else {
                const commandEmbed = new MessageEmbed()
                    .setColor('#ff8080')
                    .setAuthor({
                        name: 'Missing args!',
                        iconURL: 'https://cdn.discordapp.com/attachments/1263273354572468265/1263273386507898880/elkooo.png?ex=6699a285&is=66985105&hm=366525140ec20a778264a2482d8ec1369937bf3fce7fdc3478fefc0c7efd5813&',
                    })
                    .setDescription('```.vanity set <vanity>\n                 ^ missing argument ```');

                message.channel.send({ embeds: [commandEmbed] });
            }
        } else if (args[0] === 'setchannel') {
            const channelId = args[1];
            if (channelId) {
                guildSettings.targetChannelId = channelId;
                const commandEmbed = new MessageEmbed()
                    .setColor('#80ffb6')
                    .setAuthor({
                        name: 'Target channel changed!',
                        iconURL: 'https://cdn.discordapp.com/attachments/1263256844139233380/1263259695343472671/round-check-mark-symbol-with-transparent-background-free-png.png?ex=669995c5&is=66984445&hm=aad4059d5113ce41e5defff704c3d48cb5ede0d6d6f7d01bc1b0b067035b4819&',
                    })
                    .setDescription(`> New channel: <#${guildSettings.targetChannelId}>`);

                message.channel.send({ embeds: [commandEmbed] });
                saveSettings(); // Save settings after change
            } else {
                const commandEmbed = new MessageEmbed()
                    .setColor('#ff8080')
                    .setAuthor({
                        name: 'Missing args!',
                        iconURL: 'https://cdn.discordapp.com/attachments/1263273354572468265/1263273386507898880/elkooo.png?ex=6699a285&is=66985105&hm=366525140ec20a778264a2482d8ec1369937bf3fce7fdc3478fefc0c7efd5813&',
                    })
                    .setDescription('```.vanity setchannel <CHANNEL_ID>\n                         ^ missing argument ```');

                message.channel.send({ embeds: [commandEmbed] });
            }
        } else if (args[0] === 'setrole') {
            const roleId = args[1];
            if (roleId) {
                guildSettings.roleId = roleId;
                const commandEmbed = new MessageEmbed()
                    .setColor('#80ffb6')
                    .setAuthor({
                        name: 'Role changed!',
                        iconURL: 'https://cdn.discordapp.com/attachments/1263256844139233380/1263259695343472671/round-check-mark-symbol-with-transparent-background-free-png.png?ex=669995c5&is=66984445&hm=aad4059d5113ce41e5defff704c3d48cb5ede0d6d6f7d01bc1b0b067035b4819&',
                    })
                    .setDescription(`> New role: <@&${guildSettings.roleId}>`);

                message.channel.send({ embeds: [commandEmbed] });
                saveSettings(); // Save settings after change
            } else {
                const commandEmbed = new MessageEmbed()
                    .setColor('#ff8080')
                    .setAuthor({
                        name: 'Missing args!',
                        iconURL: 'https://cdn.discordapp.com/attachments/1263273354572468265/1263273386507898880/elkooo.png?ex=6699a285&is=66985105&hm=366525140ec20a778264a2482d8ec1369937bf3fce7fdc3478fefc0c7efd5813&',
                    })
                    .setDescription('```.vanity setrole <ROLE_ID>\n                      ^ missing argument ```');

                message.channel.send({ embeds: [commandEmbed] });
            }
        } else if (args[0] === 'settings') {
            const currentSettingsEmbed = new MessageEmbed()
                .setColor('#80b6ff')
                .setAuthor({
                    name: 'Current vanity settings',
                    iconURL: 'https://cdn.discordapp.com/attachments/1263273354572468265/1263273681614929983/Bez_eeee3.png?ex=6699a2cc&is=6698514c&hm=f824085f6913c40dcaf027c2b4926afb056c9d29ab0f2ef8371021ee4fe75e70&',
                })
                .addFields(
                    { name: 'Set vanity message', value: guildSettings.setVanityMessage ? `\`\`\`${guildSettings.setVanityMessage}\`\`\`` : '-# Not set', inline: false },
                    { name: 'Delete vanity message', value: guildSettings.deleteVanityMessage ? `\`\`\`${guildSettings.deleteVanityMessage}\`\`\`` : '-# Not set', inline: false },
                    { name: 'Vanity', value: guildSettings.checkPhrase ? `\`\`\`${guildSettings.checkPhrase}\`\`\`` : '-# Not set', inline: false },
                    { name: 'Channel', value: guildSettings.targetChannelId ? `<#${guildSettings.targetChannelId}>` : '-# Not set', inline: false },
                    { name: 'Role', value: guildSettings.roleId ? `<@&${guildSettings.roleId}>` : '-# Not set', inline: false }
                );

            message.channel.send({ embeds: [currentSettingsEmbed] });
        } else if (args[0] === 'reset') {
            // Reset all settings to null
            settings[guildId] = {
                setVanityMessage: null,
                deleteVanityMessage: null,
                checkPhrase: null,
                targetChannelId: null,
                roleId: null,
            };
            saveSettings(); // Save changes
            message.channel.send('All vanity settings have been reset to null.');
        } else {
            const commandEmbed = new MessageEmbed()
                .setColor('#fffbb6')
                .setAuthor({
                    name: 'Help with vanity module',
                    iconURL: 'https://cdn.discordapp.com/attachments/1263273354572468265/1263273681614929983/Bez_eeee3.png?ex=6699a2cc&is=6698514c&hm=f824085f6913c40dcaf027c2b4926afb056c9d29ab0f2ef8371021ee4fe75e70&',
                })
                .addFields(
                    { name: '.vanity set', value: '```Syntax: set (vanity)\nExample: set randomvanity```\n-# If you will set vanity as in the example, in status will work:\n-# `discord.gg/randomvanity`  ,  `.gg/randomvanity`\n-# `gg/randomvanity`  ,  `/randomvanity`', inline: false },
                    { name: '.vanity setmessage', value: '```Syntax: setmessage (message)\nExample: setmessage Thanks for setting our vanity!```', inline: false },
                    { name: '.vanity deletemessage', value: '```Syntax: deletemessage (message)\nExample: deletemessage You are deleted our vanity.```', inline: false },
                    { name: '.vanity setchannel', value: '```Syntax: setchannel (CHANNEL_ID)\nExample: setchannel 1261306923945558080```', inline: false },
                    { name: '.vanity setrole', value: '```Syntax: setrole (ROLE_ID)\nExample: setrole 1261306923945558080```', inline: false }
                )
                .setFooter({ text: 'You can check server settings of vanity module by:  .vanity settings', iconURL: 'https://cdn.discordapp.com/attachments/1263273354572468265/1263273374809985054/Bez_nazwy-3.png?ex=6699a283&is=66985103&hm=3ae57ff2c82cdf62ac1d2b9f02841f4959bb754eadadda078bf309bccf83d675&' });

            const missingSettingsEmbed = new MessageEmbed()
                .setColor('#ff8080')
                .setAuthor({
                    name: 'Missing functions',
                    iconURL: 'https://cdn.discordapp.com/attachments/1263273354572468265/1263273386507898880/elkooo.png?ex=6699a285&is=66985105&hm=366525140ec20a778264a2482d8ec1369937bf3fce7fdc3478fefc0c7efd5813&',
                })
                .setTimestamp();

            let hasMissingSettings = false;

            if (!guildSettings.setVanityMessage) {
                missingSettingsEmbed.addFields({ name: 'Set vanity message', value: '```Use .vanity setmessage [message] to set it```', inline: false });
                hasMissingSettings = true;
            }
            if (!guildSettings.deleteVanityMessage) {
                missingSettingsEmbed.addFields({ name: 'Delete Vanity Message', value: '```Use .vanity deletemessage [message] to set it```', inline: false });
                hasMissingSettings = true;
            }
            if (!guildSettings.checkPhrase) {
                missingSettingsEmbed.addFields({ name: 'Server vanity', value: '```Use .vanity set [vanity] to set it```', inline: false });
                hasMissingSettings = true;
            }
            if (!guildSettings.targetChannelId) {
                missingSettingsEmbed.addFields({ name: 'Target Channel', value: '```Use .vanity setchannel [ID] to set it```', inline: false });
                hasMissingSettings = true;
            }
            if (!guildSettings.roleId) {
                missingSettingsEmbed.addFields({ name: 'Role', value: '```Use .vanity setrole [ROLE_ID] to set it```', inline: false });
                hasMissingSettings = true;
            }

            // Send both embeds together if there are missing settings
            if (hasMissingSettings) {
                message.channel.send({ embeds: [commandEmbed, missingSettingsEmbed] });
            } else {
                message.channel.send({ embeds: [commandEmbed] });
            }
        }
    },
};
