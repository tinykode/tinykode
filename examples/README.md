# HTTP Server Example

Minimal HTTP server that streams TinyKode responses.

## Usage

```bash
cd examples
pnpm install
pnpm start
```

Then open http://localhost:3000 in your browser.

## Test with curl

```bash
curl -X POST http://localhost:3000/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Hello, how are you?"}' \
  --no-buffer
```

The response will stream in real-time as TinyKode processes the query.