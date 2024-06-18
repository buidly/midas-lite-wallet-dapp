import { EnvironmentsEnum } from 'types';

export * from './sharedConfig';

export const contractAddress =
  'erd1qqqqqqqqqqqqqpgqq3qsdxf55rlz5ka8mw3jdnacm8dlkuy09l5ql0wrlm';
export const API_URL = 'https://api.internal.midaschain.ai';
export const sampleAuthenticatedDomains = [API_URL];
export const environment = EnvironmentsEnum.testnet;
export const explorerAddress = 'https://explorer.internal.midaschain.ai';
