import { renderSheetMusic } from "./sheetMusicComponent";
import createButtonObserver from "roamjs-components/dom/createButtonObserver";

var runners = {
    observers: [],
}

export default {
    onload: ({ extensionAPI }) => {
        const onloadArgs = { extensionAPI };
        const sheetmusicObserver = createButtonObserver({
            attribute: 'sheetmusic',
            render: (b) => {
                renderSheetMusic(b, onloadArgs)
            }
        });
        runners['observers'] = [sheetmusicObserver];

        extensionAPI.ui.commandPalette.addCommand({
            label: "Paste sheet music in ABC notation",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please focus a block before pasting sheet music");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                    pasteAbc(uid, true);
                }
            }
        });
        extensionAPI.ui.commandPalette.addCommand({
            label: "Create sheet music in ABC notation",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please focus a block before pasting sheet music");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                    pasteAbc(uid, false);
                }
            }
        });

        async function pasteAbc(uid, paste) {
            var clipText = "";
            var def = "";
            if (paste) {
                clipText = await navigator.clipboard.readText();
                def = clipText.replaceAll("\n", "\r");
            } else {
                def = "X:     %reference\rT:     %title\rC:     %composer\rA:     %area\rO:     %origin\rK:     %key\rL:     %unit note length\rM:     %meter\rQ:     %tempo\rR:     %rhythm\rB:     %book\rD:     %discography\rF:     %file url\rS:     %source";
            }
            var source = "[Abc Standard](https://abcnotation.com/wiki/abc:standard)";

            setTimeout(async () => {
                await window.roamAlphaAPI.updateBlock(
                    { block: { uid: uid, string: "{{sheetmusic}}".toString(), open: !paste } });
                await window.roamAlphaAPI.createBlock({ "location": { "parent-uid": uid, "order": 0 }, "block": { "string": def.toString() } });
                if (!paste) {
                    await window.roamAlphaAPI.createBlock({ "location": { "parent-uid": uid, "order": 1 }, "block": { "string": source.toString() } });
                }
            }, 200);
            document.querySelector("body")?.click();
        };
    },
    onunload: () => {
        for (let index = 0; index < runners['observers'].length; index++) {
            const element = runners['observers'][index];
            element.disconnect()
        };
    }
}