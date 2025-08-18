import whenReady from "../../js/whenready.js";

whenReady().then(() => {
    liff
    .init({ 
        liffId:  '2007896254-Dkr9Yr56',
        withLoginOnExternalBrowser:  true
    })
    .then(() => {
        console.log("Success! you can do something with LIFF API here.")
    })
    .catch((error) => {
        console.log(error)
    })
})