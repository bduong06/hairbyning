import { LineOauth, FBOauth } from "./line_auth";

export default class User {
    constructor(rpc){
        this._profileLink = document.getElementById('user-logged-in');
        this._profile = null;
        this._isLoggedIn = false;
        this._session_info = null;
        this._oauth = null;
        this._rpc = rpc;
    }
    set profile(profile){
        this._profile = profile;
        console.log(this._profile.pictureUrl);
        if(profile.pictureUrl){
            this._createPofileLink();
        }
        this._get_session_info();
    }
    get profile(){
        return this._profile;
    }
    set oauth(oauth){
        this._oauth = oauth;
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
    isLoggedIn(){
        return this._isLoggedIn;
    }
    _createPofileLink(){
        const img = document.getElementById('profile-image');
        img.src = this._profile.pictureUrl;
    }
    async login(){
        this._oauth.login();
    }
}