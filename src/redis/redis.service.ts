import { Injectable } from "@nestjs/common";
import { Redis } from "ioredis";

@Injectable()
export class RedisService {
    private readonly client: Redis

    constructor() {
        this.client = new Redis({
            host: 'localhost',
            port: 6379
        })
    }

    async set(key: string, value: string, ttlSeconds?: number) {
        if(ttlSeconds) {
            await this.client.set(key, value, 'EX', ttlSeconds)
        } else {
            await this.client.set(key, value)
        }
    }

    async get(key: string): Promise<string | null> {
        return this.client.get(key)
    }

    async del(key: string): Promise<number> {
        return this.client.del(key)
    }
}