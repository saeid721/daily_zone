import React, { useState } from 'react';
import { PLACEHOLDER_IMG } from '../../../utils';
import { getOptimizedSrc } from '../../../utils/imageResize';
import '../Skeleton/Skeleton.css';

const OptimizedImage = ({
  src, alt = '', className = '', style = {},
  width, height, loading = 'lazy', fetchPriority = 'auto',
  placeholder = PLACEHOLDER_IMG,
  priority = false,
  resizeWidth,
  wrapperClassName = '', wrapperStyle = {}, onLoad, onError, ...rest
}) => {
  const [loaded, setLoaded] = useState(priority || loading === 'eager');
  const [errored, setErrored] = useState(false);

  const finalSrc = errored
    ? placeholder
    : (resizeWidth ? getOptimizedSrc(src || placeholder, resizeWidth) : (src || placeholder));

  const handleError = (e) => {
    if (!errored) { setErrored(true); e.target.src = placeholder; }
    setLoaded(true);
    onError?.(e);
  };
  const handleLoad = (e) => { setLoaded(true); onLoad?.(e); };

  return (
    <span
      className={`opt-img-wrap ${wrapperClassName}`}
      style={{ position: 'relative', display: 'block', width: '100%', height: '100%', ...wrapperStyle }}
    >
      {!priority && loading !== 'eager' && !loaded && (
        <span className="sk" aria-hidden="true" style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', zIndex: 1 }} />
      )}
      <img
        src={finalSrc}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={priority ? 'eager' : loading}
        fetchPriority={priority ? 'high' : fetchPriority}
        decoding={priority ? 'sync' : 'async'}
        style={priority ? style : { opacity: loaded ? 1 : 0, transition: 'opacity .25s ease', ...style }}
        onLoad={handleLoad}
        onError={handleError}
        {...rest}
      />
    </span>
  );
};

export default OptimizedImage;