import { Message, EmbedBuilder } from 'discord.js';
import { client } from '../../apollo/client';
import { SEARCH_NAME } from '../../apollo/query/searchName.graphql';
import { createDatasheetEmbed } from '../embed/embed';

interface Model {
  M?: string;
  T?: string;
  Sv?: string;
  W?: string;
  Ld?: string;
  OC?: string;
  inv_sv?: string;
}

interface Cost {
  description: string;
  cost: number;
}

interface Faction {
  name: string;
  id: string;
}

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
    { regex: /<\/?[^>]+(>|$)/g, replacement: '' },
    { regex: /<ul>/gi, replacement: '' },
    { regex: /<\/ul>/gi, replacement: '' },
    { regex: /<ol>/gi, replacement: '' },
    { regex: /<\/ol>/gi, replacement: '' },
    { regex: /<li>/gi, replacement: '• ' },
    { regex: /<\/li>/gi, replacement: '\n' },
  ];

  return replacements.reduce(
    (str, { regex, replacement }) => str.replace(regex, replacement),
    htmlString
  );
};

/**
 * Generates a description for models.
 *
 * @param models - Array of model objects.
 * @returns Formatted description string.
 */
const getDescription = (models: Model[] | undefined): string => {
  return (
    models
      ?.map((model) => {
        const { M, T, Sv, W, Ld, OC, inv_sv } = model;
        let description = `**M**: ${M ?? 'N/A'} | **T**: ${
          T ?? 'N/A'
        } | **Sv**: ${Sv ?? 'N/A'} | **W**: ${W ?? 'N/A'} | **Ld**: ${
          Ld ?? 'N/A'
        } | **OC**: ${OC ?? 'N/A'}`;

        if (inv_sv) {
          description += ` | **Inv Sv**: ${inv_sv}`;
        }

        return description;
      })
      .join('\n')
      .trim() || ''
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
      console.error('GraphQL Query Error:', JSON.stringify(error));
      return null;
    }

    if (!data?.searchDatasheetsByName.length) {
      return new EmbedBuilder().setDescription(
        `No datasheet found for "${item}"`
      );
    }

    const { name, loadout, models, link, keywords, faction, models_cost } =
      data.searchDatasheetsByName[0];
    const { name: factionName, id: factionId } = faction;

    const description = getDescription(models);

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
      {
        name: 'Cost',
        value: models_cost
          ?.map(({ description, cost }: Cost) => `__${description}__: ${cost}`)
          .join(', '),
      },
    ];

    return createDatasheetEmbed({
      dataSheetName: name,
      description,
      fields,
      url: link,
      factionName,
      factionId,
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
