#!/usr/bin/env python3
"""
Codegen AI Code Review Script
Performs automated code review using Codegen AI agent
"""

import os
import sys
import time
import json
import requests
from typing import Dict, Any, Optional

# Configuration from environment
CODEGEN_ORG_ID = os.getenv('CODEGEN_ORG_ID')
CODEGEN_API_KEY = os.getenv('CODEGEN_API_KEY')
GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')
PR_NUMBER = os.getenv('PR_NUMBER')
REPO_NAME = os.getenv('REPO_NAME')
HEAD_SHA = os.getenv('HEAD_SHA')
BASE_SHA = os.getenv('BASE_SHA')

# API endpoints
CODEGEN_API_BASE = "https://api.codegen.com/v1"
GITHUB_API_BASE = "https://api.github.com"

def log(message: str, level: str = "INFO"):
    """Log with timestamp"""
    print(f"[{level}] {time.strftime('%Y-%m-%d %H:%M:%S')} - {message}")

def check_env_vars():
    """Verify all required environment variables are set"""
    required = {
        'CODEGEN_ORG_ID': CODEGEN_ORG_ID,
        'CODEGEN_API_KEY': CODEGEN_API_KEY,
        'GITHUB_TOKEN': GITHUB_TOKEN,
        'PR_NUMBER': PR_NUMBER,
        'REPO_NAME': REPO_NAME
    }

    missing = [k for k, v in required.items() if not v]
    if missing:
        log(f"Missing required environment variables: {', '.join(missing)}", "ERROR")
        sys.exit(1)

def get_pr_diff() -> str:
    """Fetch PR diff from GitHub"""
    url = f"{GITHUB_API_BASE}/repos/{REPO_NAME}/pulls/{PR_NUMBER}"
    headers = {
        'Authorization': f'Bearer {GITHUB_TOKEN}',
        'Accept': 'application/vnd.github.v3.diff'
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.text
    except Exception as e:
        log(f"Failed to fetch PR diff: {e}", "ERROR")
        return ""

def get_pr_files() -> list:
    """Get list of files changed in PR"""
    url = f"{GITHUB_API_BASE}/repos/{REPO_NAME}/pulls/{PR_NUMBER}/files"
    headers = {
        'Authorization': f'Bearer {GITHUB_TOKEN}',
        'Accept': 'application/vnd.github.v3+json'
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        log(f"Failed to fetch PR files: {e}", "ERROR")
        return []

def create_codegen_task(prompt: str) -> Optional[Dict[str, Any]]:
    """Create Codegen agent task"""
    url = f"{CODEGEN_API_BASE}/organizations/{CODEGEN_ORG_ID}/agent/run"
    headers = {
        'Authorization': f'Bearer {CODEGEN_API_KEY}',
        'Content-Type': 'application/json'
    }

    payload = {
        'prompt': prompt,
        'metadata': {
            'pr_number': PR_NUMBER,
            'repo': REPO_NAME,
            'source': 'github_actions'
        }
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        log(f"Failed to create Codegen task: {e}", "ERROR")
        return None

def check_task_status(task_id: int) -> Optional[Dict[str, Any]]:
    """Check status of Codegen task"""
    url = f"{CODEGEN_API_BASE}/organizations/{CODEGEN_ORG_ID}/agent/run/{task_id}"
    headers = {
        'Authorization': f'Bearer {CODEGEN_API_KEY}'
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        log(f"Failed to check task status: {e}", "ERROR")
        return None

def main():
    """Main execution flow"""
    log("Starting Codegen AI code review")

    # Verify environment
    check_env_vars()

    # Get PR information
    log(f"Reviewing PR #{PR_NUMBER} in {REPO_NAME}")

    files = get_pr_files()
    if not files:
        log("No files changed in PR", "WARNING")
        return

    file_list = "\n".join([f"- {f['filename']} (+{f['additions']}/-{f['deletions']})" for f in files])

    # Build comprehensive review prompt
    prompt = f"""
Please perform a comprehensive code review of PR #{PR_NUMBER} in repository {REPO_NAME}.

**PR Information:**
- Head SHA: {HEAD_SHA}
- Base SHA: {BASE_SHA}

**Files Changed ({len(files)}):**
{file_list}

**Review Focus:**
1. **Code Quality**: Best practices, design patterns, maintainability
2. **Security**: Potential vulnerabilities, input validation, auth issues
3. **Performance**: Inefficient algorithms, unnecessary computations
4. **Testing**: Test coverage, edge cases
5. **Documentation**: Comments, README updates

**Output Format:**
- Specific, actionable feedback with file:line references
- Severity levels (Critical/High/Medium/Low)
- Suggested fixes with code examples
- Praise for good implementations

**Rules:**
- Focus on substantial issues, not nitpicks
- Be constructive and educational
- Prioritize security and correctness
""".strip()

    # Create review task
    log("Creating Codegen review task...")
    task = create_codegen_task(prompt)

    if not task:
        log("Failed to create review task", "ERROR")
        save_result({'status': 'error', 'message': 'Failed to create review task'})
        sys.exit(1)

    task_id = task.get('id')
    log(f"Task created with ID: {task_id}")

    # Poll for completion
    max_attempts = 60  # 10 minutes max
    attempt = 0

    while attempt < max_attempts:
        time.sleep(10)
        attempt += 1

        status_data = check_task_status(task_id)
        if not status_data:
            continue

        status = status_data.get('status')
        log(f"Task status ({attempt}/{max_attempts}): {status}")

        if status == 'completed':
            log("✅ Review completed successfully!")
            result = {
                'status': 'success',
                'message': status_data.get('summary', 'Review completed'),
                'web_url': status_data.get('web_url'),
                'result': status_data.get('result')
            }
            save_result(result)
            return

        elif status == 'failed':
            log("❌ Review failed", "ERROR")
            result = {
                'status': 'failed',
                'message': status_data.get('result', 'Review failed'),
                'web_url': status_data.get('web_url')
            }
            save_result(result)
            sys.exit(1)

    # Timeout
    log("⏰ Review timed out", "WARNING")
    result = {
        'status': 'timeout',
        'message': 'Review exceeded time limit',
        'web_url': task.get('web_url')
    }
    save_result(result)
    sys.exit(1)

def save_result(result: Dict[str, Any]):
    """Save result to file for GitHub Actions to use"""
    with open('/tmp/codegen_review.json', 'w') as f:
        json.dump(result, f, indent=2)

if __name__ == '__main__':
    main()
