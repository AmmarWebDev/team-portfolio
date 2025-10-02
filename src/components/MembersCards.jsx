// Imports
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Typography,
} from "@mui/material";

export default function MembersCards({ array }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "2rem",
      }}
    >
      {array.map((member, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: index * 0.2,
            ease: "easeOut",
          }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <Card
            sx={{
              height: "360px",
              position: "relative",
              zIndex: "2",
              borderRadius: "15px",
              boxShadow: "5px 10px 10px 0 rgba(0, 0, 0, 0.3)",
              transition: "0.3s",
              "&:hover": {
                transform: "translateY(-20px)",
                boxShadow: "5px 20px 30px 0 rgba(0, 0, 0, 0.3)",
              },
            }}
          >
            <CardContent>
              <Box
                sx={{
                  width: "120px",
                  height: "120px",
                  border: "2px solid",
                  borderColor: "primary.main",
                  borderRadius: "50%",
                  overflow: "hidden",
                  margin: "0 auto 20px",
                }}
              >
                <img
                  src={member.imagePath}
                  style={{ transition: "0.3s", objectFit: "cover" }}
                  width="100%"
                  height="100%"
                />
              </Box>

              <Typography
                gutterBottom
                variant="h4"
                component="div"
                sx={{ textAlign: "center", fontWeight: "bold" }}
              >
                {member.name}
              </Typography>

              <Typography variant="body2" sx={{ color: "primary.main" }}>
                <span
                  style={{ fontWeight: "bold", textDecoration: "underline" }}
                >
                  Skills:
                </span>
                &nbsp;
                {member.skills.join(", ")}
              </Typography>
            </CardContent>

            <CardActions sx={{ flexWrap: "wrap" }}>
              {Object.entries(member.socials).map(([key, value]) => (
                <Button
                  size="small"
                  key={key}
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  color="secondary"
                >
                  {key}
                </Button>
              ))}
            </CardActions>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
