import { gql } from 'apollo-server-express';

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
