# Git & Command Execution Policy

1. **Local Execution First**: All commands, builds, tests, and code modifications must execute and be verified locally first.
2. **Disable Automatic GitHub Pushes**: Never run `git push` automatically under any circumstance.
3. **Manual Confirmation Required**: After successful local verification, always ask the user for explicit confirmation before pushing any changes to GitHub.
4. **Clear Success Check**: Always provide a clear local success summary (build status, test results, or server state) before prompting the user.
