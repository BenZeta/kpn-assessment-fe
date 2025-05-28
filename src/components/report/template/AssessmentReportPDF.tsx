import logo from "@/assets/KPN_CORP_NEW_LOGO.png";
import placeholderImg from "@/assets/place-holder.jpg";
import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
import { useEffect, useState, useMemo } from "react";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import { styles } from "./styles";
import html2canvas from "html2canvas";
import ReactDOM from "react-dom";

// Interface definitions for TypeScript
interface ProfileData {
  assessee_name: string;
  assessee_age: string;
  assessee_gender: string;
  work_location: string;
}

interface NormData {
  id: string;
  criteria_name: string;
  minimum_score: number;
  maximum_score: number;
}

interface CategoryData {
  category_id: string | number;
  category_name: string;
  category_code: string;
  point?: number;
  category_point?: number;
  description: string;
}

interface TestResult {
  test_point?: number;
  criteria?: string;
  description?: string;
  norm?: NormData[];
  type?: string;
}

interface SubtestResult {
  subtest_point?: number;
  subtest_criteria?: string;
  criteria_color?: string;
  categories?: CategoryData[];
  category?: any[];
  type?: string; // Added the missing 'type' property
}

interface SubtestData {
  subtest_id: string;
  subtest_name: string;
  subtest_code?: string;
  description?: string;
  result: SubtestResult;
}

interface TestData {
  id?: string;
  name: string;
  description?: string;
  result: TestResult;
}

interface CategoryDetailData {
  category_id: string | number;
  category_name: string;
  category_code: string;
  summary_type: string;
  summary_view: string;
  summary_formula: string;
  tests?: TestData[];
  subtests?: SubtestData[];
}

interface DetailData {
  category_id: number | string;
  category_name: string;
  category_code: string;
  test_id: string;
  test_name: string;
  test_code: string;
  taken_at: string;
  summary_type: string;
  summary_view: string;
  summary_formula: string;
  result: TestResult;
  norm: NormData[];
  subtests: SubtestData[];
}

interface AssessmentData {
  profile: ProfileData;
  guide: { content: string };
  batch: { name: string; code: string };
  intro: CategoryDetailData[];
  detail: DetailData[];
}

interface AssessmentReportPDFProps {
  data: any;
  charts: any;
}

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

// This creates a simple DOM element with the chart that can be captured
const createCognitiveChartElement = (subtestData: SubtestData[]) => {
  // Transform subtest data for the chart
  const chartData = subtestData.map(subtest => ({
    name: subtest.subtest_name,
    value: subtest.result.subtest_point || 0,
    max: 100, // Assuming max is 100 for all subtests
  }));

  // Create a container div
  const chartContainer = document.createElement("div");
  chartContainer.style.backgroundColor = "white";
  chartContainer.style.padding = "10px";
  chartContainer.style.width = "550px";

  // Mount the Recharts component to this container
  ReactDOM.render(
    <BarChart
      layout="vertical"
      width={500}
      height={300}
      data={chartData}
      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
    >
      <XAxis type="number" domain={[0, 100]} />
      <YAxis dataKey="name" type="category" width={200} />
      <Bar
        dataKey="value"
        fill="#d32f2f"
        background={{ fill: "#f0f0f0" }}
        radius={0}
        barSize={25}
        isAnimationActive={false}
      >
        <LabelList dataKey="value" position="right" />
      </Bar>
    </BarChart>,
    chartContainer
  );

  return chartContainer;
};

// Function to create OCEAN personality chart element
const createPersonalityChartElement = (categories: CategoryData[]) => {
  // Transform category data for the chart
  const chartData = categories.map(category => ({
    name: category.category_code,
    value: category.point || category.category_point || 0,
    max: 100, // Assuming max is 100 for all categories
  }));

  // Create a container div
  const chartContainer = document.createElement("div");
  chartContainer.style.backgroundColor = "white";
  chartContainer.style.padding = "10px";
  chartContainer.style.width = "550px";

  // Mount the Recharts component to this container
  ReactDOM.render(
    <BarChart
      width={500}
      height={300}
      data={chartData}
      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
    >
      <XAxis dataKey="name" />
      <YAxis domain={[0, 100]} />
      <Bar
        dataKey="value"
        fill="#d32f2f"
        background={{ fill: "#f0f0f0" }}
        radius={0}
        isAnimationActive={false}
      >
        <LabelList dataKey="value" position="top" />
      </Bar>
    </BarChart>,
    chartContainer
  );

  return chartContainer;
};

// Main PDF component
export const AssessmentReportPDF: React.FC<AssessmentReportPDFProps> = ({ data, charts }) => {
  const [cognitiveChartImage, setCognitiveChartImage] = useState("");
  const [personalityChartImage, setPersonalityChartImage] = useState("");
  const [isReady, setIsReady] = useState(false);
  console.log(charts);

  // Find the cognitive and personality test data
  const cognitiveDetail = useMemo(
    () => data.detail.find(item => item.category_code === "KOG"),
    [data]
  );
  const personalityDetail = useMemo(
    () => data.detail.find(item => item.category_code === "PERSON" || item.test_code === "PERSON"),
    [data]
  );

  // Find the personality categories (OCEAN)
  const oceanCategories = useMemo(
    () =>
      personalityDetail?.subtests.find(subtest => subtest.subtest_code === "OCEAN")?.result
        .categories || [data],
    [personalityDetail]
  );

  // Find the personality type
  const personalityType = useMemo(
    () =>
      data.intro.find(item => item.category_code === "PERSON")?.subtests?.[0]?.result?.type ||
      "Not Available",
    [data]
  );

  // Get cognitive test score
  const cognitiveScore = cognitiveDetail?.result?.test_point || 0;
  const cognitiveCriteria = cognitiveDetail?.result?.criteria || "Not Available";

  // useEffect(() => {
  //   // Function to capture the cognitive chart
  //   const captureCognitiveChart = async () => {
  //     if (!cognitiveDetail?.subtests?.length) return;

  //     try {
  //       // Create the chart element outside of the component tree
  //       const chartElement = createCognitiveChartElement(cognitiveDetail.subtests);

  //       // Temporarily add it to body
  //       document.body.appendChild(chartElement);

  //       // Capture it with html2canvas
  //       const canvas = await html2canvas(chartElement, {
  //         scale: 2, // Higher scale for better quality
  //         useCORS: true,
  //         logging: true,
  //       });

  //       // Remove the element when done
  //       document.body.removeChild(chartElement);

  //       // Convert to data URL
  //       const dataURL = canvas.toDataURL("image/png");
  //       setCognitiveChartImage(dataURL);
  //     } catch (error) {
  //       console.error("Error capturing cognitive chart:", error);
  //     }
  //   };

  //   // Function to capture the personality chart
  //   const capturePersonalityChart = async () => {
  //     if (!oceanCategories.length) return;

  //     try {
  //       // Create the chart element outside of the component tree
  //       const chartElement = createPersonalityChartElement(oceanCategories);

  //       // Temporarily add it to body
  //       document.body.appendChild(chartElement);

  //       // Capture it with html2canvas
  //       const canvas = await html2canvas(chartElement, {
  //         scale: 2, // Higher scale for better quality
  //         useCORS: true,
  //         logging: true,
  //       });

  //       // Remove the element when done
  //       document.body.removeChild(chartElement);

  //       // Convert to data URL
  //       const dataURL = canvas.toDataURL("image/png");
  //       setPersonalityChartImage(dataURL);
  //       setIsReady(true);
  //     } catch (error) {
  //       console.error("Error capturing personality chart:", error);
  //     }
  //   };

  //   // Run the capture functions
  //   captureCognitiveChart();
  //   capturePersonalityChart();
  // }, [cognitiveDetail, oceanCategories]);

  // Get norm data for cognitive test
  const normData = cognitiveDetail?.norm || [];

  // Get test date
  const testDate = cognitiveDetail ? formatDate(cognitiveDetail.taken_at) : "N/A";

  // PDF Document Component
  return (
    <Document>
      {/* Introduction Page */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
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

        {/* Report Content Section */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>REPORT CONTENT</Text>
          <Text style={styles.sectionContent}>
            This potential assessment report presents a profile based on the assessment results that
            measure an individual's cognitive potential and personality. The results of this report
            should be used as a reference/support and can be validated with other data sources such
            as interviews, observations, biographical history, and additional assessment results
          </Text>
        </View>

        {/* Confidentiality Section */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>CONFIDENTIALITY</Text>
          <Text style={styles.sectionContent}>
            This potential assessment report is confidential and may only be accessed by authorized
            parties. The confidentiality of this report must be maintained to protect sensitive
            information and ensure that the data is not shared in an unauthorized manner.
          </Text>
        </View>

        {/* Disclaimer Section */}
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

        {/* Guide Section - From API data */}
        {data.guide && data.guide.content && (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>GUIDE</Text>
            <Text style={styles.sectionContent}>{data.guide.content}</Text>
          </View>
        )}

        {/* Batch Information */}
        {data.batch && (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>BATCH INFORMATION</Text>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Batch Name</Text>
              <Text style={styles.profileColon}>:</Text>
              <Text>{data.batch.name}</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Batch Code</Text>
              <Text style={styles.profileColon}>:</Text>
              <Text>{data.batch.code}</Text>
            </View>
          </View>
        )}
      </Page>

      {/* Psychograph Page */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
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

        {/* Profile Data */}
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
              <Text>{data.profile.work_location}</Text>
            </View>
          </View>
          <View style={styles.profileImageContainer}>
            <Image src={placeholderImg} />
          </View>
        </View>

        {/* Cognitive Category */}
        {cognitiveDetail && (
          <>
            <View style={styles.subheaderContainer}>
              <Text style={styles.categoryTitle}>Cognitive</Text>
            </View>

            {/* Chart Section */}
            <View style={styles.chartSection}>
              <View style={{ gap: 10, flexDirection: "row" }}>
                <View style={[styles.chartColumn, styles.col50]}>
                  <Text style={styles.chartTitle}>Curve</Text>
                  <Text style={{ textAlign: "center", marginTop: 40 }}>[Bell Curve Chart]</Text>
                </View>
                <View style={[styles.chartColumn, styles.col50]}>
                  <Text style={styles.chartTitle}>Norms</Text>
                  <View
                    style={[
                      styles.normsTable,
                      {
                        marginTop: 20,
                        display: "flex",
                        justifySelf: "center",
                        alignItems: "center",
                        justifyContent: "center",
                      },
                    ]}
                  >
                    {normData.map((norm, index) => (
                      <View key={index} style={styles.normsRow}>
                        <Text style={styles.normsLabel}>{norm.criteria_name}</Text>
                        <Text style={styles.normsValue}>
                          : {norm.minimum_score}-{norm.maximum_score}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            {/* Assessment Section */}
            <View style={styles.row}>
              <View style={[styles.assessmentColumn, styles.col33]}>
                <Text style={styles.assessmentTitle}>Assessment</Text>
                <Text style={{ marginTop: 20 }}>{cognitiveDetail.test_name}</Text>
              </View>
              <View style={[styles.assessmentColumn, styles.col44]}>
                <Text style={styles.assessmentTitle}>Definition</Text>
                <Text style={styles.testDescription}>
                  {cognitiveDetail.result.description || "No description available"}
                </Text>
              </View>
              <View style={[styles.assessmentColumn, styles.col23]}>
                <Text style={styles.assessmentTitle}>Score</Text>
                <Text style={styles.scoreValue}>{cognitiveDetail.result.test_point}</Text>
              </View>
            </View>
          </>
        )}

        {/* Personality Category */}
        {personalityDetail && (
          <>
            <View style={styles.subheaderContainer}>
              <Text style={styles.categoryTitle}>Personality</Text>
            </View>

            <View style={styles.assessmentSection}>
              <View style={{ ...styles.assessmentColumn, ...styles.assessmentLeft }}>
                <Text style={styles.assessmentTitle}>Assessment</Text>
                <Text style={{ marginTop: 20 }}>{personalityDetail.test_name}</Text>
              </View>
              <View style={{ ...styles.assessmentColumn, ...styles.assessmentMiddle }}>
                <Text style={styles.assessmentTitle}>Definition</Text>
                <Text style={styles.testDescription}>
                  Mengukur jenis kepribadian seseorang dengan menggunakan teori OCEAN
                </Text>
              </View>
              <View style={{ ...styles.assessmentColumn, ...styles.assessmentRight }}>
                <Text style={styles.assessmentTitle}>Type</Text>
                <Text style={{ textAlign: "center", marginTop: 20 }}>{personalityType}</Text>
              </View>
            </View>
          </>
        )}
      </Page>

      {/* Cognitive Test Result */}
      {cognitiveDetail && (
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.psychographHeader}>
            <View style={styles.headerTop}>
              <View style={styles.logo}>
                <Image src={logo} />
              </View>
              <View style={styles.confidentialBadge}>
                <Text>STRICTLY CONFIDENTIAL</Text>
              </View>
            </View>
            <Text style={styles.psychographTitle}>Cognitive Test Result</Text>
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
                <Text>{data.profile.work_location}</Text>
              </View>
            </View>
          </View>

          <View style={{ display: "flex", flexDirection: "row", gap: 10, margin: "0 25" }}>
            <View style={[styles.col60]}>
              <View style={[styles.boxPrimary]}>
                <Text
                  style={{ fontSize: 12, fontWeight: "bold", color: "white", textAlign: "center" }}
                >
                  What We Measures
                </Text>
              </View>
              <View style={[styles.boxLightPrimary, { marginTop: 5 }]}>
                <Text style={{ fontSize: 10, textAlign: "justify" }}>
                  The KPN Cognitive Test is a measurement that assesses an individual's ability when
                  faced with tasks that require them to utilize their skills in A, B, C, and D.
                  {"\n\n"}
                  The score presented is a cognitive score, where the results are compared to the
                  population that has completed the given test series.
                </Text>
              </View>
            </View>

            <View style={[styles.col40]}>
              <View style={[styles.boxPrimary]}>
                <Text
                  style={{ fontSize: 12, fontWeight: "bold", color: "white", textAlign: "center" }}
                >
                  Cognitive Score
                </Text>
              </View>
              <View style={[styles.boxLightPrimary, { marginTop: 5 }]}>
                <Text style={{ fontSize: 32, fontWeight: "bold", textAlign: "center" }}>
                  {cognitiveScore}
                </Text>
                <Text style={{ fontSize: 16, fontWeight: "bold", textAlign: "center" }}>
                  {cognitiveCriteria}
                </Text>
              </View>
            </View>
          </View>

          {/* Rendered Chart Image */}
          <View style={{ margin: "15 25", display: "flex", flexDirection: "column", gap: 10 }}>
            {charts ? (
              <Image src={charts["Personality-OCEAN"]} style={{ width: 500 }} />
            ) : (
              <Text>Loading chart...</Text>
            )}
          </View>
        </Page>
      )}

      {/* Personality Test Result */}
      {personalityDetail && oceanCategories.length > 0 && (
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.psychographHeader}>
            <View style={styles.headerTop}>
              <View style={styles.logo}>
                <Image src={logo} />
              </View>
              <View style={styles.confidentialBadge}>
                <Text>STRICTLY CONFIDENTIAL</Text>
              </View>
            </View>
            <Text style={styles.psychographTitle}>Personality Test Result</Text>
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
                <Text>{data.profile.work_location}</Text>
              </View>
            </View>
          </View>

          {/* Report Usage Guidelines */}
          <View style={{ margin: "10 25", padding: 10, backgroundColor: "#d32f2f" }}>
            <Text style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>
              Report Usage Guidelines
            </Text>
          </View>

          <View style={{ margin: "0 25", padding: 10, backgroundColor: "#ffdcdc" }}>
            <Text style={{ fontSize: 10, textAlign: "justify" }}>
              Measuring an individual's personality type using the OCEAN theory to identify their
              traits (characteristics) in behavior.
            </Text>
          </View>

          {/* Rendered Personality Chart Image */}
          <View style={{ margin: "15 25", display: "flex", flexDirection: "column", gap: 10 }}>
            {isReady && personalityChartImage ? (
              <Image src={personalityChartImage} style={{ width: 500 }} />
            ) : (
              <Text>Loading chart...</Text>
            )}
          </View>

          {/* Personality Descriptions */}
          {oceanCategories.map((category, index) => (
            <View key={index} style={{ margin: "10 25" }}>
              <View style={{ padding: 10, backgroundColor: "#d32f2f" }}>
                <Text style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>
                  ({category.category_code}) {category.category_name}
                </Text>
              </View>
              <View style={{ padding: 10, backgroundColor: "#ffdcdc" }}>
                <Text style={{ fontSize: 10, textAlign: "justify" }}>{category.description}</Text>
              </View>
            </View>
          ))}
        </Page>
      )}
    </Document>
  );
};
