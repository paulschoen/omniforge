import { EmbedBuilder, APIEmbedField } from 'discord.js';
import { determineFactionColor } from '@omniforge/shared-constants';

interface IMessagedEmbed {
  dataSheetName: string;
  description: string;
  url?: string;
  fields?: APIEmbedField[];
  factionName?: string;
  factionId?: string;
}

export function createDatasheetEmbed({
  dataSheetName,
  url,
  description,
  fields = [],
  factionName,
  factionId,
}: IMessagedEmbed) {
  const factionColor = determineFactionColor(factionId);

  return new EmbedBuilder()
    .setTitle(dataSheetName)
    .setDescription(description)
    .addFields(fields)
    .setURL(url)
    .setFooter({
      text: factionName || 'No faction',
    })
    .setColor(factionColor);
}
