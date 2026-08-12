var express = require('express');
var router = express.Router();
var fs = require('fs');
var os = require('os');
var path = require('path');
var { execFile } = require('child_process');
var { promisify } = require('util');
const execFileAsync = promisify(execFile);
const { signUp, login, createProj, saveProject, getProjects, getProject, deleteProject, editProject } = require("../controllers/userController");

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});
router.post("/signUp", signUp);
router.post("/login", login);
router.post("/createProj", createProj);
router.post("/saveProject", saveProject);
router.post("/getProjects", getProjects);
router.post("/getProject", getProject);
router.post("/deleteProject", deleteProject);
router.post("/editProject", editProject);

const localExecutionSupported = (language) => {
  const supported = ['python', 'javascript', 'js', 'bash', 'c', 'cpp', 'java'];
  return supported.includes(language?.toLowerCase());
};

const resolvePythonCommand = () => {
  if (process.platform === 'win32') return 'python';
  return 'python3';
};

const localExecute = async ({ language, files }) => {
  if (!files || !Array.isArray(files) || files.length === 0) {
    throw new Error('No files provided for local execution.');
  }

  const lang = (language || '').toLowerCase();
  if (!localExecutionSupported(lang)) {
    throw new Error(`Local execution unsupported for language: ${language}`);
  }

  const file = files[0];
  const runId = `multicodeide-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const tmpDir = path.join(os.tmpdir(), runId);
  await fs.promises.mkdir(tmpDir, { recursive: true });
  const filePath = path.join(tmpDir, file.filename || 'script');
  await fs.promises.writeFile(filePath, file.content || '', 'utf8');

  let executable;
  let args = [filePath];

  if (lang === 'python') {
    executable = resolvePythonCommand();
  } else if (lang === 'javascript' || lang === 'js') {
    executable = process.execPath;
  } else if (lang === 'bash') {
    if (process.platform === 'win32') {
      executable = process.env.ComSpec || 'cmd.exe';
      args = ['/c', file.content || ''];
    } else {
      executable = 'bash';
      args = [filePath];
    }
  } else if (lang === 'c' || lang === 'cpp') {
    const compiler = lang === 'c' ? 'gcc' : 'g++';
    const outputPath = path.join(tmpDir, 'program');
    try {
      await execFileAsync(compiler, [filePath, '-o', outputPath], {
        cwd: tmpDir,
        timeout: 15000,
        maxBuffer: 10 * 1024 * 1024
      });
    } catch (compileError) {
      return {
        stdout: compileError.stdout ? String(compileError.stdout) : '',
        stderr: compileError.stderr ? String(compileError.stderr) : String(compileError.message),
        code: typeof compileError.code === 'number' ? compileError.code : 1
      };
    }
    executable = outputPath;
    args = [];
  } else if (lang === 'java') {
    const compiler = 'javac';
    const className = path.basename(filePath, '.java');
    try {
      await execFileAsync(compiler, [filePath], {
        cwd: tmpDir,
        timeout: 15000,
        maxBuffer: 10 * 1024 * 1024
      });
    } catch (compileError) {
      return {
        stdout: compileError.stdout ? String(compileError.stdout) : '',
        stderr: compileError.stderr ? String(compileError.stderr) : String(compileError.message),
        code: typeof compileError.code === 'number' ? compileError.code : 1
      };
    }
    executable = 'java';
    args = ['-cp', tmpDir, className];
  }

  if (!executable) {
    throw new Error(`Unsupported execution language: ${language}`);
  }

  try {
    const { stdout, stderr } = await execFileAsync(executable, args, {
      cwd: tmpDir,
      timeout: 15000,
      maxBuffer: 10 * 1024 * 1024
    });
    return { stdout: stdout || '', stderr: stderr || '', code: 0 };
  } catch (err) {
    return {
      stdout: err.stdout ? String(err.stdout) : '',
      stderr: err.stderr ? String(err.stderr) : err.message,
      code: typeof err.code === 'number' ? err.code : 1
    };
  } finally {
    try {
      await fs.promises.rm(tmpDir, { recursive: true, force: true });
    } catch (cleanupErr) {
      console.warn('Could not clean up local execution temp dir:', cleanupErr);
    }
  }
};

// Proxy route to run code via a Piston-compatible execution service.
// Configure the target execution URL with the environment variable PISTON_URL.
router.post('/run', async function (req, res, next) {
  const normalizeUrl = (url) => {
    if (!url) return null;
    const trimmed = url.trim();
    if (trimmed.match(/\/api\/v2\/execute$/)) return trimmed;
    return trimmed.replace(/\/$/, '') + '/api/v2/execute';
  };

  const urls = [
    normalizeUrl(process.env.PISTON_URL),
    'http://127.0.0.1:8080/api/v2/execute',
    'http://localhost:8080/api/v2/execute',
    'http://host.docker.internal:8080/api/v2/execute',
    'http://piston:8080/api/v2/execute'
  ].filter(Boolean);

  let fetchRes;
  let lastError;
  let usedUrl;

  for (const url of urls) {
    try {
      fetchRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
      usedUrl = url;
      break;
    } catch (err) {
      lastError = err;
      console.warn(`Piston proxy attempt failed for ${url}:`, err.message || err);
    }
  }

  if (fetchRes) {
    const text = await fetchRes.text();
    try {
      const json = JSON.parse(text);
      if (!fetchRes.ok) {
        console.warn(`Piston proxy responded with status ${fetchRes.status} from ${usedUrl}:`, json);
      }
      return res.status(fetchRes.status).json(json);
    } catch (e) {
      if (!fetchRes.ok) {
        return res.status(fetchRes.status).send(text);
      }
      return res.send(text);
    }
  }

  console.error('Run proxy error: no reachable Piston URL', lastError);

  if (localExecutionSupported(req.body?.language)) {
    try {
      const result = await localExecute(req.body);
      return res.json({ success: true, run: result });
    } catch (localErr) {
      console.error('Local execution fallback failed:', localErr);
      return res.status(503).json({
        success: false,
        msg: 'Execution service unavailable. Could not reach Piston on any configured URL, and local fallback failed.',
        tried: urls,
        error: localErr.message || String(localErr)
      });
    }
  }

  return res.status(503).json({
    success: false,
    msg: 'Execution service unavailable. Could not reach Piston on any configured URL.',
    tried: urls,
    error: lastError ? lastError.message || String(lastError) : 'No network response'
  });
});

module.exports = router;
