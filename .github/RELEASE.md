# Release Flow

This documents the release flow for the maintainers. If you're not a maintainer,
you don't need to read this.

To cut a release, follow these steps:

1. Fix any lint errors (slow-types etc.):
   ```sh
   deno publish --dry-run
   ```

2. Create a release branch and run the version bump script from the root:
   ```sh
   deno run -A jsr:@deno/bump-workspaces@0.1.22/cli --dry-run
   ```
   Note: it will throw a "No target files found" error but this may be in
   prerelease only

3. Create and land a PR

4. Generate a release tag following this pattern `release-YYYY.MM.DD` and the release notes from github UI and manually update `Release.md` if needed

5. Publish as pre-release

6. Wait for the workspace publish action to publish the new versions to JSR.
