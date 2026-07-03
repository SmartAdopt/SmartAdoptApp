# Commit Convention & Local Setup Guide

To ensure a highly readable project history, automated changelog generation, and a clean collaboration environment, this project enforces the **[Conventional Commits](https://www.conventionalcommits.org/)** standard.

We use `commitlint` and `Husky` to automatically lint commit messages in your local environment before they are created.

## 1. Local Environment Setup

Before you start committing code, you need to set up the Git hooks locally.

If the project already has these dependencies in `package.json`, simply running `npm install` will install them. If you are setting this up for the first time, follow these steps:

**Step 1: Install dependencies**

```bash
npm install -D @commitlint/cli @commitlint/config-conventional husky

```

**Step 2: Configure Commitlint**
Create a `commitlint.config.mjs` file to use the conventional configuration.
*For Mac/Linux/Windows:*

```bash
node -e "fs.writeFileSync('commitlint.config.mjs', 'export default { extends: [\'@commitlint/config-conventional\'] };')"

```

*(Note: If your project does not use ES modules, use `.mjs` as the extension or ensure `type: "module"` is in your `package.json`)*.

**Step 3: Initialize Husky and add the `commit-msg` hook**

```bash
# Initialize Husky
npx husky init
# Add commit message linting to commit-msg hook for windows

node -e "fs.writeFileSync('.husky/commit-msg', 'npx --no -- commitlint --edit $'+'1\n')"  

# Add the commitlint command to the commit-msg hook for linux/mac
echo "npx --no -- commitlint --edit \$1" > .husky/commit-msg

```

Now, every time you run `git commit`, Husky will trigger Commitlint to validate your message.

---

## 2. Commit Message Format

Each commit message consists of a **header**, an optional **body**, and an optional **footer**. The header has a special format that includes a `type`, an optional `scope`, and a `subject`:

```text
type(scope?): subject
<BLANK LINE>
body?
<BLANK LINE>
footer?

```

### Rules:

* **type**: Must be one of the valid types (see below). It must be lowercase.
* **scope**: Optional. Describes the section of the codebase affected (e.g., `auth`, `ui`, `db`, `api`). Must be lowercase and enclosed in parentheses.
* **subject**: A short summary of the change.
* Do not capitalize the first letter.
* Do not end with a period `.`.
* Use the imperative mood ("add feature" not "added feature" or "adds feature").



---

## 3. Valid Types

Your commit `type` MUST be one of the following:

* **`feat`**: A new feature for the user or application.
* **`fix`**: A bug fix.
* **`docs`**: Documentation-only changes (e.g., README, comments).
* **`style`**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc).
* **`refactor`**: A code change that neither fixes a bug nor adds a feature.
* **`perf`**: A code change that improves performance.
* **`test`**: Adding missing tests or correcting existing tests.
* **`build`**: Changes that affect the build system or external dependencies (e.g., npm, webpack, docker).
* **`ci`**: Changes to our CI configuration files and scripts (e.g., GitHub Actions, Travis).
* **`chore`**: Other changes that don't modify `src` or test files (e.g., updating dependencies).
* **`revert`**: Reverts a previous commit.

---

## 4. Examples: Good vs. Bad Commits

### ✅ Correct Examples

* `feat: add user authentication layout`
* `fix(api): resolve null pointer exception in user payload`
* `docs: update installation instructions in README`
* `chore(deps): bump express from 4.17.1 to 4.18.2`
* `refactor(ui): extract button into a reusable component`

### ❌ Incorrect Examples

* `added login` *(Missing type)*
* `Feat: update button color` *(Type must be lowercase)*
* `fix(auth): Fixed token expiration bug.` *(Subject should not be capitalized and should not end with a period)*
* `update readme` *(Missing type)*

---

## 5. Troubleshooting: How to fix rejected commits

If your commit message does not follow the convention, Husky will block the commit and output an error like this:

```text
#  husky > commit-msg
⧗   --- input ---
foo: this will fail
✖   type must be one of [build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test] [type-enum]
✖   found 1 problems, 0 warnings
ⓘ   Get help: https://github.com/conventional-changelog/commitlint/#what-is-commitlint
husky - commit-msg script failed (code 1)

```

**How to fix it:**
Because the hook blocks the commit *before* it is created, your files are still safely staged in Git. You do not lose your work.

To fix the error, simply re-run your `git commit` command with a correctly formatted message:

```bash
# Previous (failed) attempt
git commit -m "foo: this will fail"

# New (successful) attempt
git commit -m "feat: add missing foo validation"

```

If you are using a GUI client (like VS Code Source Control, GitKraken, or SourceTree), the commit will fail, and the error will be shown in an alert or log console. Just rewrite the message in the input box and press "Commit" again.

**Bypassing the hook (Not Recommended):**
In absolute emergencies, if you must skip validation, you can append `--no-verify` to your commit command. However, CI pipelines will likely still reject the commit.

```bash
git commit -m "wip" --no-verify

```