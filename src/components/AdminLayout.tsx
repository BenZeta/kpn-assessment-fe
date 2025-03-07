import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { Fragment, useEffect, useState } from "react";
import { AppBar, CircularProgress, Collapse, IconButton, Toolbar, Typography } from "@mui/material";
import { Link, Outlet, useNavigate } from "react-router-dom";
import UserMenu from "./UserMenu";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import useFetch from "@/hooks/useFetch";
import { Menu } from "@/types/MasterData";
import IconRenderer from "./IconRenderer";

const drawerWidth = 240;

export default function AdminLayout() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const [collapseState, setCollapseState] = useState<any>({});
  const { data: menu } = useFetch<any>("/menu/admin");

  // PROTECT ROUTES INSIDE ADMIN LAYOUT
  useEffect(() => {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) {
      navigate("/");
    }
  }, [navigate]);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const toggleCollapse = (index: number) => {
    setCollapseState((prev: any) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const DrawerList = (
    <List dense>
      {menu ? (
        menu.data.map((menuGroup: any, index: number) => (
          <Fragment key={index}>
            {menuGroup.subheader ? (
              <>
                <ListItemButton onClick={() => toggleCollapse(index)}>
                  <ListItemText primary={menuGroup.subheader} />
                  {collapseState[index] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </ListItemButton>
                <Collapse in={collapseState[index]} timeout="auto" unmountOnExit>
                  <List component="div" dense>
                    {menuGroup.items.map((item: Menu) => {
                      return (
                        <ListItem disablePadding key={item.name}>
                          <ListItemButton component={Link} to={item.path} sx={{ pl: 4 }}>
                            <ListItemIcon>
                              <IconRenderer icon={item.icon || ""} />
                            </ListItemIcon>
                            <ListItemText primary={item.name} />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              </>
            ) : (
              <List component="div" dense>
                {menuGroup.items.map((item: Menu) => {
                  return (
                    <ListItem disablePadding key={item.name}>
                      <ListItemButton component={Link} to={item.path}>
                        <ListItemIcon>
                          <IconRenderer icon={item.icon || ""} />
                        </ListItemIcon>
                        <ListItemText primary={item.name} />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Fragment>
        ))
      ) : (
        <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      )}
    </List>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme => theme.zIndex.drawer + 1,
          transition: theme =>
            theme.transitions.create(["width", "margin"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          ...(open && {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
          }),
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              {open ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              KPN Assessment
            </Typography>
          </Box>
          <UserMenu />
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <Box sx={{ overflow: "auto" }}>{DrawerList}</Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: 3,
          width: `calc(100% - ${drawerWidth}px)`,
          transition: theme =>
            theme.transitions.create("margin", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          marginLeft: open ? 0 : `-${drawerWidth}px`,
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
