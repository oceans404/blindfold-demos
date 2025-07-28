# 🧩 Blindfold Puzzle Chain Generator

Creates puzzle chains where your answer to one question becomes the key to unlock the next question.

## How It Works

Say you have 3 questions with answers "purple", "four", and "cat".

The script works backwards:
1. Takes your final message and encrypts it with "cat" as the key
2. Takes question 3 + those encrypted shares, encrypts everything with "four"  
3. Takes question 2 + those encrypted shares, encrypts everything with "purple"
4. Question 1 + those encrypted shares become your starting URL

When someone plays:
- Answer "purple" → decrypts to reveal question 2
- Answer "four" → decrypts to reveal question 3  
- Answer "cat" → decrypts to show final message

Wrong answer at any step = gibberish. You have to get them all right in order.

## Usage

### 1. Install Dependencies
```bash
npm install @nillion/blindfold
```

### 2. Create Your Puzzle Configuration

Create a JSON file (e.g., `my-puzzle.json`):

```json
{
  "nodeCount": 3,
  "keyType": "secret",
  "completionMessage": "🎉 You solved it!",
  "steps": [
    {
      "question": "What color do you get when you mix red and blue?",
      "answer": "purple"
    },
    {
      "question": "What is 2 + 2?",
      "answer": "four"
    },
    {
      "question": "What animal says 'meow'?",
      "answer": "cat"
    }
  ]
}
```

### 3. Generate the Puzzle Chain

```bash
node generatePuzzleChain.js my-puzzle.json output.json
```

### 4. Use the Generated URL

The script outputs a starting URL that you can share:
```
/puzzle?shares=...&question=What%20color...
```

## Configuration Options

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `nodeCount` | number | No | Number of nodes for secret sharing (default: 3) |
| `keyType` | string | No | Must be "secret" (default: "secret") |
| `completionMessage` | string | No | Message shown when puzzle is complete |
| `steps` | array | Yes | Array of question/answer pairs |
| `steps[].question` | string | Yes | The question text (max 200 chars) |
| `steps[].answer` | string | Yes | The answer that serves as decryption key (max 50 chars) |

## Example Output

```json
{
  "metadata": {
    "generatedAt": "2024-01-15T10:30:00.000Z",
    "nodeCount": 3,
    "totalSteps": 3,
    "generator": "blindfold-puzzle-generator v1.0"
  },
  "startingUrl": "/puzzle?shares=...&question=...",
  "startingQuestion": "What color do you get when you mix red and blue?",
  "completionMessage": "🎉 You solved it!",
  "instructions": {
    "usage": "Visit the startingUrl to begin the puzzle chain",
    "note": "Each correct answer reveals the next step in the chain"
  }
}
```

## What Players See

1. Visit a URL with encrypted puzzle data
2. See a question like "What color do you get when you mix red and blue?"
3. Type "purple" → if correct, reveals the next question
4. Keep going until you reach the end

The data is split across 3 "nodes" so you need all the pieces to decrypt anything.

## Limitations

- Max 5 questions per chain
- Questions: 80 characters max  
- Answers: 20 characters max
- 1-3 nodes only
- Long URLs might break in some browsers

## Security Notes

- You can't skip steps - need the right answer to each question to unlock the next
- Each question uses a different encryption key  
- Getting a later answer doesn't help you with earlier questions
- Wrong answers just give you encrypted garbage

## Example Usage

```bash
# Generate a simple 3-step puzzle
node generatePuzzleChain.js example-puzzle.json my-puzzle-output.json

# The output will show:
# 🚀 Starting URL: /puzzle?shares=...&question=...
# 💡 Test URL: http://localhost:3000/puzzle?shares=...&question=...
```

## Troubleshooting

**"@nillion/blindfold package not found"**
- Run `npm install @nillion/blindfold`

**"URL is quite long" warning**
- Reduce question length or number of steps
- Consider fewer nodes (reduces share size)

**"Maximum 5 steps allowed"**
- Make shorter questions/answers
- Use fewer nodes  
- Split into multiple chains

**"Step encrypted data too large"**
- Make questions shorter
- Use fewer nodes