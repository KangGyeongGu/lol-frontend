import { Client, type StompSubscription } from '@stomp/stompjs';
import { tokenStorage } from '@/utils/token.util';

/**
 * Singleton StompClient for managing WebSocket connections via STOMP over Native WebSockets.
 */
class StompClient {
    private client: Client | null = null;
    private subscriptions: Map<string, StompSubscription> = new Map();
    private connectionPromise: Promise<void> | null = null;

    /**
     * Connect to the WebSocket server.
     * Uses Bearer token for authentication if available.
     */
    public async connect(): Promise<void> {
        if (this.client?.connected) return;
        if (this.connectionPromise) return this.connectionPromise;

        this.connectionPromise = new Promise((resolve, reject) => {
            if (this.client?.active) {
                // Client is already active but not connected (e.g., reconnecting)
                // We just need to wait for the next connection
                const currentOnConnect = this.client.onConnect;
                this.client.onConnect = (frame) => {
                    if (currentOnConnect) currentOnConnect(frame);
                    this.connectionPromise = null;
                    resolve();
                };

                const currentOnWebSocketError = this.client.onWebSocketError;
                this.client.onWebSocketError = (event) => {
                    if (currentOnWebSocketError) currentOnWebSocketError(event);
                    this.connectionPromise = null;
                    reject(new Error('WebSocket connection failed during reconnect'));
                };
                return;
            }

            const token = tokenStorage.getAccessToken();
            // Determine protocol and host for native WebSocket (ws or wss)
            const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
            const host = window.location.host;
            // Native STOMP broker URL (standardized to /ws)
            const brokerURL = `${protocol}://${host}/ws?access_token=${token}`;

            this.client = new Client({
                brokerURL,
                connectHeaders: {
                    Authorization: `Bearer ${token}`
                },
                debug: (str) => {
                    if (import.meta.env.DEV) console.debug('[STOMP]', str);
                },
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
            });

            this.client.onConnect = () => {
                console.log('[STOMP] Connected');
                this.connectionPromise = null;
                resolve();
            };

            this.client.onStompError = (frame) => {
                console.error('[STOMP] Stomp error:', frame.headers['message']);
                this.connectionPromise = null;
                reject(new Error(frame.headers['message']));
            };

            this.client.onWebSocketError = (event) => {
                console.error('[STOMP] WebSocket error:', event);
                this.connectionPromise = null;
                reject(new Error('WebSocket connection failed'));
            };

            this.client.activate();
        });

        return this.connectionPromise;
    }

    /**
     * Disconnect from the server and clear all active subscriptions.
     */
    public disconnect(): void {
        if (this.client) {
            this.subscriptions.forEach(sub => sub.unsubscribe());
            this.subscriptions.clear();
            this.client.deactivate();
            this.client = null;
            console.log('[STOMP] Disconnected');
        }
    }

    /**
     * Subscribe to a topic.
     * @param topic STOMP topic (e.g., /topic/chat/global)
     * @param callback Function to execute on message received
     * @returns Subscription ID for manual cleanup if needed
     */
    public async subscribe(topic: string, callback: (payload: any) => void): Promise<string> {
        await this.connect();

        if (this.subscriptions.has(topic)) {
            return topic; // Already subscribed
        }

        if (!this.client?.connected) {
            throw new Error('STOMP client is not connected');
        }

        const subscription = this.client.subscribe(topic, (message) => {
            try {
                const payload = JSON.parse(message.body);
                callback(payload);
            } catch (e) {
                console.warn('[STOMP] Failed to parse message body', e);
            }
        });

        this.subscriptions.set(topic, subscription);
        return topic;
    }

    /**
     * Unsubscribe from a specific topic.
     */
    public unsubscribe(topic: string): void {
        const sub = this.subscriptions.get(topic);
        if (sub) {
            sub.unsubscribe();
            this.subscriptions.delete(topic);
        }
    }

    /**
     * Send a message/command to the server.
     */
    public send(destination: string, body: any): void {
        if (!this.client?.connected) {
            console.warn('[STOMP] Cannot send: Not connected');
            return;
        }
        this.client.publish({
            destination,
            body: JSON.stringify(body)
        });
    }
}

export const stompClient = new StompClient();
