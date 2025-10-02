// Fonts
import "@fontsource/rubik/400.css";
import "@fontsource/roboto/400.css";

// CSS
import "./App.css";

// Data
import { teamMembers } from "./data/teamMembers";

// Components
import FloatiesCanvas from "./components/FloatiesCanvas";
import MembersCards from "./components/MembersCards";

// Framer Motion
import { motion } from "framer-motion";

// MUI Imports
import {
  createTheme,
  ThemeProvider,
  CssBaseline,
  Typography,
  Container,
  Box,
} from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00ffcc",
    },
    secondary: {
      main: "#fff",
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
    h1: {
      fontFamily: "Rubik, Arial, sans-serif",
      fontSize: "max(6rem, 11vw)",
      textAlign: "center",
      animation: "descend 2s",
      padding: "30px",
    },
  },
});

// create a motion-enabled Typography component
const MotionTypography = motion.create(Typography);

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FloatiesCanvas />

      <Box className="landing">
        <MotionTypography
          variant="h1"
          initial={{ opacity: 0, y: -20, scale: 0.995 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.3 }}
        >
          MEET THE TEAM
        </MotionTypography>
      </Box>

      <Container className="team-members" sx={{ py: "3rem" }}>
        <MembersCards array={teamMembers} />
      </Container>
    </ThemeProvider>
  );
}
