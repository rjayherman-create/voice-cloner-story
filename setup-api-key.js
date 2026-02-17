#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Hide input for password-like input
const askQuestion = (query) => new Promise(resolve => {
  rl.question(query, resolve);
});

const askSecretQuestion = (query) => {
  return new Promise(resolve => {
    process.stdout.write(query);
    process.stdin.setRawMode(true);
    let input = '';
    
    process.stdin.on('data', (char) => {
      const charCode = char.toString().charCodeAt(0);
      
      if (charCode === 13) { // Enter key
        process.stdin.setRawMode(false);
        process.stdout.write('\n');
        resolve(input);
      } else if (charCode === 3) { // Ctrl+C
        process.exit();
      } else if (charCode === 127) { // Backspace
        input = input.slice(0, -1);
        process.stdout.write('\b \b');
      } else {
        input += char.toString();
        process.stdout.write('*');
      }
    });
  });
};

async function setupApiKey() {
  console.log('\n🎙️ Voice Over System - ElevenLabs API Key Setup\n');
  console.log('This will securely add your ElevenLabs API key.\n');

  // Check if .env already exists
  let existingEnv = '';
  if (fs.existsSync(envPath)) {
    existingEnv = fs.readFileSync(envPath, 'utf-8');
    console.log('⚠️  Found existing .env file\n');
  }

  // Get API key securely
  console.log('You can get your API key from: https://elevenlabs.io/account/api-keys\n');
  const apiKey = await askSecretQuestion('🔑 Enter your ElevenLabs API key (hidden): ');

  if (!apiKey || apiKey.trim().length === 0) {
    console.log('\n❌ No API key provided. Setup cancelled.\n');
    rl.close();
    process.exit(1);
  }

  // Validate API key format
  if (!apiKey.startsWith('sk_')) {
    console.log('\n⚠️  Warning: API key should start with "sk_"');
    console.log('Make sure you copied the correct key from https://elevenlabs.io\n');
  }

  // Ask for confirmation
  console.log('\n✓ API key received (length: ' + apiKey.length + ' chars)\n');
  const confirm = await askQuestion('Confirm you want to save this API key? (yes/no): ');

  if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
    console.log('\n❌ Setup cancelled.\n');
    rl.close();
    process.exit(1);
  }

  // Prepare new .env content
  let newEnv = existingEnv;

  if (existingEnv.includes('ELEVENLABS_API_KEY=')) {
    // Replace existing key
    newEnv = existingEnv.replace(
      /ELEVENLABS_API_KEY=.*/,
      `ELEVENLABS_API_KEY=${apiKey}`
    );
  } else {
    // Add new key
    if (newEnv && !newEnv.endsWith('\n')) {
      newEnv += '\n';
    }
    newEnv += `\n# ElevenLabs API Configuration\nELEVENLABS_API_KEY=${apiKey}\n`;
  }

  // Save to .env
  fs.writeFileSync(envPath, newEnv, { mode: 0o600 }); // Restrict permissions

  console.log('\n✅ API key saved successfully!\n');
  console.log('Next steps:\n');
  console.log('1. Restart the server:');
  console.log('   npm start\n');
  console.log('2. Open your browser:');
  console.log('   http://localhost:5001\n');
  console.log('3. Start creating voiceovers! 🎉\n');

  rl.close();
}

// Run setup
setupApiKey().catch(err => {
  console.error('Error:', err);
  rl.close();
  process.exit(1);
});
