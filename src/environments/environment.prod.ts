export const environment = {
    production: true,
    PLUGIN_REGISTRY_PROTOCOL: (window as any)["env"]["PLUGIN_REGISTRY_PROTOCOL"],
    PLUGIN_REGISTRY_HOSTNAME: (window as any)["env"]["PLUGIN_REGISTRY_HOSTNAME"],
    PLUGIN_REGISTRY_PORT: (window as any)["env"]["PLUGIN_REGISTRY_PORT"],
    PLUGIN_REGISTRY_PATH: (window as any)["env"]["PLUGIN_REGISTRY_PATH"],
};
