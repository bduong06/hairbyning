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
        try {
            await liff.init({liffId: this._liffId });
            if (liff.isLoggedIn()) {
                console.log('isloggedIn')
                const profile = await liff.getProfile();
                const img = document.getElementById('profile-image');
                img.src = profile.pictureUrl;
                const idToken = liff.getIDToken();
                const accessToken = liff.getAccessToken();
                const response = await this._odoo_signin(idToken, accessToken);
//                user.profile = profile;
                console.log(response);
            } 
        } catch (error) {
            console.error("LIFF initialization failed: ", error);
        }
    }
    async _odoo_signin(idToken, accessToken){
        try {
 //           const idToken = localStorage.getItem(this._liffIDTokenKey);
//            const accessToken = localStorage.getItem(this._liffaccessTokenKey);
            const params = {
                state: JSON.stringify(this._state),
                id_token: idToken,
                access_token: accessToken
            };
            const session_info = await rpc('/hbn/auth_oauth/signin', params);
            console.log('_odoo_signin ' + session_info);
        } catch (error) {
            console.log("JSON-RPC Error: _odoo_signin: ", error);
        }
    }
    async _get_session_info(){
        try {
            const session_info = await rpc('/web/session/get_session_info');
            this._session_info = session_info;
            console.log('get_session_info');
            console.log(session_info);
        } catch (error) {
            console.log("JSON-RPC Error: get_session_info", error);
        }
    }
    async login(){
       // const redirect_uri = `${this._callbackUri}&scope=openid+profile+email&state=%7B%22d%22%3A+%22bduongdb%22,+%22p%22%3A+5,+%22r%22%3A+%22https%253A%252F%252Fhairbyning.com%252Fweb%22%7D`;
        const redirect_uri = `${this._liffEndpoint}?state=${this._liffState}`;
        try{
            await liff.init({liffId: this._liffId});
           // liff.login({redirectUri: encodeURIComponent(this._callbackUri)});
            liff.login({redirectUri: redirect_uri});
        } catch(error) {
            console.error("LIFF initialization failed", error);
        };
    }
}