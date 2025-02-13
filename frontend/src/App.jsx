import { Container, Typography } from "@mui/material";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to React + Vite + Material UI
      </Typography>
      <Routes>
        {/* Thêm routes ở đây */}
        <Route path="/" element={<div>Home Page</div>} />
      </Routes>
    </Container>
  );
}

export default App;
