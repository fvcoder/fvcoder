"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopyTemplateError = void 0;
exports.copyTemplate = copyTemplate;
const node_process_1 = __importDefault(require("node:process"));
const node_url_1 = __importDefault(require("node:url"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_stream_1 = __importDefault(require("node:stream"));
const node_util_1 = require("node:util");
const web_fetch_1 = require("@remix-run/web-fetch");
const gunzip_maybe_1 = __importDefault(require("gunzip-maybe"));
const tar_fs_1 = __importDefault(require("tar-fs"));
const proxy_agent_1 = require("proxy-agent");
const color_1 = require("./color");
const isUrl_1 = require("./isUrl");
const defaultAgent = new proxy_agent_1.ProxyAgent();
const httpsAgent = new proxy_agent_1.ProxyAgent();
httpsAgent.protocol = "https:";
function agent(url) {
    return new URL(url).protocol === "https:" ? httpsAgent : defaultAgent;
}
async function copyTemplate(template, destPath, options) {
    let { log = () => { } } = options;
    /**
     * Valid templates are:
     * - local file or directory on disk
     * - GitHub owner/repo shorthand
     * - GitHub owner/repo/directory shorthand
     * - full GitHub repo URL
     * - any tarball URL
     */
    try {
        if (isLocalFilePath(template)) {
            log(`Using the template from local file at "${template}"`);
            let filepath = template.startsWith("file://")
                ? node_url_1.default.fileURLToPath(template)
                : template;
            let isLocalDir = await copyTemplateFromLocalFilePath(filepath, destPath);
            return isLocalDir ? { localTemplateDirectory: filepath } : undefined;
        }
        if (isGithubRepoShorthand(template)) {
            log(`Using the template from the "${template}" repo`);
            await copyTemplateFromGithubRepoShorthand(template, destPath, options);
            return;
        }
        if (isValidGithubRepoUrl(template)) {
            log(`Using the template from "${template}"`);
            await copyTemplateFromGithubRepoUrl(template, destPath, options);
            return;
        }
        if ((0, isUrl_1.isUrl)(template)) {
            log(`Using the template from "${template}"`);
            await copyTemplateFromGenericUrl(template, destPath, options);
            return;
        }
        throw new CopyTemplateError(`"${color_1.color.bold(template)}" is an invalid template. Run ${color_1.color.bold("create-react-router --help")} to see supported template formats.`);
    }
    catch (error) {
        await options.onError(error);
    }
}
function isLocalFilePath(input) {
    try {
        return (input.startsWith("file://") ||
            node_fs_1.default.existsSync(node_path_1.default.isAbsolute(input) ? input : node_path_1.default.resolve(node_process_1.default.cwd(), input)));
    }
    catch (_) {
        return false;
    }
}
async function copyTemplateFromRemoteTarball(url, destPath, options) {
    return await downloadAndExtractTarball(destPath, url, options);
}
async function copyTemplateFromGithubRepoShorthand(repoShorthand, destPath, options) {
    let [owner, name, ...path] = repoShorthand.split("/");
    let filePath = path.length ? path.join("/") : null;
    await downloadAndExtractRepoTarball({ owner, name, filePath }, destPath, options);
}
async function copyTemplateFromGithubRepoUrl(repoUrl, destPath, options) {
    await downloadAndExtractRepoTarball(getRepoInfo(repoUrl), destPath, options);
}
async function copyTemplateFromGenericUrl(url, destPath, options) {
    await copyTemplateFromRemoteTarball(url, destPath, options);
}
async function copyTemplateFromLocalFilePath(filePath, destPath) {
    if (filePath.endsWith(".tar.gz") || filePath.endsWith(".tgz")) {
        await extractLocalTarball(filePath, destPath);
        return false;
    }
    if (node_fs_1.default.statSync(filePath).isDirectory()) {
        // If our template is just a directory on disk, return true here, and we'll
        // just copy directly from there instead of "extracting" to a temp
        // directory first
        return true;
    }
    throw new CopyTemplateError("The provided template is not a valid local directory or tarball.");
}
const pipeline = (0, node_util_1.promisify)(node_stream_1.default.pipeline);
async function extractLocalTarball(tarballPath, destPath) {
    try {
        await pipeline(node_fs_1.default.createReadStream(tarballPath), (0, gunzip_maybe_1.default)(), tar_fs_1.default.extract(destPath, { strip: 1 }));
    }
    catch (error) {
        throw new CopyTemplateError("There was a problem extracting the file from the provided template." +
            `  Template filepath: \`${tarballPath}\`` +
            `  Destination directory: \`${destPath}\`` +
            `  ${error}`);
    }
}
async function downloadAndExtractRepoTarball(repo, destPath, options) {
    // If we have a direct file path we will also have the branch. We can skip the
    // redirect and get the tarball URL directly.
    if (repo.branch && repo.filePath) {
        let tarballURL = `https://codeload.github.com/${repo.owner}/${repo.name}/tar.gz/${repo.branch}`;
        return await downloadAndExtractTarball(destPath, tarballURL, {
            ...options,
            filePath: repo.filePath,
        });
    }
    // If we don't know the branch, the GitHub API will figure out the default and
    // redirect the request to the tarball.
    // https://docs.github.com/en/rest/reference/repos#download-a-repository-archive-tar
    let url = `https://api.github.com/repos/${repo.owner}/${repo.name}/tarball`;
    if (repo.branch) {
        url += `/${repo.branch}`;
    }
    return await downloadAndExtractTarball(destPath, url, {
        ...options,
        filePath: repo.filePath ?? null,
    });
}
async function downloadAndExtractTarball(downloadPath, tarballUrl, { token, filePath }) {
    let resourceUrl = tarballUrl;
    let headers = {};
    let isGithubUrl = new URL(tarballUrl).host.endsWith("github.com");
    if (token && isGithubUrl) {
        headers.Authorization = `token ${token}`;
    }
    if (isGithubReleaseAssetUrl(tarballUrl)) {
        // We can download the asset via the GitHub api, but first we need to look
        // up the asset id
        let info = getGithubReleaseAssetInfo(tarballUrl);
        headers.Accept = "application/vnd.github.v3+json";
        let releaseUrl = info.tag === "latest"
            ? `https://api.github.com/repos/${info.owner}/${info.name}/releases/latest`
            : `https://api.github.com/repos/${info.owner}/${info.name}/releases/tags/${info.tag}`;
        let response = await (0, web_fetch_1.fetch)(releaseUrl, {
            agent: agent("https://api.github.com"),
            headers,
        });
        if (response.status !== 200) {
            throw new CopyTemplateError("There was a problem fetching the file from GitHub. The request " +
                `responded with a ${response.status} status. Please try again later.`);
        }
        let body = (await response.json());
        if (!body ||
            typeof body !== "object" ||
            !body.assets ||
            !Array.isArray(body.assets)) {
            throw new CopyTemplateError("There was a problem fetching the file from GitHub. No asset was " +
                "found at that url. Please try again later.");
        }
        let assetId = body.assets.find((asset) => {
            // If the release is "latest", the url won't match the download url
            return info.tag === "latest"
                ? asset?.browser_download_url?.includes(info.asset)
                : asset?.browser_download_url === tarballUrl;
        })?.id;
        if (assetId == null) {
            throw new CopyTemplateError("There was a problem fetching the file from GitHub. No asset was " +
                "found at that url. Please try again later.");
        }
        resourceUrl = `https://api.github.com/repos/${info.owner}/${info.name}/releases/assets/${assetId}`;
        headers.Accept = "application/octet-stream";
    }
    let response = await (0, web_fetch_1.fetch)(resourceUrl, {
        agent: agent(resourceUrl),
        headers,
    });
    if (!response.body || response.status !== 200) {
        if (token) {
            throw new CopyTemplateError(`There was a problem fetching the file${isGithubUrl ? " from GitHub" : ""}. The request ` +
                `responded with a ${response.status} status. Perhaps your \`--token\`` +
                "is expired or invalid.");
        }
        throw new CopyTemplateError(`There was a problem fetching the file${isGithubUrl ? " from GitHub" : ""}. The request ` +
            `responded with a ${response.status} status. Please try again later.`);
    }
    // file paths returned from GitHub are always unix style
    if (filePath) {
        filePath = filePath.split(node_path_1.default.sep).join(node_path_1.default.posix.sep);
    }
    let filePathHasFiles = false;
    try {
        let input = new node_stream_1.default.PassThrough();
        // Start reading stream into passthrough, don't await to avoid buffering
        writeReadableStreamToWritable(response.body, input);
        await pipeline(input, (0, gunzip_maybe_1.default)(), tar_fs_1.default.extract(downloadPath, {
            map(header) {
                let originalDirName = header.name.split("/")[0];
                header.name = header.name.replace(`${originalDirName}/`, "");
                if (filePath) {
                    // Include trailing slash on startsWith when filePath doesn't include
                    // it so something like `templates/basic` doesn't inadvertently
                    // include `templates/basic-javascript/*` files
                    if ((filePath.endsWith(node_path_1.default.posix.sep) &&
                        header.name.startsWith(filePath)) ||
                        (!filePath.endsWith(node_path_1.default.posix.sep) &&
                            header.name.startsWith(filePath + node_path_1.default.posix.sep))) {
                        filePathHasFiles = true;
                        header.name = header.name.replace(filePath, "");
                    }
                    else {
                        header.name = "__IGNORE__";
                    }
                }
                return header;
            },
            ignore(_filename, header) {
                if (!header) {
                    throw Error("Header is undefined");
                }
                return header.name === "__IGNORE__";
            },
        }));
    }
    catch (_) {
        throw new CopyTemplateError("There was a problem extracting the file from the provided template." +
            `  Template URL: \`${tarballUrl}\`` +
            `  Destination directory: \`${downloadPath}\``);
    }
    if (filePath && !filePathHasFiles) {
        throw new CopyTemplateError(`The path "${filePath}" was not found in this ${isGithubUrl ? "GitHub repo." : "tarball."}`);
    }
}
// Copied from react-router-node/stream.ts
async function writeReadableStreamToWritable(stream, writable) {
    let reader = stream.getReader();
    let flushable = writable;
    try {
        while (true) {
            let { done, value } = await reader.read();
            if (done) {
                writable.end();
                break;
            }
            writable.write(value);
            if (typeof flushable.flush === "function") {
                flushable.flush();
            }
        }
    }
    catch (error) {
        writable.destroy(error);
        throw error;
    }
}
function isValidGithubRepoUrl(input) {
    if (!(0, isUrl_1.isUrl)(input)) {
        return false;
    }
    try {
        let url = new URL(input);
        let pathSegments = url.pathname.slice(1).split("/");
        return (url.protocol === "https:" &&
            url.hostname === "github.com" &&
            // The pathname must have at least 2 segments. If it has more than 2, the
            // third must be "tree" and it must have at least 4 segments.
            // https://github.com/:owner/:repo
            // https://github.com/:owner/:repo/tree/:ref
            pathSegments.length >= 2 &&
            (pathSegments.length > 2
                ? pathSegments[2] === "tree" && pathSegments.length >= 4
                : true));
    }
    catch (_) {
        return false;
    }
}
function isGithubRepoShorthand(value) {
    if ((0, isUrl_1.isUrl)(value)) {
        return false;
    }
    // This supports :owner/:repo and :owner/:repo/nested/path, e.g.
    // remix-run/react-router
    // remix-run/react-router/examples/basic
    return /^[\w-]+\/[\w-.]+(\/[\w-.]+)*$/.test(value);
}
function isGithubReleaseAssetUrl(url) {
    /**
     * Accounts for the following formats:
     * https://github.com/owner/repository/releases/download/v0.0.1/template.tar.gz
     * ~or~
     * https://github.com/owner/repository/releases/latest/download/template.tar.gz
     */
    return (url.startsWith("https://github.com") &&
        (url.includes("/releases/download/") ||
            url.includes("/releases/latest/download/")));
}
function getGithubReleaseAssetInfo(browserUrl) {
    /**
     * https://github.com/owner/repository/releases/download/v0.0.1/template.tar.gz
     * ~or~
     * https://github.com/owner/repository/releases/latest/download/template.tar.gz
     */
    let url = new URL(browserUrl);
    let [, owner, name, , downloadOrLatest, tag, asset] = url.pathname.split("/");
    if (downloadOrLatest === "latest" && tag === "download") {
        // handle the GitHub URL quirk for latest releases
        tag = "latest";
    }
    return {
        browserUrl,
        owner,
        name,
        asset,
        tag,
    };
}
function getRepoInfo(validatedGithubUrl) {
    let url = new URL(validatedGithubUrl);
    let [, owner, name, tree, branch, ...file] = url.pathname.split("/");
    let filePath = file.join("/");
    if (tree === undefined) {
        return {
            owner,
            name,
            branch: null,
            filePath: null,
        };
    }
    return {
        owner,
        name,
        // If we've validated the GitHub URL and there is a tree, there will also be
        // a branch
        branch: branch,
        filePath: filePath === "" || filePath === "/" ? null : filePath,
    };
}
class CopyTemplateError extends Error {
    constructor(message) {
        super(message);
        this.name = "CopyTemplateError";
    }
}
exports.CopyTemplateError = CopyTemplateError;
