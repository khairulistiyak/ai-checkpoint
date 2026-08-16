const fs = require('fs');
const path = require('path');

function scaffoldCleanArchitecture(projectPath, options = {}) {
  const baseDir = options.srcDir ? path.join(projectPath, options.srcDir) : path.join(projectPath, 'src');
  
  const dirs = [
    path.join(baseDir, 'domain', 'entities'),
    path.join(baseDir, 'domain', 'use-cases'),
    path.join(baseDir, 'domain', 'dtos'),
    path.join(baseDir, 'adapters', 'repositories'),
    path.join(baseDir, 'adapters', 'controllers'),
    path.join(baseDir, 'adapters', 'gateways'),
  ];

  dirs.forEach((d) => fs.mkdirSync(d, { recursive: true }));

  const files = [
    {
      p: path.join(baseDir, 'domain', 'entities', 'user.js'),
      c: `// Pure Domain Entity (Zero external dependencies)\nfunction createUserEntity({ id, name, email, createdAt = new Date() }) {\n  if (!name || name.trim().length === 0) throw new Error('User name is required');\n  if (!email || !email.includes('@')) throw new Error('Valid email is required');\n  return Object.freeze({ id, name: name.trim(), email: email.toLowerCase().trim(), createdAt });\n}\n\nmodule.exports = { createUserEntity };\n`,
    },
    {
      p: path.join(baseDir, 'domain', 'dtos', 'user-dto.js'),
      c: `// Pure Data Transfer Object (DTO)\nfunction toUserResponseDTO(entity) {\n  return {\n    id: entity.id,\n    name: entity.name,\n    email: entity.email,\n    createdAt: entity.createdAt.toISOString(),\n  };\n}\n\nmodule.exports = { toUserResponseDTO };\n`,
    },
    {
      p: path.join(baseDir, 'domain', 'use-cases', 'create-user.js'),
      c: `// Single Responsibility Use-Case (1 File = 1 Operation)\nconst { createUserEntity } = require('../entities/user.js');\nconst { toUserResponseDTO } = require('../dtos/user-dto.js');\n\nasync function createUserUseCase(input, userRepository) {\n  const user = createUserEntity(input);\n  const saved = await userRepository.save(user);\n  return toUserResponseDTO(saved);\n}\n\nmodule.exports = { createUserUseCase };\n`,
    },
    {
      p: path.join(baseDir, 'adapters', 'repositories', 'in-memory-user-repository.js'),
      c: `// Outbound Adapter: In-Memory Repository Implementation\nclass InMemoryUserRepository {\n  constructor() { this.users = new Map(); }\n  async save(user) { this.users.set(user.id, user); return user; }\n  async findById(id) { return this.users.get(id) || null; }\n}\n\nmodule.exports = { InMemoryUserRepository };\n`,
    },
  ];

  const createdFiles = [];
  files.forEach((f) => {
    if (!fs.existsSync(f.p)) {
      fs.writeFileSync(f.p, f.c, 'utf8');
      createdFiles.push(path.relative(projectPath, f.p));
    }
  });

  return {
    success: true,
    createdFiles,
    baseDir: path.relative(projectPath, baseDir),
  };
}

module.exports = { scaffoldCleanArchitecture };
