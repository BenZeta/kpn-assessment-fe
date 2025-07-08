import useAPI from "@/hooks/useAPIAssesse";
import { Box, Button, Container, Divider, Typography } from "@mui/material";
import { AxiosResponse } from "axios";
import parse from "html-react-parser";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const contentStyles = {
  "& h2": {
    fontSize: "1.4rem", 
    marginTop: "16px", 
    marginBottom: "4px", 
    lineHeight: 1.2,
  },
  "& p": {
    marginBlock: "4px",
    lineHeight: 1.5,
  },
};

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

      <Box sx={contentStyles}>{parse(terms)}</Box>
      <Divider sx={{ my: 2, borderBottomWidth: '16px' }} />
      <Box sx={contentStyles}>{parse(pp)}</Box>
      <Divider sx={{ mt: 2 }} />
      
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
