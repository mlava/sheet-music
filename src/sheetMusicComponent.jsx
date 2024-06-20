import { createComponentRender } from "roamjs-components/components/ComponentContainer";
import React, { useEffect, useState } from 'react';
import SheetMusic from 'react-sheet-music';

const SheetMusicElement = ({ blockUid }) => {
    const [abc, setAbc] = useState(0);
    var abc1 = "";

    let blockData = window.roamAlphaAPI.data.pull("[:block/string :block/uid {:block/children ...}]", `[:block/uid \"${blockUid}\"]`);
    if (blockData.hasOwnProperty([":block/children"])) {
        abc1 += blockData[":block/children"][0][":block/string"];
        abc1 = abc1.replaceAll("\n", "\r");
    }

    var uid = blockData[":block/children"][0][":block/uid"];
    function pullFunction(before, after) {
        setAbc((keyValue => keyValue + 1));
    }
    useEffect(() => {
        window.roamAlphaAPI.data.addPullWatch(
            "[:block/string]",
            `[:block/uid "${uid}"]`,
            pullFunction);

        return () => {
            window.roamAlphaAPI.data.removePullWatch(
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