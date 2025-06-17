import {
  Assessment,
  BarChart,
  Category as CategoryIcon,
  ExpandLess,
  ExpandMore,
  Functions,
  Psychology,
  Science,
  Summarize,
  TableChart,
  ViewList,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  Fade,
  Grid2 as Grid,
  IconButton,
  MenuItem,
  Paper,
  Typography
} from "@mui/material";
import React, { useState } from "react";
import SelectCtrl from "../forms/Select";

export type Test = {
  id: string;
  name: string;
  code: string;
  subtests?: SubTest[];
};

type SubTest = {
  id: string;
  name: string;
  code: string;
};

export type Category = {
  id: number;
  name: string;
  code: string;
  tests: Test[];
  testCount: number;
};

type ReportCardProps = {
  control: any;
  data: Category | Test;
  variant: "category" | "test";
  index: number;
  fieldNamePrefix: string;
  defaultSummaryBy?: string;
  defaultSummaryFormula?: string;
  defaultSummaryView?: string;
  showCategoryPrefix?: boolean;
};

const ReportCard: React.FC<ReportCardProps> = ({
  variant,
  data,
  showCategoryPrefix,
  control,
  index,
  fieldNamePrefix,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [hoveredTest, setHoveredTest] = useState<string | null>(null);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes("personality")) return <Psychology />;
    if (name.includes("cognitive") || name.includes("kus")) return <Science />;
    return <Assessment />;
  };

  const getViewIcon = (view: string) => {
    switch (view) {
      case "table":
        return <TableChart />;
      case "bar":
        return <BarChart />;
      default:
        return <ViewList />;
    }
  };

  const renderTitle = () => {
    if (variant === "category") {
      const category = data as Category;
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              backgroundColor: "primary.main",
              color: "white",
              display: "flex",
              alignItems: "center",
            }}
          >
            {getCategoryIcon(category.name)}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}>
              {showCategoryPrefix ? `${category.name}` : category.name}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={`${category.testCount} Tests`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontSize: "0.75rem" }}
              />
              <Chip
                label={category.code}
                size="small"
                color="secondary"
                variant="filled"
                sx={{ fontSize: "0.75rem" }}
              />
            </Box>
          </Box>
          <IconButton
            onClick={handleExpandClick}
            sx={{
              backgroundColor: expanded ? "action.selected" : "transparent",
              "&:hover": { backgroundColor: "action.hover" },
            }}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
      );
    } else {
      const test = data as Test;
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              backgroundColor: "secondary.main",
              color: "white",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Assessment />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>
            {test.name}
          </Typography>
        </Box>
      );
    }
  };

  const renderItems = () => {
    if (variant === "category") {
      const category = data as Category;
      return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {category.tests.map((test, testIndex) => (
            <Fade in={expanded} timeout={300 + testIndex * 100} key={test.id}>
              <Card
                sx={{
                  background: "linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%)",
                  border: "1px solid",
                  borderColor: hoveredTest === test.id ? "primary.main" : "grey.200",
                  borderRadius: 3,
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  "&:hover": {
                    borderColor: "primary.main",
                    boxShadow: "0 8px 25px rgba(185, 31, 39, 0.15)",
                    transform: "translateY(-2px)",
                  },
                }}
                onMouseEnter={() => setHoveredTest(test.id)}
                onMouseLeave={() => setHoveredTest(null)}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        backgroundColor: "primary.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                      }}
                    >
                      <Assessment sx={{ fontSize: 20 }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, color: "primary.main", mb: 0.5 }}
                      >
                        {test.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Code: {test.code}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: "success.main",
                        boxShadow: "0 0 8px rgba(76, 175, 80, 0.4)",
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          ))}
        </Box>
      );
    } else {
      const test = data as Test;
      return (
        test.subtests?.map((subTest, index) => (
          <Card
            key={`${test.id}-subtest-${index}`}
            sx={{
              background: "linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%)",
              border: "1px solid",
              borderColor: "grey.200",
              borderRadius: 3,
              mb: 1.5,
              "&:hover": {
                borderColor: "secondary.main",
                boxShadow: "0 4px 15px rgba(217, 189, 117, 0.2)",
              },
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    backgroundColor: "secondary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <Assessment sx={{ fontSize: 16 }} />
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "secondary.dark" }}>
                  {subTest.name}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )) || null
      );
    }
  };

  const idField =
    variant === "category"
      ? `${fieldNamePrefix}[${index}].category_id`
      : `${fieldNamePrefix}[${index}].test_id`;

  const idValue = variant === "category" ? (data as Category).id : (data as Test).id;

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "grey.200",
        borderRadius: 4,
        overflow: "hidden",
        background: "linear-gradient(145deg, #ffffff 0%, #fafbff 100%)",
        transition: "all 0.3s ease",
        "&:hover": {
          borderColor: "primary.light",
          boxShadow: "0 12px 40px rgba(185, 31, 39, 0.08)",
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        {renderTitle()}

        <input type="hidden" {...control.register(idField)} defaultValue={idValue} />

        {/* Configuration Section */}
        <Box
          sx={{
            p: 2.5,
            backgroundColor: "grey.50",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "grey.100",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Functions sx={{ fontSize: 20, color: "primary.main" }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "text.primary" }}>
              Configuration Settings
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid size={4}>
              <Box sx={{ position: "relative" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Summarize sx={{ fontSize: 16, color: "text.secondary" }} />
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}
                  >
                    Summary Type
                  </Typography>
                </Box>
                <SelectCtrl
                  control={control}
                  name={`${fieldNamePrefix}[${index}].summary_type`}
                  label=""
                  defaultValue={(data as any).summary_type}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "white",
                    },
                  }}
                >
                  {variant === "category"
                    ? [
                        <MenuItem key="summary" value="summary">
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Summarize sx={{ fontSize: 16 }} />
                            Summary
                          </Box>
                        </MenuItem>,
                        <MenuItem key="detail" value="detail">
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <ViewList sx={{ fontSize: 16 }} />
                            Detail
                          </Box>
                        </MenuItem>,
                      ]
                    : [
                        <MenuItem key="subtest" value="subtest">
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Assessment sx={{ fontSize: 16 }} />
                            Sub Test
                          </Box>
                        </MenuItem>,
                        <MenuItem key="category" value="category">
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <CategoryIcon sx={{ fontSize: 16 }} />
                            Category
                          </Box>
                        </MenuItem>,
                      ]}
                </SelectCtrl>
              </Box>
            </Grid>

            <Grid size={4}>
              <Box sx={{ position: "relative" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Functions sx={{ fontSize: 16, color: "text.secondary" }} />
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}
                  >
                    Formula
                  </Typography>
                </Box>
                <SelectCtrl
                  control={control}
                  name={`${fieldNamePrefix}[${index}].summary_formula`}
                  label=""
                  defaultValue={(data as any).summary_formula}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "white",
                    },
                  }}
                >
                  <MenuItem value="avg">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Functions sx={{ fontSize: 16 }} />
                      Average
                    </Box>
                  </MenuItem>
                  <MenuItem value="sum">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Functions sx={{ fontSize: 16 }} />
                      Sum
                    </Box>
                  </MenuItem>
                </SelectCtrl>
              </Box>
            </Grid>

            <Grid size={4}>
              <Box sx={{ position: "relative" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <BarChart sx={{ fontSize: 16, color: "text.secondary" }} />
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}
                  >
                    View Type
                  </Typography>
                </Box>
                <SelectCtrl
                  control={control}
                  name={`${fieldNamePrefix}[${index}].summary_view`}
                  label=""
                  defaultValue={(data as any).summary_view}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "white",
                    },
                  }}
                >
                  <MenuItem value="table">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <TableChart sx={{ fontSize: 16 }} />
                      Table
                    </Box>
                  </MenuItem>
                  <MenuItem value="bar">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <BarChart sx={{ fontSize: 16 }} />
                      Bar Chart
                    </Box>
                  </MenuItem>
                </SelectCtrl>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Tests/Items Section */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Assessment sx={{ fontSize: 20, color: "primary.main" }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "text.primary" }}>
                {variant === "category" ? "Available Tests" : "Sub Tests"}
              </Typography>
            </Box>
            {renderItems()}
          </Box>
        </Collapse>
      </Box>
    </Paper>
  );
};

export default ReportCard;
