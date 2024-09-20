import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core';
import fetch from 'cross-fetch';

const createApolloClient = () => {
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': process.env.API_KEY,
  };

  return new ApolloClient({
    link: new HttpLink({
      uri: process.env.GQ_GATEWAY_URL,
      fetch,
      headers,
    }),
    cache: new InMemoryCache(),
  });
};

export const client = createApolloClient();
