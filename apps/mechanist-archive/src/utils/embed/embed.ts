import { EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { determineFactionColor } from '@omniforge/shared-constants';

interface IMessagedEmbed {
  id: string;
  dataSheetName: string;
  url: string;
  legend?: string;
  factionName?: string;
  factionId?: string;
  imageBase64?: string;
}

export function createDatasheetEmbed({
  id,
  dataSheetName,
  url,
  legend = '',
  factionName,
  factionId,
  imageBase64,
}: IMessagedEmbed) {
  const factionColor = determineFactionColor(factionId);

  const embedBuilder = new EmbedBuilder()
    .setTitle(dataSheetName)
    .setDescription(legend)
    .setURL(url)
    .setFooter({ text: factionName })
    .setColor(factionColor);

  if (!imageBase64) {
    return { embed: embedBuilder, file: null };
  }

  try {
    const bufferResult = Buffer.from(imageBase64, 'base64');
    const file = new AttachmentBuilder(bufferResult, { name: `${id}.png` });

    embedBuilder.setImage(`attachment://${id}.png`);

    return { embed: embedBuilder, file };
  } catch (error) {
    console.error('Error converting base64 to buffer:', error);
    throw new Error('Invalid image data provided');
  }
}
