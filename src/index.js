import { renderSheetMusic } from "./sheetMusicComponent";
import createButtonObserver from "roamjs-components/dom/createButtonObserver";

var runners = {
    observers: [],
}

// config page for future opens to define widths, colours etc
/*
const config = {
    tabTitle: "Sheet Music",
    settings: [
        {
            id: "chess-rAPI-key",
            name: "RapidAPI Key",
            description: "Your API Key for RapidAPI from https://rapidapi.com/KeeghanM/api/chess-puzzles",
            action: { type: "input", placeholder: "Add RapidAPI API key here" },
        },
    ]
};
*/

export default {
    onload: ({ extensionAPI }) => {
        //extensionAPI.settings.panel.create(config);
        
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
                def = "X:     %reference\rT:     %title\rC:     %composer\rA:     %area\rO:     %origin\rK:     %key\rL:     %unit note length\rM:     %meter\rQ:     %tempo\rR:     %rhythm\rB:     %book\rD:     %discography\rF:     %file url\rS:     %source\rC, D, E, F, | G, A, B, C | D E F G | A B c d | e f g a | b c' d' e' | f' g' a' b' |]";
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