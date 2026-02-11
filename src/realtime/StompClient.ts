import { Client, type StompSubscription } from '@stomp/stompjs';
import { tokenStorage } from '@/shared/utils/token.util';

/**
 * Subscription registry entry storing both the active subscription and the callback
 * for automatic restoration on reconnect.
 */
interface SubscriptionEntry {
    subscription: StompSubscription;
    callback: (payload: unknown) => void;
}

/**
 * Singleton StompClient for managing WebSocket connections via STOMP over Native WebSockets.
 */
class StompClient {
    private client: Client | null = null;
    private subscriptions: Map<string, SubscriptionEntry> = new Map();
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
                    this.restoreSubscriptions();
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
                debug: () => {},
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
            });

            this.client.onConnect = () => {
                this.restoreSubscriptions();
                this.connectionPromise = null;
                resolve();
            };

            this.client.onStompError = (frame) => {
                if (import.meta.env.DEV) {
                    console.error('[STOMP] Stomp error:', frame.headers['message']);
                }
                this.connectionPromise = null;
                reject(new Error(frame.headers['message']));
            };

            this.client.onWebSocketError = (event) => {
                if (import.meta.env.DEV) {
                    console.error('[STOMP] WebSocket error:', event);
                }
                this.connectionPromise = null;
                reject(new Error('WebSocket connection failed'));
            };

            this.client.activate();
        });

        return this.connectionPromise;
    }

    /**
     * Restore all subscriptions after reconnect.
     * Called automatically in onConnect handler.
     */
    private restoreSubscriptions(): void {
        if (!this.client?.connected) return;

        // Re-subscribe to all topics with their original callbacks
        const topics = Array.from(this.subscriptions.keys());
        for (const topic of topics) {
            const entry = this.subscriptions.get(topic);
            if (entry) {
                const newSubscription = this.client.subscribe(topic, (message) => {
                    try {
                        const payload = JSON.parse(message.body);
                        entry.callback(payload);
                    } catch {
                        // Ignore parse errors
                    }
                });
                entry.subscription = newSubscription;
            }
        }
    }

    /**
     * Disconnect from the server and clear all active subscriptions.
     */
    public disconnect(): void {
        if (this.client) {
            this.subscriptions.forEach(entry => entry.subscription.unsubscribe());
            this.subscriptions.clear();
            this.client.deactivate();
            this.client = null;
        }
    }

    /**
     * Subscribe to a topic.
     * @param topic STOMP topic (e.g., /topic/chat/global)
     * @param callback Function to execute on message received
     * @returns Subscription ID for manual cleanup if needed
     */
    public async subscribe(topic: string, callback: (payload: unknown) => void): Promise<string> {
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
            } catch {
                // 메시지 파싱 실패 시 무시
            }
        });

        this.subscriptions.set(topic, { subscription, callback });
        return topic;
    }

    /**
     * Unsubscribe from a specific topic.
     */
    public unsubscribe(topic: string): void {
        const entry = this.subscriptions.get(topic);
        if (entry) {
            entry.subscription.unsubscribe();
            this.subscriptions.delete(topic);
        }
    }

    /**
     * Send a message/command to the server.
     */
    public send(destination: string, body: unknown): void {
        if (!this.client?.connected) return;
        this.client.publish({
            destination,
            body: JSON.stringify(body)
        });
    }
}

export const stompClient = new StompClient();
