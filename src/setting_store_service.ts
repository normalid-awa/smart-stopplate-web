"use client";

export enum SettingsItem {
    PerformClearWhenReview,
}

export class SettingsStoreService {
    static read(key: SettingsItem | string) {
        if (typeof window !== "undefined") {
            return JSON.parse(localStorage.getItem(key.toString()) || "");
        }
    }

    static write(key: SettingsItem | string, value: any) {
        if (typeof window !== "undefined")
            localStorage.setItem(key.toString(), value);
    }

    static delete(key: SettingsItem) {
        if (typeof window !== "undefined")
            localStorage.removeItem(key.toString());
    }

    static delete_all() {
        for (let key in SettingsItem) {
            if (typeof window !== "undefined")
                localStorage.removeItem(key.toString());
        }
    }
}
