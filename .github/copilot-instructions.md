# RoomMate repository guardrails

## Scope

- Work only inside this repository.
- Do not use external agents, remote coding services, or unreviewed automation.
- Preserve the existing `web/` frontend unless a task explicitly asks for frontend changes.
- Keep backend work under `backend/`.

## Git safety

Git is read-only for automated assistants in this repository:

- Allowed: `git status` and `git pull`.
- Do not run `git add`, `git commit`, `git push`, `git checkout`, `git switch`, `git merge`, `git rebase`, `git reset`, `git clean`, or destructive history/file commands.
- Do not change branches or tags.
- A human maintainer owns staging, commits, merges, and pushes.

## Backend conventions

- Use Java 21, Spring Boot, Maven, MySQL, and Flyway.
- Keep controllers thin; put business logic in services and persistence in repositories.
- Validate API input at the boundary and return explicit errors.
- Never commit credentials. Use `backend/.env.example` as the local configuration template.
- Every schema change must be a new, forward-only Flyway migration.
- Run the focused backend verification commands from `backend/README.md` before handing off changes.
