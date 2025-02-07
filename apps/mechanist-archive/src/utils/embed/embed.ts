/* eslint-disable @typescript-eslint/restrict-template-expressions -- not a fan of this rule */
import { AttachmentBuilder, EmbedBuilder } from 'discord.js';
import { determineFactionColor } from '@omniforge/constants';
import { Logger } from '@omniforge/utils';

interface MessagedEmbed {
  id: number;
  dataSheetName: string;
  url: string;
  legend?: string;
  factionName?: string;
  factionId?: string;
  imageBase64?: string;
}

export const createDatasheetEmbed = ({
  id,
  dataSheetName,
  url,
  legend = '',
  factionName,
  factionId,
  imageBase64,
}: MessagedEmbed): { embed: EmbedBuilder; file: AttachmentBuilder | null } => {
  const factionColor = determineFactionColor(factionId);

  const embedBuilder = new EmbedBuilder()
    .setTitle(dataSheetName)
    .setDescription(legend)
    .setURL(url)
    .setFooter({ text: factionName ?? 'Unaligned Forces' })
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
    Logger.error(
      `Failed to create image attachment for datasheet ${id}: ${error}`,
    );
    throw new Error('Invalid image data provided');
  }
};
