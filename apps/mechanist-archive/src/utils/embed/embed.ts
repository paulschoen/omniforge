import { EmbedBuilder, APIEmbedField, AttachmentBuilder } from 'discord.js';
import { determineFactionColor } from '@omniforge/shared-constants';

interface IMessagedEmbed {
  id: number;
  dataSheetName: string;
  url?: string;
  legend?: string;
  factionName?: string;
  factionId?: string;
  imageBase64?: string;
}

export function createDatasheetEmbed({
  id,
  dataSheetName,
  url,
  legend,
  factionName,
  factionId,
  imageBase64,
}: IMessagedEmbed) {
  const factionColor = determineFactionColor(factionId);
  const bufferResult = Buffer.from(imageBase64, 'base64');

  const file = new AttachmentBuilder(bufferResult, {
    name: `${id}.png`,
  });

  return {
    embed: new EmbedBuilder()
      .setTitle(dataSheetName)
      .setDescription(legend || '')
      .setURL(url)
      .setFooter({
        text: factionName || 'No faction',
      })
      .setColor(factionColor)
      .setImage(`attachment://${id}.png`),
    file,
  };
}
