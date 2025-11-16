#!/usr/bin/env python3
"""
CircleCI Auto-Fix Script
Triggered when CircleCI builds fail, analyzes logs and creates auto-fixes
"""

import os
import sys
import requests
from typing import Dict, Any

# Configuration
CODEGEN_ORG_ID = os.getenv('CODEGEN_ORG_ID')
CODEGEN_API_KEY = os.getenv('CODEGEN_API_KEY')
CIRCLE_BUILD_NUM = os.getenv('CIRCLE_BUILD_NUM')
CIRCLE_PROJECT = os.getenv('CIRCLE_PROJECT_REPONAME')

def log(message: str, level: str = "INFO"):
    print(f"[{level}] CircleCI Auto-fix: {message}")

def get_failed_job_logs() -> str:
    """Fetch logs from failed CircleCI job"""
    # В реальном сценарии - получаем логи через CircleCI API
    # Для демонстрации используем environment output
    log("Fetching failed job logs from CircleCI API")
    return f"Build #{CIRCLE_BUILD_NUM} failed"

def create_auto_fix_task(logs: str) -> Dict[str, Any]:
    """Create Codegen auto-fix task"""
    url = f"https://api.codegen.com/v1/organizations/{CODEGEN_ORG_ID}/agent/run"
    headers = {
        'Authorization': f'Bearer {CODEGEN_API_KEY}',
        'Content-Type': 'application/json'
    }

    prompt = f"""
**CircleCI Build Failure Auto-Fix**

Build: #{CIRCLE_BUILD_NUM}
Project: {CIRCLE_PROJECT}

**Failure Logs:**
{logs[:2000]}

**Task:**
1. Analyze the CI/CD failure
2. Identify root cause
3. Generate production-ready fix
4. Create PR with fix and tests

**Requirements:**
- Fix must pass all CI checks
- Include proper error handling
- Add tests to prevent regression
- Follow existing code patterns
    """.strip()

    payload = {
        'prompt': prompt,
        'metadata': {
            'source': 'circleci',
            'build': CIRCLE_BUILD_NUM,
            'project': CIRCLE_PROJECT
        }
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        log(f"Failed to create auto-fix task: {e}", "ERROR")
        return {}

def main():
    log("Starting CircleCI auto-fix process")

    if not all([CODEGEN_ORG_ID, CODEGEN_API_KEY]):
        log("Codegen not configured, skipping auto-fix", "WARNING")
        sys.exit(0)

    logs = get_failed_job_logs()
    task = create_auto_fix_task(logs)

    if task.get('id'):
        log(f"✅ Auto-fix task created: {task['id']}")
        log(f"View progress: {task.get('web_url')}")
    else:
        log("❌ Failed to create auto-fix task", "ERROR")
        sys.exit(1)

if __name__ == '__main__':
    main()
