import fs from 'fs';
import path from 'path';

export function detectEcosystemCommands(projectPath) {
  const commands = [];
  try {
    const files = fs.readdirSync(projectPath);

    // Python
    const hasPy = files.includes('requirements.txt') || files.includes('pyproject.toml') || files.includes('Pipfile') || files.some(f => f.endsWith('.py'));
    if (hasPy) {
      if (files.includes('manage.py')) {
        commands.push({ id: 'py-django', name: 'Django Server', scriptName: 'manage.py runserver', category: 'dev', cmd: 'python3 manage.py runserver', fullCmd: 'python3 manage.py runserver', cwd: '.', description: 'Start Django server', isDefault: true });
      }
      if (files.includes('main.py')) {
        commands.push({ id: 'py-main', name: 'Python Main', scriptName: 'main.py', category: 'dev', cmd: 'python3 main.py', fullCmd: 'python3 main.py', cwd: '.', description: 'Run main.py', isDefault: !files.includes('manage.py') });
      } else if (files.includes('app.py')) {
        commands.push({ id: 'py-app', name: 'Python App', scriptName: 'app.py', category: 'dev', cmd: 'python3 app.py', fullCmd: 'python3 app.py', cwd: '.', description: 'Run app.py', isDefault: true });
      }
      if (files.includes('pytest.ini') || files.includes('tests') || files.includes('test')) {
        commands.push({ id: 'py-test', name: 'Pytest', scriptName: 'pytest', category: 'test', cmd: 'pytest', fullCmd: 'pytest', cwd: '.', description: 'Run Python test suite', isDefault: false });
      }
    }

    // Rust
    if (files.includes('Cargo.toml')) {
      commands.push({ id: 'rs-run', name: 'Cargo Run', scriptName: 'cargo run', category: 'dev', cmd: 'cargo run', fullCmd: 'cargo run', cwd: '.', description: 'Run Rust binary', isDefault: true });
      commands.push({ id: 'rs-test', name: 'Cargo Test', scriptName: 'cargo test', category: 'test', cmd: 'cargo test', fullCmd: 'cargo test', cwd: '.', description: 'Run Rust tests', isDefault: false });
      commands.push({ id: 'rs-build', name: 'Cargo Build', scriptName: 'cargo build', category: 'build', cmd: 'cargo build --release', fullCmd: 'cargo build --release', cwd: '.', description: 'Build release binary', isDefault: false });
      commands.push({ id: 'rs-check', name: 'Cargo Check', scriptName: 'cargo check', category: 'lint', cmd: 'cargo check', fullCmd: 'cargo check', cwd: '.', description: 'Check Rust code syntax', isDefault: false });
    }

    // Go
    if (files.includes('go.mod')) {
      commands.push({ id: 'go-run', name: 'Go Run', scriptName: 'go run .', category: 'dev', cmd: 'go run .', fullCmd: 'go run .', cwd: '.', description: 'Run Go application', isDefault: true });
      commands.push({ id: 'go-test', name: 'Go Test', scriptName: 'go test', category: 'test', cmd: 'go test ./...', fullCmd: 'go test ./...', cwd: '.', description: 'Run Go unit tests', isDefault: false });
      commands.push({ id: 'go-build', name: 'Go Build', scriptName: 'go build', category: 'build', cmd: 'go build', fullCmd: 'go build', cwd: '.', description: 'Compile Go binary', isDefault: false });
    }

    // Flutter / Dart
    if (files.includes('pubspec.yaml')) {
      commands.push({ id: 'fl-run', name: 'Flutter Run', scriptName: 'flutter run', category: 'dev', cmd: 'flutter run', fullCmd: 'flutter run', cwd: '.', description: 'Run Flutter app', isDefault: true });
      commands.push({ id: 'fl-test', name: 'Flutter Test', scriptName: 'flutter test', category: 'test', cmd: 'flutter test', fullCmd: 'flutter test', cwd: '.', description: 'Run Flutter tests', isDefault: false });
      commands.push({ id: 'fl-build', name: 'Flutter Build', scriptName: 'flutter build', category: 'build', cmd: 'flutter build apk', fullCmd: 'flutter build apk', cwd: '.', description: 'Build Flutter release package', isDefault: false });
    }

    // Docker
    if (files.includes('docker-compose.yml') || files.includes('compose.yaml')) {
      commands.push({ id: 'docker-up', name: 'Docker Compose Up', scriptName: 'docker compose up', category: 'dev', cmd: 'docker compose up -d', fullCmd: 'docker compose up -d', cwd: '.', description: 'Start Docker containers', isDefault: false });
    }

    // Makefile
    if (files.includes('Makefile')) {
      commands.push({ id: 'make-build', name: 'Make', scriptName: 'make', category: 'build', cmd: 'make', fullCmd: 'make', cwd: '.', description: 'Execute default Makefile target', isDefault: false });
    }

    // Shell Scripts (.sh) & Python runners (run_*.py)
    for (const f of files) {
      if (f.startsWith('.') || f.startsWith('._')) continue;
      const fullPath = path.join(projectPath, f);
      try {
        if (fs.statSync(fullPath).isDirectory()) continue;
      } catch (e) { continue; }

      if (f.endsWith('.sh')) {
        const cat = f.includes('start') || f.includes('run') || f.includes('dev') ? 'dev' : (f.includes('test') ? 'test' : 'custom');
        commands.push({ id: `sh-${f}`, name: f, scriptName: f, category: cat, cmd: `bash ${f}`, fullCmd: `bash ${f}`, cwd: '.', description: `Shell script: ${f}`, isDefault: cat === 'dev' });
      } else if (f.endsWith('.py') && f.startsWith('run_')) {
        commands.push({ id: `py-${f}`, name: f, scriptName: f, category: 'dev', cmd: `python3 ${f}`, fullCmd: `python3 ${f}`, cwd: '.', description: `Python runner: ${f}`, isDefault: false });
      }
    }
  } catch (e) {}
  return commands;
}

export default { detectEcosystemCommands };
