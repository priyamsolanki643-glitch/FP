import './src/utils/env';
import { LLMService } from './src/services/llm.service';

async function test() {
  try {
    console.log('Testing generateSmartResponseStream...');
    const result = await LLMService.generateSmartResponseStream('test_user', 'System prompt test', [{role: 'user', parts: [{text: 'hii'}]}], false);
    
    console.log('Stream opened successfully! Task classification:', result.task_classification);
    let fullText = '';
    for await (const chunk of result.stream) {
      console.log('CHUNK:', chunk.text());
      fullText += chunk.text();
    }
    console.log('FINAL TEXT:', fullText);
  } catch (err) {
    console.error('ERROR OCCURRED:', err);
  }
}

test();
