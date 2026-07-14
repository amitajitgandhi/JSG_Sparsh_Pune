#!/usr/bin/env node
/**
 * JSG Sparsh Portal - UI guardrail hook for Claude Code.
 *
 * Fires on PreToolUse and PostToolUse for Write/Edit calls that touch a
 * page or component file under app/**.
 *
 *  - PreToolUse: injects a non-blocking reminder (additionalContext) covering
 *    the project's UI rules before the edit/write happens.
 *  - PostToolUse: runs a mechanical (heuristic) check for missing dark: mode
 *    classes and BLOCKS (exit code 2) if it finds an obvious miss, asking
 *    Claude to fix it before moving on.
 *
 * This intentionally does NOT try to mechanically enforce "mobile-first",
 * "scroll to top on new pages", or "only touch the requested file" - those
 * require judgement, so they are reminders only, not hard blocks.
 *
 * Registered in .claude/settings.json. See CLAUDE.md for the underlying
 * UI / Design Rules this hook is reinforcing.
 */

const fs = require('fs')

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8')
  } catch {
    return ''
  }
}

function main() {
  let payload = {}
  try {
    payload = JSON.parse(readStdin() || '{}')
  } catch {
    process.exit(0) // unparseable input - fail open, never block on our own bug
  }

  const event = payload.hook_event_name
  const toolName = payload.tool_name
  const filePath = (payload.tool_input && payload.tool_input.file_path) || ''

  const isUiFile = /[\\/]app[\\/].*\.(tsx|jsx)$/.test(filePath)
  const isPageFile = /page\.(tsx|jsx)$/.test(filePath)
  const isWrite = toolName === 'Write'
  const isEdit = toolName === 'Edit'

  if (!isUiFile || (!isWrite && !isEdit)) {
    process.exit(0)
  }

  if (event === 'PreToolUse') {
    const notes = [
      'JSG Sparsh Portal UI guardrails for this file:',
      '- Mobile-first: most users are on mobile. Design for ~390px first (px-4 sm:px-6 lg:px-8 padding, 44x44px touch targets, text-sm+ body copy).',
      '- Dark mode is mandatory: every light bg/text Tailwind class needs a dark: counterpart (see CLAUDE.md color-mapping table).',
      isPageFile
        ? '- This is a page: it must scroll to top on load, not inherit scroll position from the previous page. Watch for custom history/scroll-restoration logic (e.g. useMobileBackHandler) interfering with default Next.js scroll-to-top behavior.'
        : null,
      '- Only edit the file(s) the user actually asked about. Do not modify other pages/components as a side effect without asking first.',
      isWrite
        ? '- This is a NEW file: do not edit any existing file to wire it up unless the user explicitly asked for that too - confirm first if it seems necessary.'
        : null,
    ].filter(Boolean).join('\n')

    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        additionalContext: notes,
      },
    }))
    process.exit(0)
  }

  if (event === 'PostToolUse') {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const lightClasses = [
        'bg-white', 'bg-gray-50', 'bg-indigo-50',
        'text-gray-800', 'text-gray-600', 'text-gray-500', 'text-gray-400',
        'border-gray-200', 'border-violet-100',
      ]
      const offenders = []
      content.split('\n').forEach((line, idx) => {
        if (line.includes('dark:')) return // already has some dark variant on this line
        for (const cls of lightClasses) {
          const re = new RegExp(`(^|[^a-zA-Z0-9_-])${cls}([^a-zA-Z0-9_-]|$)`)
          if (re.test(line)) {
            offenders.push(`line ${idx + 1}: ${cls}`)
            break
          }
        }
      })

      if (offenders.length > 0) {
        process.stderr.write(
          `UI guardrail: ${filePath} has light-only Tailwind classes with no dark: counterpart on the same line:\n` +
          offenders.slice(0, 15).join('\n') +
          `\nPer CLAUDE.md, add the matching dark: class (e.g. bg-white -> dark:bg-gray-800/900, text-gray-600 -> dark:text-gray-300). ` +
          `This is a heuristic same-line check - if the dark: variant is genuinely applied elsewhere (e.g. via a shared class string), it's a false positive; otherwise please fix it.`
        )
        process.exit(2) // blocks; stderr is fed back to Claude as feedback
      }
    } catch {
      // file unreadable/removed - don't block on that
    }
    process.exit(0)
  }

  process.exit(0)
}

main()
