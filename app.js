
if (navigator.serviceWorker) {
    navigator.serviceWorker.register("./sw.js")
        .then(reg => {
        console.log("sw registered at:", (new Date()).toLocaleTimeString());
    });
}


