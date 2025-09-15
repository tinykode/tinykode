import path from 'path';
import express from 'express';
import { readFileSync } from 'fs';
import { TinyKode } from 'tinykode';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const app = express();
const tinykode = new TinyKode();
const html = readFileSync(path.join(__dirname, 'client.html'), 'utf8');
const confirmations = new Map();

app.use(express.json());

app.get('/', (req, res) => {
  res.send(html);
});

app.post('/query', async (req, res) => {
  const { messages } = req.body;

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Transfer-Encoding', 'chunked');

  try {
    await tinykode.processQuery({
      messages,
      onUpdate: (chunk) => {
        res.write(chunk);
      },
      onToolCalls: (toolCalls) => {
        toolCalls?.forEach(call => {
          const message = JSON.stringify({ type: 'toolCall', name: call.toolName, params: call.input }) + '\n';
          res.write(message);
        });
      },
      onToolResults: (toolResults) => {
        toolResults?.forEach(result => {
          const message = JSON.stringify({ type: 'toolResult', name: result.toolName, output: result.output }) + '\n';
          res.write(message);
        });
      },
      onToolConfirm: async ({ name, params }) => {
        const id = Date.now().toString();
        const message = JSON.stringify({ type: 'toolConfirm', id, name, params }) + '\n';
        res.write(message);

        return new Promise(resolve => {
          confirmations.set(id, resolve);
        });
      }
    });
  } catch (error) {
    console.error('Error processing query:', error);
    res.write(`Error: ${error.message}\n`);
  }

  res.end();
});

app.post('/confirm', (req, res) => {
  const { id, confirmed } = req.body;
  const resolve = confirmations.get(id);
  if (resolve) {
    resolve(confirmed);
    confirmations.delete(id);
  }
  res.send('OK');
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});