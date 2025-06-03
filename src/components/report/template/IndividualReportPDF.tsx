import logo from "@/assets/KPN_CORP_NEW_LOGO.png";
import placeholderImg from "@/assets/place-holder.jpg";
import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./styles";
import { AssessmentData } from "@/types/ReportTypes";
import { ReactNode, useMemo } from "react";
import useRenderDetailChart from "@/hooks/useRenderDetailChart";

interface ChartsReport {
  [chart_id: string]: string;
}

interface IndividualReportPDFInteface {
  data: AssessmentData;
  charts: ChartsReport;
  introduction: ReactNode;
}

export default function IndividualReportPDF({
  data,
  charts,
  introduction,
}: IndividualReportPDFInteface) {
  const profileSection = useMemo(() => data?.profile, [data]);
  const batchInfoSection = useMemo(() => data?.batch, [data]);
  const introSection = useMemo(() => data?.intro, [data]);

  return (
    <Document>
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

        <View style={styles.contentSection}>
          <Text>{introduction}</Text>
        </View>
        {/* Batch info section */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>BATCH INFORMATION</Text>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Batch Name</Text>
            <Text style={styles.profileColon}>:</Text>
            <Text>{batchInfoSection.name}</Text>
          </View>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Batch Code</Text>
            <Text style={styles.profileColon}>:</Text>
            <Text>{batchInfoSection.code}</Text>
          </View>
        </View>

        {/* Generate intro section of report */}
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
                <Text>{profileSection.assessee_name}</Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Age</Text>
                <Text style={styles.profileColon}>:</Text>
                <Text>{profileSection.assessee_age}</Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Gender</Text>
                <Text style={styles.profileColon}>:</Text>
                <Text>{profileSection.assessee_gender}</Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Test Date</Text>
                <Text style={styles.profileColon}>:</Text>
                <Text>{batchInfoSection.taken_at}</Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Work Location</Text>
                <Text style={styles.profileColon}>:</Text>
                <Text>{profileSection.work_location}</Text>
              </View>
            </View>
            <View style={styles.profileImageContainer}>
              <Image src={placeholderImg} />
            </View>
          </View>
          {/* Iterate through intro section */}
          {introSection &&
            introSection.map(value => {
              return (
                <>
                  <View style={styles.subheaderContainer}>
                    <Text style={styles.categoryTitle}>{value.category_name}</Text>
                  </View>
                  <View style={styles.chartSection}>
                    <View style={{ gap: 10, flexDirection: "row" }}>
                      <View style={[styles.chartColumn, styles.col50]}>
                        <Text style={styles.chartTitle}>Curve</Text>
                        <Text style={{ textAlign: "center", marginTop: 40 }}>
                          [Bell Curve Chart]
                        </Text>
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
                          {value.norm.map((norm, index) => (
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
                </>
              );
            })}
        </Page>
      </Page>
    </Document>
  );
}
