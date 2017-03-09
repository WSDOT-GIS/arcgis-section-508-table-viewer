importScripts("../require.js");

import { getData, getServiceInfo } from "../browser/serviceUtils";


addEventListener("message", async (msgEvt) => {
    if (msgEvt.data && typeof msgEvt.data === "string") {
        let url = msgEvt.data;
        let svcInfo = await getServiceInfo(url);
        postMessage({
            data: {
                serviceInfo: svcInfo,
                type: "serviceinfo"
            }
        });
    }
    close();
});
