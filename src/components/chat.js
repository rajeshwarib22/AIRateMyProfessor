import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  InputBase,
  Box,
} from "@mui/material";
import { Send } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

// Styled components using the styled API
const ChatContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "80vh",
  justifyContent: "space-between",
}));

const ChatMessages = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  overflowY: "auto",
}));

const ChatInputContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(1),
  backgroundColor: "#f0f0f0",
}));

const InputBaseStyled = styled(InputBase)(({ theme }) => ({
  flex: 1,
  marginLeft: theme.spacing(1),
}));

function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(["Welcome to the chat!"]);

  const handleSend = () => {
    if (message.trim()) {
      setMessages([...messages, message]);
      setMessage(""); // Clear the input
    }
  };

  return (
    <ChatContainer>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Chat</Typography>
        </Toolbar>
      </AppBar>

      <ChatMessages>
        {messages.map((msg, index) => (
          <Typography key={index}>{msg}</Typography>
        ))}
      </ChatMessages>

      <ChatInputContainer>
        <InputBaseStyled
          placeholder="Type your message..."
          inputProps={{ "aria-label": "Type your message" }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()} // Send on Enter key
        />
        <IconButton color="primary" onClick={handleSend}>
          <Send />
        </IconButton>
      </ChatInputContainer>
    </ChatContainer>
  );
}

export default Chat;
