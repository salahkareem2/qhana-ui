export const environment = {
    production: true,
    QHANA_BACKEND_PROTOCOL: (window as any)["env"]["QHANA_BACKEND_PROTOCOL"],
    QHANA_BACKEND_HOSTNAME: (window as any)["env"]["QHANA_BACKEND_HOSTNAME"],
    QHANA_BACKEND_PORT: (window as any)["env"]["QHANA_BACKEND_PORT"],
    QHANA_BACKEND_PATH: (window as any)["env"]["QHANA_BACKEND_PATH"],
};
