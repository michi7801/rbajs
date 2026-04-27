
export class UserAgent {
    #fullString
    #browser;
    #os;

    #browserMajorVersion;
    #browserMinorVersion;
    #browserPatchVersion;
    #browserBuildVersion;

    #osMajorVersion;
    #osMinorVersion;
    #osPatchVersion;
    #osBuildVersion;

    constructor(uaString, browser, os, browserVersion, osVersion) {
        this.#fullString = uaString;
        this.#browser = browser;
        this.#os = os;
        this.#browserMajorVersion = browserVersion?.major;
        this.#browserMinorVersion = browserVersion?.minor;
        this.#browserPatchVersion = browserVersion?.patch;
        this.#browserBuildVersion = browserVersion?.build;

        this.#osMajorVersion = osVersion?.major;
        this.#osMinorVersion = osVersion?.minor;
        this.#osPatchVersion = osVersion?.patch;
        this.#osBuildVersion = osVersion?.build;
    }

    /**
     * @return {{major: Number, minor: Number, patch: Number, build: Number}}
     */
    getBrowserVersion() {
        return {
            major: this.#browserMajorVersion,
            minor: this.#browserMinorVersion,
            patch: this.#browserPatchVersion,
            build: this.#browserBuildVersion
        }
    }

    /**
     * @return {{major: Number, minor: Number, patch: Number, build: Number}}
     */
    getOSVersion() {
        return {
            major: this.#osMajorVersion,
            minor: this.#osMinorVersion,
            patch: this.#osPatchVersion,
            build: this.#osBuildVersion
        }
    }

    getBrowser() {
        return this.#browser;
    }

    getOS() {
        return this.#os;
    }

    getFullString() {
        return this.#fullString;
    }

    toJson() {
        return {
            fullString: this.#fullString,
            browser: this.#browser,
            os: this.#os,
            browserVersion: {
                major: this.#browserMajorVersion,
                minor: this.#browserMinorVersion,
                patch: this.#browserPatchVersion,
                build: this.#browserBuildVersion
            },
            osVersion: {
                major: this.#osMajorVersion,
                minor: this.#osMinorVersion,
                patch: this.#osPatchVersion,
                build: this.#osBuildVersion
            }
        }
    }
}
