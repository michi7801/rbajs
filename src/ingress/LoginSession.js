export class LoginSession {

    #id;
    #ip;
    #asn;
    #asnOrganization;
    #timestamp;
    #rtt;
    #userAgent;
    #longitude;
    #latitude;
    #isPrivateIp;
    #failedLogins24h;
    #failedLogins15min;
    #loginSuccessful;

    /**
     * @param {Number} id
     * @param {String} ip
     * @param {Number} asn
     * @param {String} asnOrganization
     * @param {Number} longitude
     * @param {Number} latitude
     * @param {String} timestamp
     * @param {Number} rtt
     * @param {UserAgent} userAgent
     * @param {Boolean} isPrivateIp
     * @param {Number} failedLogins24h
     * @param {Number} failedLogins15min
     * @param {Boolean} loginSuccessful
     */
    constructor(id, ip, asn, asnOrganization, longitude, latitude, timestamp, rtt, userAgent, isPrivateIp, failedLogins24h, failedLogins15min, loginSuccessful) {
        this.#id = id;
        this.#ip = ip;
        this.#asn = asn;
        this.#asnOrganization = asnOrganization;
        this.#timestamp = new Date(timestamp);
        this.#rtt = rtt;
        this.#userAgent = userAgent;
        this.#latitude = latitude;
        this.#longitude = longitude;
        this.#isPrivateIp = isPrivateIp;
        this.#failedLogins24h = failedLogins24h;
        this.#failedLogins15min = failedLogins15min;
        this.#loginSuccessful = loginSuccessful;
    }

    getId() {
        return this.#id;
    }

    getIp() {
        return this.#ip;
    }

    getAsn() {
        return this.#asn;
    }

    getAsnOrganization() {
        return this.#asnOrganization;
    }

    /**
     * @return {Date}
     */
    getTimestamp() {
        return this.#timestamp;
    }

    getRtt() {
        return this.#rtt;
    }

    /**
     * @return {UserAgent}
     */
    getUserAgent() {
        return this.#userAgent;
    }

    getLongitude() {
        return this.#longitude;
    }

    getLatitude() {
        return this.#latitude;
    }

    getFailedLogins15min() {
        return this.#failedLogins15min;
    }

    getFailedLogins24h() {
        return this.#failedLogins24h;
    }

    isPrivateIp() {
        return this.#isPrivateIp;
    }

    isLoginSuccessful() {
        return this.#loginSuccessful;
    }

    setFailedLogins24h(failed24h) {
        this.#failedLogins24h = failed24h;
    }

    setFailedLogins15min(failed15min) {
        this.#failedLogins15min = failed15min;
    }

    setRtt(rtt) {
        this.#rtt = rtt;
    }

    /**
     * @param {Date} timestamp
     */
    setTimestamp(timestamp) {
        this.#timestamp = timestamp;
    }

    setUserAgent(userAgent) {
        this.#userAgent = userAgent;
    }

    toJson() {
        return {
            ip: this.#ip,
            asn: this.#asn,
            asnOrganization: this.#asnOrganization,
            timestamp: this.#timestamp,
            rtt: this.#rtt,
            userAgent: this.#userAgent.toJson(),
            longitude: this.#longitude,
            latitude: this.#latitude,
            isPrivateIp: this.#isPrivateIp,
            failedLogins15min: this.#failedLogins15min,
            failedLogins24h: this.#failedLogins24h,
            loginSuccessful: this.#loginSuccessful
        }
    }
}
