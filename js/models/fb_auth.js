import { rpc } from "../../addons/web/static/src/core/network/rpc.js";
import State from "./state.js";

export default class FbOauth {
    constructor(config){
        this._callbackUri = config.callbackUri;
        this._authorizationURL = config.authorizationURL;
        this._clientId = config.clientId;
        this._scope = config.scope;
        this._state = config.state;
        this._sessionState = new State('HBN');
    }
    authorize(){
        const redirectParams = new URLSearchParams({
            scope: this._scope,
            state: JSON.stringify(this._state)
        })
        const redirect_uri = `${this._callbackUri}&${redirectParams.toString()}`;
        const params = new URLSearchParams({
            response_type: 'token',
            client_id: this._clientId,
            redirect_uri: redirect_uri
        })
        return `${this._authorizationURL}?${params.toString()}`;

//         const loginUrl =`${this._auth_endpoint}?response_type=token&client_id=${this._clientId}&redirect_uri=${this._callbackURI}`;
 //        window.location.href = loginUrl;
        // https://www.facebook.com/dialog/oauth?response_type=token&client_id=763714192774134&redirect_uri=https%3A%2F%2Fodoo.hairbyning.com%2Fauth_oauth%2Fsignin&scope=public_profile,email&state=%7B%22d%22%3A+%22bduongdb%22,+%22p%22%3A+2,+%22r%22%3A+%22https%253A%252F%252Fodoo.hairbyning.com%252Fodoo%253F%22%7D&nonce=ke-pbPVIsK2ba4IQYOgf8w%3D%3D

    }
    async init(){
        FB.getLoginStatus(async function(response) {
            if (response.status === 'connected') {
                FB.api("/me", {fields: "id,name,picture"}, function(response) {
                    this._changeLoginStatus(response);
                }.bind(this));
            }
        }.bind(this))
    }
    async _isLoggedInOdoo() {
        try {
            await rpc("/web/session/check");
            return true;
        } catch {
            return false;
        }
    }
    login(callback){
        FB.login( (response) => {
            if (response.authResponse) {
                this._sessionState.authLoggedIn = 'facebook';
                const access_token = encodeURIComponent(response.authResponse.accessToken);
                const data_access_expiration_time = encodeURIComponent(response.authResponse.expiration_time);
                const expires_in = encodeURIComponent(response.authResponse.expires_in);
                const params = {
                    access_token: access_token,
                    data_access_expiration_time: data_access_expiration_time,
                    expires_in: expires_in,
                    state: JSON.stringify(this._state)
                };
                this._odoo_signin(callback, params);
            } else {
                console.log('User cancelled login or did not fully authorize.');
            }
        }, {scope: this._scope});
    }
    async _odoo_signin(callback, params){
        try {
            const response = await rpc('/hbn/auth_oauth/signin', params);
            if(response.auth_info){
                FB.api("/me", {fields: "id,name,picture"}, function(response) {
                    this._changeLoginStatus(response);
                    callback();
                }.bind(this));
            } else {
                FB.logout();
                console.log("JSON-RPC Error: _odoo_signin: ", response.error);
                this._sessionState.authLoggedIn = null;
                location.reload()
            }
            return response;
        } catch (error) {
            console.log("JSON-RPC Error: _odoo_signin: ", error);
        }
    }
    _changeLoginStatus(response){
        const img = document.getElementById('profile-image');
        img.src = response.picture.data.url;
        console.log(JSON.stringify(response));
        this._installLogoutHandler();
        const userLoggedIn = document.getElementById('user-logged-in');
        userLoggedIn.classList.remove('d-none');
    }
    _installLogoutHandler(){
        document.getElementById('user-logged-in').addEventListener('click', function(event){
            if(event.target.id === 'user-logout'){
                event.preventDefault();
                FB.logout();
                rpc('/web/session/destroy');
                document.getElementById('user-logged-in').classList.add('d-none');
                this._sessionState.clear();
                location.reload();
            }
        }.bind(this))
    }
}