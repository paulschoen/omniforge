import { Message, EmbedBuilder } from 'discord.js';
import { client } from '../../apollo/client';
import { SEARCH_NAME } from '../../apollo/query/searchName.graphql';
import { createEmbed } from '../embed/embed';

// Utility function to convert HTML to Discord markdown
const convertHtmlToDiscord = (htmlString?: string): string => {
  if (!htmlString) return '';

  const replacements = [
    { regex: /<b>(.*?)<\/b>/gi, replacement: '**$1**' },
    { regex: /<strong>(.*?)<\/strong>/gi, replacement: '**$1**' },
    { regex: /<i>(.*?)<\/i>/gi, replacement: '*$1*' },
    { regex: /<em>(.*?)<\/em>/gi, replacement: '*$1*' },
    { regex: /<u>(.*?)<\/u>/gi, replacement: '__$1__' },
    { regex: /<s>(.*?)<\/s>/gi, replacement: '~~$1~~' },
    { regex: /<strike>(.*?)<\/strike>/gi, replacement: '~~$1~~' },
    { regex: /<\/?[^>]+(>|$)/g, replacement: '' }, // Remove other tags
  ];

  return replacements.reduce(
    (str, { regex, replacement }) => str.replace(regex, replacement),
    htmlString
  );
};

/**
 * Processes a message to check if it contains an item.
 *
 * @param message - The message to be processed.
 * @returns A promise that resolves to an EmbedBuilder or null.
 */
export const processMessage = async (
  message: Message
): Promise<EmbedBuilder | null> => {
  if (message.author.bot) return null;

  const item = message.content.match(/{{(.*?)}}/)?.[1];
  if (!item) return null;

  try {
    const { data, error } = await client.query({
      query: SEARCH_NAME,
      variables: { name: item },
    });

    if (error) {
      console.error(JSON.stringify(error));
      return null;
    }

    if (!data?.searchDatasheetsByName.length) {
      return createEmbed({
        title: 'No results found',
        description: 'womp womp',
      });
    }

    const { name, loadout, legend, link, keywords, faction } =
      data.searchDatasheetsByName[0];

    const fields = [
      {
        name: 'Loadout',
        value: convertHtmlToDiscord(loadout),
      },
      {
        name: 'Keywords',
        value: keywords
          .map(({ keyword }: { keyword: string }) => keyword)
          .join(', '),
      },
    ];

    return createEmbed({
      title: name,
      description: legend,
      fields,
      url: link,
      footer: faction?.name,
    });
  } catch (err) {
    console.error('Error processing message:', err);
    return null;
  }
};

/**
 * Handles the creation of a message.
 *
 * @param message - The message to be processed.
 * @returns A promise that resolves to void.
 */
export const handleCreateMessage = async (message: Message): Promise<void> => {
  try {
    const embed = await processMessage(message);

    if (embed) {
      await message.reply({ embeds: [embed] });
    }
  } catch (err) {
    console.error('Error handling message creation:', err);
  }
};
