import React, {type FC} from "react";
import {Row} from "@/front-end/components/layout/row.tsx";

interface Props {
  skillId: string;
}

export const SkillButton: FC<Props> = React.memo((props) => {
  const {skillId} = props;

  return (
    <Row>
      {skillId}
    </Row>
  );
});
