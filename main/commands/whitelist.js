const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageButton, MessageActionRow, MessageEmbed } = require("discord.js");
const config = require('../config.json');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('whitelist')
        .setDescription('Добавляет вас в Whitelist сервера Minecraft.')
        .addStringOption(option =>
            option.setName('nickname')
                .setDescription('Ник в Minecraft')
                .setRequired(true)),
    async execute(interaction, client) {
        let options = interaction.options._hoistedOptions
        let embed = new MessageEmbed()
            .setColor('ORANGE')
            .setDescription(`:warning: Перед добавлением в Whitelist вам нужно принять правила сервера.\n\n` +
                `Перейти к списку правил вы можете, нажав на кнопку **\`Правила сервера\`** под этим сообщением.`)
            .setTitle(options[0].value)

        const rules = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setLabel('Правила сервера')
                    .setURL(config.URL_RULES)
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

        const nickname = options[0].value.split(' ');
        if (nickname.length > 1) {
            let warn_embed = new MessageEmbed()
                .setColor('ORANGE')
                .setDescription(`:warning: Никнейм не должен иметь пробелы.`)
            interaction.reply({
                embeds: [warn_embed],
                ephemeral: true
            })
            return
        }
        let verify_embed = new MessageEmbed()
            .setColor('GREEN')
            .setDescription(`:white_check_mark: Подтверждение выслано вам в личные сообщения. Это сообщение вы можете скрыть.`)
        interaction.reply({
            embeds: [verify_embed],
            ephemeral: true
        })
        let member = client.users.cache.get(interaction.user.id);
        member.send({ embeds: [embed], components: [rules] });

        /*console.log('Pong!')*/
    }
};