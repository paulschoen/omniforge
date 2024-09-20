import { EmbedBuilder, APIEmbedField } from 'discord.js';

interface IMessagedEmbed {
  title: string;
  description: string;
  url?: string;
  fields?: APIEmbedField[];
  footer?: string;
}

export function createEmbed({
  title,
  url,
  description,
  fields = [],
  footer,
}: IMessagedEmbed) {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .addFields(fields)
    .setURL(url)
    .setFooter({
      text: footer,
    })
    .setColor('#9a1115');
}
