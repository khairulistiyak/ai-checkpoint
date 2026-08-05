#!/usr/bin/env bats

load test_helper

@test "run command lists detected project scripts" {
  cat << 'EOF' > package.json
{
  "name": "sample-project",
  "scripts": {
    "dev": "echo 'starting dev server'",
    "test": "echo 'running tests'"
  }
}
EOF

  run ./l run list
  [ "$status" -eq 0 ]
  [[ "$output" == *"PROJECT RUN COMMANDS"* ]]
  [[ "$output" == *"dev"* ]]
  [[ "$output" == *"test"* ]]
}

@test "run command executes script in correct working directory" {
  mkdir -p client
  cat << 'EOF' > client/package.json
{
  "name": "sample-client",
  "scripts": {
    "build": "echo 'built client app'"
  }
}
EOF

  run ./l run list
  [ "$status" -eq 0 ]
  [[ "$output" == *"client: build"* ]]
  [[ "$output" == *"(cwd: client)"* ]]
}

@test "run command detects python, rust, go, and flutter projects" {
  touch Cargo.toml
  touch main.py
  touch requirements.txt
  touch go.mod
  touch pubspec.yaml

  run ./l run list
  [ "$status" -eq 0 ]
  [[ "$output" == *"Cargo Run"* ]]
  [[ "$output" == *"Python Main"* ]]
  [[ "$output" == *"Go Run"* ]]
  [[ "$output" == *"Flutter Run"* ]]
}

@test "run command displays error for unknown command" {
  run ./l run unknown_cmd_xyz
  [ "$status" -ne 0 ]
  [[ "$output" == *"not found"* ]]
}
