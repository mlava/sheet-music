import { createComponentRender } from "roamjs-components/components/ComponentContainer";
import React, { useState, useEffect } from 'react';
import { AbcTextEditor } from "react-abc-editor";

const SheetMusicElement = ({ blockUid }) => {
    var abc1 = "";
    const [rerender, setRerender] = useState(false);
    var selectionCallback;
    var currentIndex = -1;
    var maxIndex = -1;

    // get sheet music notation for rendering
    let blockData = window.roamAlphaAPI.data.pull("[:block/string :block/uid {:block/children ...}]", `[:block/uid \"${blockUid}\"]`);
    if (blockData.hasOwnProperty([":block/children"])) {
        abc1 += blockData[":block/children"][0][":block/string"];
        abc1 = abc1.replaceAll("\n", "\r");
    }

    var allPitches = [
        'C,,,,', 'D,,,,', 'E,,,,', 'F,,,,', 'G,,,,', 'A,,,,', 'B,,,,',
        'C,,,', 'D,,,', 'E,,,', 'F,,,', 'G,,,', 'A,,,', 'B,,,',
        'C,,', 'D,,', 'E,,', 'F,,', 'G,,', 'A,,', 'B,,',
        'C,', 'D,', 'E,', 'F,', 'G,', 'A,', 'B,',
        'C', 'D', 'E', 'F', 'G', 'A', 'B',
        'c', 'd', 'e', 'f', 'g', 'a', 'b',
        "c'", "d'", "e'", "f'", "g'", "a'", "b'",
        "c''", "d''", "e''", "f''", "g''", "a''", "b''",
        "c'''", "d'''", "e'''", "f'''", "g'''", "a'''", "b'''",
        "c''''", "d''''", "e''''", "f''''", "g''''", "a''''", "b''''"
    ];

    function moveNote(note, step) {
        var x = allPitches.indexOf(note);
        if (x >= 0)
            return allPitches[x - step];
        return note;
    }

    function tokenize(str) {
        var arr = str.split(/(!.+?!|".+?")/);
        var output = [];
        for (var i = 0; i < arr.length; i++) {
            var token = arr[i];
            if (token.length > 0) {
                if (token[0] !== '"' && token[0] !== '!') {
                    var arr2 = arr[i].split(/([A-Ga-g][,']*)/);
                    output = output.concat(arr2);
                } else
                    output.push(token);
            }
        }
        return output;
    }

    async function storeAbc(abc1) {
        await window.roamAlphaAPI.updateBlock({ "block": { "uid": blockData[":block/children"][0][":block/uid"], "string": abc1 } });
    }

    async function clickListener(abcelem, tuneNumber, classes, analysis, drag, mouseEvent) {
        if (drag) {
            selectionCallback = drag.setSelection;
            currentIndex = drag.index;
            maxIndex = drag.max;
        }
        var originalText = abc1.substring(abcelem.startChar, abcelem.endChar);
        if (abcelem.pitches && drag && drag.step && abcelem.startChar >= 0 && abcelem.endChar >= 0) {
            var arr = tokenize(originalText);
            for (var i = 0; i < arr.length; i++) {
                arr[i] = moveNote(arr[i], drag.step);
            }
            var newText = arr.join("");

            abc1 = abc1.substring(0, abcelem.startChar) + newText + abc1.substring(abcelem.endChar);
            await storeAbc(abc1);
        }
    }

    useEffect(() => {
        setRerender(!rerender);

        return async () => {
        };
    }, []);

    return <AbcTextEditor predefinedAbcString={abc1} options={{ add_classes: true, dragging: true, clickListener: clickListener, staffwidth: 600, responsive: "resize", foregroundColor: "black", selectionColor: "red", wrap: { minSpacing: 1.0, maxSpacing: 2.7, preferredMeasuresPerLine: 6 } }} />;
};

export const renderSheetMusic = createComponentRender(
    ({ blockUid }) => <SheetMusicElement blockUid={blockUid} />,
    "sheetmusic-element-parent"
);

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}