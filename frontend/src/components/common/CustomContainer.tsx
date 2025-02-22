import { Container, ContainerProps } from "@mui/material";
import React from "react";

interface CustomContainerProps extends ContainerProps {
  children: React.ReactNode;
}

const CustomContainer: React.FC<CustomContainerProps> = ({
  children,
  ...props
}) => {
  return (
    <Container
      {...props}
      sx={{
        maxWidth: "1200px !important",
        marginTop: { sm: 2, md: 6 },
        px: { xs: 2, sm: 3 },
        ...props.sx,
      }}
    >
      {children}
    </Container>
  );
};

export default CustomContainer;
