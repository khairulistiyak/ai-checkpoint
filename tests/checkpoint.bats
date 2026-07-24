#!/usr/bin/env bats

load test_helper

@test "checkpoint save, list, and back" {
  echo "version1" > test.txt
  git add test.txt
  git commit -m "Track test.txt" >/dev/null 2>&1
  
  echo "version1.1" > test.txt
  
  run ./l cp save "first check"
  if [ "$status" -ne 0 ]; then
    echo "CP SAVE FAILED:" >&3
    echo "$output" >&3
  fi
  [ "$status" -eq 0 ]
  [[ "$output" == *"Checkpoint saved:"* ]]
  
  tag=$(git tag -l "aicp/*" | head -n 1)
  [ -n "$tag" ]
  
  run ./l cp list
  [ "$status" -eq 0 ]
  [[ "$output" == *"first check"* ]]
  
  echo "version2" > test.txt
  git add test.txt
  git commit -m "commit version2" >/dev/null 2>&1
  
  run ./l cp back --force "$tag"
  [ "$status" -eq 0 ]
  [[ "$output" == *"Restored checkpoint"* ]]
  
  run cat test.txt
  [ "$output" == "version1.1" ]
  
  branch=$(git rev-parse --abbrev-ref HEAD)
  [ "$branch" == "main" ]
}
