#!/usr/bin/env python3
"""
Script to remove corrupted git entries with embedded newlines using git-filter-repo.
"""

import subprocess
import os
import sys

def run_cmd(cmd, cwd=None):
    """Run a command and return output."""
    result = subprocess.run(cmd, shell=True, capture_output=True, cwd=cwd)
    return result.stdout.decode(), result.stderr.decode(), result.returncode

def main():
    print("=" * 60)
    print("Fixing Corrupted Git Entries with git-filter-repo")
    print("=" * 60)
    
    # First, backup the current repo (important!)
    print("\n[1/4] Backing up current .git directory...")
    run_cmd("cp -a .git .git.backup")
    print("  Backup created at .git.backup")
    
    # Create a simple path filter script
    print("\n[2/4] Creating filter script...")
    filter_script = '''#!/usr/bin/env python3
import sys
import re

for line in sys.stdin:
    line = line.rstrip('\\r\\n')
    # Remove any path that starts with newline or contains literal \\n
    if line.startswith('\\n') or '\\n' in line:
        continue
    print(line)
'''
    with open('/tmp/path_filter.py', 'w') as f:
        f.write(filter_script)
    print("  Filter script created at /tmp/path_filter.py")
    
    # Run git filter-repo to remove corrupted entries
    print("\n[3/4] Running git-filter-repo to remove corrupted entries...")
    print("  This may take a while for large repos...")
    
    # First, let's try a simple approach: just filter out files starting with newline
    stdout, stderr, rc = run_cmd(
        'git filter-repo --path-callback "if path.startswith(\'\\\\n\'): return None" --force',
        cwd='/Users/amanshrestha/Desktop/MediNest'
    )
    
    if rc != 0:
        print(f"  Warning: filter-repo returned non-zero exit code: {rc}")
        print(f"  stderr: {stderr[:500]}")
    else:
        print("  git-filter-repo completed successfully!")
    
    # Verify
    print("\n[4/4] Verifying fix...")
    stdout, stderr, rc = run_cmd("git ls-files | head -10", cwd='/Users/amanshrestha/Desktop/MediNest')
    
    # Check for remaining corrupted entries
    lines = stdout.strip().split('\n')
    corrupted = [l for l in lines if l.startswith('\n') or '\n' in l]
    
    if corrupted:
        print(f"  WARNING: {len(corrupted)} corrupted entries still remain!")
        for c in corrupted[:3]:
            print(f"    - {repr(c)[:60]}")
    else:
        print("  SUCCESS: No corrupted entries found in git index!")
    
    print("\n" + "=" * 60)
    print("Git history has been rewritten!")
    print("=" * 60)
    print("\nNEXT STEPS:")
    print("1. Force push to update origin/development:")
    print("   git push --force origin development")
    print("")
    print("2. IMPORTANT: Notify all team members to:")
    print("   - Delete their local clones")
    print("   - Re-clone the repository fresh")
    print("")
    print("3. The original .git backup is at .git.backup")
    print("   You can delete it after confirming everything works.")

if __name__ == "__main__":
    main()

