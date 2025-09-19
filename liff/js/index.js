import whenReady from "../../js/whenready.js";
const dbName = "bduongdb";

whenReady().then(() => {
    const urlParams = new URLSearchParams();
    const r = `https://${window.location.host}/web`;
    const _state = {
        'd': dbName,
        'p': 5,
        'r': r
    }

    urlParams.append('state', JSON.stringify(_state));
    const urlString = urlParams.toString();
    const state = `{"d": "${dbName}", "p", 5, "r", "${r}"}`;
    const redirect_uri='state=%7B%22d%22%3A+%22bduongdb%22,+%22p%22%3A+5,+%22r%22%3A+%22https%253A%252F%252Fhairbyning.com%252Fweb%22%7D';
    const decodeuri = decodeURIComponent(redirect_uri);
    console.log('decodeuri is ' + decodeuri);
    console.log('_state is ' + urlString);
    console.log('decode _state is ' + decodeURIComponent(urlString));
    console.log('state is ' +state);
})