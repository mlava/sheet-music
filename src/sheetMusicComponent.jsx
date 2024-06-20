import { createComponentRender } from "roamjs-components/components/ComponentContainer";
import React, { useEffect, useState } from 'react';
import SheetMusic from 'react-sheet-music';

const SheetMusicElement = ({ blockUid }) => {
    const [abc, setAbc] = useState(0);
    var abc1 = "";

    // get sheet music notation for rendering
    let blockData = window.roamAlphaAPI.data.pull("[:block/string :block/uid {:block/children ...}]", `[:block/uid \"${blockUid}\"]`);
    if (blockData.hasOwnProperty([":block/children"])) {
        abc1 += blockData[":block/children"][0][":block/string"];
        abc1 = abc1.replaceAll("\n", "\r");
    }

    var uid = blockData[":block/children"][0][":block/uid"];
    function pullFunction(before, after) { // set state to cause re-render on pullWatch change in abc notation block
        setAbc((keyValue => keyValue + 1));
    }

    useEffect(() => {
        // add a pullWatch to update render if notation is changed
        window.roamAlphaAPI.data.addPullWatch(
            "[:block/string]",
            `[:block/uid "${uid}"]`,
            pullFunction);

        // trying to fix display overflow on different screen sizes
        /*
        var svgs = document.getElementsByTagName("svg");
        for (var i = 0; i < svgs.length; i++) {
            if (svgs[i].innerHTML.startsWith("<title>Sheet Music</title>")) {
                let width = Math.round(svgs[i].getAttribute("width"));
                let height = Math.round(svgs[i].getAttribute("height"));
                svgs[i].setAttribute("preserveAspectRatio", "none");
                svgs[i].removeAttribute("width");
                svgs[i].removeAttribute("height");
                svgs[i].setAttribute("viewbox", `0 0 ${width} ${height}`);
            }
        }
        */

        return () => {
            window.roamAlphaAPI.data.removePullWatch( // remove pullWatch on remove
                "[:block/string]",
                `[:block/uid "${uid}"]`,
                pullFunction);
        };
    }, []);

    return (
        <SheetMusic
            notation={abc1}
        />
    )
};

export const renderSheetMusic = createComponentRender(
    ({ blockUid }) => <SheetMusicElement blockUid={blockUid} />,
    "sheetmusic-element-parent"
);