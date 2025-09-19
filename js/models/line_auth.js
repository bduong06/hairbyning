
class LineOauth {
    constructor(){
        this._baseCallbackURI = `https://${window.location.host}/auth_oauth/signin`;
        this._auth_endpoint = 'https://access.line.me/oauth2/v2.1/authorize';
        this._callbackURI = null;
        this._clientId = '2007896254';
        this._liffId = '2007896254-Dkr9Yr56';
        this._scope = 'openid profile email';
        this._state = {
            'd': dbName,
            'p': 5,
            'r': encodeURIComponent(`https://${window.location.host}/web`)
        }
        this._setCallbackURI();
    }
    _setCallbackURI(){
        const params = new URLSearchParams();
        params.append('scope', this._scope);
        params.append('state', JSON.stringify(this._state));
        const urlParams = params.toString();
        this._callbackURI = encodeURIComponent(this._baseCallbackURI) + '&' + urlParams;
    }
    get callbackURI(){
        return this._callbackURI;
    }
    async login(){
         const loginUrl =`${this._auth_endpoint}?response_type=code&client_id=${this._clientId}&redirect_uri=${this._callbackURI}`;
         window.location.href = loginUrl;
         //redirect_uri=https%3A%2F%2Fhairbyning.com%2Fauth_oauth%2Fsignin&amp;scope=openid+profile+email&amp;state=%7B%22d%22%3A+%22bduongdb%22,+%22p%22%3A+5,+%22r%22%3A+%22https%253A%252F%252Fhairbyning.com%252Fweb%22%7D`;

    }
    async init(){
        try {
            await liff.init({liffId: this._liffId });
            if (liff.isLoggedIn()) {
                const profile = await liff.getProfile();
                user.profile = profile;
            } 
        } catch (error) {
            console.error("LIFF initialization failed", error);
        }
    }
}

class FBOauth {
    constructor(){
        this._baseCallbackURI = `https://${window.location.host}/auth_oauth/signin`;
        this._authURL = 'https://www.facebook.com/dialog/oauth';
        this._callbackURI = null;
        this._clientId = '763714192774134';
        this._scope = 'public_profile,email';
        this._state = {
            'd': dbName,
            'p': 2,
            'r': encodeURIComponent(`https://${window.location.host}/web`)
        }
        this._setCallbackURI();
    }
    _setCallbackURI(){
        const params = new URLSearchParams();
        params.append('scope', this._scope);
        params.append('state', JSON.stringify(this._state));
        const urlParams = params.toString();
        this._callbackURI = encodeURIComponent(this._baseCallbackURI) + '&' + urlParams;
    }
    get callbackURI(){
        return this._callbackURI;
    }
    async login(){
         const loginUrl =`${this._auth_endpoint}?response_type=token&client_id=${this._clientId}&redirect_uri=${this._callbackURI}`;
         window.location.href = loginUrl;
        // https://www.facebook.com/dialog/oauth?response_type=token&client_id=763714192774134&redirect_uri=https%3A%2F%2Fodoo.hairbyning.com%2Fauth_oauth%2Fsignin&scope=public_profile,email&state=%7B%22d%22%3A+%22bduongdb%22,+%22p%22%3A+2,+%22r%22%3A+%22https%253A%252F%252Fodoo.hairbyning.com%252Fodoo%253F%22%7D&nonce=ke-pbPVIsK2ba4IQYOgf8w%3D%3D

    }
    async init(){
        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                FB.api("/me", {fields: "id,name,picture"}, function(response) {
                    user.profile = response;
                });
            }
        })
    }
}

export {LineOauth, FBOauth};