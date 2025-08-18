function whenReady(fn) {
    return new Promise(function (resolve) {
        if (document.readyState !== "loading") {
            resolve(true);
        }
        else {
            document.addEventListener("DOMContentLoaded", resolve, false);
        }
    }).then(fn || function () { });
}
export default whenReady;