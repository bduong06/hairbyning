import getProviderConfig from "../config/provider_config.js";
import LineOauth from "./line_auth.js";
import FbOauth from "./fb_auth.js";

export default function getOauthProvider(provider){
    const config = getProviderConfig(provider);
    switch (provider) {
        case 'facebook':
            return new FbOauth(config);
        case 'line':
            return new LineOauth(config);
        default:
            throw new Error('Invalid provider');
    }
}