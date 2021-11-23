const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageButton, MessageActionRow, MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong')
        .addStringOption(option =>
            option.setName('nickname')
                .setDescription('Здесь вы должны написать свой ник в майнкрафте')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('steam')
                .setDescription('Здесь вы должны написать свой ник в майнкрафте')
                .setRequired(true)),
    async execute(interaction) {
        let options = interaction.options._hoistedOptions
        let embed = new MessageEmbed()
            .setColor('RED')
            .setDescription(`<@${interaction.user.id}>\nNickname: ${options[0].value}\nЧто-то там: ${options[1].value}`)
        const rules = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('primary')
                    .setLabel('Принять')
                    .setStyle('PRIMARY'),
            );
        interaction.reply({ content: `Заявка`, embeds: [embed], components: [rules], ephemeral: false })
        console.log('Pong! ' + options[1].value)
    }
};