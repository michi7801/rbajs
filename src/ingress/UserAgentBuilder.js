import {Settings} from "../settings/Settings.js";
import {UAParser} from "ua-parser-js";
import {UserAgent} from "./UserAgent.js";

export class UserAgentBuilder {

    #versionRegex


    constructor() {
        this.#versionRegex = new RegExp(Settings.get().userAgent.uaVersionParser)
    }

    /**
     * @param {{
     *     user_agent: String,
     *     ua_browser: String,
     *     ua_os: String,
     *     ua_browser_version_major: Number,
     *     ua_browser_version_minor: Number,
     *     ua_browser_version_patch: Number,
     *     ua_browser_version_build: Number,
     *     ua_os_version_major: Number,
     *     ua_os_version_minor: Number,
     *     ua_os_version_patch: Number,
     *     ua_os_version_build: Number
     *  }} json
     * @return {UserAgent}
     */
    fromObject(json) {
        return new UserAgent(
            json.user_agent,
            json.ua_browser,
            json.ua_os,
            {major: json.ua_browser_version_major, minor: json.ua_browser_version_minor, patch: json.ua_browser_version_patch, build: json.ua_browser_version_build},
            { major: json.ua_os_version_major, minor: json.ua_os_version_minor, patch: json.ua_os_version_patch, build: json.ua_os_version_build }
        )
    }

    /**
     * @param {String} ua
     * @returns {UserAgent}
     */
    fromString(ua) {
        const uaObj = this.#parseUserAgent(ua);
        return new UserAgent(
            uaObj?.fullUserAgent,
            uaObj?.browser,
            uaObj?.os,
            uaObj?.browserVersion,
            uaObj?.osVersion
        )
    }

    #parseUserAgent(ua) {
        if (!ua || typeof ua !== "string") return null;

        const parser = new UAParser(ua);
        const result = parser.getResult();

        return {
            browser: result.browser.name || null,
            browserVersion: this.#parseVersionString(result.browser.version || null),
            os: result.os.name || null,
            osVersion: this.#parseVersionString(result.os.version || null),
            fullUserAgent: ua
        };
    }

    /**
     * @param version
     * @returns {{major: Number|null, minor: Number|null, patch: Number|null, build: Number|null}}
     */
    #parseVersionString(version) {
        let major = null, minor = null, patch = null, build = null;
        if (version !== null) {
            const versionParts = this.#versionRegex.exec(version);
            if(Array.isArray(versionParts)) {
                major = Number.isFinite(Number(versionParts[1])) ? Number(versionParts[1]) : null;
                minor = Number.isFinite(Number(versionParts[4])) ? Number(versionParts[4]) : null;
                patch = Number.isFinite(Number(versionParts[7])) ? Number(versionParts[7]) : null;
                build = Number.isFinite(Number(versionParts[10])) ? Number(versionParts[10]) : null;
            }
        }
        return {major, minor, patch, build}
    }
}
