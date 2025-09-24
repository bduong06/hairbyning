import { rpc } from "../../addons/web/static/src/core/network/rpc";

export default class User {
    constructor(){
        this._profileLink = document.getElementById('user-logged-in');
        this._profile = null;
        this._session_info = null;
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
    _createPofileLink(){
        const img = document.getElementById('profile-image');
        img.src = this._profile.pictureUrl;
    }
}