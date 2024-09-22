import { Message, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { client } from '../../apollo/client';
import {
  DOWNLOAD_IMAGE,
  SEARCH_NAME,
} from '../../apollo/query/searchName.graphql';
import { createDatasheetEmbed } from '../embed/embed';
import puppeteer from 'puppeteer';
import fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';

interface SearchResult {
  searchDatasheetsByName: Array<{
    id: number;
    name: string;
    legend: string;
    link: string;
    faction: {
      name: string;
      id: string;
    };
  }>;
}

interface ImageDownloadResult {
  downloadImage: string;
}

// Constants
const BASE_URL = 'https://game-datacards.eu/viewer';

// Function to construct URL
const constructUrl = (factionName: string, dataSheetName: string): string => {
  const formatString = (str: string) =>
    encodeURIComponent(
      str.toLowerCase().trim().replace(/’/g, "'").replace(/\s/g, '-')
    );

  const formatDataSheetName = (str: string) =>
    encodeURIComponent(str.toLowerCase().trim().replace(/\s/g, '-'));

  // Normalize specific faction name
  const normalizedFactionName =
    factionName === 'Leagues of Votann' ? 'votann' : factionName;

  const formattedFactionName = formatString(normalizedFactionName);
  const formattedDataSheetName = formatDataSheetName(dataSheetName);

  const url = `${BASE_URL}/${formattedFactionName}/${formattedDataSheetName}`;
  console.debug('Constructed URL:', url);

  return url;
};

// Function to take screenshot
const takeElementScreenshot = async (
  url: string,
  imagePath: string,
  selector = '.unit'
): Promise<void> => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 500, height: 2000 });
    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.waitForSelector(selector);
    const element = await page.$(selector);

    if (element) {
      await element.screenshot({
        path: imagePath,
        fromSurface: true,
        type: 'jpeg',
        quality: 70,
      });
    }

    await browser.close();
  } catch (error) {
    console.error(`Failed to take screenshot: ${error.message}`);
  }
};

// Interface for ProcessMessage
interface ProcessMessage {
  embed: EmbedBuilder | null;
  file: AttachmentBuilder | null;
}

// Function to fetch data from GraphQL
const fetchDataFromGraphQL = async <T>(
  query: any,
  variables: object
): Promise<T | null> => {
  try {
    const { data, error } = await client.query({ query, variables });
    if (error) {
      console.error('GraphQL Query Error:', JSON.stringify(error));
      return null;
    }
    return data;
  } catch (error) {
    console.error('GraphQL execution error:', error);
    return null;
  }
};

// Function to process message
export const processMessage = async (
  item: string | null
): Promise<ProcessMessage | null> => {
  if (!item) return null;

  const searchResult = await fetchDataFromGraphQL<SearchResult>(SEARCH_NAME, {
    name: item,
  });

  if (!searchResult || !searchResult.searchDatasheetsByName.length) {
    return {
      embed: new EmbedBuilder().setDescription(`No item found for ${item}.`),
      file: null,
    };
  }

  const { id, name, legend, link, faction } =
    searchResult.searchDatasheetsByName[0];
  const { name: factionName, id: factionId } = faction;
  let imageBase64 = '';

  const imageDownloadResult = await fetchDataFromGraphQL<ImageDownloadResult>(
    DOWNLOAD_IMAGE,
    {
      downloadImageId: id.toString(),
    }
  );

  if (imageDownloadResult) {
    imageBase64 = imageDownloadResult.downloadImage;
  }

  if (!imageBase64) {
    const screenshotPath = `/tmp/${id}.png`;
    const screenshotUrl = constructUrl(factionName, name);
    await takeElementScreenshot(screenshotUrl, screenshotPath);

    try {
      const form = new FormData();

      form.append(
        'operations',
        JSON.stringify({
          query:
            'mutation UploadImage($file: Upload!, $id: String!) { uploadImage(file: $file, id: $id) }',
          variables: {
            id: id.toString(),
            file: null,
          },
          operationName: 'UploadImage',
        })
      );

      form.append('map', JSON.stringify({ '0': ['variables.file'] }));
      form.append('0', fs.createReadStream(screenshotPath));

      const response = await axios({
        url: process.env.GQ_GATEWAY_URL,
        method: 'POST',
        data: form,
        headers: {
          ...form.getHeaders(),
          'x-apollo-operation-name': 'uploadImage',
          'x-api-key': process.env.API_KEY as string,
        },
      });

      console.log('Image uploaded successfully:', response.data);

      const imageBuffer = await fs.promises.readFile(screenshotPath);
      imageBase64 = imageBuffer.toString('base64');
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }

  return createDatasheetEmbed({
    id,
    dataSheetName: name,
    legend,
    url: link,
    factionName,
    factionId,
    imageBase64,
  });
};

// Function to handle creation of a message
export const handleCreateMessage = async (message: Message): Promise<void> => {
  if (message.author.bot) return;

  try {
    const embeds: EmbedBuilder[] = [];
    const files: AttachmentBuilder[] = [];
    const matches = [...message.content.matchAll(/{{(.*?)}}/g)];

    for (const match of matches) {
      const item = match[1];
      const result = await processMessage(item);
      if (result) {
        const { embed, file } = result;
        embed && embeds.push(embed);
        file && files.push(file);
      }
    }

    if (embeds.length || files.length) {
      await message.reply({ embeds, files });
    }
  } catch (err) {
    console.error('Error handling message creation:', err);
  }
};
