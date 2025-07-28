#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Import the blindfold library
let blindfold;
try {
  blindfold = require('@nillion/blindfold');
} catch (error) {
  console.error('Error: @nillion/blindfold package not found.');
  console.error('Please run: npm install @nillion/blindfold');
  process.exit(1);
}

const { SecretKey, encrypt } = blindfold;

/**
 * Generate puzzle chain with minimal encrypted data to stay within 4KB limit
 */
async function generateMinimalPuzzleChain(inputFile, outputFile) {
  try {
    // Read input configuration
    const inputPath = path.resolve(inputFile);
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    const config = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    validateConfig(config);

    console.log('🧩 Generating minimal puzzle chain...');
    console.log(`📝 ${config.steps.length} steps to process`);
    console.log(`🔢 Using ${config.nodeCount} nodes`);

    // Create cluster configuration
    const cluster = { nodes: Array(config.nodeCount).fill({}) };

    // Work backwards through the steps with MINIMAL data
    const steps = [...config.steps].reverse();
    let currentMessage = config.completionMessage || "🎉 Puzzle Complete!";
    let startingUrl = null;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepNumber = steps.length - i;
      const isFirst = i === steps.length - 1; // First question (last in reversed array)
      const isFinal = i === 0; // Final question (first in reversed array)
      
      console.log(`\n🔄 Processing step ${stepNumber}: "${step.question}"`);
      console.log(`🔑 Expected answer: "${step.answer}"`);
      console.log(`📏 Current message size: ${currentMessage.length} characters`);

      // Generate secret key using the answer as seed
      const secretKey = await SecretKey.generate(
        cluster,
        { store: true },
        null,
        step.answer.toLowerCase().trim()
      );

      // Encrypt the current message
      const encrypted = await encrypt(secretKey, currentMessage);
      
      // Convert shares to strings for URL encoding
      const sharesArray = Array.isArray(encrypted) ? encrypted : [encrypted];
      
      // Use ultra-compact URL encoding
      const compactShares = JSON.stringify(sharesArray);
      const encodedShares = encodeURIComponent(compactShares);

      // Use shortest possible question encoding
      const questionParam = encodeURIComponent(step.question);
      const finalParam = isFinal ? '&f=1' : ''; // Ultra short final flag
      
      const currentUrl = `/puzzle?s=${encodedShares}&q=${questionParam}${finalParam}`;

      if (isFirst) {
        startingUrl = currentUrl;
      }

      console.log(`✅ Generated ${sharesArray.length} shares`);
      console.log(`📏 Shares JSON size: ${compactShares.length} characters`);
      console.log(`📏 URL length: ${currentUrl.length} characters`);

      // Prepare ULTRA-MINIMAL message for the previous step
      if (!isFirst) {
        // Extract only the essential parts of the next URL
        const nextUrlData = {
          s: encodedShares, // shares
          q: questionParam, // question
          ...(isFinal && { f: 1 }) // final flag only if needed
        };
        
        // Create the most minimal possible next step data
        const minimalMessage = JSON.stringify(nextUrlData);
        console.log(`📏 Next step data size: ${minimalMessage.length} characters`);
        
        // Check if we're approaching the limit
        if (minimalMessage.length > 3500) {
          console.log('⚠️  Warning: Approaching 4KB limit, reducing data further...');
          
          // Even more aggressive: use base64 encoding for shares if too big
          try {
            const sharesBuffer = Buffer.from(compactShares);
            const base64Shares = sharesBuffer.toString('base64');
            if (base64Shares.length < encodedShares.length) {
              console.log(`📦 Using base64 encoding: ${base64Shares.length} vs ${encodedShares.length} chars`);
              nextUrlData.s = base64Shares;
              nextUrlData.b64 = 1; // flag to indicate base64
            }
          } catch (e) {
            // Fall back to original if base64 fails
          }
        }
        
        currentMessage = JSON.stringify(nextUrlData);
        
        // Final size check
        if (currentMessage.length > 4000) {
          throw new Error(`Step ${stepNumber} encrypted data too large: ${currentMessage.length} chars. Try fewer nodes or shorter questions.`);
        }
      }
    }

    // Create output data
    const output = {
      metadata: {
        generatedAt: new Date().toISOString(),
        nodeCount: config.nodeCount,
        keyType: config.keyType,
        totalSteps: config.steps.length,
        generator: 'blindfold-minimal-puzzle-generator v1.0'
      },
      startingUrl: startingUrl,
      startingQuestion: config.steps[0].question,
      completionMessage: config.completionMessage || "🎉 Puzzle Complete!",
      instructions: {
        usage: "Visit the startingUrl to begin the puzzle chain",
        note: "Each correct answer reveals the next step with minimal data transfer",
        urlParams: {
          "s": "shares (URL encoded JSON or base64)",
          "q": "question (URL encoded)",
          "f": "final question flag (1 if true)",
          "b64": "base64 encoding flag (1 if shares are base64 encoded)"
        }
      }
    };

    // Write output file
    const outputPath = path.resolve(outputFile);
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

    // Display results
    console.log('\n🎉 Minimal puzzle chain generated successfully!');
    console.log('📋 Summary:');
    console.log(`   • Total steps: ${config.steps.length}`);
    console.log(`   • Node count: ${config.nodeCount}`);
    console.log(`   • Starting question: "${config.steps[0].question}"`);
    console.log(`   • Output file: ${outputPath}`);
    console.log('\n🚀 Starting URL:');
    console.log(`   ${output.startingUrl}`);
    console.log('\n💡 Test URL (localhost:3000):');
    console.log(`   http://localhost:3000${output.startingUrl}`);

    // URL length analysis
    if (output.startingUrl.length > 2000) {
      console.log('\n⚠️  Warning: URL is quite long. Consider:');
      console.log('   • Reducing node count');
      console.log('   • Shorter questions');
      console.log('   • Fewer steps');
    } else {
      console.log(`\n✅ URL length (${output.startingUrl.length} chars) is reasonable`);
    }

  } catch (error) {
    console.error('\n❌ Error generating puzzle chain:');
    console.error(error.message);
    process.exit(1);
  }
}

/**
 * Validate input configuration
 */
function validateConfig(config) {
  if (!config.steps || !Array.isArray(config.steps)) {
    throw new Error('Configuration must include a "steps" array');
  }

  if (config.steps.length === 0) {
    throw new Error('At least one step is required');
  }

  if (config.steps.length > 5) {
    throw new Error('Maximum 5 steps for minimal chains (to stay within size limits)');
  }

  config.steps.forEach((step, index) => {
    if (!step.question || typeof step.question !== 'string') {
      throw new Error(`Step ${index + 1}: "question" is required and must be a string`);
    }
    if (!step.answer || typeof step.answer !== 'string') {
      throw new Error(`Step ${index + 1}: "answer" is required and must be a string`);
    }
    if (step.question.length > 80) {
      throw new Error(`Step ${index + 1}: Question too long (max 80 characters for minimal chains)`);
    }
    if (step.answer.length > 20) {
      throw new Error(`Step ${index + 1}: Answer too long (max 20 characters for minimal chains)`);
    }
  });

  // Set defaults
  config.nodeCount = config.nodeCount || 3;
  config.keyType = config.keyType || 'secret';

  if (config.nodeCount < 1 || config.nodeCount > 3) {
    throw new Error('nodeCount must be between 1 and 3 for minimal chains');
  }

  if (config.keyType !== 'secret') {
    throw new Error('Only "secret" key type is supported for puzzle chains');
  }
}

/**
 * Display usage information
 */
function showUsage() {
  console.log('🧩 Blindfold Minimal Puzzle Chain Generator');
  console.log('');
  console.log('Usage:');
  console.log('  node generatePuzzleChain-minimal.js <input.json> <output.json>');
  console.log('');
  console.log('This version uses minimal data encoding to stay within the 4KB encryption limit.');
  console.log('');
  console.log('Constraints for minimal chains:');
  console.log('  • Maximum 5 steps');
  console.log('  • Questions: 80 characters max');
  console.log('  • Answers: 20 characters max');
  console.log('  • Nodes: 1-3 only');
  console.log('  • Uses ultra-compact URL parameters (s, q, f, b64)');
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length !== 2) {
    showUsage();
    process.exit(1);
  }

  const [inputFile, outputFile] = args;
  await generateMinimalPuzzleChain(inputFile, outputFile);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = { generateMinimalPuzzleChain };