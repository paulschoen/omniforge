import { constructUrl } from './messages';
import { client } from '../../apollo/client';
import { gql } from 'apollo-server-express';
import fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';
import puppeteer from 'puppeteer';

const GET_ALL_DATASHEETS = gql`
  query GetDatasheets {
    getDatasheets {
      id
      name
      link
      legend
      faction {
        id
        name
      }
    }
  }
`;

export const SEARCH_NAME = gql`
  query SearchDatasheetsByName($name: String!) {
    searchDatasheetsByName(name: $name) {
      id
      name
      link
      legend
      faction {
        id
        name
      }
    }
  }
`;

export const UPLOAD_IMAGE = gql`
  mutation UploadImage($file: Upload!, $id: String!) {
    uploadImage(file: $file, id: $id)
  }
`;

export const DOWNLOAD_IMAGE = gql`
  query Query($downloadImageId: String!) {
    downloadImage(id: $downloadImageId)
  }
`;

const getAllDatasheets = async () => {
  const { data } = await client.query({
    query: GET_ALL_DATASHEETS,
  });
  return data.getDatasheets;
};

// Upload image to the server
export const uploadImage = async (screenshotPath: string, id: string) => {
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
  } catch (error) {
    console.error('Error uploading image:', error);
  }
};

export const takeElementScreenshot = async (
  datasheets: any[],
  selector = '.unit'
): Promise<void> => {
  const browser = await puppeteer.launch({
    headless: true,
  });

  for (const datasheet of datasheets) {
    const { id, name, faction } = datasheet;
    const { name: factionName } = faction;
    const screenshotPath = `/tmp/${id}.png`;
    const screenshotUrl = constructUrl(factionName, name);
    try {
      console.log(`Taking screenshot for ${name}`);
      const page = await browser.newPage();
      await page.setViewport({ width: 500, height: 2000 });
      await page.goto(screenshotUrl, { waitUntil: 'networkidle2' });

      await page.waitForSelector(selector);
      const element = await page.$(selector);

      if (element) {
        console.log(`Screenshot taken for ${name}`);
        await element.screenshot({
          path: screenshotPath,
          fromSurface: true,
          type: 'jpeg',
          quality: 70,
        });
      }
    } catch (error) {
      console.error(`Failed to take screenshot: ${error.message}`);
    }

    try {
      console.log(`Uploading image for ${name}`);
      await uploadImage(screenshotPath, id);
      console.log(`Image uploaded for ${name}`);
    } catch (error) {
      console.error(`Failed to upload image: ${error.message}`);
    }
  }

  console.log('Closing browser');
  await browser.close();
};

export const takeScreenshots = async () => {
  let datasheets = [];
  try {
    datasheets = await getAllDatasheets();
  } catch (error) {
    console.error('Error fetching datasheets:', error);
  }
  await takeElementScreenshot(datasheets);
};

takeScreenshots();
