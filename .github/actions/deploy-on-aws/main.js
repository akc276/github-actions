const core = require('@actions/core')
// const github = require('@actions/github')
const exec = require('@actions/exec')

function run() {
    core.notice('Hello from my custom js action');
    const bucket = core.getInput('bucket', {required: true});
    const bucketRegion = core.getInput('bucket-region', {required: true})
    const distFolder = core.getInput("dist-folder", {required: true})
    const BUCKET_URI = `s3://${bucket}`;
    /**
     * Run AWS S3 command with automatic bucket and region injection.
     *
     * @param {string} command - The AWS S3 command (args only).
     * Example: "sync ./dist --delete"
     */
    async function execute_aws_s3_cmd(command) {
        const BUCKET_URI = `s3://${bucket}`;

        // Split arguments
        const args = command.trim().split(/\s+/);

        // If no bucket is included, inject our BUCKET_URI
        const needsBucket = !args.some(arg => arg.startsWith("s3://"));
        if (needsBucket) {
            args.push(BUCKET_URI);
        }

        // Always add region if not already provided
        if (!args.includes("--region")) {
            args.push("--region", bucketRegion);
        }

        console.log("👉 Running:", `aws s3 ${args.join(" ")}`);
        try {
            await exec.exec("aws", ["s3", ...args]);
        } catch (error) {
            console.error("AWS command failed:", error.message);
            throw error;
        }
    }

    exec.exec(`aws s3 sync ${distFolder} ${BUCKET_URI} --region ${bucketRegion} --delete`)
    // execute_aws_s3_cmd(`sync ${distFolder} --delete`);
    execute_aws_s3_cmd('ls')
    // execute_aws_s3_cmd(`website --index-document index.html --error-document index.html`)
    const websiteURL = `http://${bucket}.s3-website.${bucketRegion}.amazonaws.com`;
    core.setOutput('website-url', websiteURL)
    core.notice(`Website URL: ${websiteURL}`);
}

run();
