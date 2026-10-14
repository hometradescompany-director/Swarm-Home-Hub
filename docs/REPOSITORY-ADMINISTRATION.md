# Repository administration

`main` is protected by GitHub repository settings, not by files in this
repository. A repository owner must configure and periodically verify the
following active branch ruleset for `main`:

- Require a pull request before merging.
- Require one approving review when at least two independent maintainers have
  write access. A sole maintainer may use the pull-request workflow without an
  approval requirement until an independent maintainer is available.
- Require the CI workflow in `.github/workflows/ci.yml` to pass. Where GitHub
  requires a status-check name rather than a workflow selection, require
  `ci / check`.
- Require the branch to be up to date before merging.
- Block force pushes and branch deletion.

The ruleset's only bypass actor must be the `Repository role: Admin` role, with
an `Always` bypass mode, and only `@hometradescompany-director` may hold that
role. This preserves an owner emergency-recovery path for restoring
availability or correcting a broken ruleset; it must not be used for ordinary
changes. After an emergency bypass, the owner must restore the ruleset
immediately and record the reason and follow-up work in an issue or pull
request.

Do not treat `.github/CODEOWNERS` or `CONTRIBUTING.md` as enforcement: they
remain advisory unless the active GitHub ruleset is configured to enforce the
corresponding review requirements.
