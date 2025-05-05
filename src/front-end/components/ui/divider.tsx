import {Separator} from 'radix-ui';
import React, {type CSSProperties, type FC, useMemo} from 'react';

interface Props {
  orientation?: "vertical" | "horizontal";
}

export const Divider: FC<Props> = React.memo((props) => {
  const {orientation = "horizontal"} = props;

  const dividerStyle = useMemo(() => {
    return {
      ...styles.divider,
      ...(orientation === "horizontal" ? styles.horizontal : styles.vertical)
    }
  }, [orientation]);

  return <Separator.Root
    decorative
    orientation={orientation}
    style={dividerStyle}/>
});

const styles: { [key: string]: CSSProperties } = {
  divider: {
    display: "flex",
    backgroundColor: "#00000020",
  },
  horizontal: {
    height: "1px",
    width: "100%"
  },
  vertical: {
    alignSelf: "stretch",
    width: "1px",
  }
};