import React from 'react';
import { ControlButton, useReactFlow, getRectOfNodes, getTransformForBounds } from 'react-flow-renderer';
import { toPng, toSvg } from 'html-to-image';
import { IconSvg, IconPng } from '@tabler/icons-react';

// https://reactflow.dev/examples/misc/download-image
// prismaliser/components/DownloadButton.tsx

function downloadImagePNG(dataUrl) {
  const a = document.createElement('a');
  a.setAttribute('download', 'eric.png');
  a.setAttribute('href', dataUrl);
  a.click();
}
function downloadImageSVG(dataUrl) {
  const a = document.createElement('a');
  a.setAttribute('download', 'eric.svg');
  a.setAttribute('href', dataUrl);
  a.click();
}

function DownloadButton() {
  const { getNodes } = useReactFlow();
  const onClickPNG = () => {
    // we calculate a transform for the nodes so that all nodes are visible
    // we then overwrite the transform of the `.react-flow__viewport` element
    // with the style option of the html-to-image library
    const nodesBounds = getRectOfNodes(getNodes());
    const { height: imageHeight, width: imageWidth } = nodesBounds;
    const transform = getTransformForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2);
    //const transform = getViewportForBounds(nodesBounds,imageWidth,imageHeight,0.5,2);

    toPng(document.querySelector('.react-flow__viewport'), {
      backgroundColor: '#fff',
      width: imageWidth,
      height: imageHeight,
      style: {
        width: imageWidth,
        height: imageHeight,
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
      },
    }).then(downloadImagePNG)
    .catch(console.error);
  };
  const onClickSVG = () => {
    // we calculate a transform for the nodes so that all nodes are visible
    // we then overwrite the transform of the `.react-flow__viewport` element
    // with the style option of the html-to-image library
    const nodesBounds = getRectOfNodes(getNodes());
    const { height: imageHeight, width: imageWidth } = nodesBounds;
    const transform = getTransformForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2);

    toSvg(document.querySelector('.react-flow__viewport'), {
      backgroundColor: '#fff',
      width: imageWidth,
      height: imageHeight,
      style: {
        width: imageWidth,
        height: imageHeight,
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
      },
    }).then(downloadImageSVG)
    .catch(console.error);
  };
  return (
    <React.Fragment>
      <ControlButton
        title="Download as PNG"
        onClick={onClickPNG}
      >
        <IconPng />
      </ControlButton>
      <ControlButton
        title="Download as SVG"
        onClick={onClickSVG}
      >
        <IconSvg />
      </ControlButton>
    </React.Fragment>
);
}

export default DownloadButton;
