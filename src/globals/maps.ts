import { NextWebSocketHandler } from 'next-plugin-websocket';
import { GlobalRef } from './GlobalRef';

type WebSocket = Parameters<NextWebSocketHandler>['0'];

const clientMapRef = new GlobalRef<Map<string, WebSocket>>('myapp.clients');
if (!clientMapRef.value) {
  clientMapRef.value = new Map<string, WebSocket>();
}

const tokenMapRef = new GlobalRef<Map<string, string>>('myapp.tokenmap');
if (!tokenMapRef.value) {
  tokenMapRef.value = new Map<string, string>();
}

const subscriptionMapRef = new GlobalRef<Map<string, string>>(
  'myapp.subscriptionMap'
);
if (!subscriptionMapRef.value) {
  subscriptionMapRef.value = new Map<string, string>();
}

/**
 * Stock Name to Socket Client Mapping
 */
export const clients = clientMapRef.value;
/**
 * Token to Stock Name Mapping
 */
export const tokenMap = tokenMapRef.value;
/**
 * Token to Subscription Code Mapping
 */
export const subscriptionMap = subscriptionMapRef.value;
