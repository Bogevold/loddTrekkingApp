# Development Guidelines

## Development Cycle

### Snapshot-testing (iterative work)

When developing new features or fixes, use the snapshot flow to test in homelab without bumping versions or creating Git tags:

```bash
make deploy-snapshot   # build, push :snapshot image and helm upgrade
make revert-snapshot   # revert cluster back to current release version
```

Always use `deploy-snapshot` / `revert-snapshot` during active development. Never bump the version or create releases mid-feature.

### Releasing

When a feature is complete and tested via snapshot:

```bash
make bump-patch    # or bump-minor / bump-major as appropriate
make upgrade       # build, push, helm upgrade to new version
make git-push      # push commits and tags to remote
```

### Version management

- The version lives in the `VERSION` file.
- `make build` auto-injects the version string into `app/index.html`.
- Do not manually edit `VERSION` or the version string in HTML.
