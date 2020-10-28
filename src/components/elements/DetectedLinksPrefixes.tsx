import React, { CSSProperties } from 'react';
import { DetectionBox } from '../../utils/graphModel';
import { relativeToAbsolute } from '../../utils/image';

type DetectedLinksPrefixesProps = {
  boxes: DetectionBox[] | null,
  containerSize: number,
};

function DetectedLinksPrefixes(props: DetectedLinksPrefixesProps): React.ReactElement | null {
  const { boxes, containerSize } = props;

  if (!boxes || !boxes.length) {
    return null;
  }

  const containerStyle: CSSProperties = {
    width: `${containerSize}px`,
    height: `${containerSize}px`,
    display: 'block',
    overflow: 'hidden',
  };

  const boxesElements = boxes.map((box: DetectionBox) => {
    const left: number = relativeToAbsolute(box.x1, containerSize);
    const top: number = relativeToAbsolute(box.y1, containerSize);
    const right: number = relativeToAbsolute(box.x2, containerSize);
    const bottom: number = relativeToAbsolute(box.y2, containerSize);
    const width: number = right - left;
    const height: number = bottom - top;

    const boxStyle: CSSProperties = {
      backgroundColor: 'red',
      marginLeft: `${left}px`,
      marginTop: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
    };

    return (
      <div key={`${left}${top}${width}`} style={boxStyle} className="overflow-hidden block absolute" />
    );
  });

  return (
    <div style={containerStyle}>
      { boxesElements }
    </div>
  );
}

export default DetectedLinksPrefixes;