import { Row } from '@/frontend/components/ui/layout/row';
import { Typography } from '@/frontend/components/ui/typography';
import { Divider } from '@/frontend/components/ui/layout/divider';
import React, { type FC } from 'react';
import { discordServerUrl } from '@/frontend/constants/url-consts';

export const Banner: FC = React.memo(function Banner() {
  return (
    <>
      <Row className="bg-orange-300 p-2 justify-center">
        <Typography className="font-bold mr-1">
          WARNING this is a beta! All profiles and their content may be wiped at any moment. If you experience any
          issues visit our
        </Typography>
        <a href={discordServerUrl}>discord</a>
      </Row>
      <Divider />
    </>
  );
});
