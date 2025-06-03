import { Row } from '@/front-end/components/layout/row.tsx';
import { Typography } from '@/front-end/components/ui/typography.tsx';
import { Divider } from '@/front-end/components/ui/divider.tsx';
import React, { type FC } from 'react';

export const Banner: FC = React.memo(function Banner() {
  return (
    <>
      <Row className="bg-orange-300 p-2 justify-center">
        <Typography className="font-bold mr-1">
          WARNING this is a beta! All profiles and their content may be wiped at any moment. If you experience any
          issues visit our
        </Typography>
        <a href="https://discord.gg/vJhkD4RvNF">discord</a>
      </Row>
      <Divider />
    </>
  );
});
