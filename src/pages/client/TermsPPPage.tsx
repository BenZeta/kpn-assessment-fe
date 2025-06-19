import useAPI from "@/hooks/useAPIAssesse";
import { Container, Button, Box, Divider, Typography } from "@mui/material";
import { AxiosResponse } from "axios";
import { useEffect, useState, useMemo, ReactNode } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import parse from "html-react-parser";

export default function TermsPPPage() {
  const api = useAPI();
  const navigate = useNavigate();
  const { id, token } = useParams();
  const [terms, setTerms] = useState<string>("");
  const [pp, setPP] = useState<string>("");
  useEffect(() => {
    (async () => {
      try {
        const {
          data,
        }: AxiosResponse<{
          data: { terms: { id: string; name: string }; pp: { id: string; name: string } };
        }> = await api.get(`/assessment/${token}/termspp`);
        setTerms(data.data.terms.name);
        setPP(data.data.pp.name);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [token]);

  return (
    <Container
      sx={theme => ({
        display: "flex",
        flexDirection: "column",
        p: 2,
        width: "100vw",
        minHeight: "100vh",
        backgroundColor: theme.palette.background.paper,
      })}
    >
      <Box
        sx={theme => ({ backgroundColor: theme.palette.primary.main, px: 2, borderRadius: "10px" })}
      >
        <Typography
          variant="h1"
          sx={theme => ({ color: theme.palette.primary.contrastText, py: 2 })}
        >
          Terms & Privacy Policy
        </Typography>
      </Box>
      <h2>Terms</h2>
      <Divider />
      {parse(terms)}
      <Divider />
      <h2>Privacy & Policy</h2>
      <Divider />
      {parse(pp)}
      <Divider />
      <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2, gap: 2, alignItems: "center" }}>
        <Typography sx={{ fontSize: "10pt" }}>
          by continuing, you are agree with our{" "}
          <strong>
            <em>Terms & Privacy Policy</em>
          </strong>{" "}
          of Assessment Center
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            navigate(`/client/assessment/${token}/subtest/${id}/proctor`);
          }}
        >
          Next
        </Button>
      </Box>
    </Container>
  );
}
