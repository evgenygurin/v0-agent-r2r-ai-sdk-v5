#!/usr/bin/env python3
"""
Self-Healing CI/CD System
Automatically analyzes and fixes CI failures using Codegen AI
"""

import os
import sys
import time
import json
import requests
from typing import Dict, Any, Optional, List

# Configuration
CODEGEN_ORG_ID = os.getenv('CODEGEN_ORG_ID')
CODEGEN_API_KEY = os.getenv('CODEGEN_API_KEY')
GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')
WORKFLOW_RUN_ID = os.getenv('WORKFLOW_RUN_ID')
REPO = os.getenv('REPO')
SENTRY_DSN = os.getenv('SENTRY_DSN')
LINEAR_API_KEY = os.getenv('LINEAR_API_KEY')

# API endpoints
CODEGEN_API = "https://api.codegen.com/v1"
GITHUB_API = "https://api.github.com"
LINEAR_API = "https://api.linear.app/graphql"

def log(message: str, level: str = "INFO"):
    """Log with timestamp"""
    print(f"[{level}] {time.strftime('%Y-%m-%d %H:%M:%S')} - {message}")

def get_workflow_logs() -> Optional[str]:
    """Fetch workflow run logs from GitHub"""
    url = f"{GITHUB_API}/repos/{REPO}/actions/runs/{WORKFLOW_RUN_ID}/logs"
    headers = {
        'Authorization': f'Bearer {GITHUB_TOKEN}',
        'Accept': 'application/vnd.github.v3+json'
    }

    try:
        response = requests.get(url, headers=headers, allow_redirects=True)
        response.raise_for_status()
        return response.text
    except Exception as e:
        log(f"Failed to fetch workflow logs: {e}", "ERROR")
        return None

def parse_failure_context(logs: str) -> Dict[str, Any]:
    """Parse logs to extract failure context"""
    context = {
        'error_lines': [],
        'failed_jobs': [],
        'error_types': set(),
        'files_mentioned': set()
    }

    lines = logs.split('\n')
    for i, line in enumerate(lines):
        # Detect errors
        if any(keyword in line.lower() for keyword in ['error', 'failed', 'exception']):
            context['error_lines'].append({
                'line_num': i,
                'content': line,
                'context': lines[max(0, i-2):min(len(lines), i+3)]
            })

            # Extract error types
            if 'error:' in line.lower():
                error_type = line.split('error:', 1)[1].strip().split('\n')[0]
                context['error_types'].add(error_type)

        # Extract file references
        if '.ts' in line or '.tsx' in line or '.js' in line or '.jsx' in line:
            # Simple file extraction
            parts = line.split()
            for part in parts:
                if any(ext in part for ext in ['.ts', '.tsx', '.js', '.jsx']):
                    context['files_mentioned'].add(part)

    context['error_types'] = list(context['error_types'])
    context['files_mentioned'] = list(context['files_mentioned'])

    return context

def create_linear_issue(title: str, description: str) -> Optional[str]:
    """Create Linear issue for tracking"""
    if not LINEAR_API_KEY:
        log("LINEAR_API_KEY not set, skipping issue creation", "WARNING")
        return None

    query = """
    mutation IssueCreate($title: String!, $description: String!) {
      issueCreate(input: {
        title: $title
        description: $description
        priority: 1
        labels: ["auto-generated", "ci-failure"]
      }) {
        success
        issue {
          id
          identifier
          url
        }
      }
    }
    """

    variables = {
        'title': title,
        'description': description
    }

    headers = {
        'Authorization': LINEAR_API_KEY,
        'Content-Type': 'application/json'
    }

    try:
        response = requests.post(
            LINEAR_API,
            json={'query': query, 'variables': variables},
            headers=headers
        )
        response.raise_for_status()
        data = response.json()

        if data.get('data', {}).get('issueCreate', {}).get('success'):
            issue = data['data']['issueCreate']['issue']
            log(f"Created Linear issue: {issue['identifier']}")
            return issue['url']
        else:
            log(f"Failed to create Linear issue: {data}", "ERROR")
            return None

    except Exception as e:
        log(f"Error creating Linear issue: {e}", "ERROR")
        return None

def create_codegen_fix(context: Dict[str, Any], logs: str) -> Optional[Dict[str, Any]]:
    """Create Codegen task to generate fix"""
    url = f"{CODEGEN_API}/organizations/{CODEGEN_ORG_ID}/agent/run"
    headers = {
        'Authorization': f'Bearer {CODEGEN_API_KEY}',
        'Content-Type': 'application/json'
    }

    # Build detailed prompt
    error_summary = "\n".join([
        f"- {err.get('content', '')[:200]}"
        for err in context['error_lines'][:5]
    ])

    prompt = f"""
**CI/CD Failure Auto-Fix Request**

**Workflow Run ID**: {WORKFLOW_RUN_ID}
**Repository**: {REPO}

**Failure Summary:**
{error_summary}

**Error Types Detected:**
{', '.join(context['error_types']) if context['error_types'] else 'Unknown'}

**Files Potentially Affected:**
{', '.join(context['files_mentioned'][:10]) if context['files_mentioned'] else 'Not detected'}

**Task:**
1. Analyze the CI failure logs
2. Identify root cause
3. Generate fix with proper error handling
4. Ensure fix doesn't break existing functionality
5. Include tests if applicable

**Requirements:**
- Fix must be production-ready
- Follow existing code patterns
- Add comments explaining the fix
- Update documentation if needed

**Output:**
Provide complete file changes with clear explanations.
""".strip()

    payload = {
        'prompt': prompt,
        'metadata': {
            'workflow_run_id': WORKFLOW_RUN_ID,
            'repo': REPO,
            'source': 'self_healing',
            'error_types': context['error_types']
        }
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        log(f"Failed to create Codegen fix task: {e}", "ERROR")
        return None

def wait_for_completion(task_id: int, max_wait: int = 600) -> Optional[Dict[str, Any]]:
    """Wait for Codegen task completion"""
    url = f"{CODEGEN_API}/organizations/{CODEGEN_ORG_ID}/agent/run/{task_id}"
    headers = {'Authorization': f'Bearer {CODEGEN_API_KEY}'}

    start_time = time.time()
    while time.time() - start_time < max_wait:
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()

            status = data.get('status')
            log(f"Task status: {status}")

            if status == 'completed':
                return data
            elif status == 'failed':
                log("Task failed", "ERROR")
                return None

            time.sleep(10)
        except Exception as e:
            log(f"Error checking task status: {e}", "ERROR")
            time.sleep(10)

    log("Task timed out", "ERROR")
    return None

def main():
    """Main execution"""
    log("🔄 Starting Self-Healing CI/CD process")

    if not all([CODEGEN_ORG_ID, CODEGEN_API_KEY, GITHUB_TOKEN, WORKFLOW_RUN_ID, REPO]):
        log("Missing required environment variables", "ERROR")
        sys.exit(1)

    # Fetch workflow logs
    log(f"Fetching logs for workflow run {WORKFLOW_RUN_ID}")
    logs = get_workflow_logs()

    if not logs:
        log("Failed to fetch logs", "ERROR")
        sys.exit(1)

    # Parse failure context
    log("Analyzing failure context...")
    context = parse_failure_context(logs)

    log(f"Found {len(context['error_lines'])} error lines")
    log(f"Error types: {', '.join(context['error_types']) if context['error_types'] else 'None detected'}")

    # Create Linear issue for tracking
    linear_url = create_linear_issue(
        title=f"CI Failure: Workflow Run #{WORKFLOW_RUN_ID}",
        description=f"""
## Auto-detected CI Failure

**Workflow Run**: {WORKFLOW_RUN_ID}
**Repository**: {REPO}

**Error Summary:**
{chr(10).join([f"- {err.get('content', '')[:150]}" for err in context['error_lines'][:5]])}

**Auto-fix in progress...**

This issue was automatically created by the Self-Healing CI/CD system.
        """.strip()
    )

    # Create Codegen fix
    log("Creating Codegen auto-fix task...")
    task = create_codegen_fix(context, logs)

    if not task:
        log("Failed to create fix task", "ERROR")
        sys.exit(1)

    task_id = task.get('id')
    log(f"Created task {task_id}, waiting for completion...")

    # Wait for completion
    result = wait_for_completion(task_id)

    if result:
        log("✅ Auto-fix completed successfully!")
        log(f"View results: {result.get('web_url')}")

        # Save result for PR creation
        output = {
            'success': True,
            'task_id': task_id,
            'web_url': result.get('web_url'),
            'summary': result.get('summary'),
            'linear_url': linear_url
        }

        with open('/tmp/self_healing_result.json', 'w') as f:
            json.dump(output, f, indent=2)
    else:
        log("❌ Auto-fix failed", "ERROR")
        sys.exit(1)

if __name__ == '__main__':
    main()
