import $ from 'dax-sh';
import semver from 'semver';

await $`npm run build`;

const version = semver.clean(process.env.GITHUB_REF_NAME);

if (version && semver.valid(version)) {
    await $`npm version ${version} --no-git-tag-version`.cwd('dist/lib');
    await $`mkdir -p dist/tarball`;
    await $`npm pack ---pack-destination='../tarball'`.cwd('dist/lib');
} else {
    console.error(`Invalid version: ${process.env.GITHUB_REF_NAME}`);
    process.exit(1);
}
