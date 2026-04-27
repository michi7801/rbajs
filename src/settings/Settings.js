import settings from "../../settings.json" with { type: 'json' };

export class Settings {

    static get() {
        return settings;
    }

}

