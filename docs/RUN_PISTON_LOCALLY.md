Run Piston locally (Quick start)

This project can proxy code execution to a local Piston instance. Follow these steps to run Piston with Docker Compose and configure the backend to use it.

1) Start Piston with Docker Compose

From the repository root:

```bash
docker compose -f docker-compose.piston.yml up -d
```

This will pull the Piston image and start the server on port `8080`.

2) Confirm the service

Open: http://localhost:8080/ in your browser or run:

```bash
curl -I http://localhost:8080/api/v2/runtimes
```

You should get a response (may take a bit on first run while runtimes are prepared).

3) Configure the backend

Set the `PISTON_URL` environment variable so the backend can proxy run requests.

Example (Linux/macOS):

```bash
export PISTON_URL="http://localhost:8080/api/v2/execute"
cd backend
npm run dev
```

Windows PowerShell:

```powershell
$env:PISTON_URL = "http://localhost:8080/api/v2/execute"
cd backend
npm run dev
```

Notes & troubleshooting

- The Piston image may download or build language runtimes on first run; this can take several minutes and CPU.
- If you prefer the backend and Piston in the same Docker network, adjust `PISTON_URL` to `http://piston:8080/api/v2/execute` and run the backend in Docker as well.
- If you see `401 Unauthorized` from the public API, using this local instance will avoid that.
