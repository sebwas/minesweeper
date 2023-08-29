const path = require('path')
const fs = require('fs')
const childProcess = require('child_process')
const parseArgs = require('args-parser')

const args = parseArgs(process.argv)

const packageJsonPath = path.join(__dirname, '..', 'package.json')
const packageJsonFile = fs.readFileSync(packageJsonPath).toString()
const packageJson = JSON.parse(packageJsonFile)

const version = packageJson.version

let [major = 0, minor = 0, patch = 0] = version.split('.').map(n => Number(n))

if (args.major) {
	major++
	minor = 0
	patch = 0
} else if (args.minor) {
	minor++
	patch = 0
} else if (args.patch) {
	patch++
} else {
	console.log(`
Usage: ${process.argv[1]} [OPTIONS] [--dry-run]
  --major       Major version bump
  --minor       Minor version bump
  --patch       Patch version bump

  --dry-run     Show the file contents without writing them to the disk

Exactly one type should be selected.
	`.trim())

	process.exit(1)
}

const newVersion = `${major}.${minor}.${patch}`

const canReplaceWithRegex = new RegExp(`"version"\\s*:\\s*"${version}"`, 'gm').test(packageJsonFile)

let newContent = packageJsonFile

if (canReplaceWithRegex) {
	newContent = packageJsonFile.replace(
		new RegExp(`"version"\\s*:\\s*"${version}"`, 'gm'),
		`"version": "${newVersion}"`
	)
} else {
	packageJson.version = newVersion

	newContent = JSON.stringify(packageJson)
}

if (args['dry-run']) {
	console.info('The version has not been replaced. Here\'s the package.json content that would have been written to the disk:\n')
	console.log(newContent)
	console.info('\nOmit the --dry-run option to write to disk.')
} else {
	fs.writeFileSync(packageJsonPath, newContent)
	childProcess.execSync(`git tag v${newVersion}`)
}
