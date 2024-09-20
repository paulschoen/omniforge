import { gql } from 'apollo-server-express';

export const SEARCH_NAME = gql`
  query SearchDatasheetsByName($name: String!) {
    searchDatasheetsByName(name: $name) {
      name
      link
      loadout
      legend
      keywords {
        keyword
      }
      faction {
        id
        name
      }
      models_cost {
        description
        cost
      }
      models {
        OC
        Ld
        M
        Sv
        T
        W
        inv_sv
      }
    }
  }
`;
