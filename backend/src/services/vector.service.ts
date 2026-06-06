import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { LLMService } from './llm.service';

const supabaseUrl = process.env.SUPABASE_URL || 'https://kscqvigvcfjdulonvdxa.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzY3F2aWd2Y2ZqZHVsb252ZHhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDY2MjAxMywiZXhwIjoyMDk2MjM4MDEzfQ.lNlB6nnfaeP9UADMPrMLBh0NzXr_EK6GYZB8TszR_KM';

const isLocalFallback = false;

let supabase: any = null;
const fallbackFilePath = path.join(process.cwd(), 'database.json');

try {
  if (!isLocalFallback) {
    supabase = createClient(supabaseUrl, supabaseKey);
  }
} catch (error) {
  console.error("CRITICAL ERROR IN VECTOR_SERVICE INIT:", error);
}

export interface UserMemory {
  id?: string;
  user_id: string;
  mission_name: string;
  locked_path: string;
  profile_text: string;
  embedding?: number[];
  outcome_summary: string;
  success_rate: number;
  created_at?: string;
}

// Simple Javascript Cosine Similarity helper
function calculateCosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export class VectorService {
  private static readLocalMemories(): UserMemory[] {
    try {
      if (!fs.existsSync(fallbackFilePath)) {
        return [];
      }
      const raw = fs.readFileSync(fallbackFilePath, 'utf8');
      const db = JSON.parse(raw);
      return db.user_memories || [];
    } catch (e) {
      console.error('VectorService: Error reading local database', e);
      return [];
    }
  }

  private static writeLocalMemories(memories: UserMemory[]) {
    try {
      let db: any = { missions: [], consistency_log: [], market_reports: [] };
      if (fs.existsSync(fallbackFilePath)) {
        const raw = fs.readFileSync(fallbackFilePath, 'utf8');
        db = JSON.parse(raw);
      }
      db.user_memories = memories;
      fs.writeFileSync(fallbackFilePath, JSON.stringify(db, null, 2));
    } catch (e) {
      console.error('VectorService: Error writing local database', e);
    }
  }

  /**
   * Initializes the vector store and seeds initial mock trajectories if empty.
   */
  static async init() {
    try {
      const currentCount = await this.getMemoriesCount();
      if (currentCount === 0) {
        console.log('VectorService: Seeding initial Hive Mind memories...');
        await this.seedMemories();
      }
    } catch (e) {
      console.error('VectorService: Initialization warning', e);
    }
  }

  private static async getMemoriesCount(): Promise<number> {
    if (isLocalFallback) {
      return this.readLocalMemories().length;
    }
    try {
      const { count, error } = await supabase
        .from('user_memories')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Saves a new user trajectory memory.
   */
  static async saveMemory(memory: Omit<UserMemory, 'id' | 'created_at'>): Promise<UserMemory> {
    const embedding = await LLMService.generateEmbedding(memory.profile_text);
    const fullMemory: UserMemory = {
      ...memory,
      id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      embedding,
      created_at: new Date().toISOString()
    };

    if (isLocalFallback) {
      const memories = this.readLocalMemories();
      memories.push(fullMemory);
      this.writeLocalMemories(memories);
      return fullMemory;
    } else {
      const { data, error } = await supabase
        .from('user_memories')
        .insert(fullMemory)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  }

  /**
   * Performs a vector cosine similarity search.
   */
  static async searchSimilarMemories(
    profileQueryText: string,
    limit = 5,
    matchThreshold = 0.6
  ): Promise<(UserMemory & { similarity: number })[]> {
    try {
      const queryEmbedding = await LLMService.generateEmbedding(profileQueryText);

      if (isLocalFallback) {
        const memories = this.readLocalMemories();
        const results = memories
          .map(mem => {
            const similarity = mem.embedding
              ? calculateCosineSimilarity(queryEmbedding, mem.embedding)
              : 0;
            return { ...mem, similarity };
          })
          .filter(r => r.similarity >= matchThreshold)
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, limit);
        
        return results;
      } else {
        const { data, error } = await supabase.rpc('match_user_memories', {
          query_embedding: queryEmbedding,
          match_threshold: matchThreshold,
          match_count: limit
        });

        if (error) throw error;
        return data || [];
      }
    } catch (err) {
      console.error('VectorService: Search failed. Returning empty matches.', err);
      return [];
    }
  }

  /**
   * Seeds historical memories to build the baseline context matrix "Hive Mind" network.
   */
  private static async seedMemories() {
    const seedData = [
      {
        user_id: 'seed-operator-101',
        mission_name: 'Shopify Dropshipping Indian Market',
        locked_path: 'alpha',
        profile_text: 'Goal: Ecom Dropshipping | Capital: INR 15k | Runway: 30 days | Geography: Tier 3 | Skills: Marketing, basic video editing | Mindset: Urgent need for cash flow.',
        outcome_summary: 'Success. User bypassed paid ads, generated custom TikTok/Instagram reels for a localized trending gadget, and closed INR 60k revenue in 25 days. Margin 40%.',
        success_rate: 85
      },
      {
        user_id: 'seed-operator-102',
        mission_name: 'No-Code Automation Agency (Kanpur Locals)',
        locked_path: 'beta',
        profile_text: 'Goal: B2B No-Code Agency | Capital: INR 8k | Runway: 45 days | Geography: Tier 2 | Skills: Make.com, Airtable, Sales pitching | Mindset: Highly analytical, low risk tolerance.',
        outcome_summary: 'Partial Success. Locked Beta. Pitched 12 local manufacturing firms on automating inventory sheets. Signed 2 clients at INR 15k/month retainer. Day 40 consistency remained at 92%.',
        success_rate: 75
      },
      {
        user_id: 'seed-operator-103',
        mission_name: 'Next.js Micro-SaaS for Resume Parsing',
        locked_path: 'alpha',
        profile_text: 'Goal: Micro-SaaS | Capital: INR 20k | Runway: 90 days | Geography: Tier 1 | Skills: Next.js, Node.js, AI APIs | Mindset: Technical builder prone to planning loops and over-engineering.',
        outcome_summary: 'Failure. Spent 70 days coding without any cold outreach. Runway depleted with $0 revenue. Consistency dropped to 15% due to isolation and lack of market feedback.',
        success_rate: 15
      },
      {
        user_id: 'seed-operator-104',
        mission_name: 'YouTube Video Editing Freelancing',
        locked_path: 'alpha',
        profile_text: 'Goal: Video Editing Agency | Capital: INR 3k | Runway: 15 days | Geography: Tier 2 | Skills: Premiere Pro, English writing | Mindset: High anxiety, immediate financial pressure.',
        outcome_summary: 'Success. Sent 40 personalized video audit pitches on Twitter/X to tech creators daily. Closed 3 creators at INR 10k/month each. Day 10 velocity hit first revenue.',
        success_rate: 90
      }
    ];

    for (const seed of seedData) {
      try {
        // Generate pre-seeded memories.
        // In local mode or during setup, we mock a vector to prevent startup API calls
        let embedding: number[] = Array(768).fill(0).map(() => Math.random() - 0.5);

        const fullMemory: UserMemory = {
          ...seed,
          id: `seed-mem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          embedding,
          created_at: new Date().toISOString()
        };

        if (isLocalFallback) {
          const memories = this.readLocalMemories();
          memories.push(fullMemory);
          this.writeLocalMemories(memories);
        } else {
          await supabase.from('user_memories').insert(fullMemory);
        }
      } catch (err) {
        console.error('VectorService: Failed to seed memory', err);
      }
    }
    console.log('VectorService: Seeding completed.');
  }
}
