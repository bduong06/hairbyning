import { rpc } from "../../addons/web/static/src/core/network/rpc.js";

export default class LineOauth {
    constructor(config){
        this._callbackUri = config.callbackUri;
        this._liffEndpoint = `https://${window.location.host}`;
        this._authorizationURL = config.authorizationURL;
        this._clientId = config.clientId;
        this._liffId = config.liffId;
        this._scope = config.scope;
        this._state = config.state;
        this._liffIDTokenKey = `LIFF_STORE:${config.liffId}:IDToken`;
        this._liffaccessTokenKey = `LIFF_STORE:${config.liffId}:accessToken`;
        this._liffState = document.getElementById('csrf_token').value;
    }
    authorize(){
        const redirectParams = new URLSearchParams({
            scope: this._scope,
            state: JSON.stringify(this._state)
        });
        const redirect_uri = `${encodeURIComponent(this._callbackUri)}&${redirectParams.toString()}`;
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this._clientId,
        });
        return `${this._authorizationURL}?${params.toString()}&redirect_uri=${redirect_uri}`;
//         const loginUrl =`${this._auth_endpoint}?response_type=code&client_id=${this._clientId}&redirect_uri=${this._callbackURI}`;
 //        window.location.href = loginUrl;
         //redirect_uri=https%3A%2F%2Fhairbyning.com%2Fauth_oauth%2Fsignin&amp;scope=openid+profile+email&amp;state=%7B%22d%22%3A+%22bduongdb%22,+%22p%22%3A+5,+%22r%22%3A+%22https%253A%252F%252Fhairbyning.com%252Fweb%22%7D`;
//         redirect_uri=https%3A%2F%2Fhairbyning.com%2Fauth_oauth%2Fsignin%26scope%3Dopenid%2Bprofile%2Bemail%26state%3D%257B%2522d%2522%253A%2522bduongdb%2522%252C%2522p%2522%253A5%252C%2522r%2522%253A%2522https%253A%252F%252Fhairbyning.com%252Fweb%2522%257D

    }
    async init(){
        const userLoggedIn = document.getElementById('user-logged-in');
        try {
            const img = document.getElementById('profile-image');
            await liff.init({
                liffId: this._liffId,
            });
            if (liff.isLoggedIn()) {
                if(window.location.search){
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
                const profile = await liff.getProfile();
                img.src = profile.pictureUrl;
                userLoggedIn.classList.remove('d-none');
                this._installLogoutHandler();
                this._odoo_signin();
            } 
        } catch (error) {
            userLoggedIn.classList.remove('d-none');
            console.error("LIFF initialization failed: ", error);
        }
    }
    _installLogoutHandler(){
        document.getElementById('user-logged-in').addEventListener('click', function(event){
            if(event.target.id === 'user-logout'){
                event.preventDefault();
                liff.logout();
                rpc('/web/session/destroy');
                document.getElementById('user-logged-in').classList.add('d-none');
            }
        })
    }
    async _odoo_signin(){
        try {
            const session_info = await rpc('/web/session/get_session_info');
        } catch (error) {
            if(error.code == 100) {
                try {
                    const idToken = liff.getIDToken();
                    const accessToken = liff.getAccessToken();
                    const params = {
                        state: JSON.stringify(this._state),
                        id_token: idToken,
                        access_token: accessToken
                    };
                    const response = await rpc('/hbn/auth_oauth/signin', params);
                    console.log(response.session_info + response.auth_info);
                } catch (error) {
                    console.log("JSON-RPC Error: _odoo_signin: ", error);
                }
            } else {
                console.log("JSON-RPC Error: get_session_info", error);
            }
        }
    }
    async _get_session_info(){
        try {
            const session_info = await rpc('/web/session/get_session_info');
        } catch (error) {
            console.log("JSON-RPC Error: get_session_info", error);
        }
    }
    async login(){
       // const redirect_uri = `${this._callbackUri}&scope=openid+profile+email&state=%7B%22d%22%3A+%22bduongdb%22,+%22p%22%3A+5,+%22r%22%3A+%22https%253A%252F%252Fhairbyning.com%252Fweb%22%7D`;
        //const redirect_uri = `${this._liffEndpoint}?state=${this._liffState}`;
        const redirectParams = new URLSearchParams({
            scope: this._scope,
            state: JSON.stringify(this._state)
        });
//        const redirect_uri = `${encodeURIComponent(this._callbackUri)}&${redirectParams.toString()}`;
        const redirect_uri = `${this._callbackUri}?&${redirectParams.toString()}`;
        try{
            await liff.init({liffId: this._liffId});
           // liff.login({redirectUri: encodeURIComponent(this._callbackUri)});
//            liff.login({redirectUri: redirect_uri});
           liff.login();
        } catch(error) {
            console.error("LIFF initialization failed", error);
        };
    }
}