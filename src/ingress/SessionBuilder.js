import maxmind from "maxmind";
import {LoginSession} from "./LoginSession.js";
import {UserAgentBuilder} from "./UserAgentBuilder.js";
import {Settings} from "../settings/Settings.js";

export class SessionBuilder {

    #CITY_DB;
    #cityLookup;
    #ASN_DB;
    #asnLookup;
    #userAgentBuilder;
    #privateIpRanges;

    constructor(maxmindCityDbPath, maxmindAsnDbPath) {
        this.#CITY_DB = maxmindCityDbPath;
        this.#ASN_DB = maxmindAsnDbPath;
        this.#userAgentBuilder = new UserAgentBuilder();
        this.#privateIpRanges = [
            { start: this.#ipToNumber("10.0.0.0"), end: this.#ipToNumber("10.255.255.255") },
            { start: this.#ipToNumber("172.16.0.0"), end: this.#ipToNumber("172.31.255.255") },
            { start: this.#ipToNumber("192.168.0.0"), end: this.#ipToNumber("192.168.255.255") },
        ];
    }

    async init() {
        this.#asnLookup = await maxmind.open(this.#ASN_DB);
        this.#cityLookup = await maxmind.open(this.#CITY_DB);
    }

    #ipToNumber(ip) {
        const parts = ip.split('.');
        return (
            (parts[0] << 24 >>> 0) +
            (parts[1] << 16) +
            (parts[2] << 8) +
            (parts[3] << 0)
        ) >>> 0;
    }

    #isPrivateIP(ip) {
        const num = this.#ipToNumber(ip);
        for (const range of this.#privateIpRanges) {
            if (num >= range.start && num <= range.end)
                return true;
        }
        return false;
    }

    /**
     * @param {Number} id
     * @param {String} ip
     * @param {Number} rtt
     * @param {String} userAgent
     * @param {String} timestamp
     * @param {Number} failedLogins24h
     * @param {Number} failedLogins15min
     * @param {Boolean} loginSuccessful
     * @return {LoginSession}
     */
    fromRaw(id, ip, rtt, userAgent, timestamp, failedLogins24h, failedLogins15min, loginSuccessful) {
        const isPrivateIp = this.#isPrivateIP(ip);

        const asn = isPrivateIp ?
            { autonomous_system_number: -1, autonomous_system_organization: 'private' } :
            this.#asnLookup.get(ip);
        const city = isPrivateIp ?
            { location: { longitude: Settings.get().serverLocation.longitude, latitude: Settings.get().serverLocation.latitude } } :
            this.#cityLookup.get(ip);

        const userAgentObj = this.#userAgentBuilder.fromString(userAgent)
        return new LoginSession(
            id, ip,
            asn?.autonomous_system_number ?? null,
            asn?.autonomous_system_organization ?? null,
            city?.location?.longitude ?? null,
            city?.location?.latitude ?? null,
            timestamp,
            rtt, userAgentObj, isPrivateIp,
            failedLogins24h, failedLogins15min, loginSuccessful
        )

    }

    /**
     * @param {{
     *  index: Number
     *  ip: String,
     *  asn: Number,
     *  asn_organization: String,
     *  longitude: Number,
     *  latitude: Number,
     *  timestamp: String,
     *  rtt: Number,
     *  user_agent: String,
     *  ua_browser: String,
     *  ua_os: String,
     *  ua_browser_version_major: Number,
     *  ua_browser_version_minor: Number,
     *  ua_browser_version_patch: Number,
     *  ua_browser_version_build: Number,
     *  ua_os_version_major: Number,
     *  ua_os_version_minor: Number,
     *  ua_os_version_patch: Number,
     *  ua_os_version_build: Number,
     *  failed_logins_24h: Number,
     *  failed_logins_15min: Number,
     *  login_success: Boolean
     * }} obj
     * @return {LoginSession}
     */
    fromObject(obj) {
        const userAgent = this.#userAgentBuilder.fromObject(obj)
        return new LoginSession(
            obj.index,
            obj.ip,
            obj.asn,
            obj.asn_organization,
            obj.longitude,
            obj.latitude,
            obj.timestamp,
            obj.rtt,
            userAgent,
            obj.asn === -1,
            obj.failed_logins_24h,
            obj.failed_logins_15min,
            obj.login_success
        );
    }
}
