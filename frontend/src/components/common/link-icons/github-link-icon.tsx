import React, { type FC, useMemo } from 'react';
import { nameOf } from '@/frontend/lib/function-utils';
import { Image } from '@/frontend/components/ui/image';
import { assetsBasePath } from '@/frontend/constants/asset-consts';
import { BasicTooltip } from '@/frontend/components/ui/basic-tooltip';
import { githubRepoUrl } from '@/frontend/constants/url-consts';
import type { LinkIconProps } from '@/frontend/components/common/link-icons/types';

export const GithubLinkIcon: FC<LinkIconProps> = React.memo((props) => {
  const { size = 32 } = props;

  const validatedSize = useMemo(() => (size < 30 ? 30 : size), [size]);

  return (
    <BasicTooltip tooltipContent="Visit GitHub repo">
      <a
        href={githubRepoUrl}
        target="_blank"
        rel="noreferrer"
        className="aspect-square rounded-full shadow"
        style={{ height: validatedSize }}>
        <Image src={`${assetsBasePath}logos/github-mark.svg`} alt="GitHub logo" />
      </a>
    </BasicTooltip>
  );
});

GithubLinkIcon.displayName = nameOf({ GithubLinkIcon });
