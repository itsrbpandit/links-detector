import React, { CSSProperties } from 'react';

import CameraStream from '../shared/CameraStream';
import useWindowSize from '../../hooks/useWindowSize';
import { DETECTION_CONFIG } from '../../configs/detectionConfig';
import Notification, { NotificationLevel } from '../shared/Notification';
import useLogger from '../../hooks/useLogger';
import ProgressBar from '../shared/ProgressBar';
import BoxesCanvas from './BoxesCanvas';
import { isDebugMode } from '../../constants/debug';
import ErrorBoundary from '../shared/ErrorBoundary';
import PixelsCanvas from './PixelsCanvas';
import useLinksDetector from '../../hooks/useLinksDetector';
import { normalizeCSSFilterParam } from '../../utils/image';

const uiVideoBrightness = normalizeCSSFilterParam(
  DETECTION_CONFIG.imagePreprocessing.ui.brightness,
);

const uiVideoContrast = normalizeCSSFilterParam(
  DETECTION_CONFIG.imagePreprocessing.ui.contrast,
);

const videoStyle: CSSProperties = DETECTION_CONFIG.imagePreprocessing.ui.enabled ? {
  filter: `brightness(${uiVideoBrightness}) contrast(${uiVideoContrast}) grayscale(1)`,
} : {};

function LinksDetector(): React.ReactElement | null {
  const logger = useLogger({ context: 'LiveDetector' });
  const windowSize = useWindowSize();

  const {
    detectLinks,
    error,
    loadingProgress,
    loadingStage,
    httpsBoxes,
    pixels,
  } = useLinksDetector({
    modelURL: DETECTION_CONFIG.modelLoading.linksDetectorModelURL,
    maxBoxesNum: DETECTION_CONFIG.httpsDetection.maxBoxesNum,
    scoreThreshold: DETECTION_CONFIG.httpsDetection.scoreThreshold,
    iouThreshold: DETECTION_CONFIG.httpsDetection.IOUThreshold,
  });

  if (error) {
    return (
      <Notification level={NotificationLevel.DANGER}>
        {error}
      </Notification>
    );
  }

  if (loadingProgress === null || loadingProgress < 1) {
    return <ProgressBar progress={loadingProgress} text={loadingStage} />;
  }

  if (!windowSize || !windowSize.width || !windowSize.height) {
    return <ProgressBar text="Detecting the window size" />;
  }

  const onFrame = async (video: HTMLVideoElement): Promise<void> => {
    logger.logDebug('onFrame start');
    await detectLinks({
      video,
      applyFilters: DETECTION_CONFIG.imagePreprocessing.model.enabled,
      videoBrightness: DETECTION_CONFIG.imagePreprocessing.model.brightness,
      videoContrast: DETECTION_CONFIG.imagePreprocessing.model.contrast,
    });
    logger.logDebug('onFrame end');
  };

  const videoSize: number = Math.min(windowSize.width, windowSize.height);
  const canvasContainerStyles: CSSProperties = {
    marginTop: `-${videoSize}px`,
    position: 'relative',
  };

  const httpsBoxesCanvas = httpsBoxes && isDebugMode() ? (
    <ErrorBoundary>
      <div style={canvasContainerStyles}>
        <BoxesCanvas
          boxes={httpsBoxes}
          width={videoSize}
          height={videoSize}
        />
      </div>
    </ErrorBoundary>
  ) : null;

  const imageCanvas = isDebugMode() ? (
    <ErrorBoundary>
      <div style={canvasContainerStyles}>
        <PixelsCanvas
          pixels={pixels}
          width={videoSize}
          height={videoSize}
        />
      </div>
    </ErrorBoundary>
  ) : null;

  return (
    <div>
      <ErrorBoundary>
        <CameraStream
          onFrame={onFrame}
          width={videoSize}
          height={videoSize}
          videoStyle={videoStyle}
          idealFrameRate={DETECTION_CONFIG.videoStreaming.idealFPS}
        />
      </ErrorBoundary>
      { imageCanvas }
      { httpsBoxesCanvas }
    </div>
  );
}

export default LinksDetector;
