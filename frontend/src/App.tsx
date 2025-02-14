import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Container, Button, Typography, Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const App = () => {
  const [count, setCount] = useState<number>(0);

  const handleIncrement = (): void => {
    setCount((prev) => prev + 1);
  };

  const handleDecrement = (): void => {
    setCount((prev) => prev - 1);
  };

  return (
    <Container>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          my: 4,
        }}
      >
        <Typography variant="h4" component="h1">
          Counter App
        </Typography>

        <Typography variant="h2">{count}</Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleIncrement}
            startIcon={<AddIcon />}
          >
            Increment
          </Button>

          <Button
            variant="contained"
            color="secondary"
            onClick={handleDecrement}
            startIcon={<RemoveIcon />}
          >
            Decrement
          </Button>
        </Box>
      </Box>

      <Routes>
        <Route path="/" element={<div>Home Page</div>} />
      </Routes>
    </Container>
  );
};

export default App;
