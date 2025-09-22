import useAuthStore from "@/hooks/useAuthStore";
import { Avatar, Box, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import { useState } from "react";
import { QuestionAnswerOutlined } from "@mui/icons-material";

const UserMenu = () => {
  const fullname = useAuthStore(state => state.fullname);
  const signOut = useAuthStore(state => state.signOut);
  const [anchorEl, setAnchorEl] = useState<EventTarget | Element | null>(null);

  const handleClick = (event: any): any => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    console.log("logout");
    signOut();
  };

  const open = Boolean(anchorEl);
  const id = open ? "user-popover" : undefined;

  return (
    <>
      <IconButton onClick={handleClick}>
        <Avatar sx={{ width: 32, height: 32 }} />
      </IconButton>
      <Menu
        id={id}
        anchorEl={anchorEl as Element}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "center",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
      >
        <MenuItem sx={{ width: "10rem" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
            }}
          >
            <IconButton>
              <Avatar>{fullname && fullname.slice(0, 1).toUpperCase()}</Avatar>
            </IconButton>
            <Typography sx={{ textWrap: "wrap" }}>{fullname ?? ""}</Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ width: "10rem" }}>
          Logout
        </MenuItem>
        {/* <MenuItem onClick={handleLogout} sx={{ width: "10rem" }}>
          <QuestionAnswerOutlined /> User Guide
        </MenuItem> */}
      </Menu>
    </>
  );
};
export default UserMenu;
