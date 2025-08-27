import React, { type FC, type ImgHTMLAttributes, useCallback, useState } from 'react';
import { Typography } from '@/frontend/components/ui/typography';

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

export const Image: FC<Props> = React.memo(function Image(props) {
  const [isBrokenSrc, setIsBrokenSrc] = useState(false);

  const handleError = useCallback(() => {
    setIsBrokenSrc(true);
  }, []);

  if (isBrokenSrc) {
    return <Typography>{props.alt}</Typography>;
  }

  return <img draggable={false} {...props} className={'w-full h-full ' + props.className} onError={handleError} />;
});
