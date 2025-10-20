# Release Flow

This documents the release flow for the maintainers. If you're not a maintainer,
you don't need to read this.

To cut a release, follow these steps:

1. Fix any lint errors (slow-types etc.):
   ```sh
   deno publish --dry-run
   deno doc --lint */*.ts
   deno test --doc
   ```

2. Create a release branch and run the version bump script from the root:
   ```sh
   deno run -A scripts/bump-versions.ts
   ```
   Note: it will throw a "No target files found" error but this may be in
   prerelease only

3. Create and land a PR

4. Switch back to the main branch, pull the changes and delete the release
   branch

5. Tag the main branch with release-vX.Y.Z:

   ```sh
   git tag release-vX.Y.Z
   git push origin release-vX.Y.Z
   ```

6. Generate the release notes from github UI and manually update Release.md if
   needed

7. Publish as pre-release

8. Wait for the workspace publish action to publish the new versions to JSR.
