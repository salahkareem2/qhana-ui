(function (window) {
    window["env"] = window["env"] || {};

    // Environment variables

    window["env"]["production"] = false;
    window["env"]["PLUGIN_REGISTRY_PROTOCOL"] = "http:";
    window["env"]["PLUGIN_REGISTRY_HOSTNAME"] = "localhost";
    window["env"]["PLUGIN_REGISTRY_PORT"] = "5000"; // TODO change port (also in template!)
    window["env"]["PLUGIN_REGISTRY_PATH"] = "/api/";

})(this);
