export default function getProviderConfig(provider){
        let config;
    switch (provider) {
        case 'facebook' :
            config = {
                clientId: '763714192774134',
                authorizationURL: 'https://www.facebook.com/dialog/oauth',
                scope: 'public_profile,email',
                callbackUri: `https://${window.location.host}/auth_oauth/signin`,
                state: {
                    'd': 'bduongdb',
                    'p': 2,
                    'r':`https://${window.location.host}/web`
                }
            };
            return config;

        case 'line' :
            config = {
                clientId: '2007896254',
                liffId: '2007896254-Dkr9Yr56',
                authorizationURL: 'https://access.line.me/oauth2/v2.1/authorize',
                scope: 'openid profile email',
                callbackUri: `https://${window.location.host}/auth_oauth/signin`,
                state: {
                    'd': 'bduongdb',
                    'p': 5,
                    'r': `https://${window.location.host}/web`
                }
            }
            return config;
        default:
            throw Error("Invalid provider");
    }
}