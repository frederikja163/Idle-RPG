import React, { type FC, useMemo } from 'react';
import { nameOf } from '@/frontend/lib/function-utils';
import { discordServerUrl } from '@/frontend/constants/url-consts';
import { Image } from '@/frontend/components/ui/image';
import { assetsBasePath } from '@/frontend/constants/asset-consts';
import { BasicTooltip } from '@/frontend/components/ui/basic-tooltip';
import type { LinkIconProps } from '@/frontend/components/common/link-icons/types';

export const DiscordLinkIcon: FC<LinkIconProps> = React.memo((props) => {
  const { size = 32 } = props;

  const validatedSize = useMemo(() => (size < 30 ? 30 : size), [size]);

  return (
    <BasicTooltip tooltipContent="Join Discord server">
      <a
        href={discordServerUrl}
        target="_blank"
        rel="noreferrer"
        className={`aspect-square bg-blurple rounded-full shadow`}
        style={{ height: validatedSize }}>
        <Image
          src={`${assetsBasePath}logos/Discord-Symbol-White.svg`}
          alt="Discord logo"
          className="p-[20%]" // Discord requires a margin 1/3 the width of the symbol
        />
      </a>
    </BasicTooltip>
  );
});

DiscordLinkIcon.displayName = nameOf({ DiscordLinkIcon });
