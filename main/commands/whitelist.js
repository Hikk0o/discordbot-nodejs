const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageButton, MessageActionRow, MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('whitelist')
        .setDescription('Добавляет вас в Whitelist сервера Minecraft.')
        .addStringOption(option =>
            option.setName('nickname')
                .setDescription('Здесь вы должны написать свой ник в майнкрафте')
                .setRequired(true)),
    async execute(interaction, client) {
        let options = interaction.options._hoistedOptions
        let embed = new MessageEmbed()
            .setColor('DARK_GOLD')
            .setDescription(`:warning: Перед добавлением в Whitelist вам нужно принять правила сервера.\n
            Перейти к списку правил вы можете по кнопке "Правила сервера" под этим сообщением.`)
            .setTitle(options[0].value)

        const rules = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setLabel('Правила сервера')
                    .setURL('https://yandex.ru')
                    .setStyle('LINK'),
                new MessageButton()
                    .setCustomId('accept_rules')
                    .setLabel('Ознакомлен(а) и принимаю')
                    .setStyle('SUCCESS'),
                new MessageButton()
                    .setCustomId('deny_rules')
                    .setLabel('Отказаться')
                    .setStyle('DANGER'),
            );

        interaction.reply({
            content: `Подтвержение выслано вам в личные сообщения. Это сообщение вы можете скрыть.`,
            ephemeral: true
        })
        let member = client.users.cache.get(interaction.user.id);
        member.send({ embeds: [embed], components: [rules] });

        console.log('Pong!')
    }
};