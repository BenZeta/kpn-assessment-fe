// src/components/report/styles/chartStyles.ts
import { StyleSheet } from "@react-pdf/renderer";

export const chartStyles = StyleSheet.create({
  container: {
    marginVertical: 8, // jarak antar subtest
  },
  title: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 4, // jarak ke bar
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    overflow: "hidden",
    marginHorizontal: 8, // spasi kiri/kanan antara bar dan teks min/max
  },
  barFill: {
    height: "100%",
    backgroundColor: "#d32f2f",
  },
  minMaxText: {
    fontSize: 8,
    width: 30, // cukup untuk “min:0”
    textAlign: "center" as const,
  },
});
