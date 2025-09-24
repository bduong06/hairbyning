
export default class FbOauth {
    constructor(config){
        this._callbackUri = config.callbackUri;
        this._authorizationURL = config.authorizationURL;
        this._clientId = config.clientId;
        this._scope = config.scope;
        this._state = config.state;
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
        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                FB.api("/me", {fields: "id,name,picture"}, function(response) {
                    user.profile = response;
                });
            }
        })
    }
}