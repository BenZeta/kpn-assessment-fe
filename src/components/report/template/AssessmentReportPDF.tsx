import logo from "@/assets/KPN_CORP_NEW_LOGO.png";
import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./styles";
import { SubtestChartSection } from "./subtestChart";
import dayjs from "dayjs";
import placeholderImg from "@/assets/place-holder.jpg"; // Placeholder image for profile

// Helper function to format date from ISO string
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  } catch (error) {
    return "Invalid Date";
  }
};

const testDate = formatDate(new Date().toISOString()); // Use current date for test date

interface AssessmentReportPDFProps {
  data: {
    intro: Array<{
      category_code: string;
      category_name: string;
      summary_type: string;
      summary_formula?: string;
      summary_view?: string;
      tests?: Array<{
        id: string;
        name: string;
        description: string;
        result?: {
          test_point?: number;
          norm: Array<{
            id: string;
            criteria_name: string;
            minimum_score: number;
            maximum_score: number;
          }>;
        };
      }>;

      subtests?: Array<{
        id: string;
        name: string;
        description: string;
        result: {
          type?: string;
        };
      }>;
    }>;
    detail: Array<{
      category_id: number;
      category_name: string;
      category_code: string;
      test_code?: string;
      test_name: string;
      taken_at: string;
      description?: string;
      summary_type: string;
      summary_view?: string;
      summary_formula: string;
      norm?: Array<{ criteria_name: string; minimum_score: number; maximum_score: number }>;
      result: {
        test_point: number;
        criteria: string;
        description: string;
      };
      subtests: Array<{
        subtest_id: string;
        subtest_name: string;
        subtest_code: string;
        description: string;
        result: {
          subtest_point: number;
          subtest_criteria: string;
          criteria_color: string;
          // category: [];
          categories: Array<{
            category_id: number;
            category_name: string;
            category_code: string;
            category_point: number;
            description: string;
          }>;
        };
      }>;
    }>;
    log: Array<{
      id: string;
      log: string;
      created_at: string;
    }>;
    proctoring: {
      web_cam: Array<{ key: string; lastModified: string }>;
      screen: Array<{ key: string; lastModified: string }>;
    };
    proctoringImages: {
      webcam: string[]; // data URL ("data:image/png;base64,…")
      screen: string[];
    };

    guide?: { content?: string };
    batch?: { name: string; code: string };
    profile: {
      assessee_name: string;
      assessee_age: string;
      assessee_gender: string;
      work_place: string;
    };
  };
  charts?: Record<string, string>;
}

export const AssessmentReportPDF: React.FC<AssessmentReportPDFProps> = ({ data, charts }) => {
  console.log("here some data: ", data.proctoringImages);
  return (
    <Document>
      {/* Introduction Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <View style={styles.logo}>
              <Image src={logo} />
            </View>
            <View style={styles.confidentialBadge}>
              <Text>STRICTLY CONFIDENTIAL</Text>
            </View>
          </View>
          <Text style={styles.headerTitle}>Introduction</Text>
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>REPORT CONTENT</Text>
          <Text style={styles.sectionContent}>
            This potential assessment report presents a profile based on the assessment results that
            measure an individual's cognitive potential and personality. The results of this report
            should be used as a reference/support and can be validated with other data sources such
            as interviews, observations, biographical history, and additional assessment results
          </Text>
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>CONFIDENTIALITY</Text>
          <Text style={styles.sectionContent}>
            This potential assessment report is confidential and may only be accessed by authorized
            parties. The confidentiality of this report must be maintained to protect sensitive
            information and ensure that the data is not shared in an unauthorized manner.
          </Text>
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>DISCLAIMER</Text>
          <Text style={styles.sectionContent}>
            The potential assessment report should not be used as the sole basis for
            decision-making. For more accurate results, combine this report with performance
            evaluations, experience, expertise, personality assessments, and other references.
          </Text>
          <Text style={{ ...styles.sectionContent, marginTop: 10 }}>
            Assessment results are generally valid for 12–24 months after completion or less if the
            participant undergoes significant changes in their job or life.
          </Text>
        </View>

        {data.guide && data.guide.content && (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>GUIDE</Text>
            <Text style={styles.sectionContent}>{data.guide.content}</Text>
          </View>
        )}
      </Page>

      {/* Psychograph Page */}
      {/* <Page size="A4" style={styles.page}>
        <View style={styles.psychographHeader}>
          <View style={styles.headerTop}>
            <View style={styles.logo}>
              <Image src={logo} />
            </View>
            <View style={styles.confidentialBadge}>
              <Text>STRICTLY CONFIDENTIAL</Text>
            </View>
          </View>
          <Text style={styles.psychographTitle}>Psychograph</Text>
        </View>

        <View style={styles.profileContainer}>
          <View style={styles.profileData}>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Name</Text>
              <Text style={styles.profileColon}>:</Text>
              <Text>{data.profile.assessee_name}</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Age</Text>
              <Text style={styles.profileColon}>:</Text>
              <Text>{data.profile.assessee_age}</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Gender</Text>
              <Text style={styles.profileColon}>:</Text>
              <Text>{data.profile.assessee_gender}</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Test Date</Text>
              <Text style={styles.profileColon}>:</Text>
              <Text>{testDate}</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Work Location</Text>
              <Text style={styles.profileColon}>:</Text>
              <Text>{data.profile.work_place}</Text>
            </View>
          </View>
          <View style={styles.profileImageContainer}>
            <Image src={placeholderImg} />
          </View>
        </View>

        {data.intro.map((intro, index) => (
          <View key={index}>
            <View style={styles.subheaderContainer}>
              <Text style={styles.categoryTitle}>{intro.category_name}</Text>
            </View>
            <View style={{ display: "flex", gap: 10, margin: "0 25", flexDirection: "row" }}>
              {intro.summary_type === "summary" ? (
                <>
                  <View style={{ width: "30%" }}>
                    <View style={{ backgroundColor: "#e7f0d9", padding: 10 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        Assessment
                      </Text>
                    </View>
                    {intro.tests?.map((test, index) => (
                      <View key={index} style={[styles.boxLightPrimary, { marginTop: 5 }]}>
                        <Text style={{ fontSize: 10, textAlign: "center" }}>{test.name}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={{ width: "50%" }}>
                    <View style={{ backgroundColor: "#e7f0d9", padding: 10 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        Definition
                      </Text>
                    </View>
                    {intro.tests?.map((test, index) => (
                      <View key={index} style={[styles.boxLightPrimary, { marginTop: 5 }]}>
                        <Text style={{ fontSize: 10, textAlign: "justify" }}>
                          {test.description || "No description available"}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <View style={{ width: "20%" }}>
                    <View style={{ backgroundColor: "#e7f0d9", padding: 10 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        Score
                      </Text>
                    </View>
                    {intro.tests?.map((test, index) => (
                      <View key={index} style={[styles.boxLightPrimary, { marginTop: 5 }]}>
                        <Text style={{ fontSize: 10, textAlign: "center" }}>
                          {test.result?.test_point || "N/A"}
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : (
                <>
                  <View style={{ width: "30%" }}>
                    <View style={{ backgroundColor: "#e7f0d9", padding: 10 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        Assessment
                      </Text>
                    </View>
                    {intro.subtests?.map((subtest, index) => (
                      <View key={index} style={[styles.boxLightPrimary, { marginTop: 5 }]}>
                        <Text style={{ fontSize: 10, textAlign: "center" }}>{subtest.name}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={{ width: "50%" }}>
                    <View style={{ backgroundColor: "#e7f0d9", padding: 10 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        Definition
                      </Text>
                    </View>
                    {intro.subtests?.map((subtest, index) => (
                      <View key={index} style={[styles.boxLightPrimary, { marginTop: 5 }]}>
                        <Text style={{ fontSize: 10, textAlign: "justify" }}>
                          {subtest.description || "No description available"}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <View style={{ width: "20%" }}>
                    <View style={{ backgroundColor: "#e7f0d9", padding: 10 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        Type
                      </Text>
                    </View>
                    {intro.subtests?.map((subtest, index) => (
                      <View key={index} style={[styles.boxLightPrimary, { marginTop: 5 }]}>
                        <Text style={{ fontSize: 10, textAlign: "center" }}>
                          {subtest.result?.type || "N/A"}
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          </View>
        ))}
      </Page> */}
{/* 
      {data.detail.map((detail, index) => (
        <Page key={index} size="A4" style={styles.page}>
          <View style={styles.psychographHeader}>
            <View style={styles.headerTop}>
              <View style={styles.logo}>
                <Image src={logo} />
              </View>
              <View style={styles.confidentialBadge}>
                <Text>STRICTLY CONFIDENTIAL</Text>
              </View>
            </View>
            <Text
              style={{
                ...styles.psychographTitle,
                // fontSize: detail.test_name.length > 20 ? 16 : styles.psychographTitle.fontSize,
              }}
            >
              {detail.test_name} Result
            </Text>
          </View>
          {detail.summary_type === "subtest" ? (
            <>
              <View style={{ display: "flex", flexDirection: "row", gap: 10, margin: "10 25" }}>
                <View style={[styles.col60]}>
                  <View style={[styles.boxPrimary]}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "bold",
                        color: "white",
                        textAlign: "center",
                      }}
                    >
                      What We Measures
                    </Text>
                  </View>
                  <View style={[styles.boxLightPrimary, { marginTop: 5 }]}>
                    <Text style={{ fontSize: 10, textAlign: "justify" }}>
                      {detail.result.description || "No description available"}
                    </Text>
                  </View>
                </View>

                <View style={[styles.col40]}>
                  <View style={[styles.boxPrimary]}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "bold",
                        color: "white",
                        textAlign: "center",
                      }}
                    >
                      {detail.category_name} Score
                    </Text>
                  </View>
                  <View style={[styles.boxLightPrimary, { marginTop: 5 }]}>
                    <Text style={{ fontSize: 32, fontWeight: "bold", textAlign: "center" }}>
                      {detail.result.test_point || "N/A"}
                    </Text>
                    <Text style={{ fontSize: 16, fontWeight: "bold", textAlign: "center" }}>
                      {detail.result.criteria || "Not Available"}
                    </Text>
                  </View>
                </View>
              </View>

              <SubtestChartSection
                subtests={detail.subtests.map(subtest => ({
                  subtest_name: subtest.subtest_name,
                  subtest_code: subtest.subtest_code,
                  result: {
                    subtest_point: subtest.result.subtest_point || 0,
                  },
                }))}
              />
              <View
                style={{ display: "flex", flexDirection: "row", gap: 5, justifyContent: "center" }}
              >
                {detail.norm?.map((norm, index) => (
                  <View key={index}>
                    <View style={{ padding: 10, backgroundColor: "#d74e4a" }}>
                      <Text style={{ fontSize: 10, textAlign: "center", color: "white" }}>
                        {norm.criteria_name}
                      </Text>
                    </View>
                    <View style={{ padding: 10, backgroundColor: "#f0f0f0", marginTop: 1 }}>
                      <Text style={{ fontSize: 10, textAlign: "center" }}>
                        {norm.minimum_score} - {norm.maximum_score}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <>
              <View style={{ margin: "10 25" }}>
                <View style={{ padding: 10, backgroundColor: "#d74e4a" }}>
                  <Text style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>
                    Report Usage Guidelines
                  </Text>
                </View>
                <View style={{ padding: 10, backgroundColor: "#ffdcdc", marginTop: 2 }}>
                  <Text style={{ fontSize: 10, textAlign: "justify" }}>{detail.description}</Text>
                </View>
                <View style={{ margin: "15 25 0 25", display: "flex", flexDirection: "column" }}>
                  {charts ? (
                    <Image src={charts["OCEAN"]} style={{ width: 500 }} />
                  ) : (
                    <Text>Loading chart...</Text>
                  )}
                </View>

                {(() => {
                  const allCategories = detail.subtests.flatMap(subtest => {
                    return Array.isArray(subtest.result.categories)
                      ? subtest.result.categories
                      : [];
                  });

                  return allCategories.map((cat, idx) => (
                    <View key={idx}>
                      <View
                        style={{
                          padding: 10,
                          backgroundColor: "#d74e4a",
                          marginTop: idx === 0 ? 2 : 2,
                          marginBottom: 2,
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontWeight: "bold",
                            textAlign: "center",
                            fontSize: 10,
                          }}
                        >
                          {cat.category_code} – {cat.category_name}
                        </Text>
                      </View>
                      <View style={{ padding: 10, backgroundColor: "#ffdcdc" }}>
                        <Text style={{ fontSize: 10, textAlign: "justify" }}>
                          {cat.description || "No description available"}
                        </Text>
                      </View>
                    </View>
                  ));
                })()}
              </View>
            </>
          )}
        </Page>
      ))} */}

      {/* <Page size="A4" style={styles.page}>
        <View style={styles.psychographHeader}>
          <View style={styles.headerTop}>
            <View style={styles.logo}>
              <Image src={logo} />
            </View>
            <View style={styles.confidentialBadge}>
              <Text>STRICTLY CONFIDENTIAL</Text>
            </View>
          </View>
          <Text style={styles.psychographTitle}>Proctoring</Text>
        </View>
        <View style={{ marginTop: 15, marginHorizontal: 25 }}>
          <Text style={styles.sectionTitle}>Log Activity</Text>
        </View>

        <View style={styles.logTable}>
          <View style={styles.logHeaderRow}>
            <Text style={styles.logHeaderCellDate}>Date and Time</Text>
            <Text style={styles.logHeaderCellActivity}>Activity</Text>
          </View>

          {data.log.map((entry, idx) => {
            const formattedDate = dayjs(entry.created_at).format("DD-MMM-YYYY HH:mm:ss");
            const isEven = idx % 2 === 1;
            return (
              <View key={entry.id} style={[styles.logRow, ...(isEven ? [styles.logRowEven] : [])]}>
                <Text style={styles.logCellDate}>{formattedDate}</Text>
                <Text style={styles.logCellActivity}>{entry.log}</Text>
              </View>
            );
          })}
        </View>

        <View wrap style={{ marginTop: 20, marginHorizontal: 25 }}>
          <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 8 }}>
            Webcam Proctoring
          </Text>
          {data.proctoringImages.webcam.length === 0 && (
            <Text style={{ fontSize: 10, fontStyle: "italic" }}>Tidak ada gambar webcam.</Text>
          )}
          <View style={{ display: "flex", flexDirection: "row", gap: 10 }}>
            {data.proctoringImages.webcam.map((imgDataUrl, idx) => (
              <View
                key={`webcam-${idx}`}
                wrap={false}
                style={{
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  padding: 4,
                  alignItems: "center",
                }}
              >
                <Image
                  src={imgDataUrl}
                  style={{
                    width: "100px",
                    height: "auto",
                    marginTop: 4,
                  }}
                />
              </View>
            ))}
          </View>
        </View>

        <View wrap style={{ marginTop: 20, marginHorizontal: 25, display: "flex", gap: 2 }}>
          <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 8 }}>
            Screen Proctoring
          </Text>
          {data.proctoringImages.screen.length === 0 && (
            <Text style={{ fontSize: 10, fontStyle: "italic" }}>Tidak ada gambar screen.</Text>
          )}
          <View style={{ display: "flex", flexDirection: "row", gap: 10 }}>
            {data.proctoringImages.screen.map((imgDataUrl, idx) => (
              <View
                key={`screen-${idx}`}
                wrap={false}
                style={{
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  padding: 4,
                  alignItems: "center",
                }}
              >
                <Image
                  src={imgDataUrl}
                  style={{
                    width: "100px",
                    height: "auto",
                    marginTop: 4,
                  }}
                />
              </View>
            ))}
          </View>
        </View>
      </Page> */}
    </Document>
  );
};
